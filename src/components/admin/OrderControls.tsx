"use client";
import { WhatsAppIcon } from "@/components/social";
import { Save } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call, DeleteButton } from "./ui";
import { ORDER_STATUSES, PAYMENT_STATUSES } from "@/lib/util";

export default function OrderControls({ order }: { order: any }) {
  const router = useRouter();
  const [f, setF] = useState({ status: order.status, payment_status: order.payment_status, tracking: order.tracking || "", notes: order.notes || "" });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true); setMsg("");
    const r = await call(`/api/admin/orders/${order.id}`, "PUT", f);
    setBusy(false);
    setMsg(r.ok ? "Saved ✓" : r.error);
    if (r.ok) router.refresh();
  }
  const wa = `https://wa.me/91${String(order.phone || "").replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(`Hi! Update on your order ${order.number}: it is now ${f.status}.${f.tracking ? " Tracking: " + f.tracking : ""}`)}`;
  return (
    <aside className="no-print card h-fit space-y-4 p-5">
      <h2 className="font-semibold">Manage order</h2>
      <div><label className="label">Order status</label>
        <select className="input capitalize" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value })}>{ORDER_STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <p className="mt-1 text-[11px] text-neutral-500">Cancelling or returning restores stock automatically.</p></div>
      <div><label className="label">Payment ({order.payment_method.toUpperCase()})</label>
        <select className="input capitalize" value={f.payment_status} onChange={(e) => setF({ ...f, payment_status: e.target.value })}>{PAYMENT_STATUSES.map((s) => <option key={s}>{s}</option>)}</select></div>
      <div><label className="label">Tracking / courier reference</label><input className="input" value={f.tracking} onChange={(e) => setF({ ...f, tracking: e.target.value })} /></div>
      <div><label className="label">Internal notes</label><textarea rows={3} className="input" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></div>
      <button disabled={busy} onClick={save} className="btn w-full">{busy ? "Saving…" : <><Save size={16} /> Update order</>}</button>
      {msg && <p className={`text-sm ${msg.includes("✓") ? "text-green-700" : "text-red-600"}`}>{msg}</p>}
      <a href={wa} target="_blank" className="btn-outline w-full"><WhatsAppIcon size={16} className="text-[#25D366]" /> Message customer on WhatsApp</a>
      <div className="border-t border-neutral-200 pt-3 text-center"><DeleteButton url={`/api/admin/orders/${order.id}`} after="/admin/orders" confirm="Delete this order record permanently? Stock is NOT restored — cancel it first if needed." label="Delete order" /></div>
    </aside>
  );
}
