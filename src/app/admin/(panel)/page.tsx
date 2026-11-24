import { ArrowRight, CheckCircle2, Download } from "lucide-react";
import Link from "next/link";
import { dashboardStats } from "@/lib/stats";
import { getSettings } from "@/lib/catalog";
import { inr, fdatetime } from "@/lib/util";
import { StatusBadge } from "@/components/admin/ui";
import { KpiCard, RevenueArea, WeekdayBars, FlowBands, HealthTable, ActivityCard, Delta, CountUp } from "@/components/admin/DashCharts";
import MetricToggle from "@/components/admin/MetricToggle";

const pct = (a: number, b: number) => (b ? ((a - b) / b) * 100 : a ? 100 : null);
const rangeLabel = (n: number) => (n === 7 ? "Week" : n === 30 ? "Month" : "Quarter");

export default async function Dashboard({ searchParams }: { searchParams: { days?: string; denied?: string } }) {
  const days = [7, 30, 90].includes(Number(searchParams.days)) ? Number(searchParams.days) : 30;
  const [d, st] = await Promise.all([dashboardStats(days), getSettings()]);
  const vs = `vs previous ${days} days`;
  const rev = d.series.map((x: any) => x.revenue), ord = d.series.map((x: any) => x.orders);
  const aov = d.series.map((x: any) => (x.orders ? x.revenue / x.orders : 0));
  const dow = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, i) => ({
    label, value: d.series.filter((x: any) => (new Date(x.date + "T00:00:00Z").getUTCDay() + 6) % 7 === i).reduce((a: number, x: any) => a + x.orders, 0),
  }));
  const h = d.health.all;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[34px] font-semibold leading-tight tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-[var(--adm-muted)]">Sales, orders and stock health for {st.store_name} · {d.from} → {d.to}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="seg">{[7, 30, 90].map((n) => <Link key={n} href={`/admin?days=${n}`} className={n === days ? "on" : ""}>{rangeLabel(n)}</Link>)}</div>
          <Link href="/admin/reports" className="btn"><Download size={15} /> Reports</Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard i={0} label="Revenue" kind="inr" value={d.cur.revenue} delta={pct(d.cur.revenue, d.prev.revenue)} spark={rev} hint={vs} />
        <KpiCard i={1} label="Orders" value={d.cur.orders} delta={pct(d.cur.orders, d.prev.orders)} spark={ord} hint={vs} />
        <KpiCard i={2} label="Avg. order value" kind="inr" value={Math.round(d.cur.aov)} delta={pct(d.cur.aov, d.prev.aov)} spark={aov} hint={vs} />
        <KpiCard i={3} label="Open orders" value={d.openOrders} warn={d.openOrders > 0} hint="need your action" />
      </div>

      <section>
        <div className="mb-2.5 flex items-baseline gap-2"><h2 className="text-[15px] font-semibold">Revenue</h2><span className="text-xs text-[var(--adm-muted)]">last {days} days · compared with the {days} days before</span></div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card lift p-5 lg:col-span-2">
            <MetricToggle cur={d.series} prev={d.prevSeries} total={d.cur.revenue} delta={pct(d.cur.revenue, d.prev.revenue)} totalOrders={d.cur.orders} />
          </div>
          <div className="card lift flex flex-col p-5">
            <div className="mb-1 flex items-start justify-between"><div><h3 className="text-[15px] font-semibold">Order flow</h3><p className="text-[11.5px] text-[var(--adm-muted)]">From placed to delivered · last {days} days</p></div>
              <span className="chip warn">{h.placed ? Math.round((h.delivered / h.placed) * 100) : 0}% delivered</span></div>
            <div className="mt-auto pt-6"><FlowBands steps={[{ label: "Placed", value: h.placed }, { label: "Paid", value: h.paid }, { label: "Shipped", value: h.shipped }, { label: "Delivered", value: h.delivered }]} /></div>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-2.5 flex items-baseline gap-2"><h2 className="text-[15px] font-semibold">Orders & fulfilment</h2><span className="text-xs text-[var(--adm-muted)]">{d.totalCustomers} customers · {d.newCustomers} new</span></div>
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="card lift p-5">
            <div className="mb-1 flex items-start justify-between"><div><h3 className="text-[15px] font-semibold">Orders by weekday</h3><p className="text-[11.5px] text-[var(--adm-muted)]">When customers buy</p></div><span className="chip">{days === 7 ? "this week" : `${days} days`}</span></div>
            <p className="mb-4 mt-2 text-3xl font-semibold tracking-tight"><CountUp value={d.cur.orders} /> <span className="text-sm font-normal text-[var(--adm-muted)]">orders</span></p>
            <WeekdayBars rows={dow} />
          </div>
          <ActivityCard heat={d.heat} store={st.store_name} />
          <div className="card lift p-5">
            <div className="mb-3"><h3 className="text-[15px] font-semibold">Order health</h3><p className="text-[11.5px] text-[var(--adm-muted)]">Payment & delivery quality</p></div>
            <HealthTable health={d.health} />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card lift p-5">
          <h3 className="mb-4 text-[15px] font-semibold">Top products</h3>
          <Rank rows={d.topProducts.map((p: any) => ({ label: p.name, value: p.revenue, sub: `${p.units} sold` }))} />
        </div>
        <div className="card lift p-5">
          <h3 className="mb-4 text-[15px] font-semibold">Sales by category</h3>
          <Rank rows={d.topCats.map((c: any) => ({ label: c.name, value: c.revenue }))} />
        </div>
        <div className="card lift p-5">
          <h3 className="mb-4 text-[15px] font-semibold">Payment methods</h3>
          <Rank rows={d.payments.map((p: any) => ({ label: p.m === "cod" ? "Cash on delivery" : p.m === "online" ? "Online (Razorpay)" : p.m.toUpperCase(), value: p.total, sub: `${p.n} orders` }))} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-2"><h3 className="text-[15px] font-semibold">Recent orders</h3><Link href="/admin/orders" className="inline-flex items-center gap-1 text-[13px] text-[var(--adm-muted)] hover:text-[var(--adm-accent)]">View all <ArrowRight size={14} /></Link></div>
          <table className="w-full"><tbody className="divide-y divide-[var(--adm-line)]">
            {d.recent.map((o: any) => (
              <tr key={o.id}>
                <td className="td"><Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-[var(--adm-accent)]">{o.number}</Link><p className="text-xs text-[var(--adm-muted)]">{o.name} · {fdatetime(o.created_at)}</p></td>
                <td className="td"><StatusBadge s={o.status} /></td><td className="td text-right font-semibold">{inr(o.total)}</td>
              </tr>
            ))}
          </tbody></table>
        </div>
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 pb-2"><h3 className="text-[15px] font-semibold">Stock alerts</h3><Link href="/admin/inventory?filter=low" className="inline-flex items-center gap-1 text-[13px] text-[var(--adm-muted)] hover:text-[var(--adm-accent)]">Manage stock <ArrowRight size={14} /></Link></div>
          <div className="grid grid-cols-3 gap-3 px-5 pb-3 pt-1 text-[11px] text-[var(--adm-muted)]">
            <div>Stock value<p className="text-base font-semibold text-[rgb(var(--c-ink))]">{inr(d.stockValue)}</p></div>
            <div>On sale<p className="text-base font-semibold text-[rgb(var(--c-ink))]">{d.onSale}</p></div>
            <div>To reorder<p className="text-base font-semibold text-[var(--adm-accent)]">{d.lowStock.length}</p></div>
          </div>
          {d.lowStock.length === 0 ? <p className="flex items-center gap-2 p-5 pt-1 text-sm text-green-700"><CheckCircle2 size={16} /> All stock levels look healthy</p> : (
            <table className="w-full"><tbody className="divide-y divide-[var(--adm-line)]">
              {d.lowStock.map((s: any, i: number) => (
                <tr key={i}><td className="td">{s.name}{s.variant && <span className="text-[var(--adm-muted)]"> — {s.variant}</span>}</td>
                  <td className="td text-right"><span className={`badge ${s.stock <= 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>{s.stock <= 0 ? "Out of stock" : `${s.stock} left`}</span></td></tr>
              ))}
            </tbody></table>
          )}
        </div>
      </section>
    </div>
  );
}

function Rank({ rows }: { rows: { label: string; value: number; sub?: string }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="py-6 text-center text-sm text-[var(--adm-muted)]">No data for this period</p>;
  return (
    <ul className="space-y-3.5">
      {rows.map((r, i) => (
        <li key={r.label} className="rise" style={{ ["--i" as any]: i }}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-[13px]"><span className="truncate"><span className="mr-2 text-[var(--adm-muted)]">{i + 1}</span>{r.label}</span><span className="shrink-0 font-semibold">{inr(r.value)}{r.sub && <span className="ml-1.5 text-[11px] font-normal text-[var(--adm-muted)]">{r.sub}</span>}</span></div>
          <div className="h-1.5 rounded-full bg-[rgb(var(--c-ink)/.07)]"><div className="h-full origin-left rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: i === 0 ? "var(--adm-accent)" : "rgb(var(--c-ink) / .55)", animation: "adm-fade .8s ease both", animationDelay: `${i * 70 + 200}ms` }} /></div>
        </li>
      ))}
    </ul>
  );
}
