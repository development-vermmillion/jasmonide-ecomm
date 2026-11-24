"use client";
import { useState } from "react";
export default function GiftBalance() {
  const [c, setC] = useState(""), [r, setR] = useState<any>(null);
  async function go(e: React.FormEvent) { e.preventDefault(); setR(await (await fetch("/api/wallet", { method: "POST", body: JSON.stringify({ kind: "gift", code: c }) })).json().catch(() => ({ ok: false, message: "Something went wrong" }))); }
  return <form onSubmit={go} className="card mt-6 space-y-3 p-5"><input required className="input uppercase" placeholder="GC-XXXX-XXXX-XXXX" value={c} onChange={(e) => setC(e.target.value)} /><button className="btn w-full">Check balance</button>{r && <p className={`text-sm ${r.ok ? "text-green-700" : "text-red-600"}`}>{r.ok ? `Balance: ₹${r.balance}` : r.message}</p>}</form>;
}
