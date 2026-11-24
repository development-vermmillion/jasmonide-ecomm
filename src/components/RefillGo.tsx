"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "./cart";

export default function RefillGo({ id, t }: { id: string; t: string }) {
  const { add } = useCart(); const router = useRouter(); const [msg, setMsg] = useState("Getting your refill ready…");
  useEffect(() => {
    (async () => {
      const r = await (await fetch(`/api/refill?id=${id}&t=${t}`)).json().catch(() => ({ ok: false, error: "Something went wrong" }));
      if (!r.ok) return setMsg(r.error);
      const { qty, ...i } = r.item; add(i, qty);
      try { localStorage.setItem("boxMeta", JSON.stringify({ coupon: r.coupon, note: "Refill plan order" })); } catch {}
      router.replace("/checkout");
    })();
  }, []); // eslint-disable-line
  return <><p className="h-serif text-2xl">{msg}</p>{msg.startsWith("Sorry") || msg.startsWith("This") || msg.startsWith("Invalid") ? <Link href="/shop" className="btn mt-5">Browse the shop</Link> : null}</>;
}
