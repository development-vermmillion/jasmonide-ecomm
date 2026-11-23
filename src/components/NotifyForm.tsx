"use client";
import { useState } from "react";
import { Bell } from "lucide-react";

export default function NotifyForm({ productId, variantId }: { productId: number; variantId: number | null }) {
  const [v, setV] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  async function go(e: React.FormEvent) {
    e.preventDefault();
    const isEmail = v.includes("@");
    const r = await (await fetch("/api/notify", { method: "POST", body: JSON.stringify({ product_id: productId, variant_id: variantId, email: isEmail ? v : "", phone: isEmail ? "" : v }) })).json();
    setMsg({ ok: r.ok, t: r.ok ? "Done! We'll let you know when it's back." : r.error });
  }
  return (
    <form onSubmit={go} className="mt-4 rounded-xl bg-butter/70 p-4">
      <p className="flex items-center gap-2 text-sm font-medium"><Bell size={16} /> Notify me when it's back</p>
      <div className="mt-2 flex gap-2"><input required value={v} onChange={(e) => setV(e.target.value)} placeholder="Email or phone" className="input" /><button className="btn">Notify</button></div>
      {msg && <p className={`mt-2 text-xs ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.t}</p>}
    </form>
  );
}
