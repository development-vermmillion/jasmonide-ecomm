import { NextResponse } from "next/server";
import { run } from "@/lib/db";
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json().catch(() => ({}));
  if (b.active !== undefined) await run("update gift_cards set active = ? where id = ?", [b.active ? 1 : 0, Number(params.id)]);
  if (b.balance !== undefined && Number(b.balance) >= 0) await run("update gift_cards set balance = ? where id = ?", [Number(b.balance), Number(params.id)]);
  return NextResponse.json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await run("delete from gift_cards where id = ?", [Number(params.id)]);
  return NextResponse.json({ ok: true });
}
