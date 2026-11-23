"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronRight, Search, PackageSearch, User, Heart } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

type Flags = { combos: boolean; sale: boolean; track: boolean; accounts: boolean; wishlist: boolean; theme: boolean; search: boolean; blog?: boolean };

export default function MobileMenu({ cats, flags }: { cats: { name: string; slug: string }[]; flags: Flags }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const path = usePathname();
  const close = () => setOpen(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", key);
    return () => { document.body.style.overflow = prev; document.removeEventListener("keydown", key); };
  }, [open]);
  const row = "flex items-center justify-between border-b border-neutral-200 py-3.5";
  return (
    <div className="lg:hidden">
      <button onClick={() => setOpen(true)} aria-label="Menu" className="flex h-10 w-10 items-center justify-center rounded-full"><Menu size={24} /></button>
      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[100] flex flex-col bg-paper" role="dialog" aria-modal="true" aria-label="Menu">
          <div className="flex items-center justify-between px-5 py-4" style={{ paddingTop: "max(1rem, env(safe-area-inset-top))" }}>
            <span className="eyebrow">Menu</span>
            <div className="flex items-center gap-1">{flags.theme && <ThemeToggle />}<button onClick={close} aria-label="Close menu" className="flex h-10 w-10 items-center justify-center rounded-full"><X size={24} /></button></div>
          </div>
          <div className="flex-1 overflow-y-auto px-5 pb-10">
            {flags.search && <form action="/shop" className="relative mb-4"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" /><input name="q" placeholder="Search products" className="input !pl-9" /></form>}
            <ul className="text-lg">
              <li><Link className={row} href="/shop" onClick={close}>Shop all <ChevronRight size={18} /></Link></li>
              {cats.map((c) => <li key={c.slug}><Link className={row} href={`/category/${c.slug}`} onClick={close}>{c.name} <ChevronRight size={18} /></Link></li>)}
              {flags.combos && <li><Link className={row} href="/combos" onClick={close}>Combos <ChevronRight size={18} /></Link></li>}
              {flags.sale && <li><Link className={`${row} text-clay`} href="/sale" onClick={close}>Sale <ChevronRight size={18} /></Link></li>}
              {flags.blog && <li><Link className={row} href="/blog" onClick={close}>Blog <ChevronRight size={18} /></Link></li>}
              {flags.wishlist && <li><Link className={row} href="/wishlist" onClick={close}><span className="inline-flex items-center gap-2"><Heart size={18} /> Wishlist</span><ChevronRight size={18} /></Link></li>}
              {flags.accounts && <li><Link className={row} href="/account" onClick={close}><span className="inline-flex items-center gap-2"><User size={18} /> My account</span><ChevronRight size={18} /></Link></li>}
              {flags.track && <li><Link className={row} href="/track" onClick={close}><span className="inline-flex items-center gap-2"><PackageSearch size={18} /> Track order</span><ChevronRight size={18} /></Link></li>}
            </ul>
          </div>
        </div>, document.body)}
    </div>
  );
}
