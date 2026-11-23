import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { run } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(req: Request) {
  const s = await getSession();
  if (s?.role !== "owner") return NextResponse.json({ ok: false, error: "Only the owner can manage users" }, { status: 403 });
  const b = await req.json();
  if (!b.email || !b.name || String(b.password || "").length < 6) return NextResponse.json({ ok: false, error: "Name, email and a 6+ character password are required" }, { status: 400 });
  try {
    await run("insert into admins (name,email,password_hash,role) values (?,?,?,?)", [b.name, b.email.trim().toLowerCase(), bcrypt.hashSync(b.password, 10), b.role === "owner" ? "owner" : "staff"]);
  } catch {
    return NextResponse.json({ ok: false, error: "Email already in use" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
