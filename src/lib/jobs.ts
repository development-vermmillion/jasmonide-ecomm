import { all, one, run } from "./db";
import { getSettings } from "./catalog";
import { orderToken } from "./token";

const g = globalThis as any;
const esc = (t: any) => String(t ?? "").replace(/</g, "&lt;");

/** Refill reminders for "Subscribe & save" plans. Moves each plan's next date forward so it only reminds once per cycle. */
export async function sendRefillReminders(onlyId?: number) {
  const s = await getSettings();
  if (s.subs_enabled !== "1") return 0;
  const lead = Math.max(0, Number(s.subs_remind_days) || 0);
  const due = await all(
    `select s.*, p.name as pname, c.name as cname, c.email, c.phone, v.name as vname from subscriptions s
     join products p on p.id = s.product_id join customers c on c.id = s.customer_id left join variants v on v.id = s.variant_id
     where ${onlyId ? "s.id = ?" : "s.active = 1 and date(s.next_date, ?) <= date('now')"} limit 50`, [onlyId ?? `-${lead} day`]);
  const base = (s.site_url || "").startsWith("http") ? s.site_url.replace(/\/$/, "") : "";
  const { sendEmail, sendWhatsApp, emailShell } = await import("./notify");
  let n = 0;
  for (const d of due) {
    const link = `${base}/refill/${d.id}?t=${orderToken("sub" + d.id)}`;
    const name = `${d.pname}${d.vname ? " — " + d.vname : ""}`;
    let sent = false;
    if (d.email) sent = (await sendEmail(d.email, `Time for your ${d.pname} refill`, emailShell(s, `Running low, ${esc(String(d.cname || "").split(" ")[0])}?`, `<p>It's about time for your <b>${esc(name)}</b>. Reorder in one tap and enjoy <b>${esc(s.subs_discount)}% off</b> your refill.</p>`, base ? { href: link, label: "Refill now" } : undefined))).ok || sent;
    if (d.phone && s.notify_status_whatsapp === "1") sent = (await sendWhatsApp(d.phone, s.wa_order_template, [String(d.cname || "there").split(" ")[0], name, "refill reminder", link])).ok || sent;
    // only move on when a reminder really went out; otherwise it is retried once email/WhatsApp is set up
    if (!sent) continue;
    await run("update subscriptions set next_date = date('now', ?), last_reminded = date('now') where id = ?", [`+${d.every_days} day`, d.id]);
    n++;
  }
  return n;
}

/** Runs the scheduled work at most once an hour. Called from page loads and the /api/cron URL. */
export async function maybeRunJobs(force = false) {
  const now = Date.now();
  if (!force && g.__jobsAt && now - g.__jobsAt < 10 * 60 * 1000) return null;
  g.__jobsAt = now;
  const last = await one("select value from settings where key = 'jobs_last_run'");
  if (!force && last && now - Number(last.value) < 60 * 60 * 1000) return null;
  await run("insert into settings (key, value) values ('jobs_last_run', ?) on conflict(key) do update set value = excluded.value", [String(now)]);
  const out: Record<string, number | string> = {};
  try { out.refills = await sendRefillReminders(); } catch (e: any) { out.refills = "error: " + e.message; }
  try { const { maybeBackup } = await import("./backup"); await maybeBackup(); out.backup = "checked"; } catch {}
  return out;
}
