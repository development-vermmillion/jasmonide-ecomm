import Link from "next/link";
import { Search } from "lucide-react";
import { all } from "@/lib/db";

export default async function NotFoundBody() {
  const cats = await all("select name, slug from categories order by sort, name limit 8").catch(() => []);
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="text-5xl">🕯️</div>
      <p className="eyebrow mt-4">Error 404</p>
      <h1 className="h-serif mt-1 text-3xl sm:text-4xl">This page has gone out, like a blown-out candle</h1>
      <p className="mt-3 text-neutral-600">The link may be old or mistyped. Let's help you find something warm and lovely instead.</p>
      <form action="/shop" className="mx-auto mt-6 flex max-w-sm gap-2">
        <input name="q" placeholder="Search candles, jesmonite, resin…" className="input" />
        <button className="btn" aria-label="Search"><Search size={16} /></button>
      </form>
      {cats.length > 0 && <div className="mt-6 flex flex-wrap justify-center gap-2">{cats.map((c: any) => <Link key={c.slug} href={`/category/${c.slug}`} className="rounded-full border border-neutral-300 px-3 py-1 text-sm hover:border-plum">{c.name}</Link>)}</div>}
      <div className="mt-8 flex justify-center gap-3"><Link href="/" className="btn">Back to home</Link><Link href="/shop" className="btn-outline">Browse the shop</Link></div>
    </div>
  );
}
