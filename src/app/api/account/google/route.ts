import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSettings } from "@/lib/catalog";
import { origin } from "@/lib/customer-auth";

export async function GET(req: NextRequest) {
  const s = await getSettings();
  if (s.accounts_enabled !== "1" || s.login_google_enabled !== "1" || !s.google_client_id) return NextResponse.redirect(new URL("/account/login?err=google", req.url));
  const next = req.nextUrl.searchParams.get("next") || "/account";
  const state = randomBytes(16).toString("hex");
  const q = new URLSearchParams({ client_id: s.google_client_id, redirect_uri: origin(req) + "/api/account/google/callback", response_type: "code", scope: "openid email profile", state, prompt: "select_account" });
  const res = NextResponse.redirect("https://accounts.google.com/o/oauth2/v2/auth?" + q);
  res.cookies.set("g_state", state + "|" + (next.startsWith("/") ? next : "/account"), { httpOnly: true, sameSite: "lax", path: "/", maxAge: 600 });
  return res;
}
