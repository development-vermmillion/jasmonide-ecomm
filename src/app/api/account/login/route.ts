import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { one } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { signCustomer, setCustomerCookie } from "@/lib/customer-auth";

export async function POST(req: Request) {
  if ((await getSettings()).accounts_enabled !== "1") return NextResponse.json({ ok: false, error: "Accounts are disabled" }, { status: 403 });
  const { email, password } = await req.json();
  const c = await one("select id, password_hash from customers where lower(email) = ?", [String(email || "").trim().toLowerCase()]);
  if (!c?.password_hash || !bcrypt.compareSync(String(password || ""), c.password_hash))
    return NextResponse.json({ ok: false, error: "Incorrect email or password" }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  setCustomerCookie(res, await signCustomer(c.id));
  return res;
}
