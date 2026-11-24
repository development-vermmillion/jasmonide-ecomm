import { getSettings, getSecret } from "./catalog";
import { all, one, run } from "./db";

/** Server-side senders. Every sender fails soft: it returns { ok:false, error } and never throws, so a missing key never breaks checkout. */
type R = { ok: boolean; error?: string };

export async function sendEmail(to: string, subject: string, html: string): Promise<R> {
  const s = await getSettings();
  if (s.email_enabled !== "1") return { ok: false, error: "Email is switched off (Admin → Integrations)" };
  const pass = await getSecret("smtp_pass");
  if (!s.smtp_host || !s.smtp_user || !pass || !to) return { ok: false, error: "Email settings are incomplete" };
  try {
    const nodemailer = (await import("nodemailer")).default;
    const port = Number(s.smtp_port) || 587;
    const tx = nodemailer.createTransport({ host: s.smtp_host, port, secure: port === 465, auth: { user: s.smtp_user, pass } });
    await tx.sendMail({ from: `"${s.email_from_name || s.store_name}" <${s.email_from || s.smtp_user}>`, to, subject, html });
    return { ok: true };
  } catch (e: any) { return { ok: false, error: e.message || "Email failed" }; }
}

const digits = (p: string) => String(p || "").replace(/\D/g, "");
export const phone10 = (p: string) => digits(p).slice(-10);
export const waNumber = (p: string) => { const d = digits(p); return d.length === 10 ? "91" + d : d; };

/** WhatsApp Cloud API template message. `params` fill {{1}}, {{2}} … in the approved template. */
export async function sendWhatsApp(to: string, template: string, params: string[]): Promise<R> {
  const s = await getSettings();
  if (s.wa_api_enabled !== "1") return { ok: false, error: "WhatsApp is switched off (Admin → Integrations)" };
  const token = await getSecret("wa_access_token");
  if (!s.wa_phone_number_id || !token || !to || !template) return { ok: false, error: "WhatsApp settings are incomplete" };
  try {
    const r = await fetch(`https://graph.facebook.com/v20.0/${encodeURIComponent(s.wa_phone_number_id)}/messages`, {
      method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ messaging_product: "whatsapp", to: waNumber(to), type: "template", template: { name: template, language: { code: s.wa_template_lang || "en" }, components: [{ type: "body", parameters: params.map((text) => ({ type: "text", text })) }] } }),
    });
    if (!r.ok) return { ok: false, error: `WhatsApp error ${r.status}: ${(await r.text()).slice(0, 160)}` };
    return { ok: true };
  } catch (e: any) { return { ok: false, error: e.message || "WhatsApp failed" }; }
}

