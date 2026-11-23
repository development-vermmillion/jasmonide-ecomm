import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { getSecret } from "@/lib/catalog";
import { markPaid, verifyRzpWebhook } from "@/lib/payments";

/** Razorpay → server confirmation, so orders are marked paid even if the customer closes the tab. */
export async function POST(req: Request) {
  const raw = await req.text();
  const secret = await getSecret("razorpay_webhook_secret");
  if (!secret || !verifyRzpWebhook(raw, req.headers.get("x-razorpay-signature") || "", secret)) return NextResponse.json({ ok: false }, { status: 400 });
  try {
    const ev = JSON.parse(raw);
    const pay = ev?.payload?.payment?.entity;
    if ((ev.event === "payment.captured" || ev.event === "order.paid") && (pay?.order_id || ev?.payload?.order?.entity?.id)) {
      const gid = pay?.order_id || ev.payload.order.entity.id;
      const o = await one("select * from orders where gateway_order_id = ?", [gid]);
      if (o && Math.round(o.total * 100) === Number(pay?.amount ?? ev.payload.order.entity.amount_paid))
        await markPaid(o.id, { ref: pay?.id || "", gatewayPaymentId: pay?.id || "", note: "Razorpay webhook · " + (pay?.id || "") });
    }
  } catch {}
  return NextResponse.json({ ok: true });
}
