"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

export default function ProfileForm({ me }: { me: any }) {
  const router = useRouter();
  const [f, setF] = useState({ name: me.name || "", phone: me.phone || "", address: me.address || "", city: me.city || "", state: me.state || "", pincode: me.pincode || "", password: "" });
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const set = (k: string) => (e: any) => setF({ ...f, [k]: e.target.value });
  async function save(e: React.FormEvent) {
    e.preventDefault();
    const r = await (await fetch("/api/account/profile", { method: "PUT", body: JSON.stringify(f) })).json();
    setMsg({ ok: r.ok, t: r.ok ? "Saved" : r.error });
    if (r.ok) { setF({ ...f, password: "" }); router.refresh(); }
  }
  async function logout() { await fetch("/api/account/logout", { method: "POST" }); router.push("/"); router.refresh(); }
  return (
    <form onSubmit={save} className="card space-y-3 p-5">
      <div className="flex items-center justify-between"><p className="font-semibold">Profile & address</p><button type="button" onClick={logout} className="btn-outline !py-1.5 text-xs"><LogOut size={14} /> Sign out</button></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="label">Name</label><input className="input" value={f.name} onChange={set("name")} /></div>
        <div><label className="label">Phone</label><input className="input" value={f.phone} onChange={set("phone")} /></div>
      </div>
      <div><label className="label">Address</label><input className="input" value={f.address} onChange={set("address")} /></div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><label className="label">City</label><input className="input" value={f.city} onChange={set("city")} /></div>
        <div><label className="label">State</label><input className="input" value={f.state} onChange={set("state")} /></div>
        <div><label className="label">PIN</label><input className="input" value={f.pincode} onChange={set("pincode")} /></div>
      </div>
      <div><label className="label">New password (optional)</label><input type="password" className="input" value={f.password} onChange={set("password")} /></div>
      {msg && <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.t}</p>}
      <button className="btn">Save changes</button>
    </form>
  );
}
