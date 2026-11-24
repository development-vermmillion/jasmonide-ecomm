"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Smartphone, Mail } from "lucide-react";

type Cfg = { otp: boolean; google: boolean; password: boolean; forgot?: boolean };
const GoogleLogo = () => <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.5 5.8c4.4-4.1 7.1-10.1 7.1-17.5z"/><path fill="#FBBC05" d="M10.5 28.7a14.5 14.5 0 010-9.4l-7.9-6.1a24 24 0 000 21.6l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.5-5.8c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"/></svg>;

export default function AuthForms({ next, cfg, err }: { next: string; cfg: Cfg; err?: string }) {
  const router = useRouter();
  const first: "otp" | "email" = cfg.otp ? "otp" : "email";
  const [tab, setTab] = useState<"otp" | "email">(first);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [msg, setMsg] = useState(err === "google" ? "Google sign-in didn't work. Please try again or use another method." : "");
  const [busy, setBusy] = useState(false);
  // phone OTP
  const [ph, setPh] = useState(""); const [sent, setSent] = useState(false); const [code, setCode] = useState(""); const [nm, setNm] = useState(""); const [test, setTest] = useState("");
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  const [forgot, setForgot] = useState(false); const [fdone, setFdone] = useState(""); const [flink, setFlink] = useState("");
  async function sendReset(e: React.FormEvent) { e.preventDefault(); const r = await post("/api/account/forgot", { email: f.email }); if (!r.ok) return setMsg(r.error); setFdone("If an account exists for that email, a reset link is on its way. Check your inbox (and spam)."); setFlink(r.testLink || ""); }
  const done = () => { router.push(next); router.refresh(); };
  async function post(url: string, body: any) { setBusy(true); setMsg(""); const r = await (await fetch(url, { method: "POST", body: JSON.stringify(body) })).json().catch(() => ({ ok: false, error: "Something went wrong" })); setBusy(false); return r; }

  async function sendCode(e?: React.FormEvent) { e?.preventDefault(); const r = await post("/api/account/otp/send", { phone: ph }); if (!r.ok) return setMsg(r.error); setSent(true); setTest(r.testCode || ""); }
  async function verify(e: React.FormEvent) { e.preventDefault(); const r = await post("/api/account/otp/verify", { phone: ph, code, name: nm }); if (!r.ok) return setMsg(r.error); done(); }
  async function pwd(e: React.FormEvent) { e.preventDefault(); const r = await post(`/api/account/${mode}`, f); if (!r.ok) return setMsg(r.error || "Something went wrong"); done(); }

  return (
    <div className="card mx-auto mt-6 max-w-md space-y-4 p-6">
      {cfg.google && <a href={`/api/account/google?next=${encodeURIComponent(next)}`} className="btn-outline w-full gap-3"><GoogleLogo /> Continue with Google</a>}
      {cfg.google && (cfg.otp || cfg.password) && <p className="flex items-center gap-3 text-xs text-neutral-400"><span className="h-px flex-1 bg-neutral-200" />or<span className="h-px flex-1 bg-neutral-200" /></p>}
      {cfg.otp && cfg.password && (
        <div className="grid grid-cols-2 gap-1 rounded-full bg-lilac/60 p-1 text-sm">
          <button type="button" onClick={() => { setTab("otp"); setMsg(""); }} className={`flex items-center justify-center gap-1.5 rounded-full py-2 transition ${tab === "otp" ? "bg-white font-semibold shadow-sm" : ""}`}><Smartphone size={14} /> Phone OTP</button>
          <button type="button" onClick={() => { setTab("email"); setMsg(""); }} className={`flex items-center justify-center gap-1.5 rounded-full py-2 transition ${tab === "email" ? "bg-white font-semibold shadow-sm" : ""}`}><Mail size={14} /> Email</button>
        </div>
      )}
      {cfg.otp && tab === "otp" && (!sent ? (
        <form onSubmit={sendCode} className="space-y-3">
          <div><label className="label">Mobile number</label>
            <div className="flex"><span className="flex items-center rounded-l-xl border border-r-0 border-neutral-200 bg-neutral-50 px-3 text-sm text-neutral-500">+91</span><input required inputMode="numeric" autoComplete="tel-national" maxLength={10} placeholder="98765 43210" className="input !rounded-l-none" value={ph} onChange={(e) => setPh(e.target.value.replace(/\D/g, ""))} /></div></div>
          <button disabled={busy || ph.length !== 10} className="btn w-full">{busy ? "Sending…" : "Send OTP"}</button>
          <p className="text-center text-xs text-neutral-500">New here? We'll create your account automatically.</p>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-3">
          <p className="text-sm text-neutral-600">We sent a 6-digit code to <b>+91 {ph}</b>. <button type="button" className="underline" onClick={() => { setSent(false); setCode(""); setTest(""); }}>Change</button></p>
          {test && <p className="rounded-lg bg-butter/70 p-2 text-sm">Test mode — your code is <b className="tracking-widest">{test}</b> (no SMS was sent)</p>}
          <input required autoFocus inputMode="numeric" autoComplete="one-time-code" maxLength={6} placeholder="• • • • • •" className="input text-center text-xl tracking-[0.5em]" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} />
          <div><label className="label">Your name (optional)</label><input className="input" value={nm} onChange={(e) => setNm(e.target.value)} /></div>
          <button disabled={busy || code.length !== 6} className="btn w-full">{busy ? "Checking…" : "Verify & continue"}</button>
          <button type="button" className="w-full text-center text-xs underline" onClick={() => sendCode()}>Resend code</button>
        </form>
      ))}
      {cfg.password && (!cfg.otp || tab === "email") && forgot && (
        <form onSubmit={sendReset} className="space-y-3">
          <p className="text-sm text-neutral-600">Enter your email and we'll send a link to choose a new password.</p>
          <div><label className="label">Email</label><input required type="email" className="input" value={f.email} onChange={set("email")} /></div>
          {fdone && <p className="rounded-lg bg-mint p-3 text-sm text-green-800">{fdone}</p>}
          {flink && <p className="rounded-lg bg-butter/70 p-2 text-xs">Test mode (email not set up): <a className="underline break-all" href={flink}>{flink}</a></p>}
          <button disabled={busy} className="btn w-full">{busy ? "Please wait…" : "Send reset link"}</button>
          <button type="button" className="w-full text-center text-xs underline" onClick={() => { setForgot(false); setFdone(""); setMsg(""); }}>Back to sign in</button>
        </form>
      )}
      {cfg.password && (!cfg.otp || tab === "email") && !forgot && (
        <form onSubmit={pwd} className="space-y-3">
          <div className="grid grid-cols-2 gap-1 rounded-full bg-lilac/60 p-1 text-sm">
            {(["login", "register"] as const).map((m) => <button type="button" key={m} onClick={() => setMode(m)} className={`rounded-full py-2 transition ${mode === m ? "bg-white font-semibold shadow-sm" : ""}`}>{m === "login" ? "Sign in" : "Create account"}</button>)}
          </div>
          {mode === "register" && <div><label className="label">Full name *</label><input required className="input" value={f.name} onChange={set("name")} /></div>}
          <div><label className="label">Email *</label><input required type="email" className="input" value={f.email} onChange={set("email")} /></div>
          {mode === "register" && <div><label className="label">Phone</label><input className="input" value={f.phone} onChange={set("phone")} /></div>}
          <div><label className="label">Password *</label><input required type="password" minLength={6} className="input" value={f.password} onChange={set("password")} /></div>
          <button disabled={busy} className="btn w-full">{busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}</button>
          {mode === "login" && cfg.forgot !== false && <button type="button" className="w-full text-center text-xs underline" onClick={() => { setForgot(true); setMsg(""); }}>Forgot password?</button>}
        </form>
      )}
      {!cfg.otp && !cfg.password && !cfg.google && <p className="text-center text-sm text-neutral-500">Sign-in is not set up yet.</p>}
      {msg && <p className="text-sm text-red-600">{msg}</p>}
    </div>
  );
}
