"use client";
import { useState } from "react";
import { Send } from "lucide-react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  async function go(e: React.FormEvent) {
    e.preventDefault();
    const r = await (await fetch("/api/newsletter", { method: "POST", body: JSON.stringify({ email }) })).json();
    setMsg({ ok: r.ok, t: r.ok ? "You're in! Watch your inbox for offers." : r.error });
    if (r.ok) setEmail("");
  }
  return (
    <form onSubmit={go}>
      <div className="flex gap-2">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="input" />
        <button className="btn !px-4" aria-label="Subscribe"><Send size={16} /></button>
      </div>
      {msg && <p className={`mt-2 text-xs ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.t}</p>}
    </form>
  );
}
