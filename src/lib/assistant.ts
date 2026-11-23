import { all, run } from "./db";
import { getSettings } from "./catalog";
import { activeRules } from "./bulk";
import { ruleLabel } from "./bulk-label";

/* ---------- tiny local NLP: tokenise, normalise, synonyms ---------- */
const STOP = new Set("the a an and or for to of in on is are was were be been i you your my me we our do does did can could would should will long take takes taken accept accepts what how which who where when why with it its this that these those have has had want need looking please tell about any some there hi hello hey ok so if at by from as get got give show kya hai hain ka ki ke mein me se ko aur".split(" "));
const SYN: Record<string, string> = {
  deliver: "ship", delivery: "ship", dispatch: "ship", shipping: "ship", shipped: "ship", courier: "ship", ship: "ship", send: "ship",
  refund: "return", replace: "return", replacement: "return", exchange: "return", return: "return", money: "return", back: "return",
  cod: "cash", cash: "cash", upi: "pay", payment: "pay", pay: "pay", paytm: "pay", gpay: "pay", phonepe: "pay", card: "pay",
  cost: "price", rate: "price", cheap: "price", expensive: "price", price: "price", much: "price", amount: "price", charges: "price", charge: "price",
  wholesale: "bulk", bulk: "bulk", discount: "bulk", offer: "bulk", offers: "bulk", deal: "bulk", coupon: "coupon", code: "coupon",
  track: "track", tracking: "track", status: "track", where: "track", whatsapp: "contact", phone: "contact", call: "contact", email: "contact", contact: "contact", number: "contact", address: "contact",
  beginner: "start", starter: "start", begin: "start", start: "start", first: "start", newbie: "start",
  moulds: "mould", molds: "mould", mold: "mould", mould: "mould", silicone: "silicone", colour: "color", colours: "color", color: "color", colors: "color", pigment: "color", pigments: "color", dye: "color",
};
function norm(w: string) {
  if (SYN[w]) return SYN[w];
  if (w.length > 4 && w.endsWith("ies")) w = w.slice(0, -3) + "y";
  else if (w.length > 4 && w.endsWith("es")) w = w.slice(0, -2);
  else if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) w = w.slice(0, -1);
  if (w.length > 5 && w.endsWith("ing")) w = w.slice(0, -3);
  return SYN[w] || w;
}
export const tokens = (t: string) => Array.from(new Set((t || "").toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 1 && !STOP.has(w)).map(norm)));

type Item = { kind: "taught" | "faq" | "policy" | "knowledge" | "product" | "blog"; id?: number; text: string; answer: string; link?: string; weight: number; price?: number };

async function corpus(): Promise<Item[]> {
  const s = await getSettings();
  const [taught, faqs, prods, posts, rules] = await Promise.all([
    all("select id, question, answer from assistant_taught where active = 1"),
    s.faq_enabled === "1" ? all("select id, question, answer from faqs where active = 1") : Promise.resolve([]),
    all("select p.id, p.name, p.slug, p.short_desc, p.tags, p.price, p.sale_price, p.type, c.name as cat from products p left join categories c on c.id = p.category_id where p.status = 'published' and (p.type != 'combo' or ? = '1') limit 400", [s.combos_enabled]),
    s.blog_enabled === "1" ? all("select id, title, slug, excerpt from blog_posts where status = 'published' limit 100") : Promise.resolve([]),
    activeRules(),
  ]);
  const I: Item[] = [];
  for (const t of taught) I.push({ kind: "taught", id: t.id, text: t.question, answer: t.answer, weight: 1.3 });
  for (const f of faqs) I.push({ kind: "faq", id: f.id, text: f.question + " " + f.answer.slice(0, 120), answer: f.answer, weight: 1.1 });
  (s.assistant_extra || "").split("\n").map((x) => x.trim()).filter(Boolean).forEach((l) => I.push({ kind: "knowledge", text: l, answer: l, weight: 1.0 }));
  const pol = (q: string, a: string) => I.push({ kind: "policy", text: q, answer: a, weight: 1.0 });
  pol("shipping delivery time charges dispatch courier", `We ship across India. Shipping is ₹${s.shipping_flat}, and **free above ₹${s.free_shipping_min}**.`);
  pol("return refund replace policy exchange", s.returns_enabled === "1" ? `You can request a return within ${s.return_days} days of delivery, from your order page.` : "Returns aren't being accepted right now. Please message us on WhatsApp.");
  pol("payment pay cash cod upi methods", `Payment options: ${[s.cod_enabled === "1" ? "Cash on delivery (physical items)" : "", s.upi_enabled === "1" ? "UPI / bank transfer" : ""].filter(Boolean).join(" and ") || "please message us on WhatsApp"}.`);
  if (s.track_enabled === "1") pol("track order status where is my order", "You can track your order on the [Track order](/track) page with your order number and phone number.");
  pol("contact whatsapp phone email address reach support help", `Reach us on [WhatsApp](https://wa.me/${s.whatsapp}), email ${s.email} or call ${s.phone}.`);
  if (rules.length) pol("bulk wholesale discount offer quantity deal", "Bulk savings:\n\n" + rules.map((r) => `- ${r.name ? r.name + " — " : ""}${ruleLabel(r)}`).join("\n"));
  if (s.coupons_enabled === "1") pol("coupon code promo discount", "If you have a coupon code, enter it at checkout in the coupon box.");
  for (const p of prods) {
    const price = p.sale_price && p.sale_price < p.price ? p.sale_price : p.price;
    I.push({ kind: "product", id: p.id, text: `${p.name} ${p.name} ${p.cat || ""} ${p.tags || ""} ${p.short_desc || ""}`, answer: p.name, link: `/product/${p.slug}`, weight: 1, price });
  }
  for (const b of posts) I.push({ kind: "blog", id: b.id, text: `${b.title} ${b.title} ${b.excerpt || ""}`, answer: b.title, link: `/blog/${b.slug}`, weight: 0.9 });
  return I;
}

