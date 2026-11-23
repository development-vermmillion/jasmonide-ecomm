import { NextResponse } from "next/server";
import { run } from "@/lib/db";

export async function POST(req: Request) {
  const b = await req.json();
  if (!b.question?.trim() || !b.answer?.trim()) return NextResponse.json({ ok: false, error: "Question and answer are required" }, { status: 400 });
  await run("insert into faqs (question,answer,sort,active) values (?,?,?,?)", [b.question.trim(), b.answer.trim(), Number(b.sort) || 0, b.active === false ? 0 : 1]);
  return NextResponse.json({ ok: true });
}
