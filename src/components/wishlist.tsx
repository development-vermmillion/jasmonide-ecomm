"use client";
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

type Ctx = { ids: number[]; toggle: (id: number) => void; has: (id: number) => boolean };
const C = createContext<Ctx>({ ids: [], toggle: () => {}, has: () => false });
export const useWishlist = () => useContext(C);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<number[]>([]);
  useEffect(() => { try { setIds(JSON.parse(localStorage.getItem("wishlist") || "[]")); } catch {} }, []);
  const toggle = useCallback((id: number) => setIds((cur) => {
    const n = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur];
    try { localStorage.setItem("wishlist", JSON.stringify(n)); } catch {}
    return n;
  }), []);
  return <C.Provider value={{ ids, toggle, has: (id) => ids.includes(id) }}>{children}</C.Provider>;
}

export function HeartButton({ id, className = "" }: { id: number; className?: string }) {
  const { has, toggle } = useWishlist();
  const on = has(id);
  return (
    <button type="button" aria-label={on ? "Remove from wishlist" : "Add to wishlist"} aria-pressed={on}
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(id); }}
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm transition hover:scale-110 dark:bg-black/40 ${className}`}>
      <Heart size={18} className={on ? "fill-red-500 text-red-500" : "text-neutral-600 dark:text-white"} />
    </button>
  );
}

export function WishlistLink() {
  const { ids } = useWishlist();
  return (
    <Link href="/wishlist" aria-label="Wishlist" className="relative flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-lilac/70">
      <Heart size={19} />
      {ids.length > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-clay px-1 text-[10px] text-white">{ids.length}</span>}
    </Link>
  );
}
