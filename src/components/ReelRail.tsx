"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Play, X, ChevronLeft, ChevronRight, ExternalLink, ShoppingBag } from "lucide-react";
import { InstagramIcon } from "./social";
import ScrollRow from "./ScrollRow";
import { inr } from "@/lib/util";

type Reel = { id: number; title: string; url: string; embed: string; thumb: string; video: string; product: null | { name: string; slug: string; price: number; image: string } };

function ReelCard({ r, onOpen }: { r: Reel; onOpen: () => void }) {
  const vid = useRef<HTMLVideoElement>(null);
  return (
    <button onClick={onOpen} onMouseEnter={() => vid.current?.play().catch(() => {})} onMouseLeave={() => { if (vid.current) { vid.current.pause(); vid.current.currentTime = 0; } }}
      className="group relative aspect-[9/16] w-[170px] shrink-0 snap-start overflow-hidden rounded-2xl bg-lilac text-left sm:w-[200px]">
      <img src={r.thumb} alt={r.title} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      {r.video && <video ref={vid} src={r.video} muted loop playsInline preload="none" className="absolute inset-0 h-full w-full object-cover opacity-0 transition group-hover:opacity-100" />}
      <span className="absolute inset-0 bg-black/20 transition group-hover:bg-black/10" />
      <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-plum"><InstagramIcon size={15} /></span>
      <span className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-plum shadow transition group-hover:scale-110"><Play size={20} className="ml-0.5 fill-current" /></span>
      <span className="absolute inset-x-0 bottom-0 p-3 text-white">
        <span className="line-clamp-2 text-sm font-medium drop-shadow">{r.title}</span>
        {r.product && <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-medium text-ink"><ShoppingBag size={11} /> {inr(r.product.price)}</span>}
      </span>
    </button>
  );
}

export default function ReelRail({ reels, eyebrow, title, handle, instagram, tone = "", compact = false }: { reels: Reel[]; eyebrow: string; title: string; handle: string; instagram: string; tone?: string; compact?: boolean }) {
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const go = useCallback((d: number) => setOpen((o) => (o === null ? o : (o + d + reels.length) % reels.length)), [reels.length]);

  useEffect(() => {
    if (open === null) return;
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") close(); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    document.addEventListener("keydown", key);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", key); document.body.style.overflow = prev; };
  }, [open, close, go]);

  const cur = open === null ? null : reels[open];
  return (
    <div className={tone}>
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 ${compact ? "py-8" : "py-12"}`}>
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div><p className="eyebrow">{eyebrow}</p><h2 className={`h-serif mt-1 ${compact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl"}`}>{title}</h2></div>
          <a href={instagram} target="_blank" className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium hover:bg-white"><InstagramIcon size={16} /> Follow {handle}</a>
        </div>
        <ScrollRow>{reels.map((r, i) => <ReelCard key={r.id} r={r} onOpen={() => setOpen(i)} />)}</ScrollRow>
      </div>

      {cur && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-3 backdrop-blur-sm" onClick={close} role="dialog" aria-modal="true">
          <div className="relative flex max-h-full w-full max-w-4xl flex-col gap-4 overflow-y-auto rounded-2xl bg-paper p-4 md:flex-row" onClick={(e) => e.stopPropagation()}>
            <button onClick={close} aria-label="Close" className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white shadow"><X size={18} /></button>
            <div className="mx-auto w-full max-w-[360px] shrink-0 overflow-hidden rounded-xl bg-black">
              {cur.embed ? (
                <iframe key={cur.id} src={cur.embed} title={cur.title} className="h-[640px] w-full bg-white" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />
              ) : cur.video ? (
                <video key={cur.id} src={cur.video} controls autoPlay loop playsInline className="aspect-[9/16] w-full" />
              ) : <p className="p-8 text-sm text-white">No video attached to this reel yet.</p>}
            </div>
            <div className="flex flex-1 flex-col justify-center gap-3 md:pr-8">
              <p className="eyebrow">Reel {open! + 1} of {reels.length}</p>
              <h3 className="h-serif text-2xl">{cur.title}</h3>
              {cur.product ? (
                <Link href={`/product/${cur.product.slug}`} onClick={close} className="flex items-center gap-3 rounded-xl bg-lilac/60 p-3 transition hover:bg-lilac">
                  <img src={cur.product.image} alt="" className="h-16 w-16 rounded-lg object-cover" />
                  <div className="flex-1"><p className="text-xs text-neutral-500">Featured in this reel</p><p className="font-medium">{cur.product.name}</p><p className="text-sm">{inr(cur.product.price)}</p></div>
                  <span className="btn !px-4 !py-2 text-xs"><ShoppingBag size={14} /> Shop</span>
                </Link>
              ) : null}
              {cur.url && <a href={cur.url} target="_blank" className="inline-flex items-center gap-2 text-sm underline"><ExternalLink size={14} /> Open on Instagram</a>}
              <div className="mt-2 flex gap-2">
                <button onClick={() => go(-1)} className="btn-outline" aria-label="Previous reel"><ChevronLeft size={16} /> Prev</button>
                <button onClick={() => go(1)} className="btn-outline" aria-label="Next reel">Next <ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
