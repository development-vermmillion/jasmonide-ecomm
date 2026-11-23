"use client";
import { QuickSwitch, DeleteButton } from "./ui";
import { Star, BadgeCheck } from "lucide-react";

export default function ReviewRow({ r }: { r: any }) {
  return (
    <div className="card flex flex-wrap items-start justify-between gap-4 p-4">
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1 text-amber-500">{[1, 2, 3, 4, 5].map((n) => <Star key={n} size={14} className={n <= r.rating ? "fill-current" : "opacity-30"} />)}<span className="ml-2 text-xs text-neutral-500">{r.name} · on <b>{r.product_name}</b></span>{r.verified ? <BadgeCheck size={14} className="ml-1 text-green-700" /> : null}</p>
        {r.title && <p className="mt-1 font-medium">{r.title}</p>}
        <p className="text-sm text-neutral-700">{r.body}</p>
      </div>
      <div className="flex items-center gap-4">
        <QuickSwitch kind="reviews" id={r.id} on={r.status === "approved"} onLabel="Approved" offLabel={r.status === "pending" ? "Pending" : "Hidden"} />
        <DeleteButton url={`/api/admin/reviews/${r.id}`} />
      </div>
    </div>
  );
}
