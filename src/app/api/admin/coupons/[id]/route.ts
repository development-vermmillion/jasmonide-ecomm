import { NextResponse } from "next/server";
import { run } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json();
  await run("update coupons set type=?, value=?, min_order=?, max_uses=?, expires_at=?, active=? where id=?",
    [b.type === "fixed" ? "fixed" : "percent", Number(b.value) || 0, Number(b.min_order) || 0, Number(b.max_uses) || 0, b.expires_at || null, b.active ? 1 : 0, Number(params.id)]);
  return NextResponse.json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await run("delete from coupons where id = ?", [Number(params.id)]);
  return NextResponse.json({ ok: true });
}
