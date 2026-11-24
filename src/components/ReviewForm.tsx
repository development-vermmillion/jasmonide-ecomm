"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

export default function ReviewForm({ productId, defaultName }: { productId: number; defaultName: string }) {
  const router = useRouter();
  const [f, setF] = useState({ name: defaultName, title: "", body: "" });
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  async function go(e: React.FormEvent) {
    e.preventDefault();
    const r = await (await fetch("/api/reviews", { method: "POST", body: JSON.stringify({ ...f, rating, product_id: productId }) })).json();
    setMsg({ ok: r.ok, t: r.ok ? (r.status === "approved" ? "Thank you — your words mean so much to a small studio like ours. Your review is live." : "Thank you! Your review will appear once approved.") : r.error });
    if (r.ok) { setF({ ...f, title: "", body: "" }); setRating(0); router.refresh(); }
  }
  return (
    <form onSubmit={go} className="card space-y-3 p-5">
      <p className="font-semibold">Write a review</p>
      <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button type="button" key={n} aria-label={`${n} stars`} onMouseEnter={() => setHover(n)} onClick={() => setRating(n)} className="text-amber-500 transition hover:scale-110">
            <Star size={26} className={n <= (hover || rating) ? "fill-current" : "opacity-40"} />
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="label">Your name *</label><input required className="input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        <div><label className="label">Headline</label><input className="input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
      </div>
      <div><label className="label">Your review *</label><textarea required rows={3} className="input" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} /></div>
      {msg && <p className={`text-sm ${msg.ok ? "text-green-700" : "text-red-600"}`}>{msg.t}</p>}
      <button className="btn">Submit review</button>
    </form>
  );
}
