"use client";
import { ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { CountUp, Delta, RevenueArea } from "./DashCharts";

type Pt = { date: string; revenue: number; orders: number };
export default function MetricToggle({ cur, prev, total, delta, totalOrders }: { cur: Pt[]; prev: Pt[]; total: number; delta: number | null; totalOrders: number }) {
  const [m, setM] = useState<"revenue" | "orders">("revenue");
  return (
    <div>
      <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-[15px] font-semibold">{m === "revenue" ? "Revenue" : "Orders"}</h3>
        <div className="seg">{(["revenue", "orders"] as const).map((x) => <button key={x} className={m === x ? "on" : ""} onClick={() => setM(x)}>{x === "revenue" ? "Revenue" : "Orders"}</button>)}</div>
      </div>
      <div className="mb-2 flex flex-wrap items-center gap-3">
        <p className="text-[34px] font-semibold leading-none tracking-tight"><CountUp key={m} value={m === "revenue" ? total : totalOrders} kind={m === "revenue" ? "inr" : "int"} /></p>
        <Delta v={delta} />
        <span className="ml-auto flex items-center gap-4 text-[11.5px] text-[var(--adm-muted)]"><span className="flex items-center gap-1.5"><i className="h-[3px] w-4 rounded bg-[var(--adm-accent)]" />This period</span><span className="flex items-center gap-1.5"><i className="h-[3px] w-4 rounded border-t border-dashed border-neutral-400" />Previous</span></span>
      </div>
      <RevenueArea key={m} cur={cur} prev={prev} metric={m} />
      <p className="mt-1 flex items-center gap-1 text-[11px] text-[var(--adm-muted)]"><ArrowUpRight size={11} /> Hover the chart for daily details · excludes cancelled & returned</p>
    </div>
  );
}
