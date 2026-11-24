"use client";
import { useEffect, useState } from "react";
import { useCart } from "./cart";
import { WhatsAppIcon } from "./social";
import { inr } from "@/lib/util";

export default function WaCart({ className = "" }: { className?: string }) {
  const { items, subtotal } = useCart();
  const [c, setC] = useState<any>(null);
  useEffect(() => { fetch("/api/site-config").then((r) => r.json()).then(setC).catch(() => {}); }, []);
  if (!c?.waCart || !items.length) return null;
  const text = `Hi ${c.store}! I'd like to order:\n` + items.map((i) => `• ${i.name}${i.variantName ? " (" + i.variantName + ")" : ""} × ${i.qty} — ${inr(i.price * i.qty)}`).join("\n") + `\nTotal: ${inr(subtotal)}`;
  return <a href={`https://wa.me/${c.whatsapp}?text=${encodeURIComponent(text)}`} target="_blank" className={`btn-outline ${className}`}><WhatsAppIcon size={16} className="text-[#25D366]" /> Send my bag on WhatsApp</a>;
}
