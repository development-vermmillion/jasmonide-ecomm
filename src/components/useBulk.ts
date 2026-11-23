"use client";
import { useEffect, useState } from "react";

/** Asks the server for the automatic bulk discount on the current cart. */
export function useBulk(items: { productId: number; price: number; qty: number }[]) {
  const [r, setR] = useState({ discount: 0, label: "", hint: "" });
  const sig = JSON.stringify(items.map((i) => [i.productId, i.price, i.qty]));
  useEffect(() => {
    if (!items.length) { setR({ discount: 0, label: "", hint: "" }); return; }
    let live = true;
    fetch("/api/bulk", { method: "POST", body: JSON.stringify({ items }) }).then((x) => x.json()).then((d) => live && setR(d)).catch(() => {});
    return () => { live = false; };
  }, [sig]); // eslint-disable-line react-hooks/exhaustive-deps
  return r;
}
