import { NextResponse } from "next/server";
import { getSettings } from "@/lib/catalog";
import { checkOtp } from "@/lib/otp";
import { signCustomer, setCustomerCookie, findOrCreateCustomer } from "@/lib/customer-auth";

export async function POST(req: Request) {
  const s = await getSettings();
  if (s.accounts_enabled !== "1" || s.login_otp_enabled !== "1") return NextResponse.json({ ok: false, error: "Phone sign-in is not available" }, { status: 403 });
  const { phone, code, name } = await req.json();
  const r = await checkOtp(String(phone || ""), String(code || ""));
  if (!r.ok) return NextResponse.json(r, { status: 400 });
  const id = await findOrCreateCustomer({ phone: String(phone), name: String(name || "") });
  const res = NextResponse.json({ ok: true });
  setCustomerCookie(res, await signCustomer(id));
  return res;
}
