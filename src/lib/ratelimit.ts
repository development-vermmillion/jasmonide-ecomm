import { one, run } from "./db";

/** Client IP behind proxies (Hostinger / cPanel / Cloudflare). */
export function clientIp(req: Request) {
  const h = req.headers;
  return (h.get("cf-connecting-ip") || h.get("x-forwarded-for") || h.get("x-real-ip") || "local").split(",")[0].trim().slice(0, 64);
}

/** Simple database-backed limiter: at most `max` hits per `windowSec` for `key`. Returns true when the action is allowed. */
export async function allow(key: string, max: number, windowSec: number): Promise<boolean> {
  const now = Date.now(), from = now - windowSec * 1000;
  const r = await one("select count(*) n from rate_hits where key = ? and ts > ?", [key, from]);
  if ((r?.n || 0) >= max) return false;
  await run("insert into rate_hits (key, ts) values (?, ?)", [key, now]);
  if (Math.random() < 0.02) await run("delete from rate_hits where ts < ?", [now - 24 * 3600 * 1000]);
  return true;
}

export const TOO_MANY = { ok: false, error: "Too many attempts. Please wait a few minutes and try again." };
