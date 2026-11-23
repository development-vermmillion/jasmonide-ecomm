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
    return await one("select id, name, email, phone, address, city, state, pincode from customers where id = ?", [Number(payload.id)]);
  } catch {
    return null;
  }
}
