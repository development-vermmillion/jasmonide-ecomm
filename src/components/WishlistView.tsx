"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "./wishlist";
import ProductCardGrid from "./ProductCardGrid";

export default function WishlistView() {
  const { ids } = useWishlist();
  const [items, setItems] = useState<any[] | null>(null);
  useEffect(() => {
    if (!ids.length) { setItems([]); return; }
    fetch("/api/products?ids=" + ids.join(",")).then((r) => r.json()).then((d) => setItems(ids.map((i) => d.find((p: any) => p.id === i)).filter(Boolean))).catch(() => setItems([]));
  }, [ids]);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Saved for later</p>
      <h1 className="h-serif mt-1 text-3xl sm:text-4xl">Your wishlist</h1>
      {items && items.length > 0 ? <ProductCardGrid products={items} /> : items && (
        <div className="py-20 text-center text-neutral-500"><Heart size={40} className="mx-auto mb-3 opacity-40" /><p>Nothing saved yet. Tap the heart on any product.</p><Link href="/shop" className="btn mt-4">Browse products</Link></div>
      )}
    </div>
  );
}
