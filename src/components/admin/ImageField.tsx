"use client";
import { Upload } from "lucide-react";
import { useState } from "react";

export default function ImageField({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  async function up(fl?: File) {
    if (!fl) return;
    setBusy(true);
    const fd = new FormData(); fd.append("files", fl);
    const r = await (await fetch("/api/admin/upload", { method: "POST", body: fd })).json();
    setBusy(false);
    if (r.urls) onChange(r.urls[0]);
  }
  return (
    <div className="flex items-center gap-2">
      {value && <img src={value} alt="" className="h-10 w-10 rounded object-cover" />}
      <input className="input" disabled={disabled} value={value} placeholder="https://… or upload" onChange={(e) => onChange(e.target.value)} />
      <label className={`btn-outline cursor-pointer !px-3 ${disabled ? "pointer-events-none opacity-50" : ""}`}><Upload size={14} /> {busy ? "…" : ""}<input type="file" accept="image/*" className="hidden" onChange={(e) => up(e.target.files?.[0])} /></label>
    </div>
  );
}
