import { NextResponse } from "next/server";
import { saveProduct } from "@/lib/products-admin";

export async function POST(req: Request) {
  try {
    return NextResponse.json({ ok: true, ...(await saveProduct(await req.json())) });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
