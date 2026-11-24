import { NextResponse } from "next/server";
import { getSettings } from "@/lib/catalog";

/** Small public bits of config that client components need. */
export const dynamic = "force-dynamic";
export async function GET() {
  const s = await getSettings();
  return NextResponse.json({ waCart: s.wa_cart_button === "1", whatsapp: s.whatsapp, store: s.store_name, otp: s.login_otp_enabled === "1", google: s.login_google_enabled === "1" && !!s.google_client_id, password: s.login_password_enabled === "1" });
}
