"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export default function CancelOrder({ number, token, paid }: { number: string; token: string; paid: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false), [why, setWhy] = useState(""), [busy, setBusy] = useState(false), [msg, setMsg] = useState("");
  async function go() {
    setBusy(true); setMsg("");
    const r = await (await fetch("/api/orders/cancel", { method: "POST", body: JSON.stringify({ number, token, reason: why }) })).json().catch(() => ({ ok: false, error: "Something went wrong" }));
    setBusy(false);
    if (!r.ok) return setMsg(r.error);
    router.refresh();
  }
  if (!open) return <button onClick={() => setOpen(true)} className="btn-outline"><XCircle size={16} /> Cancel order</button>;
  return (
    <div className="card mt-4 w-full space-y-3 p-4 text-sm">
      <p className="font-medium">Cancel this order?</p>
      <p className="text-xs text-neutral-500">{paid ? "You've already paid, so we'll refund you to your original payment method." : "Nothing has been charged."} Items go back in stock.</p>
      <select className="input" value={why} onChange={(e) => setWhy(e.target.value)}><option value="">Reason (optional)</option><option>Ordered by mistake</option><option>Found a better price</option><option>Need to change address or items</option><option>Taking too long</option><option>Other</option></select>
      {msg && <p className="text-red-600">{msg}</p>}
      <div className="flex gap-2"><button disabled={busy} onClick={go} className="btn !bg-red-600">{busy ? "Cancelling…" : "Yes, cancel it"}</button><button onClick={() => setOpen(false)} className="btn-outline">Keep my order</button></div>
    </div>
  );
}
