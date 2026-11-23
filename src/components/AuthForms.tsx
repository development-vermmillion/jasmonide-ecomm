"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthForms({ next }: { next: string }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  async function go(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setErr("");
    const r = await (await fetch(`/api/account/${mode}`, { method: "POST", body: JSON.stringify(f) })).json();
    setBusy(false);
    if (!r.ok) return setErr(r.error || "Something went wrong");
    router.push(next); router.refresh();
  }
  return (
    <form onSubmit={go} className="card mx-auto mt-6 max-w-md space-y-3 p-6">
      <div className="grid grid-cols-2 gap-1 rounded-full bg-lilac/60 p-1 text-sm">
        {(["login", "register"] as const).map((m) => <button type="button" key={m} onClick={() => setMode(m)} className={`rounded-full py-2 transition ${mode === m ? "bg-white font-semibold shadow-sm" : ""}`}>{m === "login" ? "Sign in" : "Create account"}</button>)}
      </div>
      {mode === "register" && <div><label className="label">Full name *</label><input required className="input" value={f.name} onChange={set("name")} /></div>}
      <div><label className="label">Email *</label><input required type="email" className="input" value={f.email} onChange={set("email")} /></div>
      {mode === "register" && <div><label className="label">Phone</label><input className="input" value={f.phone} onChange={set("phone")} /></div>}
      <div><label className="label">Password *</label><input required type="password" minLength={6} className="input" value={f.password} onChange={set("password")} /></div>
      {err && <p className="text-sm text-red-600">{err}</p>}
      <button disabled={busy} className="btn w-full">{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
    </form>
  );
}
