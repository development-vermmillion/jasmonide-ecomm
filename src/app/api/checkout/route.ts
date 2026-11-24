import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";
import { orderToken } from "@/lib/token";
import { getCustomer } from "@/lib/customer-auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const me = await getCustomer();
    let source: any = {};
    try { source = JSON.parse(decodeURIComponent(cookies().get("src")?.value || "{}")); } catch {}
    const o = await createOrder({ ...body, customerId: me?.id ?? null, source });
    return NextResponse.json({ ok: true, number: o.number, token: orderToken(o.number), total: o.total });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message || "Could not place order" }, { status: 400 });
  }
}
