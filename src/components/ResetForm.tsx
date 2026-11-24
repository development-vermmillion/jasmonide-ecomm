"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [p, setP] = useState(""), [msg, setMsg] = useState(""), [busy, setBusy] = useState(false);
  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setMsg("");
    const r = await (await fetch("/api/account/reset", { method: "POST", body: JSON.stringify({ token, password: p }) })).json().catch(() => ({ ok: false, error: "Something went wrong" }));
    setBusy(false);
    if (!r.ok) return setMsg(r.error);
    router.push("/account"); router.refresh();
  }
  if (!token) return <p className="card mt-6 p-5 text-sm">This link is incomplete. Please use the link from your email.</p>;
  return <form onSubmit={go} className="card mt-6 space-y-3 p-5"><div><label className="label">New password</label><input required type="password" minLength={6} className="input" value={p} onChange={(e) => setP(e.target.value)} /></div>{msg && <p className="text-sm text-red-600">{msg}</p>}<button disabled={busy} className="btn w-full">{busy ? "Saving…" : "Save and sign in"}</button></form>;
}
