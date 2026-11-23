import { NextResponse } from "next/server";
import { run } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { answer } from "@/lib/assistant";

const hits = new Map<string, number[]>();
function limited(ip: string) {
  const now = Date.now(), a = (hits.get(ip) || []).filter((t) => now - t < 60000);
  a.push(now); hits.set(ip, a);
  return a.length > 20;
}

export async function POST(req: Request) {
  const s = await getSettings();
  if (s.assistant_enabled !== "1") return NextResponse.json({ ok: false, error: "Assistant is off" }, { status: 404 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "local";
  if (limited(ip)) return NextResponse.json({ ok: true, reply: "You're sending messages very fast — give me a moment and try again 🙂" });
  const b = await req.json();
  const q = String(b.question || "").trim().slice(0, 300);
  if (!q) return NextResponse.json({ ok: true, reply: s.assistant_greeting });
  const a = await answer(q);
  let chatId = 0;
  if (s.assistant_log_chats === "1")
    chatId = (await run("insert into assistant_chats (session,question,answer,source,answered) values (?,?,?,?,?)", [String(b.session || "").slice(0, 40), q, a.reply, a.source, a.answered ? 1 : 0])).id as number;
  return NextResponse.json({ ok: true, reply: a.reply, chatId });
}
