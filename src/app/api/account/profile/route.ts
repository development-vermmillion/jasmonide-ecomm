import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { run } from "@/lib/db";
import { getCustomer } from "@/lib/customer-auth";

export async function PUT(req: Request) {
  const me = await getCustomer();
  if (!me) return NextResponse.json({ ok: false, error: "Please sign in" }, { status: 401 });
  const b = await req.json();
  await run("update customers set name=?, phone=?, address=?, city=?, state=?, pincode=? where id=?", [b.name || me.name, b.phone || "", b.address || "", b.city || "", b.state || "", b.pincode || "", me.id]);
  if (b.password) {
    if (String(b.password).length < 6) return NextResponse.json({ ok: false, error: "Password must be 6+ characters" }, { status: 400 });
    await run("update customers set password_hash = ? where id = ?", [bcrypt.hashSync(b.password, 10), me.id]);
  }
  return NextResponse.json({ ok: true });
}
