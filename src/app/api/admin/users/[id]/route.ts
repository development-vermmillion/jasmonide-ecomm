import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { run, one } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { ROLES } from "@/lib/roles";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const s = await getSession();
  const id = Number(params.id);
  if (s?.role !== "owner" && s?.id !== id) return NextResponse.json({ ok: false, error: "Not allowed" }, { status: 403 });
  const b = await req.json();
  if (b.password) {
    if (String(b.password).length < 6) return NextResponse.json({ ok: false, error: "Password must be 6+ characters" }, { status: 400 });
    await run("update admins set password_hash = ? where id = ?", [bcrypt.hashSync(b.password, 10), id]);
  }
  if (b.role && s?.role === "owner") {
    if (!(b.role in ROLES)) return NextResponse.json({ ok: false, error: "Unknown role" }, { status: 400 });
    if (b.role !== "owner" && (await one("select role from admins where id = ?", [id]))?.role === "owner" && !(await one("select count(*) n from admins where role='owner' and id != ?", [id]))?.n)
      return NextResponse.json({ ok: false, error: "Keep at least one owner" }, { status: 400 });
    await run("update admins set role = ? where id = ?", [b.role, id]);
  }
  return NextResponse.json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const s = await getSession();
  const id = Number(params.id);
  if (s?.role !== "owner") return NextResponse.json({ ok: false, error: "Only the owner can remove users" }, { status: 403 });
  if (s.id === id) return NextResponse.json({ ok: false, error: "You can't remove yourself" }, { status: 400 });
  const owners = await one("select count(*) n from admins where role='owner' and id != ?", [id]);
  if (!owners?.n) return NextResponse.json({ ok: false, error: "Keep at least one owner" }, { status: 400 });
  await run("delete from admins where id = ?", [id]);
  return NextResponse.json({ ok: true });
}
