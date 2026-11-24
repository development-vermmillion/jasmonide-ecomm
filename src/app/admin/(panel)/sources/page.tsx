import Link from "next/link";
import { all, one } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { inr } from "@/lib/util";
import CartRow from "@/components/admin/CartRow";

export const dynamic = "force-dynamic";
const ago = (s: string) => { const m = Math.round((Date.now() - new Date(s.replace(" ", "T") + "Z").getTime()) / 60000); return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.round(m / 60)}h ago` : `${Math.round(m / 1440)}d ago`; };
const LABEL: Record<string, string> = { instagram: "Instagram", facebook: "Facebook", google: "Google", whatsapp: "WhatsApp", youtube: "YouTube", direct: "Direct / typed link", bing: "Bing", pinterest: "Pinterest", twitter: "X / Twitter", linkedin: "LinkedIn", search: "Other search" };

export default async function Sources({ searchParams }: { searchParams: { days?: string } }) {
  const days = [7, 30, 90].includes(Number(searchParams.days)) ? Number(searchParams.days) : 30;
  const since = `-${days} day`;
  const [s, visits, orders, carts, totals] = await Promise.all([
    getSettings(),
    all("select source, sum(n) as v from visits where day >= date('now', ?) group by source", [since]),
    all("select source, count(*) as n, coalesce(sum(case when status not in ('cancelled','returned') then total end),0) as rev from orders where created_at >= datetime('now', ?) group by source", [since]),
    all("select * from abandoned_carts where recovered = 0 and updated_at >= datetime('now', ?) and updated_at < datetime('now','-30 minutes') order by updated_at desc limit 100", [since]),
    one("select (select count(*) from abandoned_carts where recovered = 1 and updated_at >= datetime('now', ?)) as rec, (select count(*) from abandoned_carts where updated_at >= datetime('now', ?)) as all_", [since, since]),
  ]);
  const map = new Map<string, any>();
  for (const v of visits) map.set(v.source, { source: v.source, visits: v.v, orders: 0, rev: 0 });
  for (const o of orders) { const r = map.get(o.source) || { source: o.source, visits: 0, orders: 0, rev: 0 }; r.orders = o.n; r.rev = o.rev; map.set(o.source, r); }
  const rows = [...map.values()].sort((a, b) => b.rev - a.rev || b.visits - a.visits);
  const maxRev = Math.max(1, ...rows.map((r) => r.rev));
  const totVisits = rows.reduce((a, r) => a + r.visits, 0), totOrders = rows.reduce((a, r) => a + r.orders, 0), totRev = rows.reduce((a, r) => a + r.rev, 0);
  const lost = carts.reduce((a: number, c: any) => a + c.total, 0);
  const nice = (x: string) => LABEL[x] || (x.startsWith("referral:") ? x.slice(9) : x);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="h-serif text-3xl">Sources & abandoned carts</h1><p className="text-sm text-neutral-500">Where your visitors and sales come from, and who left something in their bag.</p></div>
        <div className="flex gap-1 rounded-full bg-[rgb(var(--c-ink)/.06)] p-1 text-sm">{[7, 30, 90].map((d) => <Link key={d} href={`/admin/sources?days=${d}`} className={`rounded-full px-4 py-1.5 transition ${d === days ? "bg-white font-medium shadow-sm" : ""}`}>{d} days</Link>)}</div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[["Visits", totVisits.toLocaleString("en-IN")], ["Orders", totOrders], ["Revenue", inr(totRev)], ["Conversion", totVisits ? (totOrders / totVisits * 100).toFixed(1) + "%" : "—"]].map(([l, v]) => <div key={l as string} className="card p-4"><p className="text-xs text-neutral-500">{l}</p><p className="mt-1 text-2xl font-semibold">{v}</p></div>)}
      </div>
      <section className="card overflow-x-auto p-5">
        <h2 className="font-semibold">Sales by source</h2>
        <p className="mb-3 text-xs text-neutral-500">Source is detected from the link (Instagram bio/ad, Google, WhatsApp…) or from <code>?utm_source=</code> in links you share. Add <code>?utm_source=instagram&utm_medium=bio</code> to your Instagram bio link to measure it.</p>
        <table className="w-full min-w-[560px]">
          <thead className="border-b border-neutral-200"><tr><th className="th">Source</th><th className="th">Visits</th><th className="th">Orders</th><th className="th">Conversion</th><th className="th">Revenue</th><th className="th w-1/4"></th></tr></thead>
          <tbody className="divide-y divide-neutral-100">
            {rows.map((r) => <tr key={r.source}><td className="td font-medium">{nice(r.source)}</td><td className="td">{r.visits}</td><td className="td">{r.orders}</td><td className="td">{r.visits ? (r.orders / r.visits * 100).toFixed(1) + "%" : "—"}</td><td className="td font-medium">{inr(r.rev)}</td>
              <td className="td"><div className="h-2 rounded-full bg-[rgb(var(--c-ink)/.06)]"><div className="bar-in h-2 rounded-full bg-[var(--adm-accent)]" style={{ width: `${(r.rev / maxRev) * 100}%` }} /></div></td></tr>)}
            {!rows.length && <tr><td className="td text-neutral-500" colSpan={6}>No data yet — visits are recorded as people open your site.</td></tr>}
          </tbody></table>
      </section>
      <section className="card overflow-x-auto p-5">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2"><div><h2 className="font-semibold">Abandoned carts</h2><p className="text-xs text-neutral-500">Shoppers who typed their phone/email at checkout but didn't order (after 30 minutes). Click WhatsApp or email to follow up.</p></div>
          <p className="text-sm"><b>{carts.length}</b> waiting · <b>{inr(lost)}</b> in bags · <b>{totals?.rec || 0}</b> recovered</p></div>
        <table className="w-full min-w-[720px]">
          <thead className="border-b border-neutral-200"><tr><th className="th">Shopper</th><th className="th">Bag</th><th className="th">Value</th><th className="th">Source</th><th className="th">Left</th><th className="th"></th></tr></thead>
          <tbody className="divide-y divide-neutral-100">{carts.map((c: any) => <CartRow key={c.id} c={{ ...c, ago: ago(c.updated_at) }} store={s.store_name} />)}
            {!carts.length && <tr><td className="td text-neutral-500" colSpan={6}>No abandoned carts in this period 🎉</td></tr>}</tbody></table>
      </section>
    </div>
  );
}
