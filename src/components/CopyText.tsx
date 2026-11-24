"use client";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
export default function CopyText({ text, label }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  return <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(text); setOk(true); setTimeout(() => setOk(false), 1500); } catch {} }} className="btn-outline !px-3 !py-1.5 text-xs">{ok ? <Check size={13} /> : <Copy size={13} />} {ok ? "Copied" : label || "Copy"}</button>;
}
