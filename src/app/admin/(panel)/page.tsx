import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { dashboardStats } from "@/lib/stats";
import { inr, fdatetime } from "@/lib/util";
import { RevenueChart, HBars, Kpi } from "@/components/admin/Charts";
import { StatusBadge } from "@/components/admin/ui";

const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : a ? 100 : null);

export default async function Dashboard({ searchParams }: { searchParams: { days?: string } }) {
  const days = [7, 30, 90].includes(Number(searchParams.days)) ? Number(searchParams.days) : 30;
  const d = await dashboardStats(days);
  const vs = `vs previous ${days} days`;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="h-serif text-3xl">Sales dashboard</h1><p className="text-sm text-neutral-500">{d.from} → {d.to}</p></div>
        <div className="flex rounded-full border border-neutral-300 bg-white p-0.5 text-sm">
          {[7, 30, 90].map((n) => (
            <Link key={n} href={`/admin?days=${n}`} className={`rounded-full px-4 py-1.5 ${n === days ? "bg-plum text-white" : "text-neutral-600"}`}>{n}d</Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi tone="bg-lilac/70" label="Revenue" value={inr(d.cur.revenue)} delta={pct(d.cur.revenue, d.prev.revenue)} hint={vs} />
        <Kpi tone="bg-mint/70" label="Orders" value={String(d.cur.orders)} delta={pct(d.cur.orders, d.prev.orders)} hint={vs} />
        <Kpi tone="bg-sky/70" label="Avg. order value" value={inr(Math.round(d.cur.aov))} delta={pct(d.cur.aov, d.prev.aov)} hint={vs} />
        <Kpi tone="bg-butter/80" label="Open orders" value={String(d.openOrders)} hint="need action" />
        <Kpi tone="bg-blush/70" label="Customers" value={String(d.totalCustomers)} hint={`${d.newCustomers} new in period`} />
        <Kpi tone="bg-peach/70" label="Stock value" value={inr(d.stockValue)} hint="at selling price" />
        <Kpi tone="bg-lilac/50" label="Low / out of stock" value={String(d.lowStock.length)} hint="items to reorder" />
        <Kpi tone="bg-mint/50" label="Products on sale" value={String(d.onSale)} hint="active offers" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-2 flex justify-between"><h2 className="font-semibold">Revenue</h2><span className="text-xs text-neutral-500">Excludes cancelled & returned</span></div>
          <RevenueChart data={d.series} />
        </div>
        <div className="card p-5">
          <h2 className="mb-4 font-semibold">Orders by status</h2>
          <HBars money={false} rows={d.statuses.map((s: any) => ({ label: s.status[0].toUpperCase() + s.status.slice(1), value: s.n, sub: inr(s.total) }))} />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5"><h2 className="mb-4 font-semibold">Top products</h2>
          <HBars rows={d.topProducts.map((p: any) => ({ label: p.name, value: p.revenue, sub: `${p.units} sold` }))} /></div>
        <div className="card p-5"><h2 className="mb-4 font-semibold">Sales by category</h2>
          <HBars rows={d.topCats.map((c: any) => ({ label: c.name, value: c.revenue }))} /></div>
        <div className="card p-5"><h2 className="mb-4 font-semibold">Payment methods</h2>
          <HBars rows={d.payments.map((p: any) => ({ label: p.m === "cod" ? "Cash on delivery" : p.m.toUpperCase(), value: p.total, sub: `${p.n} orders` }))} /></div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="flex justify-between p-5 pb-3"><h2 className="font-semibold">Recent orders</h2><Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm underline">View all <ArrowRight size={14} /></Link></div>
          <table className="w-full"><tbody className="divide-y divide-neutral-100">
            {d.recent.map((o: any) => (
              <tr key={o.id} className="hover:bg-neutral-50">
                <td className="td"><Link href={`/admin/orders/${o.id}`} className="font-medium underline-offset-2 hover:underline">{o.number}</Link><p className="text-xs text-neutral-500">{o.name} · {fdatetime(o.created_at)}</p></td>
                <td className="td"><StatusBadge s={o.status} /></td><td className="td text-right font-medium">{inr(o.total)}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
        <div className="card overflow-hidden">
          <div className="flex justify-between p-5 pb-3"><h2 className="font-semibold">Low stock alerts</h2><Link href="/admin/inventory?filter=low" className="inline-flex items-center gap-1 text-sm underline">Manage stock <ArrowRight size={14} /></Link></div>
          {d.lowStock.length === 0 ? <p className="flex items-center gap-2 p-5 pt-0 text-sm text-green-700"><CheckCircle2 size={16} /> All stock levels look healthy</p> : (
            <table className="w-full"><tbody className="divide-y divide-neutral-100">
              {d.lowStock.map((s: any, i: number) => (
                <tr key={i}><td className="td">{s.name}{s.variant && <span className="text-neutral-500"> — {s.variant}</span>}</td>
                  <td className="td text-right"><span className={`badge ${s.stock <= 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>{s.stock <= 0 ? "Out of stock" : `${s.stock} left`}</span></td></tr>
              ))}
            </tbody></table>
          )}
        </div>
      </div>
    </div>
  );
}
