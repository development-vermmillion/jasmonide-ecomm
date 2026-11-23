import { NextResponse } from "next/server";
import { run } from "@/lib/db";

export async function POST(req: Request) {
  const b = await req.json();
  if (!b.code?.trim()) return NextResponse.json({ ok: false, error: "Code required" }, { status: 400 });
  try {
    await run("insert into coupons (code,type,value,min_order,max_uses,expires_at,active) values (?,?,?,?,?,?,?)",
      [b.code.trim().toUpperCase(), b.type === "fixed" ? "fixed" : "percent", Number(b.value) || 0, Number(b.min_order) || 0, Number(b.max_uses) || 0, b.expires_at || null, b.active === false ? 0 : 1]);
  } catch {
    return NextResponse.json({ ok: false, error: "That code already exists" }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
