import { NextResponse } from "next/server";
import { one, run } from "@/lib/db";
import { orderToken } from "@/lib/token";
import { addEvent } from "@/lib/orders";

/** Customer submits their UPI reference (UTR) after paying. Admin then verifies and marks the order paid. */
export async function POST(req: Request) {
  try {
    const { number, token, ref } = await req.json();
    if (token !== orderToken(String(number))) throw new Error("Invalid order link");
    const clean = String(ref || "").trim().toUpperCase();
    if (!/^[A-Z0-9]{8,30}$/.test(clean)) throw new Error("Enter the 12-digit UPI reference / UTR number from your payment app");
    const o = await one("select * from orders where number = ?", [number]);
    if (!o || o.payment_method !== "upi") throw new Error("Order not found");
    if (o.payment_status === "paid") throw new Error("This order is already marked paid");
    await run("update orders set payment_ref = ? where id = ?", [clean, o.id]);
    await addEvent(o.id, "Customer shared payment reference", clean);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
