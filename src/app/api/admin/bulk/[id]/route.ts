import { NextResponse } from "next/server";
import { run } from "@/lib/db";
import { vals, check } from "../route";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json(); const e = check(b);
  if (e) return NextResponse.json({ ok: false, error: e }, { status: 400 });
  await run("update bulk_rules set name=?,scope=?,target_id=?,basis=?,min_qty=?,max_qty=?,min_value=?,discount_type=?,value=?,active=?,starts_at=?,ends_at=? where id=?", [...vals(b), Number(params.id)]);
  return NextResponse.json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await run("delete from bulk_rules where id = ?", [Number(params.id)]);
  return NextResponse.json({ ok: true });
}
