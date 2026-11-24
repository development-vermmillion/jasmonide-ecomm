"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCw } from "lucide-react";
import { QUESTIONS } from "@/lib/mood";
import { inr } from "@/lib/util";

export default function MoodQuiz() {
  const [step, setStep] = useState(0);
  const [picks, setPicks] = useState<number[]>([]);
  const [res, setRes] = useState<any[] | null>(null);
  const [busy, setBusy] = useState(false);
  async function pick(i: number) {
    const next = [...picks.slice(0, step), i];
    setPicks(next);
    if (step < QUESTIONS.length - 1) return setStep(step + 1);
    setBusy(true);
    const r = await (await fetch("/api/mood", { method: "POST", body: JSON.stringify({ picks: next }) })).json().catch(() => ({ items: [] }));
    setBusy(false); setRes(r.items || []);
  }
  const reset = () => { setStep(0); setPicks([]); setRes(null); };

  if (res) return (
    <div className="sf-fade mx-auto max-w-4xl">
      <p className="eyebrow text-center">Your glow match</p>
      <h2 className="h-serif mt-1 text-center text-3xl">Made for the way you want to feel</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {res.map((p, i) => (
          <Link key={p.id} href={`/product/${p.slug}`} style={{ ["--i" as any]: i }} className="rv-item sf-lift card group overflow-hidden">
            <div className="aspect-square overflow-hidden"><img src={p.image} alt={p.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" /></div>
            <div className="p-4"><p className="text-xs font-semibold uppercase tracking-widest text-plum">{i === 0 ? "Best match" : "Also lovely"}</p><p className="mt-1 font-medium">{p.name}</p><p className="mt-0.5 line-clamp-2 text-xs text-neutral-500">{p.spec}</p><p className="mt-2 font-semibold">{p.strike ? <s className="mr-1 text-xs font-normal text-neutral-400">{inr(p.strike)}</s> : null}{inr(p.price)}</p></div>
          </Link>
        ))}
      </div>
      {!res.length && <p className="mt-6 text-center text-neutral-500">Nothing matched right now — browse the full collection instead.</p>}
      <div className="mt-8 flex justify-center gap-3"><button onClick={reset} className="btn-outline"><RotateCw size={15} /> Try again</button><Link href="/shop" className="btn">See everything <ArrowRight size={15} /></Link></div>
    </div>
  );

  const q = QUESTIONS[step];
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 flex items-center gap-2">{QUESTIONS.map((_, i) => <span key={i} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-plum" : "bg-neutral-200"}`} />)}</div>
      <div key={step} className="sf-fade">
        <p className="eyebrow">Question {step + 1} of {QUESTIONS.length}</p>
        <h2 className="h-serif mt-1 text-2xl sm:text-3xl">{q.q}</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {q.opts.map((o, i) => (
            <button key={o.label} disabled={busy} onClick={() => pick(i)} className={`sf-lift flex items-center gap-3 rounded-2xl border bg-white p-4 text-left transition hover:border-plum ${picks[step] === i ? "border-plum ring-2 ring-plum/20" : "border-neutral-200"}`}>
              <span className="text-2xl">{o.emoji}</span><span className="font-medium">{o.label}</span>
            </button>
          ))}
        </div>
        {busy && <p className="mt-4 text-sm text-neutral-500">Finding your glow…</p>}
        {step > 0 && <button onClick={() => setStep(step - 1)} className="mt-6 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-plum"><ArrowLeft size={14} /> Back</button>}
      </div>
    </div>
  );
}
