import { NextResponse } from "next/server";
import { one, run } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { orderToken } from "@/lib/token";
import { updateOrder, addEvent } from "@/lib/orders";
import { allow, clientIp, TOO_MANY } from "@/lib/ratelimit";
import { alertOwner } from "@/lib/notify";

/** Customer cancels their own order while it hasn't shipped yet. */
export async function POST(req: Request) {
  if (!(await allow("cancel:" + clientIp(req), 10, 3600))) return NextResponse.json(TOO_MANY, { status: 429 });
  const { number, token, reason } = await req.json().catch(() => ({}));
  const s = await getSettings();
  if (s.customer_cancel_enabled !== "1") return NextResponse.json({ ok: false, error: "Please contact us to cancel this order" }, { status: 403 });
  if (token !== orderToken(String(number))) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  const o = await one("select * from orders where number = ?", [number]);
  if (!o) return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 });
  if (!["pending", "confirmed", "processing"].includes(o.status)) return NextResponse.json({ ok: false, error: "This order has already shipped or is closed, so it can't be cancelled here. You can request a return instead." }, { status: 400 });
  const why = String(reason || "").slice(0, 200);
  await run("update orders set cancel_reason = ? where id = ?", [why, o.id]);
  await updateOrder(o.id, { status: "cancelled" });
  await addEvent(o.id, "Cancelled by customer", why);
  const refund = o.payment_status === "paid" && o.payment_method !== "cod";
  alertOwner(`Order ${o.number} cancelled by customer`, `${o.name} cancelled order ${o.number} (₹${o.total}). ${refund ? "PAID online — a refund is needed." : "No payment taken."}${why ? " Reason: " + why : ""}`, "order").catch(() => {});
  return NextResponse.json({ ok: true, refund });
}
