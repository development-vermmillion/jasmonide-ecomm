import { NextResponse } from "next/server";
import { checkCoupon } from "@/lib/orders";

export async function POST(req: Request) {
  const { code, subtotal } = await req.json();
  const r = await checkCoupon(code, Number(subtotal) || 0);
  return NextResponse.json({ ok: r.ok, discount: r.discount, message: r.message });
}
