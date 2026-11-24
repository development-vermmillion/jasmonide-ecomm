"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Search, X } from "lucide-react";
import { inr } from "@/lib/util";

export default function SearchBox({ cats = [] }: { cats?: { name: string; slug: string }[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [q, setQ] = useState("");
  const [res, setRes] = useState<any[] | null>(null);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && !/input|textarea|select/i.test((e.target as HTMLElement)?.tagName || ""))) { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, []);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const id = setTimeout(() => input.current?.focus(), 60);
    return () => { document.body.style.overflow = prev; clearTimeout(id); };
  }, [open]);
  useEffect(() => {
    if (q.trim().length < 2) { setRes(null); return; }
    const t = setTimeout(async () => { try { const r = await (await fetch("/api/search?q=" + encodeURIComponent(q.trim()))).json(); setRes(r); import("@/lib/insights-client").then((m) => m.ins("search", { label: q.trim().toLowerCase().slice(0, 50), val: Array.isArray(r) ? r.length : 0 })); } catch { setRes([]); } }, 220);
    return () => clearTimeout(t);
  }, [q]);

  const close = () => setOpen(false);
  const go = (e: React.FormEvent) => { e.preventDefault(); if (q.trim()) { close(); router.push(`/shop?q=${encodeURIComponent(q.trim())}`); } };

  return (
    <>
      <button onClick={() => setOpen(true)} aria-label="Search" title="Search  ( / )" className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-lilac/70"><Search size={19} /></button>
      {mounted && open && createPortal(
        <div className="fixed inset-0 z-[110]" role="dialog" aria-modal="true" aria-label="Search">
          <div className="sf-fade absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={close} />
          <div className="sheet-down relative mx-auto max-h-[88vh] max-w-3xl overflow-y-auto rounded-b-3xl bg-paper shadow-2xl sm:mt-0" style={{ paddingTop: "env(safe-area-inset-top)" }}>
            <form onSubmit={go} className="flex items-center gap-3 border-b border-neutral-200 px-5 py-4 sm:px-7 sm:py-5">
              <Search size={20} className="shrink-0 text-neutral-400" />
              <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search candles, vessels, materials…" aria-label="Search products" className="min-w-0 flex-1 bg-transparent text-lg outline-none placeholder:text-neutral-400 sm:text-xl" />
              <button type="button" onClick={close} aria-label="Close search" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lilac/70 transition hover:bg-lilac"><X size={18} /></button>
            </form>
            <div className="px-5 py-5 sm:px-7">
              {res === null && (
                <>
                  <p className="eyebrow">Browse</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {cats.map((c, i) => <Link key={c.slug} href={`/category/${c.slug}`} onClick={close} className="rise rounded-full border border-neutral-300 px-4 py-2 text-sm transition hover:border-plum hover:bg-lilac/60" style={{ ["--i" as any]: i }}>{c.name}</Link>)}
                  </div>
                  <p className="mt-5 hidden text-xs text-neutral-400 sm:block">Tip: press <kbd className="rounded border border-neutral-300 px-1.5">/</kbd> anywhere to search</p>
                </>
              )}
              {res && res.length === 0 && <p className="py-8 text-center text-sm text-neutral-500">No matches for “{q}”. Try another word.</p>}
              {res && res.length > 0 && (
                <ul className="grid gap-1 sm:grid-cols-2">
                  {res.map((p, i) => (
                    <li key={p.id} className="rise" style={{ ["--i" as any]: i }}>
                      <Link href={`/product/${p.slug}`} onClick={close} className="flex items-center gap-3 rounded-2xl p-2 transition hover:bg-lilac/60">
                        <img src={p.image} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                        <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{p.name}</span><span className="block text-xs text-neutral-500">{p.category}</span></span>
                        <span className="text-sm font-medium">{inr(p.price)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              {res && res.length > 0 && <button onClick={go} className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-plum py-3 text-sm font-medium text-white">See all results <ArrowRight size={15} /></button>}
            </div>
          </div>
        </div>, document.body)}
    </>
  );
}
