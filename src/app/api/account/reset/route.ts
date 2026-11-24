import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createHash } from "crypto";
import { one, run } from "@/lib/db";
import { allow, clientIp, TOO_MANY } from "@/lib/ratelimit";
import { signCustomer, setCustomerCookie } from "@/lib/customer-auth";

export async function POST(req: Request) {
  if (!(await allow("reset:ip:" + clientIp(req), 15, 3600))) return NextResponse.json(TOO_MANY, { status: 429 });
  const { token, password } = await req.json().catch(() => ({}));
  if (String(password || "").length < 6) return NextResponse.json({ ok: false, error: "Use a password of 6 or more characters" }, { status: 400 });
  const h = createHash("sha256").update(String(token || "")).digest("hex");
  const r = await one("select * from password_resets where token_hash = ? and used = 0 and expires_at > datetime('now')", [h]);
  if (!r) return NextResponse.json({ ok: false, error: "This link has expired. Please ask for a new one." }, { status: 400 });
  await run("update customers set password_hash = ? where id = ?", [bcrypt.hashSync(String(password), 10), r.customer_id]);
  await run("update password_resets set used = 1 where customer_id = ?", [r.customer_id]);
  const res = NextResponse.json({ ok: true });
  setCustomerCookie(res, await signCustomer(r.customer_id));
  return res;
}
