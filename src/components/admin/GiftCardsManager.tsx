"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call, DeleteButton } from "./ui";
import { fdate } from "@/lib/util";

export default function GiftCardsManager({ rows, canEdit }: { rows: any[]; canEdit: boolean }) {
  const router = useRouter();
  const [f, setF] = useState<any>({ amount: 500, code: "", to_name: "", to_email: "", note: "", expires_at: "", send: true });
  const [c, setC] = useState<any>({ who: "", amount: 100, note: "" });
  const [msg, setMsg] = useState(""), [cmsg, setCmsg] = useState("");
  async function issue() { const r = await call("/api/admin/giftcards", "POST", { ...f, action: "issue" }); setMsg(r.ok ? r.message : r.error); if (r.ok) { setF({ ...f, code: "", to_name: "", to_email: "", note: "" }); router.refresh(); } }
  async function credit() { const r = await call("/api/admin/giftcards", "POST", { ...c, action: "credit" }); setCmsg(r.ok ? r.message : r.error); if (r.ok) router.refresh(); }
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="card overflow-x-auto lg:col-span-2"><table className="w-full min-w-[560px]">
        <thead className="border-b border-neutral-200 bg-neutral-50"><tr><th className="th">Code</th><th className="th">For</th><th className="th">Value</th><th className="th">Balance</th><th className="th">Expires</th><th className="th"></th></tr></thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map((g) => (
            <tr key={g.id} className={g.active ? "" : "opacity-50"}>
              <td className="td font-mono font-semibold">{g.code}</td><td className="td text-xs">{g.to_name || g.to_email || "—"}</td>
              <td className="td">₹{g.initial}</td><td className="td font-semibold">₹{g.balance}</td><td className="td text-xs">{fdate(g.expires_at) || "Never"}</td>
              <td className="td whitespace-nowrap text-right">{canEdit && <><button className="mr-3 text-xs underline" onClick={async () => { await call(`/api/admin/giftcards/${g.id}`, "PUT", { active: !g.active }); router.refresh(); }}>{g.active ? "Disable" : "Enable"}</button><DeleteButton url={`/api/admin/giftcards/${g.id}`} /></>}</td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={6} className="py-12 text-center text-neutral-500">No gift cards yet. Issue one on the right.</td></tr>}
        </tbody></table></div>
      <div className="space-y-5">
        <div className="card space-y-3 p-5">
          <h2 className="font-semibold">Issue a gift card</h2>
          <div className="grid grid-cols-2 gap-2"><div><label className="label">Amount (₹)</label><input type="number" className="input" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></div><div><label className="label">Code (optional)</label><input className="input uppercase" placeholder="auto" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value })} /></div></div>
          <div><label className="label">Recipient name</label><input className="input" value={f.to_name} onChange={(e) => setF({ ...f, to_name: e.target.value })} /></div>
          <div><label className="label">Recipient email</label><input type="email" className="input" value={f.to_email} onChange={(e) => setF({ ...f, to_email: e.target.value })} /></div>
          <div><label className="label">Message</label><input className="input" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} /></div>
          <div><label className="label">Expires (optional)</label><input type="date" className="input" value={f.expires_at} onChange={(e) => setF({ ...f, expires_at: e.target.value })} /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.send} onChange={(e) => setF({ ...f, send: e.target.checked })} /> Email it to the recipient (needs Email set up)</label>
          {msg && <p className="text-sm">{msg}</p>}
          <button disabled={!canEdit} onClick={issue} className="btn w-full">Create gift card</button>
        </div>
        <div className="card space-y-3 p-5">
          <h2 className="font-semibold">Add store credit to a customer</h2>
          <p className="text-xs text-neutral-500">Great for goodwill after a delay or damaged item. Spent automatically at checkout.</p>
          <div><label className="label">Customer email or phone</label><input className="input" value={c.who} onChange={(e) => setC({ ...c, who: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-2"><div><label className="label">Amount (₹)</label><input type="number" className="input" value={c.amount} onChange={(e) => setC({ ...c, amount: e.target.value })} /></div><div><label className="label">Note</label><input className="input" value={c.note} onChange={(e) => setC({ ...c, note: e.target.value })} /></div></div>
          {cmsg && <p className="text-sm">{cmsg}</p>}
          <button disabled={!canEdit} onClick={credit} className="btn-outline w-full">Add credit</button>
        </div>
      </div>
    </div>
  );
}
