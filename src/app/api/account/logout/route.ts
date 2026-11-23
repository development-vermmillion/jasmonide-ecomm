import { NextResponse } from "next/server";
import { CCOOKIE } from "@/lib/customer-auth";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(CCOOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
