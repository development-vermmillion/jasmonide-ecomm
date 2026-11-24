"use client";
import { useState } from "react";
import { Send } from "lucide-react";

export default function ContactForm() {
  const [f, setF] = useState({ name: "", email: "", phone: "", message: "" });
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  async function go(e: React.FormEvent) {
    e.preventDefault();
    const r = await (await fetch("/api/contact", { method: "POST", body: JSON.stringify(f) })).json();
    setMsg({ ok: r.ok, t: r.ok ? "Thank you for reaching out — a real person will write back to you soon." : r.error });
    if (r.ok) setF({ name: "", email: "", phone: "", message: "" });
  }
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  return (
    <form onSubmit={go} className="card mt-6 space-y-3 p-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><label className="label">Name *</label><input required className="input" value={f.name} onChange={set("name")} /></div>
        <div><label className="label">Email</label><input type="email" className="input" value={f.email} onChange={set("email")} /></div>
        <div><label className="label">Phone</label><input className="input" value={f.phone} onChange={set("phone")} /></div>
      </div>
      <div><label className="label">Message *</label><textarea required rows={4} className="input" value={f.message} onChange={set("message")} /></div>
      {msg && <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.t}</p>}
      <button className="btn"><Send size={16} /> Send message</button>
    </form>
  );
}
