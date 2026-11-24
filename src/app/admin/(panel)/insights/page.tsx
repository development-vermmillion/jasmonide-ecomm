import Link from "next/link";
import { overview } from "@/lib/insights";
import { inr } from "@/lib/util";
import ProductInterest from "@/components/admin/ProductInterest";
import { Lightbulb, MousePointerClick } from "lucide-react";

export const dynamic = "force-dynamic";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const TIP: Record<string, string> = { fix: "bg-amber-50 border-amber-200", promote: "bg-green-50 border-green-200", nudge: "bg-lilac/50 border-lilac", restock: "bg-red-50 border-red-200", idea: "bg-sky/40 border-sky" };
const TAG: Record<string, string> = { fix: "Fix", promote: "Promote", nudge: "Nudge", restock: "Restock", idea: "Idea" };

export default async function Insights({ searchParams }: { searchParams: { days?: string } }) {
  const days = [7, 30, 90].includes(Number(searchParams.days)) ? Number(searchParams.days) : 30;
  const d = await overview(days);
  const pct = (a: number, b: number) => (b && a <= b ? Math.round((a / b) * 100) + "%" : "—");
  const grid: Record<string, number> = {}; let gmax = 1;
  for (const g of d.grid) { grid[g.dow + "-" + g.hr] = g.n; gmax = Math.max(gmax, g.n); }
  const fun = [["Visited the shop", d.sessions], ["Looked at a product", d.viewers], ["Added to bag", d.atc], ["Started checkout", d.checkout], ["Placed an order", d.orders]] as [string, number][];
  const fmax = Math.max(1, d.sessions, d.viewers);
  const trend = d.prevSessions ? Math.round(((d.sessions - d.prevSessions) / d.prevSessions) * 100) : null;
  const catMax = Math.max(1, ...d.cats.map((c: any) => c.views + c.cclicks + c.wish * 3 + c.atc * 5));
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div><h1 className="h-serif text-3xl">Insights</h1><p className="text-sm text-neutral-500">What your customers look at, love and buy — measured on your own site, no external tool needed.</p></div>
        <div className="flex items-center gap-2 text-sm">
          {[7, 30, 90].map((n) => <Link key={n} href={`/admin/insights?days=${n}`} className={`rounded-full px-3 py-1 ${days === n ? "bg-[rgb(var(--c-ink))] text-white" : "bg-[rgb(var(--c-ink)/.06)]"}`}>{n} days</Link>)}
          <Link href="/admin/heatmap" className="btn-outline !py-1.5 text-xs"><MousePointerClick size={14} /> Click heatmap</Link>
        </div>
      </div>
      {!d.hasData && <div className="card p-6 text-sm"><p className="font-semibold">No data yet — it starts collecting the moment people visit your shop.</p><p className="mt-1 text-neutral-600">Browse your own store in a private window (your admin visits are ignored) to see it work. Numbers fill in over the next few days.</p></div>}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[["Visitors", d.sessions, trend !== null ? `${trend >= 0 ? "▲" : "▼"} ${Math.abs(trend)}% vs before` : ""], ["Page views", d.pageViews, ""], ["Added to bag", d.atc, `${pct(d.atc, d.viewers)} of product viewers`], ["Orders", d.orders, `${pct(d.orders, d.sessions)} of visitors`], ["Sales", inr(d.revenue), ""]].map(([l, v, s]) => (
          <div key={l as string} className="card p-4"><p className="text-xs text-neutral-500">{l}</p><p className="text-2xl font-semibold">{v}</p>{s && <p className="text-[11px] text-neutral-500">{s}</p>}</div>
        ))}
      </div>

      {d.tips.length > 0 && (
        <section className="space-y-2">
          <h2 className="flex items-center gap-2 font-semibold"><Lightbulb size={17} className="text-[var(--adm-accent)]" /> Where to focus next</h2>
          <div className="grid gap-2 md:grid-cols-2">
            {d.tips.map((t, i) => (
              <div key={i} className={`rounded-xl border p-3.5 text-sm ${TIP[t.kind]}`}>
                <p className="flex items-center gap-2"><span className="rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">{TAG[t.kind]}</span><b>{t.product ? <Link className="hover:underline" href={`/product/${t.slug}`} target="_blank">{t.product}</Link> : t.title}</b></p>
                {t.product && <p className="mt-1 font-medium">{t.title}</p>}
                <p className="mt-0.5 text-xs text-neutral-700">{t.why}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-5 lg:grid-cols-5">
        <section className="card p-5 lg:col-span-2">
          <h2 className="font-semibold">Shopping funnel</h2><p className="mb-3 text-xs text-neutral-500">Where visitors drop off, last {days} days</p>
          <div className="space-y-2.5">{fun.map(([l, n], i) => (
            <div key={l}><div className="flex justify-between text-xs"><span>{l}</span><span><b>{n}</b>{i > 0 && <span className="ml-1.5 text-neutral-400">{pct(n, fun[i - 1][1])} of previous</span>}</span></div><div className="mt-1 h-2.5 rounded-full bg-neutral-100"><div className="h-2.5 rounded-full bg-[var(--adm-accent)]" style={{ width: `${Math.min(100, Math.max(2, (n / fmax) * 100))}%`, opacity: 1 - i * 0.14 }} /></div></div>
          ))}</div>
          <p className="mt-3 text-[11px] text-neutral-500">Orders come from your order list; the other steps are counted from visits to your shop.</p>
        </section>
        <section className="card p-5 lg:col-span-3">
          <h2 className="font-semibold">Which categories attract people</h2><p className="mb-3 text-xs text-neutral-500">Product views, category taps, wishlists and bag adds combined</p>
          <div className="space-y-2.5">{d.cats.map((c: any) => { const sc = c.views + c.cclicks + c.wish * 3 + c.atc * 5; return (
            <div key={c.id}><div className="flex justify-between text-xs"><span className="font-medium">{c.name}</span><span className="text-neutral-500">{c.views} views · {c.cclicks} taps · {c.wish} ♥ · {c.atc} in bag · {c.sold} sold</span></div><div className="mt-1 h-2.5 rounded-full bg-neutral-100"><div className="h-2.5 rounded-full bg-[var(--adm-accent)]" style={{ width: `${Math.max(2, (sc / catMax) * 100)}%` }} /></div></div>
          ); })}</div>
        </section>
      </div>

      <section className="space-y-2"><h2 className="font-semibold">Product interest</h2><p className="text-xs text-neutral-500">Click a column to sort. ▲▼ shows views compared with the previous {days} days.</p><ProductInterest rows={d.products} /></section>

      <div className="grid gap-5 lg:grid-cols-3">
        <section className="card p-5"><h2 className="font-semibold">What people search for</h2>
          <ul className="mt-2 divide-y divide-neutral-100 text-sm">{d.searches.map((s: any) => <li key={s.label} className="flex justify-between py-1.5"><span>{s.label}</span><span className="text-xs text-neutral-500">{s.n}× · {s.results} result{s.results === 1 ? "" : "s"}</span></li>)}{!d.searches.length && <li className="py-3 text-xs text-neutral-500">No searches yet.</li>}</ul>
          {d.noResults.length > 0 && <><p className="mt-4 text-xs font-semibold text-red-700">Searched, nothing found</p><ul className="mt-1 text-sm">{d.noResults.map((s: any) => <li key={s.label} className="flex justify-between py-0.5"><span>{s.label}</span><span className="text-xs text-neutral-500">{s.n}×</span></li>)}</ul></>}
        </section>
        <section className="card p-5"><h2 className="font-semibold">Most visited pages</h2>
          <ul className="mt-2 divide-y divide-neutral-100 text-sm">{d.pages.map((p: any) => <li key={p.path} className="flex justify-between gap-3 py-1.5"><Link href={`/admin/heatmap?path=${encodeURIComponent(p.path)}`} className="truncate hover:underline" title="Open click heatmap">{p.path}</Link><span className="shrink-0 text-xs text-neutral-500">{p.views}</span></li>)}</ul>
          <p className="mt-3 text-xs text-neutral-500">Devices: {d.devices.map((x: any) => `${x.device} ${pct(x.n, d.devices.reduce((a: number, b: any) => a + b.n, 0))}`).join(" · ") || "—"}</p>
          {d.pin.length > 0 && <p className="mt-1 text-xs text-neutral-500">Pincode checks: {d.pin.map((x: any) => `${x.n} ${x.label === "ok" ? "deliverable" : "not deliverable"}`).join(", ")}</p>}
        </section>
        <section className="card p-5"><h2 className="font-semibold">When people shop</h2><p className="mb-2 text-xs text-neutral-500">Visitors by day and hour (India time) — post and run offers when it's darkest</p>
          <div className="overflow-x-auto"><table className="border-separate border-spacing-[2px] text-[9px]"><tbody>{[1, 2, 3, 4, 5, 6, 0].map((dow) => <tr key={dow}><td className="pr-1 text-neutral-500">{DAYS[dow]}</td>{Array.from({ length: 24 }, (_, h) => { const n = grid[dow + "-" + h] || 0; return <td key={h} title={`${DAYS[dow]} ${h}:00 — ${n} visitors`} className="h-3.5 w-3.5 rounded-[3px]" style={{ background: n ? `rgba(109,90,156,${0.15 + 0.85 * (n / gmax)})` : "rgba(0,0,0,.05)" }} />; })}</tr>)}<tr><td /><td colSpan={24} className="pt-1 text-neutral-400">12am ← → 11pm</td></tr></tbody></table></div>
        </section>
      </div>
    </div>
  );
}
