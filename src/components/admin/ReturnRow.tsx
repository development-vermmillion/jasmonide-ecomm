"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call } from "./ui";
import { inr, fdate } from "@/lib/util";

export default function ReturnRow({ r }: { r: any }) {
  const router = useRouter();
  const [st, setSt] = useState(r.status);
  const [amt, setAmt] = useState(r.refund_amount || r.order_total);
  const [note, setNote] = useState(r.admin_note || "");
  const [msg, setMsg] = useState("");
  async function save() {
    const x = await call(`/api/admin/returns/${r.id}`, "PUT", { status: st, refund_amount: Number(amt) || 0, admin_note: note });
    setMsg(x.ok ? "Saved ✓" : x.error); if (x.ok) router.refresh();
  }
  return (
    <div className="card space-y-3 p-4">
      <div className="flex flex-wrap justify-between gap-2"><p className="font-medium">Order {r.number} · {r.customer_name} · {r.phone}</p><p className="text-xs text-neutral-500">{fdate(r.created_at)} · order total {inr(r.order_total)}</p></div>
      <p className="text-sm"><b>{r.reason}</b>{r.details ? ` — ${r.details}` : ""}</p>
      <div className="grid gap-3 sm:grid-cols-4">
        <select className="input" value={st} onChange={(e) => setSt(e.target.value)}>{["requested", "approved", "rejected", "refunded"].map((x) => <option key={x}>{x}</option>)}</select>
        <input type="number" className="input" value={amt} onChange={(e) => setAmt(e.target.value)} placeholder="Refund ₹" />
        <input className="input sm:col-span-2" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note to customer" />
      </div>
      <div className="flex items-center gap-3"><button className="btn !py-2 text-xs" onClick={save}>Update</button>{msg && <span className="text-xs">{msg}</span>}{st === "refunded" && <span className="text-xs text-neutral-500">Marks the order as returned & refunded.</span>}</div>
    </div>
  );
}
