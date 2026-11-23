"use client";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ScrollRow({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const go = (d: number) => ref.current?.scrollBy({ left: d * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  const btn = "absolute top-1/3 z-10 hidden h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-md transition hover:bg-plum hover:text-white md:flex";
  return (
    <div className="relative">
      <button aria-label="Scroll left" onClick={() => go(-1)} className={`${btn} -left-4`}><ChevronLeft size={20} /></button>
      <div ref={ref} className="no-scrollbar -mx-4 flex snap-x scroll-pl-4 gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:scroll-pl-0 sm:gap-4 sm:px-0">{children}</div>
      <button aria-label="Scroll right" onClick={() => go(1)} className={`${btn} -right-4`}><ChevronRight size={20} /></button>
    </div>
  );
}
