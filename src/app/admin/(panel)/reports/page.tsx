import { Download } from "lucide-react";
import Link from "next/link";
import { all, one } from "@/lib/db";
import { dayExpr, rangeDates } from "@/lib/stats";
import { inr } from "@/lib/util";
import { Kpi } from "@/components/admin/Charts";

const LIVE = "o.status not in ('cancelled','returned')";

export default async function Reports({ searchParams }: { searchParams: { days?: string } }) {
  const days = [7, 30, 90, 365].includes(Number(searchParams.days)) ? Number(searchParams.days) : 30;
  const { from, to } = rangeDates(days);
  const rng = [from, to];
  const [tot, byDay, byProduct, byCat, byState, refunds, coupons] = await Promise.all([
    one(`select coalesce(sum(o.subtotal),0) gross, coalesce(sum(o.discount),0) discounts, coalesce(sum(o.shipping),0) shipping, coalesce(sum(o.tax),0) tax, coalesce(sum(o.total),0) net, count(*) orders
         from orders o where ${LIVE} and ${dayExpr()} between ? and ?`, rng),
    all(`select ${dayExpr()} d, count(*) orders, sum(o.total) revenue from orders o where ${LIVE} and ${dayExpr()} between ? and ? group by d order by d desc limit 31`, rng),
    all(`select oi.name, oi.variant_name, sum(oi.qty) units, sum(oi.qty*oi.price) revenue from order_items oi join orders o on o.id=oi.order_id where ${LIVE} and ${dayExpr()} between ? and ? group by oi.product_id, oi.variant_name order by revenue desc limit 15`, rng),
    all(`select coalesce(c.name,'Uncategorised') name, sum(oi.qty) units, sum(oi.qty*oi.price) revenue from order_items oi join orders o on o.id=oi.order_id left join products p on p.id=oi.product_id left join categories c on c.id=p.category_id where ${LIVE} and ${dayExpr()} between ? and ? group by c.id order by revenue desc`, rng),
    all(`select coalesce(nullif(o.state,''),'—') state, count(*) orders, sum(o.total) revenue from orders o where ${LIVE} and ${dayExpr()} between ? and ? group by state order by revenue desc limit 8`, rng),
    one(`select count(*) n, coalesce(sum(o.total),0) t from orders o where o.status in ('cancelled','returned') and ${dayExpr()} between ? and ?`, rng),
    all(`select o.coupon_code code, count(*) uses, sum(o.discount) given from orders o where ${LIVE} and o.coupon_code != '' and ${dayExpr()} between ? and ? group by o.coupon_code`, rng),
  ]);
  const Table = ({ head, rows }: { head: string[]; rows: any[][] }) => (
    <div className="overflow-x-auto"><table className="w-full"><thead className="border-b border-neutral-200"><tr>{head.map((h, i) => <th key={h} className={`th ${i > 0 ? "text-right" : ""}`}>{h}</th>)}</tr></thead>
      <tbody className="divide-y divide-neutral-100">{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={`td ${j > 0 ? "text-right" : ""}`}>{c}</td>)}</tr>)}
        {!rows.length && <tr><td colSpan={head.length} className="py-6 text-center text-sm text-neutral-400">No data</td></tr>}</tbody></table></div>
  );
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="h-serif text-3xl">Sales reports</h1><p className="text-sm text-neutral-500">{from} → {to}</p></div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-full border border-neutral-300 bg-white p-0.5 text-sm">{[7, 30, 90, 365].map((n) => <Link key={n} href={`/admin/reports?days=${n}`} className={`rounded-full px-4 py-1.5 ${n === days ? "bg-plum text-white" : "text-neutral-600"}`}>{n === 365 ? "1y" : n + "d"}</Link>)}</div>
          <a href="/api/admin/export/orders" className="btn-outline"><Download size={16} /> Export orders</a>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <Kpi tone="bg-lilac/70" label="Gross sales" value={inr(tot.gross)} hint={`${tot.orders} orders`} />
        <Kpi tone="bg-mint/70" label="Discounts" value={inr(tot.discounts)} hint="coupons" />
        <Kpi tone="bg-sky/70" label="Shipping" value={inr(tot.shipping)} hint="collected" />
        <Kpi tone="bg-butter/80" label="Tax" value={inr(tot.tax)} hint="collected" />
        <Kpi tone="bg-blush/70" label="Net revenue" value={inr(tot.net)} hint={`${refunds.n} cancelled/returned (${inr(refunds.t)})`} />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-5"><h2 className="mb-2 font-semibold">Best-selling products</h2><Table head={["Product", "Units", "Revenue"]} rows={byProduct.map((p: any) => [<>{p.name}{p.variant_name && <span className="text-neutral-500"> — {p.variant_name}</span>}</>, p.units, inr(p.revenue)])} /></div>
        <div className="card p-5"><h2 className="mb-2 font-semibold">By category</h2><Table head={["Category", "Units", "Revenue"]} rows={byCat.map((c: any) => [c.name, c.units, inr(c.revenue)])} /></div>
        <div className="card p-5"><h2 className="mb-2 font-semibold">By state</h2><Table head={["State", "Orders", "Revenue"]} rows={byState.map((s: any) => [s.state, s.orders, inr(s.revenue)])} /></div>
        <div className="card p-5"><h2 className="mb-2 font-semibold">Coupon usage</h2><Table head={["Code", "Uses", "Discount given"]} rows={coupons.map((c: any) => [c.code, c.uses, inr(c.given)])} /></div>
        <div className="card p-5 lg:col-span-2"><h2 className="mb-2 font-semibold">Daily sales (latest 31 days)</h2><Table head={["Date", "Orders", "Revenue"]} rows={byDay.map((d: any) => [d.d, d.orders, inr(d.revenue)])} /></div>
      </div>
    </div>
  );
}
