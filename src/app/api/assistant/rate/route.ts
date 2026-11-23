import { NextResponse } from "next/server";
import { run } from "@/lib/db";

export async function POST(req: Request) {
  const { chatId, rating } = await req.json();
  if (!Number(chatId)) return NextResponse.json({ ok: false });
  await run("update assistant_chats set rating = ? where id = ?", [rating === -1 ? -1 : rating === 1 ? 1 : 0, Number(chatId)]);
  return NextResponse.json({ ok: true });
}
