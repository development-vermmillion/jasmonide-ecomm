import { NextResponse } from "next/server";
import { run } from "@/lib/db";

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await run("delete from reviews where id = ?", [Number(params.id)]);
  return NextResponse.json({ ok: true });
}
