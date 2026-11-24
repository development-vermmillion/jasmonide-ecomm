import { NextResponse } from "next/server";
import { allow, clientIp, TOO_MANY } from "@/lib/ratelimit";
import { run } from "@/lib/db";
import { getSettings } from "@/lib/catalog";

export async function POST(req: Request) {
  if (!(await allow("news:" + clientIp(req), 10, 3600))) return NextResponse.json(TOO_MANY, { status: 429 });
  if ((await getSettings()).newsletter_enabled !== "1") return NextResponse.json({ ok: false, error: "Signup is disabled" }, { status: 403 });
  const { email } = await req.json();
  const e = String(email || "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(e)) return NextResponse.json({ ok: false, error: "Enter a valid email" }, { status: 400 });
  await run("insert or ignore into subscribers (email) values (?)", [e]);
  return NextResponse.json({ ok: true });
}
