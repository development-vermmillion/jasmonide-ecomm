import { NextResponse } from "next/server";
import { allow, clientIp, TOO_MANY } from "@/lib/ratelimit";
import { one, run } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { getCustomer } from "@/lib/customer-auth";

export async function POST(req: Request) {
  if (!(await allow("review:" + clientIp(req), 8, 3600))) return NextResponse.json(TOO_MANY, { status: 429 });
  const s = await getSettings();
  if (s.reviews_enabled !== "1") return NextResponse.json({ ok: false, error: "Reviews are disabled" }, { status: 403 });
  const b = await req.json();
  const rating = Math.round(Number(b.rating));
  if (!(rating >= 1 && rating <= 5) || !b.name?.trim() || !String(b.body || "").trim())
    return NextResponse.json({ ok: false, error: "Please add your name, a star rating and a few words" }, { status: 400 });
  const p = await one("select id from products where id = ? and status = 'published'", [Number(b.product_id)]);
  if (!p) return NextResponse.json({ ok: false, error: "Product not found" }, { status: 404 });
  const me = await getCustomer();
  let verified = 0;
  if (me) verified = (await one("select count(*) n from order_items oi join orders o on o.id = oi.order_id where o.customer_id = ? and oi.product_id = ? and o.status not in ('cancelled','returned')", [me.id, p.id]))?.n > 0 ? 1 : 0;
  const status = s.reviews_auto_approve === "1" ? "approved" : "pending";
  await run("insert into reviews (product_id, customer_id, name, rating, title, body, status, verified) values (?,?,?,?,?,?,?,?)",
    [p.id, me?.id ?? null, b.name.trim().slice(0, 60), rating, String(b.title || "").slice(0, 100), String(b.body).slice(0, 1500), status, verified]);
  return NextResponse.json({ ok: true, status });
}
