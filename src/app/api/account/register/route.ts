import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { one, run } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { signCustomer, setCustomerCookie } from "@/lib/customer-auth";

export async function POST(req: Request) {
  const s = await getSettings();
  if (s.accounts_enabled !== "1") return NextResponse.json({ ok: false, error: "Accounts are disabled" }, { status: 403 });
  const b = await req.json();
  const email = String(b.email || "").trim().toLowerCase();
  if (!b.name?.trim() || !/^\S+@\S+\.\S+$/.test(email) || String(b.password || "").length < 6)
    return NextResponse.json({ ok: false, error: "Enter your name, a valid email and a password of 6+ characters" }, { status: 400 });
  const ex = await one("select id, password_hash from customers where lower(email) = ?", [email]);
  let id: number;
  if (ex?.password_hash) return NextResponse.json({ ok: false, error: "An account with this email already exists. Please sign in." }, { status: 400 });
  if (ex) { // claim a guest-checkout record so earlier orders show up in the account
    id = ex.id;
    await run("update customers set name = ?, phone = coalesce(nullif(?, ''), phone), password_hash = ? where id = ?", [b.name.trim(), b.phone || "", bcrypt.hashSync(b.password, 10), id]);
  } else {
    id = (await run("insert into customers (name,email,phone,password_hash) values (?,?,?,?)", [b.name.trim(), email, b.phone || "", bcrypt.hashSync(b.password, 10)])).id;
  }
  const res = NextResponse.json({ ok: true });
  setCustomerCookie(res, await signCustomer(id));
  return res;
}
