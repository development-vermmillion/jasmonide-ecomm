"use client";
import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

/** Thin reading-progress bar + back-to-top button. */
export default function ScrollExtras() {
  const [p, setP] = useState(0);
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => {
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setP(h > 0 ? window.scrollY / h : 0);
      setShow(window.scrollY > 700);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <>
      <div className="fixed left-0 top-0 z-[70] h-[3px] w-full origin-left bg-plum" style={{ transform: `scaleX(${p})` }} />
      <button aria-label="Back to top" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={`float-ui fixed bottom-20 right-5 z-30 hidden sm:flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-md transition hover:bg-plum hover:text-white dark:text-white ${show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"}`}>
        <ArrowUp size={18} />
      </button>
    </>
  );
}
