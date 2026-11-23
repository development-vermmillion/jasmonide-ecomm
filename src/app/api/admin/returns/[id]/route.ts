import { NextResponse } from "next/server";
import { one, run } from "@/lib/db";
import { updateOrder } from "@/lib/orders";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const b = await req.json();
  const r = await one("select * from returns where id = ?", [id]);
  if (!r) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  if (!["requested", "approved", "rejected", "refunded"].includes(b.status)) return NextResponse.json({ ok: false, error: "Bad status" }, { status: 400 });
  await run("update returns set status=?, refund_amount=?, admin_note=? where id=?", [b.status, Number(b.refund_amount) || 0, b.admin_note || "", id]);
  // refunding closes the order: stock is restored and payment marked refunded
  if (b.status === "refunded" && r.status !== "refunded") await updateOrder(r.order_id, { status: "returned", payment_status: "refunded" });
  return NextResponse.json({ ok: true });
}
