import { NextResponse } from "next/server";
import { one, run } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { orderToken } from "@/lib/token";
import { gatewayReady, rzpFetch } from "@/lib/payments";

export async function POST(req: Request) {
  try {
    const { number, token } = await req.json();
    if (token !== orderToken(String(number))) throw new Error("Invalid order link");
    const o = await one("select * from orders where number = ?", [number]);
    if (!o) throw new Error("Order not found");
    if (o.payment_status === "paid") throw new Error("This order is already paid");
    if (o.payment_method !== "online" || !(await gatewayReady())) throw new Error("Online payment is not available for this order");
    const s = await getSettings();
    const r = await rzpFetch("/orders", { method: "POST", body: JSON.stringify({ amount: Math.round(o.total * 100), currency: "INR", receipt: o.number, notes: { order: o.number } }) });
    await run("update orders set gateway_order_id = ? where id = ?", [r.id, o.id]);
    return NextResponse.json({ ok: true, key: s.razorpay_key_id, orderId: r.id, amount: r.amount, name: s.store_name, description: `Order ${o.number}`, prefill: { name: o.name, email: o.email, contact: o.phone } });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "Could not start payment" }, { status: 400 });
  }
}
