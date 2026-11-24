"use client";
import { useState } from "react";
import { Bell } from "lucide-react";
import { call } from "./ui";

export default function AlertTest() {
  const [msg, setMsg] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  return (
    <div className="card flex flex-wrap items-center gap-3 p-4">
      <button disabled={busy} className="btn-outline" onClick={async () => { setBusy(true); const r = await call("/api/admin/alerts", "POST", {}); setBusy(false); setMsg(r.results || [r.error]); }}><Bell size={15} /> Send low-stock alert now</button>
      <p className="text-xs text-neutral-500">Save your email / WhatsApp settings first, then use this to test them.</p>
      {msg.map((m, i) => <p key={i} className="w-full text-sm">{m}</p>)}
    </div>
  );
}
