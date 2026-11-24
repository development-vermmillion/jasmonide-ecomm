"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CookieBanner({ text }: { text: string }) {
  const [show, setShow] = useState(false);
  useEffect(() => { try { if (!localStorage.getItem("cc")) setShow(true); } catch {} }, []);
  if (!show) return null;
  const choose = (v: "yes" | "no") => { try { localStorage.setItem("cc", v); if (v === "yes") (window as any).__lt?.(); } catch {} setShow(false); };
  return (
    <div role="dialog" aria-label="Cookie notice" className="sf-fade fixed inset-x-3 bottom-3 z-40 mx-auto max-w-xl rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl sm:bottom-5">
      <p className="text-sm text-neutral-700">{text} <Link href="/page/cookies" className="underline">Cookie policy</Link></p>
      <div className="mt-3 flex gap-2"><button onClick={() => choose("yes")} className="btn !px-5 !py-2 text-sm">Accept all</button><button onClick={() => choose("no")} className="btn-outline !px-5 !py-2 text-sm">Only essential</button></div>
    </div>
  );
}
