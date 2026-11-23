"use client";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";

export default function ProductCardGrid({ products }: { products: any[] }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 [&_.pcard]:!w-full">
      {products.map((p, i) => <Reveal key={p.id} delay={(i % 4) * 70}><ProductCard p={p} /></Reveal>)}
    </div>
  );
}
