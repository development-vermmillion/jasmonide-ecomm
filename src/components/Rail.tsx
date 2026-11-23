import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import ScrollRow from "./ScrollRow";
import Reveal from "./Reveal";

export default function Rail({ eyebrow, title, href, products, linkLabel = "View all", tone = "" }: { eyebrow?: string; title: string; href?: string; products: any[]; linkLabel?: string; tone?: string }) {
  if (!products.length) return null;
  return (
    <section className={tone}>
      <Reveal><div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            <h2 className="h-serif mt-1 text-2xl sm:text-3xl">{title}</h2>
          </div>
          {href && <Link href={href} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium hover:bg-white">{linkLabel} <ArrowRight size={15} /></Link>}
        </div>
        <ScrollRow>{products.map((p) => <ProductCard key={p.id} p={p} />)}</ScrollRow>
      </div></Reveal>
    </section>
  );
}
