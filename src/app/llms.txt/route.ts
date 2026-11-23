import { all } from "@/lib/db";
import { getSettings } from "@/lib/catalog";

export const dynamic = "force-dynamic";
/** /llms.txt — a plain-text brief for AI assistants (ChatGPT, Claude, Perplexity, Gemini). */
export async function GET() {
  const s = await getSettings();
  const base = s.site_url?.startsWith("http") ? s.site_url : "http://localhost:3000";
  const [cats, prods, posts, faqs] = await Promise.all([
    all("select name, slug, description from categories order by sort"),
    all("select name, slug, short_desc, price from products where status='published' order by featured desc, id desc limit 60"),
    s.blog_enabled === "1" ? all("select title, slug, excerpt from blog_posts where status='published' order by id desc limit 30") : Promise.resolve([]),
    s.faq_enabled === "1" ? all("select question, answer from faqs where active=1 order by sort, id limit 30") : Promise.resolve([]),
  ]);
  const L: string[] = [];
  L.push(`# ${s.store_name}`, "", `> ${s.site_description}`, "", s.llms_about || "", "");
  const facts = (s.llms_facts || "").split("\n").map((x) => x.trim()).filter(Boolean);
  if (facts.length) L.push("## Key facts", ...facts.map((f) => `- ${f}`), "");
  L.push("## Contact", `- Email: ${s.email}`, `- Phone / WhatsApp: ${s.phone}`, `- Address: ${s.address}`, "");
  L.push("## Categories", ...cats.map((c: any) => `- [${c.name}](${base}/category/${c.slug}): ${c.description || ""}`), "");
  L.push("## Products", ...prods.map((p: any) => `- [${p.name}](${base}/product/${p.slug}): ${p.short_desc || ""} (₹${p.price})`), "");
  if (posts.length) L.push("## Articles", ...posts.map((p: any) => `- [${p.title}](${base}/blog/${p.slug}): ${p.excerpt || ""}`), "");
  if (faqs.length) L.push("## FAQ", ...faqs.flatMap((f: any) => [`### ${f.question}`, f.answer, ""]));
  return new Response(L.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
