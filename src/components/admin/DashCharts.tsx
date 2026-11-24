"use client";
import { ArrowDownRight, ArrowUpRight, Download, Maximize2, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { inr } from "@/lib/util";

const ACC = "var(--adm-accent)";
const INK = "rgb(var(--c-ink))";
const faint = (a: number) => `rgb(var(--c-ink) / ${a})`;
const k = (n: number) => (n >= 100000 ? (n / 100000).toFixed(1).replace(/\.0$/, "") + "L" : n >= 1000 ? (n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(/\.0$/, "") + "k" : String(Math.round(n)));
const dshort = (s: string) => new Date(s + "T00:00:00Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
const dlong = (s: string) => new Date(s + "T00:00:00Z").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

/* ---------- count-up number ---------- */
export function CountUp({ value, kind = "int", className = "" }: { value: number; kind?: "int" | "inr" | "dec"; className?: string }) {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return setV(value);
    let raf = 0; const t0 = performance.now(), D = 1000;
    const tick = (t: number) => { const p = Math.min(1, (t - t0) / D); setV(value * (1 - Math.pow(1 - p, 4))); if (p < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [value]);
  const txt = kind === "inr" ? inr(Math.round(v)) : kind === "dec" ? v.toFixed(1) : Math.round(v).toLocaleString("en-IN");
  return <span className={className}>{txt}</span>;
}

export function Delta({ v, warn }: { v: number | null | undefined; warn?: boolean }) {
  if (v == null) return null;
  const up = v >= 0;
  return <span className={`chip ${warn ? "warn" : ""}`}>{up ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}{Math.abs(v).toFixed(1)}%</span>;
}

/* ---------- sparkline ---------- */
function smooth(p: [number, number][], lo = -1e9, hi = 1e9) {
  const cl = (y: number) => Math.max(lo, Math.min(hi, y));
  if (p.length < 2) return "";
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] || p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] || p2, t = 0.13;
    d += ` C${p1[0] + (p2[0] - p0[0]) * t},${cl(p1[1] + (p2[1] - p0[1]) * t)} ${p2[0] - (p3[0] - p1[0]) * t},${cl(p2[1] - (p3[1] - p1[1]) * t)} ${p2[0]},${p2[1]}`;
  }
  return d;
}
export function Spark({ values, w = 120, h = 36 }: { values: number[]; w?: number; h?: number }) {
  const max = Math.max(...values, 1), min = Math.min(...values, 0);
  const pts = values.map((v, i) => [(i / Math.max(1, values.length - 1)) * w, h - 3 - ((v - min) / (max - min || 1)) * (h - 8)] as [number, number]);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-9 w-[110px] overflow-visible" aria-hidden>
      <path d={smooth(pts)} fill="none" stroke={INK} strokeOpacity=".75" strokeWidth="1.5" strokeLinecap="round" pathLength={1} className="draw" />
    </svg>
  );
}

/* ---------- KPI card ---------- */
export function KpiCard({ label, value, kind = "int", delta, hint, spark, i = 0, warn }: { label: string; value: number; kind?: "int" | "inr" | "dec"; delta?: number | null; hint?: string; spark?: number[]; i?: number; warn?: boolean }) {
  return (
    <div className="card lift rise p-4 sm:p-5" style={{ ["--i" as any]: i }}>
      <div className="flex items-start justify-between gap-2"><p className="text-[13px] text-[var(--adm-muted)]">{label}</p><Delta v={delta} warn={warn} /></div>
      <div className="mt-3 flex items-end justify-between gap-2">
        <p className="text-[28px] font-semibold leading-none tracking-tight"><CountUp value={value} kind={kind} /></p>
        {spark && spark.length > 1 && <Spark values={spark} />}
      </div>
      {hint && <p className="mt-2 text-[11.5px] text-[var(--adm-muted)]">{hint}</p>}
    </div>
  );
}

