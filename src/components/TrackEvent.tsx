"use client";
import { useEffect } from "react";
import { track } from "@/lib/track-client";

/** Fires one shop event when it appears. `once` de-duplicates across reloads (used for Purchase). */
export default function TrackEvent({ event, items, value, id, once }: { event: "view_item" | "add_to_cart" | "begin_checkout" | "purchase"; items: { id: number | string; name: string; price: number; qty?: number }[]; value: number; id?: string; once?: boolean }) {
  useEffect(() => {
    try {
      if (once && id) { if (localStorage.getItem("tr_" + id)) return; localStorage.setItem("tr_" + id, "1"); }
    } catch {}
    const t = setTimeout(() => track(event, { items, value, id }), 600); // wait for the pixel script to load
    return () => clearTimeout(t);
  }, []); // eslint-disable-line
  return null;
}
