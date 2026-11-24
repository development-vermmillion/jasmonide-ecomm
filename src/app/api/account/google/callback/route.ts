import { NextRequest, NextResponse } from "next/server";
import { getSettings, getSecret } from "@/lib/catalog";
import { signCustomer, setCustomerCookie, findOrCreateCustomer, origin } from "@/lib/customer-auth";

export async function GET(req: NextRequest) {
  const fail = (m = "google") => NextResponse.redirect(new URL("/account/login?err=" + m, origin(req)));
  const s = await getSettings();
  const secret = await getSecret("google_client_secret");
  const code = req.nextUrl.searchParams.get("code"), state = req.nextUrl.searchParams.get("state");
  const [st, next] = (req.cookies.get("g_state")?.value || "").split("|");
  if (!code || !state || state !== st || !s.google_client_id || !secret || s.login_google_enabled !== "1") return fail();
  try {
    const t = await (await fetch("https://oauth2.googleapis.com/token", {
      method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: s.google_client_id, client_secret: secret, redirect_uri: origin(req) + "/api/account/google/callback", grant_type: "authorization_code" }),
    })).json();
    if (!t.access_token) return fail();
    const u = await (await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: "Bearer " + t.access_token } })).json();
    if (!u.email || u.email_verified === false) return fail();
    const id = await findOrCreateCustomer({ email: u.email, name: u.name });
    const res = NextResponse.redirect(new URL(next?.startsWith("/") ? next : "/account", origin(req)));
    setCustomerCookie(res, await signCustomer(id));
    res.cookies.delete("g_state");
    return res;
  } catch { return fail(); }
}
