import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { getSecret } from "@/lib/catalog";
import { orderToken } from "@/lib/token";
import { markPaid, verifyRzpPayment } from "@/lib/payments";

export async function POST(req: Request) {
  try {
    const b = await req.json();
    if (b.token !== orderToken(String(b.number))) throw new Error("Invalid order link");
    const o = await one("select * from orders where number = ?", [b.number]);
    if (!o || !o.gateway_order_id || o.gateway_order_id !== b.razorpay_order_id) throw new Error("Order mismatch");
    const ok = verifyRzpPayment(b.razorpay_order_id, b.razorpay_payment_id, b.razorpay_signature, await getSecret("razorpay_key_secret"));
    if (!ok) throw new Error("Payment signature could not be verified. If money was deducted, it will be matched automatically or contact us with your order number.");
    await markPaid(o.id, { ref: b.razorpay_payment_id, gatewayPaymentId: b.razorpay_payment_id, note: "Razorpay · " + b.razorpay_payment_id });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