/* ---------- tooltip card ---------- */
function Tip({ x, y, children, dark, align = "center" }: { x: number; y: number; children: React.ReactNode; dark?: boolean; align?: "center" | "left" }) {
  const l = Math.min(Math.max(x, 14), 86);
  return (
    <div className={`tip-in pointer-events-none absolute z-20 min-w-[150px] rounded-xl px-3 py-2 text-xs shadow-xl ${dark ? "bg-[#141416] text-white" : "border border-[var(--adm-line)] bg-[rgb(var(--c-surface))]"}`}
      style={{ left: `${l}%`, top: `${y}%`, transform: `translate(${align === "center" ? "-50%" : "-12%"}, -100%) translateY(-10px)` }}>{children}</div>
  );
}

/* ---------- revenue area chart with comparison + hover ---------- */
export function RevenueArea({ cur, prev, metric = "revenue" }: { cur: { date: string; revenue: number; orders: number }[]; prev: { date: string; revenue: number; orders: number }[]; metric?: "revenue" | "orders" }) {
  const W = 800, H = 250, P = { l: 44, r: 12, t: 14, b: 26 };
  const [hi, setHi] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const val = (d: any) => d?.[metric] || 0;
  const max = Math.max(1, ...cur.map(val), ...prev.map(val));
  const p10 = Math.pow(10, Math.floor(Math.log10(max))); const top = Math.ceil(max / p10) * p10;
  const X = (i: number) => P.l + (i / Math.max(1, cur.length - 1)) * (W - P.l - P.r);
  const Y = (v: number) => P.t + (H - P.t - P.b) * (1 - v / top);
  const pc = cur.map((d, i) => [X(i), Y(val(d))] as [number, number]);
  const pp = cur.map((_, i) => [X(i), Y(val(prev[i]))] as [number, number]);
  const line = smooth(pc, P.t, H - P.b), area = `${line} L${X(cur.length - 1)},${H - P.b} L${X(0)},${H - P.b} Z`;
  const step = Math.max(1, Math.ceil(cur.length / 8));
  const move = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect(); const fx = ((e.clientX - r.left) / r.width) * W;
    setHi(Math.max(0, Math.min(cur.length - 1, Math.round(((fx - P.l) / (W - P.l - P.r)) * (cur.length - 1)))));
  };
  const c = hi != null ? cur[hi] : null, pv = hi != null ? prev[hi] : null;
  const diff = c && pv && val(pv) ? ((val(c) - val(pv)) / val(pv)) * 100 : null;
  const fmt = (n: number) => (metric === "revenue" ? inr(Math.round(n)) : String(n));
  return (
    <div ref={ref} className="relative" onPointerMove={move} onPointerLeave={() => setHi(null)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full touch-pan-y select-none" role="img" aria-label="Revenue over time">
        <defs><linearGradient id="adm-area" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f24a0d" stopOpacity=".22" /><stop offset="100%" stopColor="#f24a0d" stopOpacity="0" /></linearGradient></defs>
        {[0, 0.5, 1].map((f) => (<g key={f}><line x1={P.l} x2={W - P.r} y1={Y(top * f)} y2={Y(top * f)} stroke={faint(0.07)} /><text x={P.l - 8} y={Y(top * f) + 3.5} textAnchor="end" fontSize="10.5" fill={faint(0.45)} fontFamily="ui-monospace, monospace">{metric === "revenue" ? "₹" : ""}{k(top * f)}</text></g>))}
        {cur.map((d, i) => i % step === 0 && <text key={d.date} x={X(i)} y={H - 6} textAnchor="middle" fontSize="10.5" fill={faint(0.45)} fontFamily="ui-monospace, monospace">{dshort(d.date)}</text>)}
        <path d={area} fill="url(#adm-area)" className="fade-in" />
        {prev.some((d) => val(d) > 0) && <path d={smooth(pp, P.t, H - P.b)} fill="none" stroke={faint(0.28)} strokeWidth="1.5" strokeDasharray="4 4" />}
        <path d={line} fill="none" stroke="#f24a0d" strokeWidth="2.2" strokeLinecap="round" pathLength={1} className="draw" />
        {hi != null && c && (<g><line x1={X(hi)} x2={X(hi)} y1={P.t} y2={H - P.b} stroke={faint(0.18)} /><circle cx={X(hi)} cy={Y(val(pv))} r="4" fill="rgb(var(--c-surface))" stroke={faint(0.35)} strokeWidth="1.5" /><circle cx={X(hi)} cy={Y(val(c))} r="5" fill="rgb(var(--c-surface))" stroke="#f24a0d" strokeWidth="2.2" /></g>)}
      </svg>
      {hi != null && c && (
        <Tip x={(X(hi) / W) * 100} y={(Y(val(c)) / H) * 100}>
          <p className="font-medium">{dlong(c.date)} <span className="font-normal text-[var(--adm-muted)]">· {c.orders} order{c.orders === 1 ? "" : "s"}</span></p>
          <p className="mt-1.5 flex items-center gap-2"><span className="h-3.5 w-[3px] rounded bg-[var(--adm-accent)]" /><span className="text-[var(--adm-muted)]">This period</span><b className="ml-auto">{fmt(val(c))}</b>{diff != null && <span className="font-medium text-[var(--adm-accent)]">{diff >= 0 ? "+" : ""}{Math.round(diff)}%</span>}</p>
          <p className="mt-1 flex items-center gap-2"><span className="h-3.5 w-[3px] rounded bg-neutral-300" /><span className="text-[var(--adm-muted)]">Previous</span><b className="ml-auto">{fmt(val(pv))}</b></p>
        </Tip>
      )}
    </div>
  );
}

