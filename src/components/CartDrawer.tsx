"use client";
import WaCart from "./WaCart";
import { useBulk } from "./useBulk";
import { ShoppingBag, X, Truck, Minus, Plus, Trash2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useCart } from "./cart";
import { inr } from "@/lib/util";

export function CartButton() {
  const { count, setOpen } = useCart();
  return (
    <button onClick={() => setOpen(true)} aria-label="Open bag" className="group relative flex h-10 items-center gap-2 rounded-full transition hover:bg-lilac/70 max-sm:w-10 max-sm:justify-center sm:border sm:border-neutral-300 sm:pl-3.5 sm:pr-4 sm:hover:border-plum">
      <ShoppingBag size={19} className="transition-transform group-hover:-rotate-6" /><span className="hidden text-[13.5px] font-medium sm:inline">Bag</span>
      {count > 0 && <span key={count} className="bump absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-clay px-1 text-[10px] font-semibold text-white sm:static sm:h-5 sm:min-w-5">{count}</span>}
    </button>
  );
}

export function CartDrawer({ freeMin }: { freeMin: number }) {
  const { open, setOpen, items, setQty, remove, subtotal } = useCart();
  const bulk = useBulk(items);
  return (
    <>
      <div onClick={() => setOpen(false)} className={`fixed inset-0 z-50 bg-black/40 transition ${open ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-paper transition-transform ${open ? "translate-x-0 shadow-2xl" : "invisible translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
          <h2 className="h-serif text-xl">Your bag</h2>
          <button onClick={() => setOpen(false)} aria-label="Close" className="text-neutral-500 hover:text-ink"><X size={22} /></button>
        </div>
        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
            <ShoppingBag size={44} className="text-neutral-300" /><div><p className="h-serif text-xl">Your bag is waiting</p><p className="mt-1 text-sm text-neutral-500">Something warm and lovely is out there for you.</p></div>
            <Link href="/shop" onClick={() => setOpen(false)} className="btn">Find your glow</Link>
          </div>
        ) : (
          <>
            {subtotal < freeMin && (
              <div className="flex items-center gap-2 bg-clay-soft px-5 py-2 text-xs text-clay-dark"><Truck size={14} />Add {inr(freeMin - subtotal)} more for free shipping</div>
            )}
            <ul className="flex-1 divide-y divide-neutral-200 overflow-y-auto px-5">
              {items.map((i) => (
                <li key={i.key} className="flex gap-3 py-4">
                  <img src={i.image} alt="" className="h-20 w-20 rounded-lg object-cover" />
                  <div className="flex-1 text-sm">
                    <Link href={`/product/${i.slug}`} onClick={() => setOpen(false)} className="font-medium hover:underline">{i.name}</Link>
                    {i.variantName && <p className="text-xs text-neutral-500">{i.variantName}</p>}
                    <p className="mt-1">{inr(i.price)}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex items-center rounded-full border border-neutral-300">
                        <button className="px-2.5 py-1" aria-label="Decrease" onClick={() => setQty(i.key, i.qty - 1)}><Minus size={12} /></button>
                        <span className="w-6 text-center text-xs">{i.qty}</span>
                        <button className="px-2.5 py-1" aria-label="Increase" onClick={() => setQty(i.key, i.qty + 1)}><Plus size={12} /></button>
                      </div>
                      <button onClick={() => remove(i.key)} aria-label="Remove" className="text-neutral-400 hover:text-red-600"><Trash2 size={15} /></button>
                    </div>
                  </div>
                  <div className="text-sm font-medium">{inr(i.price * i.qty)}</div>
                </li>
              ))}
            </ul>
            <div className="border-t border-neutral-200 p-5">
              {bulk.hint && <p className="mb-2 rounded-lg bg-butter px-3 py-2 text-xs">🎁 {bulk.hint}</p>}
              <div className="mb-1 flex justify-between text-sm"><span>Subtotal</span><b>{inr(subtotal)}</b></div>
              {bulk.discount > 0 && <div className="mb-3 flex justify-between text-sm text-green-700"><span>{bulk.label}</span><span>−{inr(bulk.discount)}</span></div>}
              <p className="mb-3 text-xs text-neutral-500">Shipping and taxes calculated at checkout.</p>
              <Link href="/checkout" onClick={() => setOpen(false)} className="btn w-full">Checkout <ArrowRight size={16} /></Link>
              <WaCart className="mt-2 w-full" />
              <Link href="/cart" onClick={() => setOpen(false)} className="mt-2 block text-center text-xs underline">View full bag</Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
