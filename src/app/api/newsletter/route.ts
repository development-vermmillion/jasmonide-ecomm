import { NextResponse } from "next/server";
import { run } from "@/lib/db";
import { getSettings } from "@/lib/catalog";

export async function POST(req: Request) {
  if ((await getSettings()).newsletter_enabled !== "1") return NextResponse.json({ ok: false, error: "Signup is disabled" }, { status: 403 });
  const { email } = await req.json();
  const e = String(email || "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(e)) return NextResponse.json({ ok: false, error: "Enter a valid email" }, { status: 400 });
  await run("insert or ignore into subscribers (email) values (?)", [e]);
  return NextResponse.json({ ok: true });
}
