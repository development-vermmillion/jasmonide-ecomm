"use client";
import { useEffect, useState } from "react";

/** Sticky header that tightens, blurs and drops its announcement bar once you scroll. */
export default function HeaderShell({ announcement, children }: { announcement?: React.ReactNode; children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header data-scrolled={scrolled} className={`sticky top-0 z-40 border-b transition-[background-color,box-shadow,border-color] duration-300 ${scrolled ? "border-transparent bg-paper/80 shadow-[0_10px_30px_-18px_rgba(0,0,0,.35)] backdrop-blur-xl" : "border-neutral-200 bg-paper"}`}>
      {announcement && (
        <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${scrolled ? "grid-rows-[0fr]" : "grid-rows-[1fr]"}`}>
          <div className="overflow-hidden">{announcement}</div>
        </div>
      )}
      {children}
    </header>
  );
}
