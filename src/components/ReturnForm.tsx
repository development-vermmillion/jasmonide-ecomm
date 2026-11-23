"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Undo2 } from "lucide-react";

const REASONS = ["Damaged or defective", "Wrong item received", "Not as described", "Changed my mind", "Other"];

export default function ReturnForm({ number, token }: { number: string; token: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [err, setErr] = useState("");
  async function go(e: React.FormEvent) {
    e.preventDefault();
    const r = await (await fetch("/api/returns", { method: "POST", body: JSON.stringify({ number, token, reason, details }) })).json();
    if (!r.ok) return setErr(r.error);
    router.refresh();
  }
  if (!open) return <button className="btn-outline" onClick={() => setOpen(true)}><Undo2 size={16} /> Request a return / refund</button>;
  return (
    <form onSubmit={go} className="card space-y-3 p-5">
      <p className="font-semibold">Request a return</p>
      <div><label className="label">Reason</label><select className="input" value={reason} onChange={(e) => setReason(e.target.value)}>{REASONS.map((r) => <option key={r}>{r}</option>)}</select></div>
      <div><label className="label">Details (optional)</label><textarea rows={3} className="input" value={details} onChange={(e) => setDetails(e.target.value)} /></div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <div className="flex gap-2"><button className="btn">Submit request</button><button type="button" className="btn-outline" onClick={() => setOpen(false)}>Cancel</button></div>
    </form>
  );
}
