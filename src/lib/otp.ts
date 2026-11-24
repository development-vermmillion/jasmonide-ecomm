import { createHash, randomInt } from "crypto";
import { all, one, run } from "./db";

const hash = (phone: string, code: string) => createHash("sha256").update(`${phone}:${code}:${process.env.AUTH_SECRET || "dev"}`).digest("hex");
export const normPhone = (p: string) => String(p || "").replace(/\D/g, "").slice(-10);

/** Create a 6-digit code for a phone. Max 5 codes per hour per number. */
export async function issueOtp(phone: string): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  const p = normPhone(phone);
  if (!/^[6-9]\d{9}$/.test(p)) return { ok: false, error: "Enter a valid 10-digit mobile number" };
  const recent = await one("select count(*) n from otp_codes where phone = ? and created_at > datetime('now','-1 hour')", [p]);
  if ((recent?.n || 0) >= 5) return { ok: false, error: "Too many codes requested. Please try again in an hour." };
  const code = String(randomInt(100000, 1000000));
  await run("insert into otp_codes (phone, code_hash, expires_at) values (?,?, datetime('now','+10 minutes'))", [p, hash(p, code)]);
  await run("delete from otp_codes where created_at < datetime('now','-1 day')");
  return { ok: true, code };
}

export async function checkOtp(phone: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const p = normPhone(phone);
  const row = await one("select id, code_hash, attempts from otp_codes where phone = ? and expires_at > datetime('now') order by id desc limit 1", [p]);
  if (!row) return { ok: false, error: "Code expired. Please request a new one." };
  if (row.attempts >= 5) return { ok: false, error: "Too many wrong attempts. Please request a new code." };
  if (row.code_hash !== hash(p, String(code || "").trim())) {
    await run("update otp_codes set attempts = attempts + 1 where id = ?", [row.id]);
    return { ok: false, error: "That code isn't right. Please check and try again." };
  }
  await run("delete from otp_codes where phone = ?", [p]);
  return { ok: true };
}
void all;
