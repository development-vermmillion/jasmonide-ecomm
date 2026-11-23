"use client";
import { Pencil, Ticket } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call, DeleteButton, QuickSwitch, Switch } from "./ui";
import { fdate } from "@/lib/util";

const blank = { code: "", type: "percent", value: 10, min_order: 0, max_uses: 0, expires_at: "", active: true };

export default function CouponsManager({ rows }: { rows: any[] }) {
  const router = useRouter();
  const [f, setF] = useState<any>(blank);
  const [editing, setEditing] = useState<number | null>(null);
  const [err, setErr] = useState("");
  async function save() {
    const r = editing ? await call(`/api/admin/coupons/${editing}`, "PUT", f) : await call("/api/admin/coupons", "POST", f);
    if (!r.ok) return setErr(r.error);
    setF(blank); setEditing(null); setErr(""); router.refresh();
  }
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="card overflow-x-auto lg:col-span-2"><table className="w-full min-w-[560px]">
        <thead className="border-b border-neutral-200 bg-neutral-50"><tr><th className="th">Code</th><th className="th">Discount</th><th className="th">Min order</th><th className="th">Used</th><th className="th">Expires</th><th className="th">Status</th><th className="th"></th></tr></thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map((c) => (
            <tr key={c.id} className={c.active ? "" : "opacity-50"}>
              <td className="td font-mono font-semibold">{c.code}</td><td className="td">{c.type === "percent" ? `${c.value}%` : `₹${c.value}`}</td>
              <td className="td">{c.min_order ? `₹${c.min_order}` : "—"}</td><td className="td">{c.used}{c.max_uses ? ` / ${c.max_uses}` : ""}</td><td className="td">{fdate(c.expires_at) || "Never"}</td>
              <td className="td"><QuickSwitch kind="coupons" id={c.id} on={!!c.active} onLabel="Active" offLabel="Off" /></td>
              <td className="td whitespace-nowrap text-right"><button className="mr-3 inline-flex items-center gap-1 text-xs underline" onClick={() => { setEditing(c.id); setF({ ...c, expires_at: c.expires_at || "", active: !!c.active }); }}><Pencil size={13} />Edit</button><DeleteButton url={`/api/admin/coupons/${c.id}`} /></td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={7} className="py-12 text-center text-neutral-500">No coupons yet.</td></tr>}
        </tbody></table></div>
      <div className="card h-fit space-y-3 p-5">
        <div className="flex justify-between"><h2 className="font-semibold">{editing ? "Edit coupon" : "New coupon"}</h2>{editing && <button className="text-xs underline" onClick={() => { setEditing(null); setF(blank); }}>Cancel</button>}</div>
        <div><label className="label">Code</label><input className="input uppercase" disabled={!!editing} value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><label className="label">Type</label><select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}><option value="percent">Percent %</option><option value="fixed">Fixed ₹</option></select></div>
          <div><label className="label">Value</label><input type="number" className="input" value={f.value} onChange={(e) => setF({ ...f, value: e.target.value })} /></div>
          <div><label className="label">Min order ₹</label><input type="number" className="input" value={f.min_order} onChange={(e) => setF({ ...f, min_order: e.target.value })} /></div>
          <div><label className="label">Max uses (0 = ∞)</label><input type="number" className="input" value={f.max_uses} onChange={(e) => setF({ ...f, max_uses: e.target.value })} /></div>
        </div>
        <div><label className="label">Expires on</label><input type="date" className="input" value={f.expires_at} onChange={(e) => setF({ ...f, expires_at: e.target.value })} /></div>
        <label className="flex items-center gap-3 text-sm"><Switch on={!!f.active} onChange={(v) => setF({ ...f, active: v })} /> {f.active ? "Active" : "Off"}</label>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button className="btn w-full" onClick={save}><Ticket size={16} /> {editing ? "Save changes" : "Create coupon"}</button>
      </div>
    </div>
  );
}
