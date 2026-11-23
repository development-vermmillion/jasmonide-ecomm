import { BadgeCheck } from "lucide-react";
import { all } from "@/lib/db";
import { getSettings } from "@/lib/catalog";
import { getCustomer } from "@/lib/customer-auth";
import { fdate } from "@/lib/util";
import Stars from "./Stars";
import ReviewForm from "./ReviewForm";
import Reveal from "./Reveal";

export default async function Reviews({ productId }: { productId: number }) {
  const s = await getSettings();
  if (s.reviews_enabled !== "1") return null;
  const [rows, me] = await Promise.all([all("select * from reviews where product_id = ? and status = 'approved' order by id desc limit 30", [productId]), getCustomer()]);
  const n = rows.length;
  const avg = n ? rows.reduce((a: number, r: any) => a + r.rating, 0) / n : 0;
  return (
    <section id="reviews" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-10 sm:px-6">
      <Reveal>
        <p className="eyebrow">Reviews</p>
        <h2 className="h-serif mt-1 text-2xl sm:text-3xl">What makers say</h2>
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="space-y-4">
            <div className="rounded-xl bg-butter/70 p-5">
              <p className="h-serif text-5xl">{n ? avg.toFixed(1) : "—"}</p>
              <Stars value={avg} size={18} /><p className="mt-1 text-sm text-neutral-600">{n} review{n === 1 ? "" : "s"}</p>
              {n > 0 && <div className="mt-3 space-y-1.5">{[5, 4, 3, 2, 1].map((k) => {
                const c = rows.filter((r: any) => r.rating === k).length;
                return <div key={k} className="flex items-center gap-2 text-xs"><span className="w-3">{k}</span><div className="h-1.5 flex-1 rounded-full bg-white/70"><div className="h-1.5 rounded-full bg-amber-500" style={{ width: `${(c / n) * 100}%` }} /></div><span className="w-4 text-neutral-500">{c}</span></div>;
              })}</div>}
            </div>
            <ReviewForm productId={productId} defaultName={me?.name || ""} />
          </div>
          <div className="space-y-4 lg:col-span-2">
            {rows.map((r: any) => (
              <article key={r.id} className="card p-5">
                <div className="flex items-center justify-between gap-3"><Stars value={r.rating} /><span className="text-xs text-neutral-500">{fdate(r.created_at)}</span></div>
                {r.title && <p className="mt-2 font-semibold">{r.title}</p>}
                <p className="mt-1 text-sm leading-relaxed text-neutral-700">{r.body}</p>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-neutral-500">{r.name}{r.verified ? <span className="inline-flex items-center gap-1 text-green-700"><BadgeCheck size={14} /> Verified buyer</span> : null}</p>
              </article>
            ))}
            {!n && <p className="card p-8 text-center text-neutral-500">No reviews yet — be the first to share your experience.</p>}
          </div>
        </div>
      </Reveal>
    </section>
  );
}
