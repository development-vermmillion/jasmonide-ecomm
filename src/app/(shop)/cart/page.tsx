"use client";
import { useBulk } from "@/components/useBulk";
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/cart";
import { inr } from "@/lib/util";

export default function CartPage() {
  const { items, setQty, remove, subtotal, ready } = useCart();
  const bulk = useBulk(items);
  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="h-serif text-3xl">Your bag</h1>
      {!ready ? null : items.length === 0 ? (
        <div className="py-20 text-center"><ShoppingBag size={48} className="mx-auto mb-3 text-neutral-300" /><p className="h-serif text-2xl">Your bag is waiting</p><p className="mt-1 text-neutral-500">Something warm and lovely is out there for you.</p><Link href="/shop" className="btn mt-5">Find your glow</Link></div>
      ) : (
        <>
          <ul className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
            {items.map((i) => (
              <li key={i.key} className="flex items-center gap-4 py-4">
                <img src={i.image} alt="" className="h-24 w-24 rounded-lg object-cover" />
                <div className="flex-1">
                  <Link href={`/product/${i.slug}`} className="font-medium hover:underline">{i.name}</Link>
                  {i.variantName && <p className="text-sm text-neutral-500">{i.variantName}</p>}
                  <p className="text-sm">{inr(i.price)}</p>
                  <button onClick={() => remove(i.key)} className="mt-1 inline-flex items-center gap-1 text-xs text-neutral-500 hover:text-red-600"><Trash2 size={13} /> Remove</button>
                </div>
                <div className="flex items-center rounded-full border border-neutral-300">
                  <button className="px-3 py-2" aria-label="Decrease" onClick={() => setQty(i.key, i.qty - 1)}><Minus size={14} /></button>
                  <span className="w-7 text-center text-sm">{i.qty}</span>
                  <button className="px-3 py-2" aria-label="Increase" onClick={() => setQty(i.key, i.qty + 1)}><Plus size={14} /></button>
                </div>
                <p className="w-24 text-right font-medium">{inr(i.price * i.qty)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col items-end gap-2">
            {bulk.hint && <p className="rounded-lg bg-butter px-3 py-2 text-sm">🎁 {bulk.hint}</p>}
            <p className="text-lg">Subtotal <b>{inr(subtotal)}</b></p>
            {bulk.discount > 0 && <p className="text-sm text-green-700">{bulk.label}: −{inr(bulk.discount)}</p>}
            <p className="text-xs text-neutral-500">Shipping, coupons and taxes at checkout.</p>
            <Link href="/checkout" className="btn mt-2">Proceed to checkout <ArrowRight size={16} /></Link>
          </div>
        </>
      )}
    </div>
  );
}
