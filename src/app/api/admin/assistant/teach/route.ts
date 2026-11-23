import { NextResponse } from "next/server";
import { run } from "@/lib/db";

/** Create a taught answer (optionally from a chat, which is then marked handled). */
export async function POST(req: Request) {
  const b = await req.json();
  if (!String(b.question || "").trim() || !String(b.answer || "").trim()) return NextResponse.json({ ok: false, error: "Question and answer are required" }, { status: 400 });
  await run("insert into assistant_taught (question, answer) values (?,?)", [String(b.question).trim(), String(b.answer).trim()]);
  if (b.chatId) await run("update assistant_chats set handled = 1 where id = ?", [Number(b.chatId)]);
  return NextResponse.json({ ok: true });
}
