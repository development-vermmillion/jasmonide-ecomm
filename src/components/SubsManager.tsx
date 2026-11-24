"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { inr } from "@/lib/util";

export default function SubsManager({ subs }: { subs: any[] }) {
  const router = useRouter(); const [busy, setBusy] = useState(0);
  async function act(id: number, action: string) { setBusy(id); await fetch("/api/account/subscriptions", { method: "PATCH", body: JSON.stringify({ id, action }) }); setBusy(0); router.refresh(); }
  return (
    <div className="space-y-2">
      {subs.map((s) => (
        <div key={s.id} className="card flex flex-wrap items-center justify-between gap-3 p-3 text-sm">
          <div><p className="font-medium">{s.name}{s.vname ? ` — ${s.vname}` : ""} × {s.qty}</p><p className="text-xs text-neutral-500">Every {s.every_days} days · {s.active === 1 ? `next reminder ${new Date(s.next_date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : "paused"}</p></div>
          <div className="flex gap-2">
            {s.active === 1 ? <button disabled={busy === s.id} onClick={() => act(s.id, "pause")} className="btn-outline !px-3 !py-1.5 text-xs">Pause</button> : <button disabled={busy === s.id} onClick={() => act(s.id, "resume")} className="btn-outline !px-3 !py-1.5 text-xs">Resume</button>}
            <button disabled={busy === s.id} onClick={() => confirm("Cancel this refill plan?") && act(s.id, "cancel")} className="text-xs text-red-600 underline">Cancel</button>
          </div>
        </div>
      ))}
    </div>
  );
}
