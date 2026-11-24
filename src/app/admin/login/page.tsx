"use client";
import { ShieldCheck, LogIn } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await (await fetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) })).json();
    setBusy(false);
    if (!r.ok) return setErr(r.error || "Login failed");
    router.push("/admin"); router.refresh();
  }
  return (
    <div className="adm flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="card rise w-full max-w-sm space-y-4 p-8">
        <div><span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--adm-accent-soft)] text-[var(--adm-accent)]"><ShieldCheck size={22} /></span><p className="eyebrow">Store admin</p><h1 className="h-serif mt-1 text-3xl">Sign in</h1></div>
        <div><label className="label">Email</label><input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus /></div>
        <div><label className="label">Password</label><input className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} /></div>
        {err && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{err}</p>}
        <button className="btn w-full" disabled={busy}>{busy ? "Signing in…" : <><LogIn size={16} /> Sign in</>}</button>
        <p className="text-center text-xs text-neutral-500">Default: admin@example.com / admin123 (change in .env.local)</p>
      </form>
    </div>
  );
}
