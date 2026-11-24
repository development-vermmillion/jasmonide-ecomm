"use client";
import { UserPlus, KeyRound } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { call, DeleteButton } from "./ui";
import { ROLES, roleOf } from "@/lib/roles";

export default function UsersManager({ rows, meId, isOwner }: { rows: any[]; meId: number; isOwner: boolean }) {
  const router = useRouter();
  const [f, setF] = useState({ name: "", email: "", password: "", role: "manager" });
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  async function add() {
    const r = await call("/api/admin/users", "POST", f);
    setMsg(r.ok ? "User added ✓" : r.error);
    if (r.ok) { setF({ name: "", email: "", password: "", role: "manager" }); router.refresh(); }
  }
  async function changePw() {
    const r = await call(`/api/admin/users/${meId}`, "PUT", { password: pw });
    setMsg(r.ok ? "Password updated ✓" : r.error);
    if (r.ok) setPw("");
  }
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2"><div className="card overflow-x-auto"><table className="w-full">
        <thead className="border-b border-neutral-200 bg-neutral-50"><tr><th className="th">Name</th><th className="th">Email</th><th className="th">Role</th><th className="th"></th></tr></thead>
        <tbody className="divide-y divide-neutral-100">
          {rows.map((u) => (
            <tr key={u.id}><td className="td font-medium">{u.name}{u.id === meId && <span className="ml-2 text-xs text-neutral-400">(you)</span>}</td><td className="td">{u.email}</td>
              <td className="td">{isOwner && u.id !== meId
                ? <select className="input !py-1 text-sm" value={roleOf(u.role)} onChange={async (e) => { const r = await call(`/api/admin/users/${u.id}`, "PUT", { role: e.target.value }); setMsg(r.ok ? "Role updated ✓" : r.error); router.refresh(); }}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
                : <span className={`badge ${u.role === "owner" ? "bg-plum text-white" : "bg-neutral-100"}`}>{ROLES[roleOf(u.role)].label}</span>}</td>
              <td className="td text-right">{isOwner && u.id !== meId && <DeleteButton url={`/api/admin/users/${u.id}`} label="Remove" confirm={`Remove ${u.name}?`} />}</td></tr>
          ))}
        </tbody></table></div>
        <div className="card p-5"><h2 className="font-semibold">What each role can do</h2>
          <div className="mt-3 divide-y divide-neutral-100 text-sm">{Object.entries(ROLES).map(([k, v]) => <div key={k} className="py-2"><p className="font-medium">{v.label}{v.readOnly && <span className="ml-2 badge bg-neutral-100">read-only</span>}</p><p className="text-xs text-neutral-500">{v.desc}</p></div>)}</div></div></div>
      <div className="space-y-5">
        <div className="card space-y-3 p-5"><h2 className="font-semibold">Change my password</h2>
          <input type="password" className="input" placeholder="New password (6+ chars)" value={pw} onChange={(e) => setPw(e.target.value)} /><button className="btn w-full" onClick={changePw}><KeyRound size={15} /> Update</button></div>
        {isOwner && (
          <div className="card space-y-3 p-5"><h2 className="font-semibold">Add user</h2>
            <input className="input" placeholder="Name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
            <input className="input" type="email" placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
            <input className="input" type="password" placeholder="Password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
            <select className="input" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>{Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
            <p className="text-xs text-neutral-500">{ROLES[f.role]?.desc}</p>
            <button className="btn w-full" onClick={add}><UserPlus size={16} /> Add user</button></div>
        )}
        {msg && <p className="text-sm">{msg}</p>}
      </div>
    </div>
  );
}