/* ---------- weekday bars: peak bar highlighted, dashed average line ---------- */
export function WeekdayBars({ rows, unit = "orders", height = 150 }: { rows: { label: string; value: number }[]; unit?: string; height?: number }) {
  const max = Math.max(1, ...rows.map((r) => r.value)); const avg = rows.reduce((a, r) => a + r.value, 0) / rows.length;
  const peak = rows.findIndex((r) => r.value === max);
  const [hi, setHi] = useState<number | null>(null);
  const bh = height - 26;
  return (
    <div className="relative" style={{ height }} onPointerLeave={() => setHi(null)}>
      <div className="absolute left-0 right-0 border-t border-dashed" style={{ bottom: 26 + (avg / max) * (bh - 4), borderColor: faint(0.55) }}>
        <span className="absolute -top-[22px] left-0 rounded-md bg-[#141416] px-1.5 py-0.5 text-[10px] font-medium text-white">Avg · {avg.toFixed(avg < 10 ? 1 : 0)}</span>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-end gap-2" style={{ height }}>
        {rows.map((r, i) => (
          <div key={r.label} className="flex h-full flex-1 cursor-pointer flex-col items-center justify-end gap-1.5" onPointerEnter={() => setHi(i)}>
            <div className="bar-in w-full rounded-lg transition-colors duration-200" style={{ ["--i" as any]: i, height: Math.max(6, (r.value / max) * (bh - 4)), background: i === peak ? ACC : hi === i ? faint(0.2) : faint(0.09) }} />
            <span className={`text-[11px] ${i === peak ? "font-medium text-[var(--adm-accent)]" : "text-[var(--adm-muted)]"}`}>{r.label}</span>
          </div>
        ))}
      </div>
      {hi != null && <Tip x={((hi + 0.5) / rows.length) * 100} y={100 - ((26 + (rows[hi].value / max) * (bh - 4)) / height) * 100} dark><b>{rows[hi].value}</b> {unit} <span className="opacity-60">· {rows[hi].label}</span></Tip>}
    </div>
  );
}

