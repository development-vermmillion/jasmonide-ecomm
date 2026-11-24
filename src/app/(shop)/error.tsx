"use client";
import Link from "next/link";
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <div className="text-5xl">🫧</div>
      <h1 className="h-serif mt-4 text-3xl">Something went wrong on our side</h1>
      <p className="mt-3 text-neutral-600">It's not you — we hit a snag loading this page. Please try again, and if it keeps happening, message us on WhatsApp.</p>
      <div className="mt-8 flex justify-center gap-3"><button onClick={reset} className="btn">Try again</button><Link href="/" className="btn-outline">Go home</Link></div>
    </div>
  );
}
