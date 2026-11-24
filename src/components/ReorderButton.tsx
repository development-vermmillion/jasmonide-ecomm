"use client";
import { useState } from "react";
import { RotateCw } from "lucide-react";
import { useCart } from "./cart";

export default function ReorderButton({ number, small }: { number: string; small?: boolean }) {
  const { add, setOpen } = useCart();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  async function go(e: React.MouseEvent) {
    e.preventDefault(); e.stopPropagation();
    setBusy(true); setMsg("");
    const r = await (await fetch(`/api/account/reorder?number=${encodeURIComponent(number)}`)).json().catch(() => ({ ok: false }));
    setBusy(false);
    if (!r.ok) return setMsg(r.error || "Could not reorder");
    for (const { qty, ...i } of r.items) add(i, qty);
    if (!r.items.length) return setMsg("Sorry, those items are sold out right now.");
    setMsg(r.skipped.length ? `Added. Not available: ${r.skipped.join(", ")}` : "Added to your bag ✓");
    setOpen(true);
  }
  return <span className="inline-flex flex-col items-end"><button onClick={go} disabled={busy} className={`btn-outline ${small ? "!px-3 !py-1.5 text-xs" : ""}`}><RotateCw size={14} className={busy ? "animate-spin" : ""} /> Reorder</button>{msg && <span className="mt-1 text-[11px] text-neutral-500">{msg}</span>}</span>;
}