/* ---------- heatmap ---------- */
const LV = ["", "#ffd9c9", "#ffb08a", "#ff7f45", "#f24a0d", "#b83208"];
type Cell = { date: string; n: number; revenue: number };
function weeks(cells: Cell[]) {
  const cols: (Cell | null)[][] = []; let col: (Cell | null)[] = [];
  const dow = (s: string) => (new Date(s + "T00:00:00Z").getUTCDay() + 6) % 7; // Mon = 0
  for (let i = 0; i < dow(cells[0].date); i++) col.push(null);
  for (const c of cells) { col.push(c); if (col.length === 7) { cols.push(col); col = []; } }
  if (col.length) { while (col.length < 7) col.push(null); cols.push(col); }
  return cols;
}
const level = (n: number, max: number) => (n <= 0 ? 0 : Math.min(5, 1 + Math.floor((n / max) * 4.999)));
export function Heatmap({ cells, size = 15 }: { cells: Cell[]; size?: number }) {
  const cols = useMemo(() => weeks(cells), [cells]);
  const max = Math.max(1, ...cells.map((c) => c.n));
  const [hi, setHi] = useState<{ c: Cell; x: number; y: number } | null>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const mon = (s: string) => new Date(s + "T00:00:00Z").toLocaleDateString("en-IN", { month: "short", timeZone: "UTC" });
  const months = cols.map((col, i) => { const m = mon(col.find(Boolean)!.date); return !i || m !== mon(cols[i - 1].find(Boolean)!.date) ? m : ""; });
  return (
    <div ref={wrap} className="relative" onPointerLeave={() => setHi(null)}>
      <div className="grid gap-[3px] sm:gap-1" style={{ gridTemplateColumns: `repeat(${cols.length}, minmax(0, 1fr))`, maxWidth: cols.length * (size + 12) }}>
        {cols.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-[3px] sm:gap-1">
            <span className="h-4 whitespace-nowrap text-[10px] leading-4 text-[var(--adm-muted)]">{months[ci]}</span>
            {col.map((c, ri) => c ? (
              <button key={ri} aria-label={`${c.date}: ${c.n} orders`} className="pop aspect-square w-full rounded-full transition-transform hover:scale-125 focus:outline-none" style={{ ["--i" as any]: ci * 7 + ri, background: c.n ? LV[level(c.n, max)] : faint(0.07) }}
                onPointerEnter={(e) => { const r = wrap.current!.getBoundingClientRect(), t = (e.currentTarget as HTMLElement).getBoundingClientRect(); setHi({ c, x: ((t.left + t.width / 2 - r.left) / r.width) * 100, y: ((t.top - r.top) / r.height) * 100 }); }} />
            ) : <span key={ri} className="aspect-square w-full" />)}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10.5px] text-[var(--adm-muted)]">
        <span>Mon – Sun, top to bottom</span>
        <span className="flex items-center gap-1">Less {[0, 1, 2, 3, 4, 5].map((l) => <i key={l} className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: l ? LV[l] : faint(0.07) }} />)} More</span>
      </div>
      {hi && <Tip x={hi.x} y={hi.y} dark><p className="font-medium">{dlong(hi.c.date)}</p><p className="mt-0.5 text-base font-semibold">{hi.c.n}<span className="ml-1 text-xs font-normal opacity-60">order{hi.c.n === 1 ? "" : "s"}</span></p><p className="text-[#ff9a73]">{inr(Math.round(hi.c.revenue))}</p></Tip>}
    </div>
  );
}

