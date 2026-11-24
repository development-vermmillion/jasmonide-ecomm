import { NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";
import { one, run } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { origin } from "@/lib/customer-auth";
import { allow, clientIp, TOO_MANY } from "@/lib/ratelimit";
import { sendEmail, emailShell } from "@/lib/notify";

/** Always answers the same way, so nobody can use this to discover which emails have accounts. */
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if ((await getSettings()).forgot_enabled === "0") return NextResponse.json({ ok: false, error: "Password reset is switched off. Please contact us." }, { status: 403 });
  const e = String(email || "").trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(e)) return NextResponse.json({ ok: false, error: "Enter your email address" }, { status: 400 });
  if (!(await allow("forgot:ip:" + clientIp(req), 8, 3600)) || !(await allow("forgot:" + e, 3, 3600))) return NextResponse.json(TOO_MANY, { status: 429 });
  const s = await getSettings();
  const c = await one("select id, name from customers where lower(email) = ?", [e]);
  let test = "";
  if (c) {
    const raw = randomBytes(24).toString("hex");
    await run("insert into password_resets (customer_id, token_hash, expires_at) values (?,?,datetime('now','+30 minutes'))", [c.id, createHash("sha256").update(raw).digest("hex")]);
    const link = `${origin(req)}/account/reset?token=${raw}`;
    const r = await sendEmail(e, `Reset your ${s.store_name} password`, emailShell(s, "Reset your password", `<p>Hi ${String(c.name || "").replace(/</g, "")}, tap the button to choose a new password. This link works for 30 minutes. If you didn't ask for it, you can ignore this email.</p>`, { href: link, label: "Choose a new password" }));
    // email not set up yet (e.g. while testing) → show the link on screen only when OTP is in test mode
    if (!r.ok && s.otp_provider === "test") test = link;
  }
  return NextResponse.json({ ok: true, testLink: test || undefined });
}
