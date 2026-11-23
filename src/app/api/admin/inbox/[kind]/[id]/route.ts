import { NextResponse } from "next/server";
import { run } from "@/lib/db";

const TABLES: Record<string, string> = { enquiries: "enquiries", subscribers: "subscribers", notify: "notify_requests" };

export async function PUT(req: Request, { params }: { params: { kind: string; id: string } }) {
  if (params.kind !== "enquiries") return NextResponse.json({ ok: false }, { status: 400 });
  const { status } = await req.json();
  await run("update enquiries set status = ? where id = ?", [status === "done" ? "done" : "new", Number(params.id)]);
  return NextResponse.json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: { kind: string; id: string } }) {
  const t = TABLES[params.kind];
  if (!t) return NextResponse.json({ ok: false }, { status: 400 });
  await run(`delete from ${t} where id = ?`, [Number(params.id)]);
  return NextResponse.json({ ok: true });
}
