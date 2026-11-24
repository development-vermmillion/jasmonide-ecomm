import { NextResponse } from "next/server";
import { allow, clientIp, TOO_MANY } from "@/lib/ratelimit";
import { run } from "@/lib/db";
import { getSettings } from "@/lib/catalog";

export async function POST(req: Request) {
  if (!(await allow("contact:" + clientIp(req), 6, 3600))) return NextResponse.json(TOO_MANY, { status: 429 });
  if ((await getSettings()).contact_enabled !== "1") return NextResponse.json({ ok: false, error: "The contact form is disabled" }, { status: 403 });
  const b = await req.json();
  if (!b.name?.trim() || !String(b.message || "").trim() || !(b.email?.trim() || b.phone?.trim()))
    return NextResponse.json({ ok: false, error: "Please add your name, a phone or email, and a message" }, { status: 400 });
  await run("insert into enquiries (name,email,phone,message) values (?,?,?,?)", [b.name.trim().slice(0, 80), b.email || "", b.phone || "", String(b.message).slice(0, 3000)]);
  return NextResponse.json({ ok: true });
}
