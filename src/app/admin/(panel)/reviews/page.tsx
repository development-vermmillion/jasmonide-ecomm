import Link from "next/link";
import { all } from "@/lib/db";
import ReviewRow from "@/components/admin/ReviewRow";

export default async function Reviews({ searchParams }: { searchParams: { status?: string } }) {
  const st = searchParams.status;
  const rows = await all(`select r.*, p.name as product_name from reviews r join products p on p.id = r.product_id ${st ? "where r.status = ?" : ""} order by r.id desc limit 200`, st ? [st] : []);
  return (
    <div className="space-y-5">
      <div><h1 className="h-serif text-3xl">Reviews</h1><p className="text-sm text-neutral-500">Switch a review on to show it in the store.</p></div>
      <div className="flex gap-2 text-xs">{[["", "All"], ["pending", "Pending"], ["approved", "Approved"], ["hidden", "Hidden"]].map(([v, l]) => <Link key={v} href={v ? `/admin/reviews?status=${v}` : "/admin/reviews"} className={`rounded-full px-3 py-1 ${(st || "") === v ? "bg-plum text-white" : "bg-white"}`}>{l}</Link>)}</div>
      <div className="space-y-3">{rows.map((r: any) => <ReviewRow key={r.id} r={r} />)}{!rows.length && <p className="card p-10 text-center text-neutral-500">No reviews here.</p>}</div>
    </div>
  );
}
