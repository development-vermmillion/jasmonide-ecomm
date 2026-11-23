import { NextResponse } from "next/server";
import { updateOrder } from "@/lib/orders";
import { run } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    await updateOrder(Number(params.id), await req.json());
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 400 });
  }
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await run("delete from orders where id = ?", [Number(params.id)]);
  return NextResponse.json({ ok: true });
}
