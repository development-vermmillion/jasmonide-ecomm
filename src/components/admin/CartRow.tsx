"use client";
import { useRouter } from "next/navigation";
import { MessageCircle, Mail, Check, Trash2 } from "lucide-react";
import { call } from "./ui";
import { inr } from "@/lib/util";

export default function CartRow({ c, store }: { c: any; store: string }) {
  const router = useRouter();
  const items: { name: string; qty: number; price: number }[] = JSON.parse(c.items || "[]");
  const list = items.map((i) => `${i.name} ×${i.qty}`).join(", ");
  const digits = String(c.phone || "").replace(/\D/g, ""), wa = digits.length === 10 ? "91" + digits : digits;
  const hi = c.name ? c.name.split(" ")[0] : "there";
  const text = `Hi ${hi}! This is ${store}. You left ${list} in your bag — it's still waiting for you 💛 Need any help finishing your order?`;
  const mark = async () => { await call(`/api/admin/sources/${c.id}`, "PUT"); router.refresh(); };
  return (
    <tr>
      <td className="td"><p className="font-medium">{c.name || "—"}</p><p className="text-xs text-neutral-500">{c.phone} {c.email}</p></td>
      <td className="td max-w-xs text-sm text-neutral-600">{list}</td>
      <td className="td font-medium">{inr(c.total)}</td>
      <td className="td capitalize">{c.source || "direct"}</td>
      <td className="td text-xs text-neutral-500">{c.ago}</td>
      <td className="td"><div className="flex items-center justify-end gap-2">
        {wa && <a onClick={mark} target="_blank" href={`https://wa.me/${wa}?text=${encodeURIComponent(text)}`} className="btn-outline !px-2.5 !py-1.5 text-xs" title="Message on WhatsApp"><MessageCircle size={14} /></a>}
        {c.email && <a onClick={mark} href={`mailto:${c.email}?subject=${encodeURIComponent("Your bag is waiting 💛")}&body=${encodeURIComponent(text)}`} className="btn-outline !px-2.5 !py-1.5 text-xs" title="Send email"><Mail size={14} /></a>}
        {c.contacted ? <span className="badge bg-green-100 text-green-800"><Check size={12} /> contacted</span> : <button onClick={mark} className="text-xs underline">Mark contacted</button>}
        <button onClick={async () => { await call(`/api/admin/sources/${c.id}`, "DELETE"); router.refresh(); }} aria-label="Remove" className="text-neutral-400 hover:text-red-600"><Trash2 size={14} /></button>
      </div></td>
    </tr>
  );
}
