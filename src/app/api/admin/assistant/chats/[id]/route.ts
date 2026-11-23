import { NextResponse } from "next/server";
import { run } from "@/lib/db";

export async function PUT(_: Request, { params }: { params: { id: string } }) {
  await run("update assistant_chats set handled = 1 where id = ?", [Number(params.id)]);
  return NextResponse.json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await run("delete from assistant_chats where id = ?", [Number(params.id)]);
  return NextResponse.json({ ok: true });
}
