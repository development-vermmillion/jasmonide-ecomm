import { NextResponse } from "next/server";
import { rzpFetch } from "@/lib/payments";
import { getSettings, getSecret } from "@/lib/catalog";

export async function POST() {
  const s = await getSettings();
  if (!s.razorpay_key_id || !(await getSecret("razorpay_key_secret"))) return NextResponse.json({ ok: false, error: "Save your Key ID and Key secret first." });
  try {
    await rzpFetch("/payments?count=1");
    return NextResponse.json({ ok: true, mode: s.razorpay_key_id.startsWith("rzp_live") ? "LIVE" : "TEST" });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message });
  }
}
