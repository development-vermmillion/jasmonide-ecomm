"use client";
import { PlugZap } from "lucide-react";
import { useState } from "react";

export default function RazorpayTest() {
  const [msg, setMsg] = useState(""); const [ok, setOk] = useState(false); const [busy, setBusy] = useState(false);
  async function test() {
    setBusy(true); setMsg("");
    const r = await (await fetch("/api/admin/payments/test", { method: "POST" })).json();
    setBusy(false); setOk(!!r.ok);
    setMsg(r.ok ? `Connected ✓ — ${r.mode} mode keys are working.` : r.error);
  }
  return (
    <div className="card flex flex-wrap items-center gap-3 p-4">
      <button className="btn-outline" disabled={busy} onClick={test}><PlugZap size={16} /> {busy ? "Testing…" : "Test Razorpay connection"}</button>
      <p className="text-xs text-neutral-500">Save your keys first, then test. Needs internet access from your server.</p>
      {msg && <p className={`w-full text-sm ${ok ? "text-green-700" : "text-red-600"}`}>{msg}</p>}
    </div>
  );
}