/* ---------- isometric 3D columns ---------- */
const shade = (hex: string, f: number) => { const n = parseInt(hex.slice(1), 16); const c = (s: number) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * (1 - f)))); return `rgb(${c(16)},${c(8)},${c(0)})`; };
export function Iso3D({ cells }: { cells: Cell[] }) {
  const cols = useMemo(() => weeks(cells), [cells]);
  const max = Math.max(1, ...cells.map((c) => c.n));
  const a = 13, b = 6.5, H = 110;
  const nC = cols.length, nR = 7;
  const W = (nC + nR) * a + 20, VH = (nC + nR) * b + H + 24, ox = nR * a + 10, oy = H + 10;
  const [hi, setHi] = useState<{ c: Cell; x: number; y: number } | null>(null);
  const items: { c: Cell; ci: number; ri: number }[] = [];
  cols.forEach((col, ci) => col.forEach((c, ri) => c && items.push({ c, ci, ri })));
  items.sort((p, q) => p.ci + p.ri - (q.ci + q.ri));
  return (
    <div className="relative" onPointerLeave={() => setHi(null)}>
      <svg viewBox={`0 0 ${W} ${VH}`} className="w-full">
        {items.map(({ c, ci, ri }, idx) => {
          const x = ox + (ci - ri) * a, y = oy + (ci + ri) * b, h = c.n ? 5 + (c.n / max) * H : 1.5;
          const base = c.n ? LV[level(c.n, max)] : "#d9d9de";
          const on = hi?.c.date === c.date;
          return (
            <g key={c.date} className="pop" style={{ ["--i" as any]: idx / 2 }} onPointerEnter={() => setHi({ c, x: (x / W) * 100, y: ((y - h) / VH) * 100 })} opacity={hi && !on ? 0.55 : 1}>
              <polygon points={`${x - a},${y + b - h} ${x},${y + 2 * b - h} ${x},${y + 2 * b} ${x - a},${y + b}`} fill={shade(base, 0.16)} />
              <polygon points={`${x},${y + 2 * b - h} ${x + a},${y + b - h} ${x + a},${y + b} ${x},${y + 2 * b}`} fill={shade(base, 0.06)} />
              <polygon points={`${x},${y - h} ${x + a},${y + b - h} ${x},${y + 2 * b - h} ${x - a},${y + b - h}`} fill={on ? "#111" : base} />
            </g>
          );
        })}
      </svg>
      {hi && <Tip x={hi.x} y={hi.y} dark><p className="font-medium">{dlong(hi.c.date)}</p><p className="mt-0.5 text-lg font-semibold">{hi.c.n}<span className="ml-1 text-xs font-normal opacity-60">orders</span></p><p className="text-[#ff9a73]">{inr(Math.round(hi.c.revenue))}</p></Tip>}
      <p className="mt-1 text-[10.5px] text-[var(--adm-muted)]">Hover a column for details</p>
    </div>
  );
}

/* ---------- order flow (funnel bands) ---------- */
export function FlowBands({ steps }: { steps: { label: string; value: number }[] }) {
  const W = 400, H = 200, cy = 104, n = steps.length;
  const max = Math.max(1, steps[0].value);
  const xs = steps.map((_, i) => 44 + (i / (n - 1)) * (W - 88));
  const hs = steps.map((s) => Math.max(12, (s.value / max) * 84));
  const band = (scale: number) => {
    const top = [[0, cy - (hs[0] * scale) / 2], ...xs.map((x, i) => [x, cy - (hs[i] * scale) / 2]), [W, cy - (hs[n - 1] * scale) / 2]] as [number, number][];
    const bot = [[W, cy + (hs[n - 1] * scale) / 2], ...xs.map((x, i) => [x, cy + (hs[i] * scale) / 2]).reverse(), [0, cy + (hs[0] * scale) / 2]] as [number, number][];
    return `${smooth(top, 0, H)} L${bot[0][0]},${bot[0][1]} ${smooth(bot, 0, H).replace(/^M[^C]*/, "")} Z`;
  };
  return (
    <div>
      <div className="relative">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" aria-hidden>
          {xs.map((x, i) => i > 0 && <g key={i}><line x1={x} x2={x} y1={26} y2={H - 6} stroke={faint(0.14)} /><text x={x} y={14} textAnchor="middle" fontSize="10" fill={faint(0.5)}>{steps[i - 1].value ? Math.round((steps[i].value / steps[i - 1].value) * 100) : 0}%</text></g>)}
          <path d={band(1.9)} fill="#f24a0d" fillOpacity=".1" className="fade-in" /><path d={band(1.45)} fill="#f24a0d" fillOpacity=".2" className="fade-in" /><path d={band(1)} fill="#f24a0d" fillOpacity=".85" className="fade-in" />
        </svg>
        {steps.map((s, i) => <span key={s.label} className="pop absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-black shadow" style={{ left: `${(xs[i] / W) * 100}%`, top: `${(cy / H) * 100}%`, ["--i" as any]: 20 + i * 8 }}>{s.value}</span>)}
      </div>
      <div className="mt-1 grid text-[11px] text-[var(--adm-muted)]" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }}>{steps.map((s) => <span key={s.label} className="text-center">{s.label}</span>)}</div>
    </div>
  );
}