function rank(I: Item[], q: string) {
  const Q = tokens(q);
  if (!Q.length) return { Q, ranked: [] as (Item & { score: number })[] };
  const docs = I.map((i) => new Set(tokens(i.text)));
  const df = new Map<string, number>();
  docs.forEach((d) => d.forEach((w) => df.set(w, (df.get(w) || 0) + 1)));
  const idf = (w: string) => Math.log(1 + docs.length / (1 + (df.get(w) || 0)));
  const Qk = Q.filter((w) => df.has(w)); // ignore words that appear nowhere in our knowledge
  if (!Qk.length) return { Q, ranked: [] as (Item & { score: number })[] };
  const qSum = Qk.reduce((a, w) => a + idf(w), 0) || 1;
  const ranked = I.map((it, n) => {
    const d = docs[n];
    let m = 0, dSum = 0;
    d.forEach((w) => { dSum += idf(w); });
    for (const w of Qk) if (d.has(w)) m += idf(w);
    const coverage = m / qSum, precision = dSum ? Math.min(1, m / dSum) : 0;
    return { ...it, score: (0.75 * coverage + 0.25 * precision) * it.weight };
  }).filter((x) => x.score > 0.15).sort((a, b) => b.score - a.score);
  return { Q, ranked };
}

export type Answer = { reply: string; source: string; answered: boolean };

export async function answer(question: string): Promise<Answer> {
  const s = await getSettings();
  const q = question.trim();
  if (/^(hi|hello|hey|namaste|hii+|good (morning|evening|afternoon))\b/i.test(q) && q.split(/\s+/).length <= 4) return { reply: s.assistant_greeting, source: "smalltalk", answered: true };
  if (/^(thanks|thank you|thx|ok thanks|great|shukriya|dhanyavad)\b/i.test(q)) return { reply: "You're welcome! Let me know if you need anything else 😊", source: "smalltalk", answered: true };

  const I = await corpus();
  const { ranked } = rank(I, q);
  const qa = ranked.find((r) => ["taught", "faq", "knowledge", "policy"].includes(r.kind));
  const prods = ranked.filter((r) => r.kind === "product" && r.score >= 0.5).slice(0, 3);
  const blog = ranked.find((r) => r.kind === "blog" && r.score >= 0.5);
  const plist = (ps: typeof prods) => ps.map((p) => `- [${p.answer}](${p.link}) — ₹${p.price}`).join("\n");

  let out: Answer;
  if (qa && qa.score >= 0.5) {
    if (qa.kind === "taught" && qa.id) await run("update assistant_taught set hits = hits + 1 where id = ?", [qa.id]);
    let reply = qa.answer;
    if (prods.length && qa.kind !== "taught") reply += `\n\nYou may like:\n${plist(prods.slice(0, 2))}`;
    out = { reply, source: qa.kind, answered: true };
  } else if (prods.length) {
    out = { reply: `Here's what I found:\n\n${plist(prods)}`, source: "product", answered: true };
  } else if (blog) {
    out = { reply: `This guide might help: [${blog.answer}](${blog.link})`, source: "blog", answered: true };
  } else {
    out = { reply: `I'm not sure about that one yet. Try [browsing the shop](/shop) or message us on [WhatsApp](https://wa.me/${s.whatsapp}) and we'll help.`, source: "fallback", answered: false };
  }

  // Optional: a free local LLM (Ollama) phrases the reply from the facts we found. Off unless OLLAMA_URL is set.
  const url = process.env.OLLAMA_URL;
  if (url && out.answered && out.source !== "taught") {
    try {
      const ctx = ranked.slice(0, 5).map((r) => `- ${r.kind === "product" ? `${r.answer} (₹${r.price}) ${r.link}` : r.kind === "blog" ? `${r.answer} ${r.link}` : r.answer}`).join("\n");
      const r = await fetch(url.replace(/\/$/, "") + "/api/chat", {
        method: "POST", headers: { "content-type": "application/json" }, signal: AbortSignal.timeout(20000),
        body: JSON.stringify({ model: process.env.OLLAMA_MODEL || "llama3.2", stream: false, messages: [
          { role: "system", content: `You are ${s.assistant_name}, assistant for ${s.store_name}. Answer in under 70 words using ONLY the facts below. Keep markdown links exactly as given. Never invent prices or policies.\nFACTS:\n${ctx}` },
          { role: "user", content: q }] }),
      });
      const j = await r.json();
      if (j?.message?.content) out = { ...out, reply: j.message.content, source: "local-llm" };
    } catch {}
  }
  return out;
}
