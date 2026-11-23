import { NextResponse } from "next/server";
import { run } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json();
  await run("update categories set name=?, description=?, image=?, sort=? where id=?", [b.name, b.description || "", b.image || "", Number(b.sort) || 0, Number(params.id)]);
  return NextResponse.json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await run("delete from categories where id = ?", [Number(params.id)]);
  return NextResponse.json({ ok: true });
}
