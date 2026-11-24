import { NextResponse } from "next/server";
import { getSettings } from "@/lib/catalog";
import { issueOtp } from "@/lib/otp";
import { sendOtp } from "@/lib/notify";

export async function POST(req: Request) {
  const s = await getSettings();
  if (s.accounts_enabled !== "1" || s.login_otp_enabled !== "1") return NextResponse.json({ ok: false, error: "Phone sign-in is not available" }, { status: 403 });
  const { phone } = await req.json();
  const r = await issueOtp(String(phone || ""));
  if (!r.ok) return NextResponse.json(r, { status: 400 });
  const d = await sendOtp(String(phone), r.code);
  if (!d.ok) return NextResponse.json({ ok: false, error: d.error || "Could not send the code" }, { status: 502 });
  // test mode: no SMS is sent, so show the code to let you try the flow
  return NextResponse.json({ ok: true, ...(d.test ? { testCode: r.code } : {}) });
}
