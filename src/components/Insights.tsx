"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ins, flush } from "@/lib/insights-client";

/** Records page views, where people click, how far they scroll and how long they stay. Mounted once in the shop layout. */
export default function Insights() {
  const path = usePathname();
  const max = useRef(0), t0 = useRef(Date.now()), clicks = useRef(0), last = useRef("");

  // end-of-page summary (scroll depth + time on page)
  const finish = (p: string) => {
    if (!p) return;
    const secs = Math.round((Date.now() - t0.current) / 1000);
    if (max.current > 0 || secs > 2) { ins("scroll", { path: p, val: Math.min(100, max.current) }); if (secs > 2) ins("time", { path: p, val: Math.min(secs, 900) }); }
  };
  useEffect(() => {
    if (last.current && last.current !== path) finish(last.current);
    last.current = path; max.current = 0; t0.current = Date.now();
    ins("view", { path });
    flush();
  }, [path]); // eslint-disable-line

  useEffect(() => {
    const onScroll = () => { const d = document.documentElement, h = d.scrollHeight - innerHeight; if (h > 0) max.current = Math.max(max.current, Math.round(((scrollY) / h) * 100)); else max.current = 100; };
    const onClick = (e: MouseEvent) => {
      if (clicks.current++ > 80) return;
      const t = e.target as HTMLElement | null; if (!t || !t.closest) return;
      const d = document.documentElement, w = Math.max(d.scrollWidth, innerWidth), h = Math.max(d.scrollHeight, 1);
      const el = (t.closest("a,button,input,select,summary,[role=button]") as HTMLElement) || t;
      let label = (el.getAttribute("aria-label") || el.textContent || el.tagName).trim().replace(/\s+/g, " ").slice(0, 40);
      if (el.tagName === "IMG") label = "image";
      ins("click", { x: Math.round((e.pageX / w) * 1000) / 10, y: Math.round(e.pageY), ph: h, label });
      const a = t.closest("a") as HTMLAnchorElement | null, href = a?.getAttribute("href") || "";
      const pm = href.match(/^\/product\/([^/?#]+)/), cm = href.match(/^\/category\/([^/?#]+)/);
      if (pm) ins("pclick", { label: pm[1] }); else if (cm) ins("cclick", { label: cm[1] });
    };
    const bye = () => { finish(last.current); flush(); };
    addEventListener("scroll", onScroll, { passive: true }); document.addEventListener("click", onClick, true);
    addEventListener("pagehide", bye); document.addEventListener("visibilitychange", () => { if (document.visibilityState === "hidden") bye(); });
    onScroll();
    return () => { removeEventListener("scroll", onScroll); document.removeEventListener("click", onClick, true); removeEventListener("pagehide", bye); };
  }, []); // eslint-disable-line
  return null;
}
