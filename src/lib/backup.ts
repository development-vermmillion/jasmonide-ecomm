import fs from "fs";
import path from "path";
import { rawClient, all } from "./db";
import { getSettings } from "./catalog";

export const BACKUP_DIR = path.join(process.cwd(), "data", "backups");
const TABLES = ["settings", "admins", "categories", "products", "variants", "combo_items", "coupons", "customers", "orders", "order_events", "order_items", "stock_log", "reels", "reviews", "returns", "subscribers", "enquiries", "notify_requests", "blog_posts", "faqs", "bulk_rules", "assistant_chats", "assistant_taught", "visits", "abandoned_carts"];
const stamp = () => new Date().toISOString().replace(/[-:]/g, "").replace(/\..*/, "").replace("T", "-");

/** Save a copy of the database. Local SQLite file → a consistent .db copy. Remote DB (Turso) → a .json dump of every table. */
export async function backupNow(kind = "manual"): Promise<{ ok: boolean; file?: string; error?: string }> {
  try {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
    const url = process.env.DATABASE_URL || "file:./data/store.db";
    if (url.startsWith("file:")) {
      const file = `store-${stamp()}-${kind}.db`;
      const c = await rawClient();
      await c.execute(`vacuum into '${path.join(BACKUP_DIR, file).replace(/'/g, "''")}'`);
      await prune();
      return { ok: true, file };
    }
    const dump: Record<string, any[]> = {};
    for (const t of TABLES) dump[t] = await all(`select * from ${t}`);
    const file = `store-${stamp()}-${kind}.json`;
    fs.writeFileSync(path.join(BACKUP_DIR, file), JSON.stringify({ created: new Date().toISOString(), tables: dump }));
    await prune();
    return { ok: true, file };
  } catch (e: any) { return { ok: false, error: e.message || "Backup failed" }; }
}

export function listBackups() {
  try {
    return fs.readdirSync(BACKUP_DIR).filter((f) => /^store-.*\.(db|json)$/.test(f)).map((f) => { const st = fs.statSync(path.join(BACKUP_DIR, f)); return { file: f, size: st.size, time: st.mtimeMs }; }).sort((a, b) => b.time - a.time);
  } catch { return []; }
}

async function prune() {
  const keep = Math.max(3, Number((await getSettings()).backup_keep) || 14);
  for (const b of listBackups().slice(keep)) try { fs.unlinkSync(path.join(BACKUP_DIR, b.file)); } catch {}
}

/** Called opportunistically (admin panel, new orders): makes a backup when the last one is older than the chosen interval. */
export async function maybeBackup() {
  const g = globalThis as any;
  if (g.__backupBusy) return;
  const s = await getSettings();
  if (s.backup_enabled !== "1") return;
  const every = Math.max(1, Number(s.backup_every_hours) || 24) * 3600_000;
  const last = listBackups()[0]?.time || 0;
  if (Date.now() - last < every) return;
  g.__backupBusy = true;
  try { await backupNow("auto"); } finally { g.__backupBusy = false; }
}
