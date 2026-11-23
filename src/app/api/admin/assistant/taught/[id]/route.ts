import { NextResponse } from "next/server";
import { run } from "@/lib/db";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json();
  await run("update assistant_taught set question=?, answer=?, active=? where id=?", [b.question, b.answer, b.active === false || b.active === 0 ? 0 : 1, Number(params.id)]);
  return NextResponse.json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await run("delete from assistant_taught where id = ?", [Number(params.id)]);
  return NextResponse.json({ ok: true });
}
