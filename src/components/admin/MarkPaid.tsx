"use client";
import { BadgeCheck } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call } from "./ui";

export default function MarkPaid({ orderId, utr }: { orderId: number; utr?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  async function go() {
    setBusy(true); setErr("");
    const r = await call(`/api/admin/orders/${orderId}`, "PUT", { payment_status: "paid", payment_ref: utr || undefined });
    setBusy(false);
    if (r.ok) router.refresh(); else setErr(r.error);
  }
  return <div><button onClick={go} disabled={busy} className="btn"><BadgeCheck size={16} /> {busy ? "Saving…" : "Mark payment received"}</button>{err && <p className="mt-1 text-xs text-red-600">{err}</p>}</div>;
}
