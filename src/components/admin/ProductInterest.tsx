"use client";
import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

const COLS: [string, string, string][] = [["score", "Interest", "Combined score: views + clicks + wishlists×5 + bag adds×8 + sales×15"], ["views", "Views", ""], ["clicks", "Card clicks", "Taps on this product from lists"], ["wish", "Wishlist", ""], ["atc", "Added to bag", ""], ["rate", "Bag rate", "Added to bag ÷ views"], ["sold", "Sold", ""], ["secs", "Avg time", "Seconds on the product page"]];
export default function ProductInterest({ rows }: { rows: any[] }) {
  const [by, setBy] = useState("score"), [asc, setAsc] = useState(false), [all, setAll] = useState(false);
  const data = rows.map((r) => ({ ...r, rate: r.views ? r.atc / r.views : 0 }));
  data.sort((a, b) => ((b[by] || 0) - (a[by] || 0)) * (asc ? -1 : 1));
  const max = Math.max(1, ...data.map((d) => d.score));
  const shown = all ? data : data.slice(0, 15);
  return (
    <div className="card overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead className="border-b border-neutral-200 bg-neutral-50"><tr><th className="th">Product</th>{COLS.map(([k, l, tip]) => <th key={k} title={tip} onClick={() => { if (by === k) setAsc(!asc); else { setBy(k); setAsc(false); } }} className="th cursor-pointer select-none whitespace-nowrap text-right">{l}{by === k && (asc ? <ArrowUp size={11} className="ml-0.5 inline" /> : <ArrowDown size={11} className="ml-0.5 inline" />)}</th>)}</tr></thead>
        <tbody className="divide-y divide-neutral-100">
          {shown.map((p) => {
            const trend = p.prev_views ? Math.round(((p.views - p.prev_views) / p.prev_views) * 100) : null;
            return (
              <tr key={p.id}>
                <td className="td"><a href={`/product/${p.slug}`} target="_blank" className="font-medium hover:underline">{p.name}</a><p className="text-[11px] text-neutral-500">{p.cat || "—"}{p.track_stock && p.type !== "variable" && p.stock <= 0 ? " · sold out" : ""}</p></td>
                <td className="td text-right"><div className="ml-auto flex w-24 items-center gap-2"><div className="h-1.5 flex-1 rounded-full bg-neutral-100"><div className="h-1.5 rounded-full bg-[var(--adm-accent)]" style={{ width: `${(p.score / max) * 100}%` }} /></div><span className="w-8 text-xs">{p.score}</span></div></td>
                <td className="td text-right">{p.views}{trend !== null && p.views + p.prev_views > 6 && <span className={`ml-1 text-[10px] ${trend >= 0 ? "text-green-600" : "text-red-500"}`}>{trend >= 0 ? "▲" : "▼"}{Math.abs(trend)}%</span>}</td>
                <td className="td text-right">{p.clicks}</td><td className="td text-right">{p.wish}</td><td className="td text-right">{p.atc}</td>
                <td className="td text-right">{p.views ? Math.round(p.rate * 100) + "%" : "—"}</td><td className="td text-right">{p.sold}</td><td className="td text-right">{p.secs ? p.secs + "s" : "—"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {data.length > 15 && <button onClick={() => setAll(!all)} className="w-full border-t border-neutral-100 py-2.5 text-xs underline">{all ? "Show top 15" : `Show all ${data.length} products`}</button>}
    </div>
  );
}
