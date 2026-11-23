"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { inr } from "@/lib/util";

export default function SearchBox() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [res, setRes] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (q.trim().length < 2) { setRes([]); return; }
    const t = setTimeout(async () => {
      try { setRes(await (await fetch("/api/search?q=" + encodeURIComponent(q.trim()))).json()); setOpen(true); } catch {}
    }, 250);
    return () => clearTimeout(t);
  }, [q]);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  return (
    <form ref={box} className="relative hidden md:block" onSubmit={(e) => { e.preventDefault(); setOpen(false); if (q.trim()) router.push(`/shop?q=${encodeURIComponent(q.trim())}`); }}>
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
      <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => res.length && setOpen(true)} placeholder="Search" aria-label="Search products"
        className="w-40 rounded-full border border-neutral-300 bg-white/60 py-1.5 pl-9 pr-4 text-sm outline-none transition-all focus:w-64 focus:border-plum" />
      {open && res.length > 0 && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl">
          {res.map((p) => (
            <Link key={p.id} href={`/product/${p.slug}`} onClick={() => setOpen(false)} className="flex items-center gap-3 px-3 py-2 hover:bg-lilac/50">
              <img src={p.image} alt="" className="h-10 w-10 rounded-md object-cover" />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p.name}</p><p className="text-xs text-neutral-500">{p.category}</p></div>
              <span className="text-sm">{inr(p.price)}</span>
            </Link>
          ))}
          <Link href={`/shop?q=${encodeURIComponent(q)}`} onClick={() => setOpen(false)} className="block bg-lilac/40 px-3 py-2 text-center text-xs font-medium">See all results</Link>
        </div>
      )}
    </form>
  );
}
