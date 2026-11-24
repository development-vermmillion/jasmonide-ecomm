import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { one } from "./db";

export const CCOOKIE = "cust_session";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me-please-32chars!!");

export async function signCustomer(id: number) {
  return new SignJWT({ id }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("30d").sign(secret());
}
export function setCustomerCookie(res: any, token: string) {
  res.cookies.set(CCOOKIE, token, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30, secure: process.env.NODE_ENV === "production" && process.env.INSECURE_COOKIES !== "1" });
}
export async function getCustomer() {
  const t = cookies().get(CCOOKIE)?.value;
  if (!t) return null;
  try {
    const { payload } = await jwtVerify(t, secret());
    return await one("select id, name, email, phone, address, city, state, pincode, points, credit, referral_code from customers where id = ?", [Number(payload.id)]);
  } catch {
    return null;
  }
}

/** Find a customer by phone (last 10 digits) or email, or create one. Used by OTP and Google sign-in. */
export async function findOrCreateCustomer(o: { phone?: string; email?: string; name?: string }) {
  const { run } = await import("./db");
  const p10 = String(o.phone || "").replace(/\D/g, "").slice(-10);
  const email = String(o.email || "").trim().toLowerCase();
  let c: any = null;
  if (p10) c = await one("select id, name, email, phone from customers where substr(replace(replace(replace(phone,' ',''),'+',''),'-',''), -10) = ?", [p10]);
  if (!c && email) c = await one("select id, name, email, phone from customers where lower(email) = ?", [email]);
  if (c) {
    // fill in anything we just learned
    await run("update customers set email = case when email = '' then ? else email end, phone = case when phone = '' then ? else phone end, name = case when name in ('', 'Customer') and ? != '' then ? else name end where id = ?", [email, p10 ? "+91" + p10 : "", o.name || "", o.name || "", c.id]);
    return c.id as number;
  }
  return (await run("insert into customers (name,email,phone) values (?,?,?)", [o.name?.trim() || "Customer", email, p10 ? "+91" + p10 : ""])).id;
}

/** Public origin of this request (works behind proxies like Hostinger). */
export const origin = (req: Request) => {
  const h = req.headers, host = h.get("x-forwarded-host") || h.get("host") || new URL(req.url).host;
  const proto = h.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : new URL(req.url).protocol.replace(":", ""));
  return `${proto}://${host}`;
};

