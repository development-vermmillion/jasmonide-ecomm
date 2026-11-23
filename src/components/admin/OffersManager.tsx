"use client";
import { Percent, Eraser } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call } from "./ui";

export default function OffersManager({ cats }: { cats: { id: number; name: string }[]; products: { id: number; name: string }[] }) {
  const router = useRouter();
  const [f, setF] = useState({ scope: "category", categoryId: cats[0]?.id || "", percent: 10, start: "", end: "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function run(action: "apply" | "clear") {
    const target = f.scope === "all" ? "ALL products" : `the “${cats.find((c) => c.id === Number(f.categoryId))?.name}” category`;
    if (!confirm(action === "apply" ? `Apply ${f.percent}% off to ${target}?` : `Remove sale prices from ${target}?`)) return;
    setBusy(true); setMsg("");
    const r = await call("/api/admin/sale", "POST", { action, percent: f.percent, categoryId: f.scope === "category" ? f.categoryId : undefined, start: f.start, end: f.end });
    setBusy(false);
    setMsg(r.ok ? `Done — ${r.count} product(s) updated.` : r.error);
    if (r.ok) router.refresh();
  }
  return (
    <div className="card space-y-4 p-5">
      <h2 className="font-semibold">Bulk sale tool</h2>
      <div className="grid gap-3 sm:grid-cols-5">
        <div><label className="label">Apply to</label><select className="input" value={f.scope} onChange={(e) => setF({ ...f, scope: e.target.value })}><option value="category">One category</option><option value="all">Whole store</option></select></div>
        {f.scope === "category" && <div><label className="label">Category</label><select className="input" value={f.categoryId} onChange={(e) => setF({ ...f, categoryId: e.target.value as any })}>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>}
        <div><label className="label">Discount %</label><input type="number" min="1" max="99" className="input" value={f.percent} onChange={(e) => setF({ ...f, percent: Number(e.target.value) })} /></div>
        <div><label className="label">Starts</label><input type="date" className="input" value={f.start} onChange={(e) => setF({ ...f, start: e.target.value })} /></div>
        <div><label className="label">Ends</label><input type="date" className="input" value={f.end} onChange={(e) => setF({ ...f, end: e.target.value })} /></div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={busy} className="btn-clay" onClick={() => run("apply")}><Percent size={16} /> Apply sale</button>
        <button disabled={busy} className="btn-outline" onClick={() => run("clear")}><Eraser size={16} /> Clear sale prices</button>
        {msg && <span className="text-sm text-neutral-600">{msg}</span>}
      </div>
      <p className="text-xs text-neutral-500">Sale prices are calculated from each product's regular price (and each variant's price). Combos are included — edit a combo's own sale price from its product page.</p>
    </div>
  );
}
