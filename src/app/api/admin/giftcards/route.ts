import { NextResponse } from "next/server";
import { one, run } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { sendEmail, emailShell } from "@/lib/notify";
import { walletLog } from "@/lib/wallet";

const mk = () => "GC-" + Array.from({ length: 3 }, () => Math.random().toString(36).slice(2, 6).toUpperCase().replace(/[O0I1L]/g, "X")).join("-");

/** POST {action:"issue"} creates a gift card; {action:"credit"} adds store credit to a customer (by email or phone). */
export async function POST(req: Request) {
  const b = await req.json().catch(() => ({}));
  const s = await getSettings();
  if (b.action === "credit") {
    const amt = Number(b.amount);
    if (!(amt > 0 && amt <= 100000)) return NextResponse.json({ ok: false, error: "Enter an amount" }, { status: 400 });
    const key = String(b.who || "").trim().toLowerCase(), p10 = key.replace(/\D/g, "").slice(-10);
    const c = await one("select id, name from customers where lower(email) = ? or (? != '' and substr(replace(replace(replace(phone,' ',''),'+',''),'-',''), -10) = ?)", [key, p10.length === 10 ? p10 : "", p10]);
    if (!c) return NextResponse.json({ ok: false, error: "No customer with that email or phone" }, { status: 404 });
    await run("update customers set credit = credit + ? where id = ?", [amt, c.id]);
    await walletLog(c.id, "credit_add", amt, "", String(b.note || "Added by admin").slice(0, 120));
    return NextResponse.json({ ok: true, message: `₹${amt} added to ${c.name}` });
  }
  const amt = Math.round(Number(b.amount));
  if (!(amt >= 1 && amt <= 100000)) return NextResponse.json({ ok: false, error: "Enter an amount between ₹1 and ₹1,00,000" }, { status: 400 });
  let code = String(b.code || "").trim().toUpperCase().replace(/\s+/g, "") || mk();
  if (await one("select 1 from gift_cards where upper(code) = ?", [code])) return NextResponse.json({ ok: false, error: "That code already exists" }, { status: 400 });
  await run("insert into gift_cards (code, initial, balance, to_name, to_email, note, expires_at) values (?,?,?,?,?,?,?)", [code, amt, amt, String(b.to_name || "").slice(0, 80), String(b.to_email || "").slice(0, 120), String(b.note || "").slice(0, 300), b.expires_at || null]);
  let mail = "";
  if (b.send && b.to_email) {
    const base = (s.site_url || "").startsWith("http") ? s.site_url.replace(/\/$/, "") : "";
    const r = await sendEmail(b.to_email, `A ${s.store_name} gift card for you 🎁`, emailShell(s, `${b.to_name ? String(b.to_name).replace(/</g, "") + ", you" : "You"}'ve received a gift card!`,
      `<p>Here's <b>₹${amt}</b> to spend at ${s.store_name}.</p>${b.note ? `<p style="font-style:italic">“${String(b.note).replace(/</g, "&lt;")}”</p>` : ""}<p style="font-size:20px;letter-spacing:2px;background:#f4efe8;padding:12px 18px;border-radius:12px;display:inline-block"><b>${code}</b></p><p>Enter this code at checkout.</p>`, base ? { href: base + "/shop", label: "Start shopping" } : undefined));
    mail = r.ok ? "Emailed ✓" : "Not emailed: " + r.error;
  }
  return NextResponse.json({ ok: true, code, message: `Gift card ${code} created${mail ? " · " + mail : ""}` });
}
