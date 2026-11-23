import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { one } from "@/lib/db";
import { signSession, COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const a = await one("select * from admins where lower(email) = lower(?)", [String(email || "").trim()]);
  if (!a || !bcrypt.compareSync(String(password || ""), a.password_hash))
    return NextResponse.json({ ok: false, error: "Invalid email or password" }, { status: 401 });
  const token = await signSession({ id: a.id, name: a.name, email: a.email, role: a.role });
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7, secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1" });
  return res;
}
