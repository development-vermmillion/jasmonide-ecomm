import { inr } from "@/lib/util";
import { IndianRupee, ShoppingBag, Receipt, Clock, Users, Warehouse, AlertTriangle, Percent, Ticket, Truck, Landmark, TrendingUp, ArrowUp, ArrowDown } from "lucide-react";

const KPI_ICONS: Record<string, any> = { Revenue: IndianRupee, Orders: ShoppingBag, "Avg. order value": Receipt, "Open orders": Clock, Customers: Users, "Stock value": Warehouse, "Low / out of stock": AlertTriangle, "Products on sale": Percent, "Gross sales": IndianRupee, Discounts: Ticket, Shipping: Truck, Tax: Landmark, "Net revenue": TrendingUp };

export function RevenueChart({ data }: { data: { date: string; revenue: number; orders: number }[] }) {
  const W = 800, H = 240, P = { l: 48, r: 10, t: 10, b: 26 };
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const nice = (m: number) => { const p = Math.pow(10, Math.floor(Math.log10(m))); return Math.ceil(m / p) * p; };
  const top = nice(max);
  const bw = (W - P.l - P.r) / data.length;
  const y = (v: number) => P.t + (H - P.t - P.b) * (1 - v / top);
  const step = Math.ceil(data.length / 8);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Daily revenue">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={P.l} x2={W - P.r} y1={y(top * f)} y2={y(top * f)} stroke="#e5e5e5" />
          <text x={P.l - 6} y={y(top * f) + 4} textAnchor="end" fontSize="10" fill="#888">{top * f >= 1000 ? Math.round((top * f) / 1000) + "k" : Math.round(top * f)}</text>
        </g>
      ))}
      {data.map((d, i) => (
        <g key={d.date}>
          <rect x={P.l + i * bw + bw * 0.15} y={y(d.revenue)} width={bw * 0.7} height={Math.max(0, H - P.b - y(d.revenue))} rx="2" fill="#8E7CC3" opacity={d.revenue ? 0.9 : 0.15}>
            <title>{`${d.date}: ${inr(d.revenue)} · ${d.orders} orders`}</title>
          </rect>
          {i % step === 0 && <text x={P.l + i * bw + bw / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="#888">{d.date.slice(5)}</text>}
        </g>
      ))}
    </svg>
  );
}

const BAR = ["#8E7CC3", "#F2A6B3", "#7FC8A9", "#F6C177", "#7DB9E8", "#F4A988"];

export function HBars({ rows, money = true }: { rows: { label: string; value: number; sub?: string }[]; money?: boolean }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (!rows.length) return <p className="py-6 text-center text-sm text-neutral-400">No data for this period</p>;
  return (
    <ul className="space-y-3">
      {rows.map((r, i) => (
        <li key={r.label}>
          <div className="mb-1 flex justify-between gap-3 text-sm"><span className="truncate">{r.label}</span><span className="shrink-0 font-medium">{money ? inr(r.value) : r.value}{r.sub && <span className="ml-1 text-xs font-normal text-neutral-400">{r.sub}</span>}</span></div>
          <div className="h-2 rounded-full bg-neutral-100"><div className="h-2 rounded-full" style={{ width: `${(r.value / max) * 100}%`, background: BAR[i % 6] }} /></div>
        </li>
      ))}
    </ul>
  );
}

export function Kpi({ label, value, delta, hint, tone = "" }: { label: string; value: string; delta?: number | null; hint?: string; tone?: string }) {
  const Icon = KPI_ICONS[label];
  return (
    <div className={`card border-white/60 p-4 ${tone}`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wide text-neutral-600">{label}</p>
        {Icon && <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/80 text-plum"><Icon size={16} /></span>}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 flex items-center gap-1 text-xs">
        {delta != null && <span className={`inline-flex items-center ${delta >= 0 ? "text-green-700" : "text-red-600"}`}>{delta >= 0 ? <ArrowUp size={12} /> : <ArrowDown size={12} />}{Math.abs(delta).toFixed(0)}%</span>}
        <span className="text-neutral-500">{hint}</span>
      </p>
    </div>
  );
}
