import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const COOKIE = "admin_session";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || "dev-secret-change-me-please-32chars!!");

export type Session = { id: number; name: string; email: string; role: string };

export async function signSession(s: Session) {
  return new SignJWT(s as any).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(secret());
}
export async function verifyToken(token?: string): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as any;
  } catch {
    return null;
  }
}
export async function getSession(): Promise<Session | null> {
  return verifyToken(cookies().get(COOKIE)?.value);
}
