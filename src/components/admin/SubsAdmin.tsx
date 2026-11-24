"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call } from "./ui";
import { fdate } from "@/lib/util";

export default function SubsAdmin({ rows, canEdit }: { rows: any[]; canEdit: boolean }) {
  const router = useRouter(); const [msg, setMsg] = useState("");
  async function act(id: number, action: string) { const r = await call("/api/admin/subscriptions", "POST", { id, action }); setMsg(r.message || ""); router.refresh(); }
  return (
    <div className="space-y-3">
      {msg && <p className="rounded-lg bg-green-50 p-3 text-sm text-green-800">{msg}</p>}
      <div className="card overflow-x-auto"><table className="w-full min-w-[640px]">
        <thead className="border-b border-neutral-200 bg-neutral-50"><tr><th className="th">Customer</th><th className="th">Product</th><th className="th">Every</th><th className="th">Next reminder</th><th className="th">Status</th><th className="th"></th></tr></thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map((s) => (
            <tr key={s.id} className={s.active === 1 ? "" : "opacity-60"}>
              <td className="td">{s.cname}<p className="text-xs text-neutral-500">{s.email || s.phone}</p></td>
              <td className="td">{s.pname}{s.vname ? ` — ${s.vname}` : ""} × {s.qty}</td><td className="td">{s.every_days} days</td>
              <td className="td">{fdate(s.next_date)}{s.last_reminded ? <p className="text-[11px] text-neutral-400">last reminded {fdate(s.last_reminded)}</p> : null}</td>
              <td className="td">{s.active === 1 ? <span className="badge bg-green-100 text-green-800">Active</span> : s.active === 0 ? <span className="badge bg-neutral-200">Paused</span> : <span className="badge bg-red-100 text-red-700">Cancelled</span>}</td>
              <td className="td whitespace-nowrap text-right text-xs">{canEdit && s.active >= 0 && <><button className="mr-3 underline" onClick={() => act(s.id, "remind")}>Remind now</button>{s.active === 1 ? <button className="mr-3 underline" onClick={() => act(s.id, "pause")}>Pause</button> : <button className="mr-3 underline" onClick={() => act(s.id, "resume")}>Resume</button>}<button className="text-red-600 underline" onClick={() => confirm("Cancel this plan?") && act(s.id, "cancel")}>Cancel</button></>}</td>
            </tr>
          ))}
          {!rows.length && <tr><td colSpan={6} className="py-12 text-center text-neutral-500">No refill plans yet. They appear when customers tap “Subscribe & save” on a product page.</td></tr>}
        </tbody></table></div>
    </div>
  );
}
