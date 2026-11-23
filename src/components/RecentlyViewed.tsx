"use client";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import ScrollRow from "./ScrollRow";

export default function RecentlyViewed({ id }: { id: number }) {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    let ids: number[] = [];
    try { ids = JSON.parse(localStorage.getItem("recent") || "[]"); } catch {}
    const next = [id, ...ids.filter((x) => x !== id)].slice(0, 12);
    try { localStorage.setItem("recent", JSON.stringify(next)); } catch {}
    const others = next.filter((x) => x !== id).slice(0, 8);
    if (!others.length) return;
    fetch("/api/products?ids=" + others.join(",")).then((r) => r.json()).then(setItems).catch(() => {});
  }, [id]);
  if (!items.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Pick up where you left off</p>
      <h2 className="h-serif mb-5 mt-1 text-2xl sm:text-3xl">Recently viewed</h2>
      <ScrollRow>{items.map((p) => <ProductCard key={p.id} p={p} />)}</ScrollRow>
    </section>
  );
}
