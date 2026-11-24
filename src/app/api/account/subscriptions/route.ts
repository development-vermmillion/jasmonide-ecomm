import { NextResponse } from "next/server";
import { all, one, run } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { getCustomer } from "@/lib/customer-auth";

export async function GET() {
  const me = await getCustomer();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, subs: await all("select s.*, p.name from subscriptions s join products p on p.id = s.product_id where s.customer_id = ? and s.active >= 0 order by s.id desc", [me.id]) });
}
export async function POST(req: Request) {
  const s = await getSettings();
  if (s.subs_enabled !== "1") return NextResponse.json({ ok: false, error: "Refill plans are switched off" }, { status: 403 });
  const me = await getCustomer();
  if (!me) return NextResponse.json({ ok: false, error: "Please sign in" }, { status: 401 });
  const b = await req.json().catch(() => ({}));
  const p = await one("select id, type, status from products where id = ?", [Number(b.product_id)]);
  if (!p || p.status !== "published" || p.type === "digital" || p.type === "combo") return NextResponse.json({ ok: false, error: "This product can't be subscribed to" }, { status: 400 });
  const days = Math.max(7, Math.min(365, Math.floor(Number(b.every_days) || 30)));
  const allowed = String(s.subs_intervals || "30").split(",").map(Number).filter(Boolean);
  if (allowed.length && !allowed.includes(days)) return NextResponse.json({ ok: false, error: "Choose one of the offered refill gaps" }, { status: 400 });
  if (p.type === "variable" && !b.variant_id) return NextResponse.json({ ok: false, error: "Please choose an option first" }, { status: 400 });
  const qty = Math.max(1, Math.min(20, Math.floor(Number(b.qty) || 1)));
  await run("insert into subscriptions (customer_id, product_id, variant_id, qty, every_days, next_date) values (?,?,?,?,?, date('now', ?))", [me.id, p.id, b.variant_id ? Number(b.variant_id) : null, qty, days, `+${days} day`]);
  return NextResponse.json({ ok: true });
}
export async function PATCH(req: Request) {
  const me = await getCustomer();
  if (!me) return NextResponse.json({ ok: false }, { status: 401 });
  const { id, action } = await req.json().catch(() => ({}));
  const sub = await one("select * from subscriptions where id = ? and customer_id = ?", [Number(id), me.id]);
  if (!sub) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  if (action === "pause") await run("update subscriptions set active = 0 where id = ?", [sub.id]);
  else if (action === "resume") await run("update subscriptions set active = 1, next_date = date('now', ?) where id = ?", [`+${sub.every_days} day`, sub.id]);
  else if (action === "cancel") await run("update subscriptions set active = -1 where id = ?", [sub.id]);
  return NextResponse.json({ ok: true });
}
