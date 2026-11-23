"use client";
import ScrollRow from "./ScrollRow";
import { useState } from "react";
import ProductCard from "./ProductCard";

export default function TabbedRail({ eyebrow, title, tabs, tone = "" }: { eyebrow: string; title: string; tabs: { label: string; products: any[] }[]; tone?: string }) {
  const [i, setI] = useState(0);
  return (
    <section className={tone}><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div><p className="eyebrow">{eyebrow}</p><h2 className="h-serif mt-1 text-2xl sm:text-3xl">{title}</h2></div>
        <div className="flex gap-2">
          {tabs.map((t, k) => (
            <button key={t.label} onClick={() => setI(k)}
              className={`rounded-full border px-4 py-1.5 text-sm ${i === k ? "border-plum bg-plum text-white" : "border-neutral-300 bg-white/70 hover:border-plum"}`}>{t.label}</button>
          ))}
        </div>
      </div>
      <ScrollRow>{tabs[i].products.map((p) => <ProductCard key={p.id} p={p} />)}</ScrollRow>
    </div></section>
  );
}
