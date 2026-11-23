import { NextResponse } from "next/server";
import { run } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json();
  await run("update faqs set question=?, answer=?, sort=?, active=? where id=?", [b.question, b.answer, Number(b.sort) || 0, b.active === false || b.active === 0 ? 0 : 1, Number(params.id)]);
  return NextResponse.json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await run("delete from faqs where id = ?", [Number(params.id)]);
  return NextResponse.json({ ok: true });
}
