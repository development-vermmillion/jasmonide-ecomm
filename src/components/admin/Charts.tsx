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
          <rect x={P.l + i * bw + bw * 0.15} y={y(d.revenue)} width={bw * 0.7} height={Math.max(0, H - P.b - y(d.revenue))} rx="2" fill="#f24a0d" opacity={d.revenue ? 0.9 : 0.15}>
            <title>{`${d.date}: ${inr(d.revenue)} · ${d.orders} orders`}</title>
          </rect>
          {i % step === 0 && <text x={P.l + i * bw + bw / 2} y={H - 8} textAnchor="middle" fontSize="10" fill="#888">{d.date.slice(5)}</text>}
        </g>
      ))}
    </svg>
  );
}

const BAR = ["#f24a0d", "#2b2b30", "#6b6b73", "#a0a0a8", "#c9c9cf", "#dcdce0"];

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

export function Kpi({ label, value, delta, hint }: { label: string; value: string; delta?: number | null; hint?: string; tone?: string }) {
  const Icon = KPI_ICONS[label];
  return (
    <div className="card lift p-4 sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] text-[var(--adm-muted)]">{label}</p>
        {delta != null ? <span className="chip">{delta >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}{Math.abs(delta).toFixed(1)}%</span> : Icon ? <Icon size={15} className="text-[var(--adm-muted)]" /> : null}
      </div>
      <p className="mt-3 text-[26px] font-semibold leading-none tracking-tight">{value}</p>
      {hint && <p className="mt-2 text-[11.5px] text-[var(--adm-muted)]">{hint}</p>}
    </div>
  );
}
