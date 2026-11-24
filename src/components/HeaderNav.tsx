"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown } from "lucide-react";
import { inr } from "@/lib/util";

export type MegaCat = { id: number; name: string; slug: string; description: string; image: string; count: number; products: { id: number; name: string; slug: string; image: string; price: number; from: boolean }[] };

export function NavLink({ href, children, tone }: { href: string; children: React.ReactNode; tone?: "sale" }) {
  const path = usePathname();
  const active = path === href || path.startsWith(href + "/");
  return (
    <Link href={href} className={`nav-link relative inline-flex h-10 items-center whitespace-nowrap rounded-full px-3.5 text-[13.5px] font-medium transition-colors hover:bg-lilac/70 ${tone === "sale" ? "text-clay" : ""} ${active ? "is-active" : ""}`}>
      {children}
      {tone === "sale" && <span className="ml-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-clay" />}
    </Link>
  );
}

export function MegaMenu({ cats }: { cats: MegaCat[] }) {
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const t = useRef<any>(null);
  const path = usePathname();
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [open]);
  const enter = () => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(true), 70); };
  const leave = () => { clearTimeout(t.current); t.current = setTimeout(() => setOpen(false), 140); };
  const c = cats[i] || cats[0];
  if (!c) return null;
  return (
    <div className="flex h-full items-center" onMouseEnter={enter} onMouseLeave={leave}>
      <button type="button" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen((o) => !o)}
        className={`inline-flex h-10 items-center gap-1 rounded-full px-3.5 text-[13.5px] font-medium transition-colors hover:bg-lilac/70 ${open ? "bg-lilac/70" : ""}`}>
        Shop <ChevronDown size={14} className={`opacity-60 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {/* dim the page behind */}
      <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-full h-[100vh] bg-black/25 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "opacity-100" : "opacity-0"}`} />
      <div className={`absolute inset-x-0 top-full z-50 origin-top transition duration-300 ease-out ${open ? "visible translate-y-0 opacity-100" : "pointer-events-none invisible -translate-y-2 opacity-0"}`}>
        <div className="border-b border-neutral-200 bg-paper shadow-[0_40px_70px_-40px_rgba(0,0,0,.35)]">
          <div className="mx-auto grid max-w-7xl grid-cols-12 gap-8 px-6 py-7">
            <ul className="col-span-4 space-y-1">
              {cats.map((x, n) => (
                <li key={x.id}>
                  <Link href={`/category/${x.slug}`} onMouseEnter={() => setI(n)} onFocus={() => setI(n)}
                    className={`group flex items-center gap-3 rounded-2xl p-2.5 pr-3 transition-colors ${n === i ? "bg-lilac/70" : "hover:bg-lilac/40"}`}>
                    <img src={x.image} alt="" loading="lazy" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
                    <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{x.name}</span><span className="block text-xs text-neutral-500">{x.count} item{x.count === 1 ? "" : "s"}</span></span>
                    <ArrowRight size={15} className={`shrink-0 transition ${n === i ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-0"}`} />
                  </Link>
                </li>
              ))}
            </ul>
            <div key={c.id} className="col-span-8">
              <div className="rise flex items-end justify-between gap-6">
                <div className="min-w-0"><p className="eyebrow">{c.name}</p><p className="mt-1 max-w-md text-sm text-neutral-600">{c.description}</p></div>
                <Link href={`/category/${c.slug}`} className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium transition hover:border-plum hover:bg-lilac/50">Shop all <ArrowRight size={14} /></Link>
              </div>
              <div className="mt-5 grid grid-cols-4 gap-4">
                {c.products.map((p, n) => (
                  <Link key={p.id} href={`/product/${p.slug}`} className="rise group block" style={{ ["--i" as any]: n + 1 }}>
                    <span className="block aspect-[4/5] overflow-hidden rounded-2xl bg-lilac/40"><img src={p.image} alt="" loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></span>
                    <span className="mt-2 block truncate text-sm font-medium">{p.name}</span>
                    <span className="text-xs text-neutral-500">{p.from && "From "}{inr(p.price)}</span>
                  </Link>
                ))}
                {c.products.length === 0 && <p className="col-span-4 py-10 text-sm text-neutral-500">New pieces landing soon.</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
