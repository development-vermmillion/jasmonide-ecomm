"use client";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call, DeleteButton, QuickSwitch, Switch } from "./ui";
import { ruleLabel } from "@/lib/bulk-label";

const blank = { name: "", scope: "all", target_id: "", basis: "qty", min_qty: 10, max_qty: 0, min_value: 0, discount_type: "percent", value: 10, active: true, starts_at: "", ends_at: "" };

export default function BulkManager({ rows, cats, products }: { rows: any[]; cats: any[]; products: any[] }) {
  const router = useRouter();
  const [f, setF] = useState<any>(blank);
  const [editing, setEditing] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const set = (k: string, v: any) => setF((s: any) => ({ ...s, [k]: v }));
  const name = (r: any) => r.scope === "all" ? "All products" : r.scope === "category" ? `Category: ${cats.find((c) => c.id === r.target_id)?.name || "?"}` : `Product: ${products.find((p) => p.id === r.target_id)?.name || "?"}`;
  async function save() {
    const r = editing ? await call(`/api/admin/bulk/${editing}`, "PUT", f) : await call("/api/admin/bulk", "POST", f);
    if (!r.ok) return setErr(r.error);
    setF(blank); setEditing(null); setErr(""); router.refresh();
  }
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="card divide-y divide-neutral-100 lg:col-span-2">
        {rows.map((r) => (
          <div key={r.id} className={`flex flex-wrap items-center justify-between gap-3 p-4 ${r.active ? "" : "opacity-60"}`}>
            <div className="min-w-0"><p className="font-medium">{r.name || ruleLabel(r)}</p><p className="text-sm text-neutral-600">{ruleLabel(r)} · <span className="text-neutral-500">{name(r)}</span></p>{(r.starts_at || r.ends_at) && <p className="text-xs text-neutral-500">{r.starts_at || "now"} → {r.ends_at || "no end"}</p>}</div>
            <div className="flex items-center gap-4"><QuickSwitch kind="bulk" id={r.id} on={!!r.active} onLabel="On" offLabel="Off" /><button className="inline-flex items-center gap-1 text-xs underline" onClick={() => { setEditing(r.id); setF({ ...r, target_id: r.target_id || "", active: !!r.active }); }}><Pencil size={12} />Edit</button><DeleteButton url={`/api/admin/bulk/${r.id}`} /></div>
          </div>
        ))}
        {!rows.length && <p className="p-10 text-center text-neutral-500">No bulk rules yet. Add your first one →</p>}
      </div>
      <div className="card h-fit space-y-3 p-5">
        <h2 className="font-semibold">{editing ? "Edit rule" : "Add bulk discount"}</h2>
        <div><label className="label">Name shown to customers (optional)</label><input className="input" placeholder="e.g. Bulk saver" value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div><label className="label">Applies to</label>
          <select className="input" value={f.scope} onChange={(e) => { set("scope", e.target.value); set("target_id", ""); }}><option value="all">All products</option><option value="category">One category</option><option value="product">One product</option></select></div>
        {f.scope === "category" && <select className="input" value={f.target_id} onChange={(e) => set("target_id", e.target.value)}><option value="">— choose category —</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>}
        {f.scope === "product" && <select className="input" value={f.target_id} onChange={(e) => set("target_id", e.target.value)}><option value="">— choose product —</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>}
        <div><label className="label">Discount triggers on</label>
          <select className="input" value={f.basis} onChange={(e) => set("basis", e.target.value)}><option value="qty">Quantity bought</option><option value="value">Order value (₹)</option></select></div>
        {f.basis === "qty" ? (
          <div className="grid grid-cols-2 gap-3"><div><label className="label">From qty</label><input type="number" min="1" className="input" value={f.min_qty} onChange={(e) => set("min_qty", e.target.value)} /></div><div><label className="label">Up to qty (0 = no limit)</label><input type="number" min="0" className="input" value={f.max_qty} onChange={(e) => set("max_qty", e.target.value)} /></div></div>
        ) : <div><label className="label">Minimum value (₹)</label><input type="number" min="1" className="input" value={f.min_value} onChange={(e) => set("min_value", e.target.value)} /></div>}
        <div className="grid grid-cols-2 gap-3">
          <div><label className="label">Discount type</label><select className="input" value={f.discount_type} onChange={(e) => set("discount_type", e.target.value)}><option value="percent">Percentage %</option><option value="fixed">Fixed ₹ amount</option></select></div>
          <div><label className="label">{f.discount_type === "percent" ? "Percent off" : f.basis === "qty" ? "₹ off per item" : "₹ off total"}</label><input type="number" min="0" className="input" value={f.value} onChange={(e) => set("value", e.target.value)} /></div>
        </div>
        <div className="grid grid-cols-2 gap-3"><div><label className="label">Starts (optional)</label><input type="date" className="input" value={f.starts_at} onChange={(e) => set("starts_at", e.target.value)} /></div><div><label className="label">Ends (optional)</label><input type="date" className="input" value={f.ends_at} onChange={(e) => set("ends_at", e.target.value)} /></div></div>
        <label className="flex items-center gap-3 text-sm"><Switch on={!!f.active} onChange={(v) => set("active", v)} /> {f.active ? "On" : "Off"}</label>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <div className="flex gap-2"><button className="btn" onClick={save}>{editing ? "Save" : "Add rule"}</button>{editing && <button className="btn-outline" onClick={() => { setEditing(null); setF(blank); }}>Cancel</button>}</div>
      </div>
    </div>
  );
}
