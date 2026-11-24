import { NextResponse } from "next/server";
import { run } from "@/lib/db";
import { sendRefillReminders } from "@/lib/jobs";

export async function POST(req: Request) {
  const { id, action } = await req.json().catch(() => ({}));
  const n = Number(id);
  if (action === "remind") { const sent = await sendRefillReminders(n); return NextResponse.json({ ok: true, message: sent ? "Reminder sent" : "Not sent — set up Email (or WhatsApp) in Integrations first" }); }
  if (action === "pause") await run("update subscriptions set active = 0 where id = ?", [n]);
  if (action === "resume") await run("update subscriptions set active = 1 where id = ?", [n]);
  if (action === "cancel") await run("update subscriptions set active = -1 where id = ?", [n]);
  return NextResponse.json({ ok: true });
}
