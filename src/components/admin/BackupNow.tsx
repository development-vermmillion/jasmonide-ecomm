"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { DatabaseBackup } from "lucide-react";
import { call } from "./ui";

export default function BackupNow() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  return <div className="flex items-center gap-3"><button disabled={busy} className="btn" onClick={async () => { setBusy(true); const r = await call("/api/admin/backups", "POST"); setBusy(false); setMsg(r.ok ? "Backup saved ✓" : r.error); router.refresh(); }}><DatabaseBackup size={16} /> {busy ? "Backing up…" : "Back up now"}</button>{msg && <span className="text-sm">{msg}</span>}</div>;
}