/** Deliver an OTP using the provider chosen in Admin → Integrations. In test mode the code is returned so the UI can show it. */
export async function sendOtp(phone: string, code: string): Promise<R & { test?: boolean }> {
  const s = await getSettings();
  const to = phone10(phone);
  switch (s.otp_provider) {
    case "msg91": {
      const key = await getSecret("msg91_authkey");
      if (!key || !s.msg91_template_id) return { ok: false, error: "MSG91 is not set up" };
      try {
        const r = await fetch(`https://control.msg91.com/api/v5/otp?template_id=${encodeURIComponent(s.msg91_template_id)}&mobile=91${to}&authkey=${encodeURIComponent(key)}&otp=${code}`, { method: "POST" });
        return r.ok ? { ok: true } : { ok: false, error: "SMS provider refused the request" };
      } catch { return { ok: false, error: "Could not reach the SMS provider" }; }
    }
    case "twilio": {
      const tok = await getSecret("twilio_token");
      if (!s.twilio_sid || !tok || !s.twilio_from) return { ok: false, error: "Twilio is not set up" };
      try {
        const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(s.twilio_sid)}/Messages.json`, {
          method: "POST", headers: { Authorization: "Basic " + Buffer.from(`${s.twilio_sid}:${tok}`).toString("base64"), "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ To: "+91" + to, From: s.twilio_from, Body: `${code} is your ${s.store_name} login code. Valid for 10 minutes.` }),
        });
        return r.ok ? { ok: true } : { ok: false, error: "SMS provider refused the request" };
      } catch { return { ok: false, error: "Could not reach the SMS provider" }; }
    }
    case "whatsapp": {
      const r = await sendWhatsApp(to, s.wa_otp_template, [code]);
      return r;
    }
    default: return { ok: true, test: true };
  }
}

/** Tell the owner something (email and/or WhatsApp, whichever is on). */
export async function alertOwner(subject: string, text: string, kind: "stock" | "order") {
  const s = await getSettings();
  const wantEmail = kind === "stock" ? s.alert_low_stock_email === "1" : true;
  const wantWa = kind === "stock" ? s.alert_low_stock_whatsapp === "1" : s.alert_low_stock_whatsapp === "1";
  const out: string[] = [];
  const to = s.alert_email || s.email;
  if (wantEmail && to) { const r = await sendEmail(to, subject, `<pre style="font:14px/1.5 system-ui">${text.replace(/</g, "&lt;")}</pre>`); out.push("email: " + (r.ok ? "sent" : r.error)); }
  if (wantWa && s.alert_whatsapp) { const r = await sendWhatsApp(s.alert_whatsapp, s.wa_alert_template, [text.replace(/\n/g, " · ").slice(0, 900)]); out.push("whatsapp: " + (r.ok ? "sent" : r.error)); }
  return out;
}

/** Products/variants at or below their low-stock level. */
export async function lowStockList() {
  return all<{ name: string; variant: string; stock: number; low: number }>(
    `select p.name, '' as variant, p.stock, p.low_stock as low from products p where p.type = 'simple' and p.track_stock = 1 and p.status = 'published' and p.stock <= p.low_stock
     union all select p.name, v.name, v.stock, p.low_stock from variants v join products p on p.id = v.product_id where p.track_stock = 1 and p.status = 'published' and v.stock <= p.low_stock
     order by 3`);
}

/** Send at most one low-stock summary per day (called after each order). `force` sends now. */
export async function checkLowStock(force = false): Promise<string[]> {
  const s = await getSettings();
  if (!force && s.alert_low_stock_email !== "1" && s.alert_low_stock_whatsapp !== "1") return [];
  const list = await lowStockList();
  if (!list.length) return force ? ["Nothing is low on stock right now 🎉"] : [];
  const day = new Date().toISOString().slice(0, 10);
  const sig = "low:" + list.map((l) => l.name + l.variant + l.stock).join("|").slice(0, 200);
  if (!force) {
    if (await one("select 1 from alerts_sent where key = ? and day = ?", [sig, day])) return [];
    await run("insert or ignore into alerts_sent (key, day) values (?, ?)", [sig, day]);
    await run("delete from alerts_sent where day < date('now','-14 day')");
  }
  const text = `Low stock at ${s.store_name}:\n` + list.map((l) => `• ${l.name}${l.variant ? " (" + l.variant + ")" : ""}: ${l.stock} left (alert at ${l.low})`).join("\n");
  return alertOwner(`Low stock: ${list.length} item${list.length > 1 ? "s" : ""}`, text, "stock");
}

const esc = (t: any) => String(t ?? "").replace(/</g, "&lt;");
const siteBase = (s: Record<string, string>) => ((s.site_url || "").startsWith("http") ? s.site_url.replace(/\/$/, "") : "");

export function emailShell(s: Record<string, string>, title: string, bodyHtml: string, cta?: { href: string; label: string }) {
  return `<div style="font:15px/1.6 system-ui,sans-serif;max-width:540px;margin:auto;color:#2a2a2a"><h2 style="font-family:Georgia,serif;font-weight:500">${esc(title)}</h2>${bodyHtml}${cta ? `<p style="margin:22px 0"><a href="${cta.href}" style="background:#2a2a2a;color:#fff;text-decoration:none;padding:11px 22px;border-radius:999px;display:inline-block">${esc(cta.label)}</a></p>` : ""}<p style="color:#777;font-size:13px">— ${esc(s.store_name)}${s.phone ? " · " + esc(s.phone) : ""}</p></div>`;
}

const STATUS_TEXT: Record<string, [string, string]> = {
  confirmed: ["Your order is confirmed", "We've got everything and are getting your order ready. Each piece is packed by hand."],
  processing: ["We're packing your order", "Your order is being carefully prepared."],
  shipped: ["Your order is on its way", "It has left our studio and is heading to you."],
  delivered: ["Your order was delivered", "We hope it brings a little glow to your day. A review would mean the world to us."],
  cancelled: ["Your order was cancelled", "If you paid online, your refund will be processed to the original payment method."],
  returned: ["Your return is complete", "Thank you — we'll process your refund shortly."],
};

/** Email / WhatsApp the customer when their order moves to a new status. Never throws. */
export async function notifyOrderStatus(orderId: number, status: string) {
  try {
    const s = await getSettings();
    const t = STATUS_TEXT[status];
    if (!t) return;
    const o = await one("select * from orders where id = ?", [orderId]);
    if (!o) return;
    const { orderToken } = await import("./token");
    const link = `${siteBase(s)}/order/${o.number}?t=${orderToken(o.number)}`;
    const track = status === "shipped" && o.tracking ? `<p>Tracking number: <b>${esc(o.tracking)}</b></p>` : "";
    if (o.email && s.notify_status_email === "1")
      await sendEmail(o.email, `${t[0]} · ${o.number}`, emailShell(s, `${t[0]}, ${esc(String(o.name || "").split(" ")[0])}`, `<p>${t[1]}</p><p>Order <b>${o.number}</b></p>${track}`, siteBase(s) ? { href: link, label: "View your order" } : undefined));
    if (o.phone && s.notify_status_whatsapp === "1")
      await sendWhatsApp(o.phone, s.wa_order_template, [String(o.name || "there").split(" ")[0], o.number, t[0].toLowerCase(), o.tracking || "—"]);
  } catch {}
}

/** A sold-out product is back — tell everyone who asked, once. */
export async function notifyRestock(productId: number, variantId: number | null) {
  try {
    const s = await getSettings();
    const reqs = await all("select * from notify_requests where product_id = ? and notified_at is null and (variant_id is null or variant_id = ? or ? is null)", [productId, variantId, variantId]);
    if (!reqs.length) return;
    const p = await one("select name, slug from products where id = ?", [productId]);
    if (!p) return;
    const link = `${siteBase(s)}/product/${p.slug}`;
    for (const r of reqs) {
      let sent = false;
      if (r.email && s.notify_restock_email === "1")
        sent = (await sendEmail(r.email, `${p.name} is back in stock`, emailShell(s, "Good news — it's back 💛", `<p><b>${esc(p.name)}</b> is available again. Stock is limited, so grab yours soon.</p>`, siteBase(s) ? { href: link, label: "Shop now" } : undefined))).ok || sent;
      if (r.phone && s.notify_restock_whatsapp === "1") sent = (await sendWhatsApp(r.phone, s.wa_order_template, ["there", p.name, "back in stock", link])).ok || sent;
      // only mark as told when a message really went out, so nobody is silently skipped while email/WhatsApp isn't set up yet
      if (sent) await run("update notify_requests set notified_at = datetime('now') where id = ?", [r.id]);
    }
  } catch {}
}