/* ---------- health table with tabs ---------- */
type Health = { placed: number; paid: number; shipped: number; delivered: number; cancelled: number; returned: number; days: number | null };
export function HealthTable({ health }: { health: Record<string, Health> }) {
  const [tab, setTab] = useState("all");
  const h = health[tab]; const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
  const rows: [string, string, string, boolean][] = [
    ["Paid orders", `${h.paid} of ${h.placed} orders`, `${pct(h.paid, h.placed)}%`, false],
    ["Delivery time", "Placed → delivered", h.days == null ? "—" : `${h.days.toFixed(1)}d`, false],
    ["Delivered", `${h.delivered} of ${h.placed} orders`, `${pct(h.delivered, h.placed)}%`, false],
    ["Cancelled / returned", "Lost orders", `${h.cancelled + h.returned}`, h.cancelled + h.returned > 0],
  ];
  return (
    <div>
      <div className="mb-3 flex gap-5 border-b border-[var(--adm-line)] text-sm">
        {[["all", "All"], ["upi", "UPI"], ["cod", "COD"], ["online", "Online"]].map(([id, l]) => (
          <button key={id} onClick={() => setTab(id)} className={`-mb-px border-b-2 pb-2 transition-colors ${tab === id ? "border-[rgb(var(--c-ink))] font-medium" : "border-transparent text-[var(--adm-muted)] hover:text-[rgb(var(--c-ink))]"}`}>{l}</button>
        ))}
      </div>
      <div className="flex justify-between px-1 pb-1.5 text-[11px] text-[var(--adm-muted)]"><span>Metric</span><span>Actual</span></div>
      <div key={tab} className="divide-y divide-[var(--adm-line)]">
        {rows.map(([a, b, c, bad], i) => (
          <div key={a} className="rise flex items-center justify-between px-1 py-2.5" style={{ ["--i" as any]: i }}>
            <div><p className="text-[13.5px] font-medium">{a}</p><p className="text-[11.5px] text-[var(--adm-muted)]">{b}</p></div>
            <p className={`text-[15px] font-semibold ${bad ? "text-[var(--adm-accent)]" : ""}`}>{c}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- activity card + slide-over drawer ---------- */
export function ActivityCard({ heat, store }: { heat: Cell[]; store: string }) {
  const [open, setOpen] = useState(false);
  const total = heat.reduce((a, c) => a + c.n, 0);
  const best = heat.reduce((b, c) => (c.n > b.n ? c : b), heat[0]);
  const last = heat.slice(-7).reduce((a, c) => a + c.n, 0), before = heat.slice(-14, -7).reduce((a, c) => a + c.n, 0);
  return (
    <div className="card lift flex h-full flex-col p-5">
      <div className="mb-3 flex items-start justify-between"><div><h3 className="text-[15px] font-semibold">Orders placed</h3><p className="text-[11.5px] text-[var(--adm-muted)]">Last 22 weeks</p></div>
        <button onClick={() => setOpen(true)} className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--adm-line)] transition hover:border-[var(--adm-accent)] hover:text-[var(--adm-accent)]" aria-label="Expand"><Maximize2 size={14} /></button></div>
      <div className="mb-4 flex items-end justify-between"><p className="text-3xl font-semibold tracking-tight"><CountUp value={total} /> <span className="text-sm font-normal text-[var(--adm-muted)]">orders</span></p>
        <div className="flex gap-5 text-right text-[11px] text-[var(--adm-muted)]"><div>Busiest day<p className="text-base font-semibold text-[rgb(var(--c-ink))]">{best.n}</p></div><div>This week<p className="flex items-center gap-1 text-base font-semibold text-[rgb(var(--c-ink))]">{last}{before > 0 && <Delta v={((last - before) / before) * 100} />}</p></div></div></div>
      <div className="mt-auto"><Heatmap cells={heat} size={16} /></div>
      {open && <Drawer heat={heat} store={store} onClose={() => setOpen(false)} />}
    </div>
  );
}

function Drawer({ heat, store, onClose }: { heat: Cell[]; store: string; onClose: () => void }) {
  const [view, setView] = useState<"3d" | "grid">("3d");
  useEffect(() => {
    const esc = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", esc); const o = document.body.style.overflow; document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = o; };
  }, [onClose]);
  const total = heat.reduce((a, c) => a + c.n, 0);
  const best = heat.reduce((b, c) => (c.n > b.n ? c : b), heat[0]);
  let longest = 0, run = 0; heat.forEach((c) => { run = c.n ? run + 1 : 0; longest = Math.max(longest, run); });
  let cur = 0; for (let i = heat.length - 1; i >= 0 && heat[i].n; i--) cur++;
  const dow = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((label, d) => ({ label: label[0], value: heat.filter((c) => (new Date(c.date + "T00:00:00Z").getUTCDay() + 6) % 7 === d).reduce((a, c) => a + c.n, 0) }));
  const wk: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 0; i < heat.length; i += 7) { const sl = heat.slice(i, i + 7); wk.push({ date: sl[0].date, revenue: sl.reduce((a, c) => a + c.revenue, 0), orders: sl.reduce((a, c) => a + c.n, 0) }); }
  const csv = () => { const b = new Blob(["date,orders,revenue\n" + heat.map((c) => `${c.date},${c.n},${c.revenue}`).join("\n")], { type: "text/csv" }); const a = document.createElement("a"); a.href = URL.createObjectURL(b); a.download = "orders-22-weeks.csv"; a.click(); };
  return createPortal(
    <div className="adm fixed inset-0 z-[60] !bg-transparent">
      <div className="fade-in absolute inset-0 bg-black/25 backdrop-blur-[2px]" style={{ animationDelay: "0s" }} onClick={onClose} />
      <aside className="slide-in absolute bottom-0 right-0 top-0 flex w-full max-w-[560px] flex-col overflow-y-auto border-l border-[var(--adm-line)] bg-[rgb(var(--c-surface))] p-5 shadow-2xl sm:rounded-l-[22px]">
        <div className="flex items-start justify-between"><div><h3 className="text-[17px] font-semibold tracking-tight">Orders placed</h3><p className="text-xs text-[var(--adm-muted)]">{store} · {dshort(heat[0].date)} – {dshort(heat[heat.length - 1].date)}</p></div>
          <div className="flex gap-2"><button onClick={csv} aria-label="Download CSV" className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--adm-line)] hover:border-[var(--adm-accent)]"><Download size={14} /></button><button onClick={onClose} aria-label="Close" className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--adm-line)] hover:border-[var(--adm-accent)]"><X size={15} /></button></div></div>
        <div className="seg mt-4 self-start">{(["3d", "grid"] as const).map((v) => <button key={v} className={view === v ? "on" : ""} onClick={() => setView(v)}>{v === "3d" ? "3D" : "Grid"}</button>)}</div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[["22-week total", total, <span key="a" className="text-[var(--adm-accent)]">orders</span>], ["Busiest day", best.n, dshort(best.date)], ["Longest streak", longest, "days"], ["Current streak", cur, "days"]].map(([l, v, s], i) => (
            <div key={String(l)} className="rise" style={{ ["--i" as any]: i }}><p className="text-[11px] text-[var(--adm-muted)]">{l}</p><p className="text-xl font-semibold"><CountUp value={v as number} /> <span className="text-[11px] font-normal text-[var(--adm-muted)]">{s}</span></p></div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-[var(--adm-line)] p-4">{view === "3d" ? <Iso3D cells={heat} /> : <Heatmap cells={heat} size={24} />}</div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--adm-line)] p-4"><p className="mb-3 text-[13px] font-semibold">Weekday rhythm</p><WeekdayBars rows={dow} height={130} /></div>
          <div className="rounded-2xl border border-[var(--adm-line)] p-4"><p className="mb-1 text-[13px] font-semibold">Weekly revenue</p><RevenueArea cur={wk} prev={wk.map((w) => ({ ...w, revenue: 0, orders: 0 }))} /></div>
        </div>
      </aside>
    </div>,
    document.body
  );
}
