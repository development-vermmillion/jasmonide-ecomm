import { listBackups, maybeBackup } from "@/lib/backup";
import { getSettings } from "@/lib/catalog";
import { fdatetime } from "@/lib/util";
import BackupNow from "@/components/admin/BackupNow";
import { DeleteButton } from "@/components/admin/ui";
import Link from "next/link";
import { orderToken } from "@/lib/token";

export const dynamic = "force-dynamic";
export default async function Backups() {
  await maybeBackup();
  const [s, rows] = [await getSettings(), listBackups()];
  const remote = !(process.env.DATABASE_URL || "file:").startsWith("file:");
  const mb = (n: number) => (n / 1048576 >= 0.1 ? (n / 1048576).toFixed(1) + " MB" : Math.max(1, Math.round(n / 1024)) + " KB");
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Backups</h1><p className="text-sm text-neutral-500">{s.backup_enabled === "1" ? `Automatic backup every ${s.backup_every_hours} hours, keeping the latest ${s.backup_keep}.` : "Automatic backups are off."} Change this in <Link href="/admin/integrations" className="underline">Integrations</Link>.</p></div>
      <div className="card space-y-3 p-5">
        <BackupNow />
        <p className="text-xs text-neutral-500">{remote ? "Your database is remote (Turso), so each backup is a JSON copy of all your tables. Turso also keeps its own point-in-time backups." : "Each backup is a full copy of your store database (products, orders, customers, settings)."} Backups are stored on the server in <code>data/backups</code> — <b>download copies regularly and keep them somewhere else</b> (Google Drive / laptop), because a backup on the same server can't protect you if the server itself is lost. Uploaded product images live in the <code>uploads</code> folder and aren't part of this file.</p>
      </div>
      <div className="card overflow-x-auto"><table className="w-full min-w-[480px]">
        <thead className="border-b border-neutral-200 bg-neutral-50"><tr><th className="th">Backup</th><th className="th">Saved</th><th className="th">Size</th><th className="th"></th></tr></thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map((b) => <tr key={b.file}><td className="td font-medium">{b.file}</td><td className="td text-neutral-500">{fdatetime(new Date(b.time).toISOString())}</td><td className="td">{mb(b.size)}</td>
            <td className="td space-x-3 text-right"><a className="text-xs underline" href={`/api/admin/backups/${b.file}`}>Download</a><DeleteButton url={`/api/admin/backups/${b.file}`} label="Delete" confirm="Delete this backup?" /></td></tr>)}
          {!rows.length && <tr><td className="td text-neutral-500" colSpan={4}>No backups yet — click “Back up now”.</td></tr>}
        </tbody></table></div>
      <details className="card p-5 text-sm"><summary className="cursor-pointer font-medium">Scheduled jobs (refill reminders, backups)</summary>
        <p className="mt-3 text-neutral-600">These run automatically whenever customers visit. To make sure they also run on quiet days, add a free hourly cron (cPanel → Cron Jobs, or cron-job.org) that opens this address:</p>
        <code className="mt-2 block break-all rounded bg-neutral-100 p-2 text-xs">{(s.site_url || "").startsWith("http") ? s.site_url.replace(/\/$/, "") : "https://YOUR-SITE"}/api/cron?t={orderToken("cron")}</code></details>
      <details className="card p-5 text-sm"><summary className="cursor-pointer font-medium">How to restore a backup</summary>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-neutral-600"><li>Stop the site (Hostinger → Node.js app → Stop).</li><li>Replace <code>data/store.db</code> with the backup file (rename it to <code>store.db</code>) using the file manager.</li><li>Start the site again. Ask me if you'd like help doing this.</li></ol></details>
    </div>
  );
}
