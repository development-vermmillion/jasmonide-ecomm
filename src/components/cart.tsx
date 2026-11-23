"use client";
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";

export type CartItem = {
  key: string; productId: number; variantId: number | null; name: string; variantName: string;
  price: number; image: string; slug: string; qty: number; max: number; type: string;
};
type Ctx = {
  items: CartItem[]; count: number; subtotal: number; ready: boolean; open: boolean;
  setOpen: (b: boolean) => void;
  add: (i: Omit<CartItem, "key" | "qty">, qty?: number) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
};
const C = createContext<Ctx>(null as any);
export const useCart = () => useContext(C);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem("cart") || "[]")); } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) try { localStorage.setItem("cart", JSON.stringify(items)); } catch {}
  }, [items, ready]);

  const add: Ctx["add"] = useCallback((i, qty = 1) => {
    const key = `${i.productId}-${i.variantId ?? 0}`;
    setItems((cur) => {
      const ex = cur.find((x) => x.key === key);
      if (ex) return cur.map((x) => (x.key === key ? { ...x, price: i.price, max: i.max, qty: Math.min(x.qty + qty, i.max) } : x));
      return [...cur, { ...i, key, qty: Math.min(qty, i.max) }];
    });
    setOpen(true);
  }, []);
  const setQty = useCallback((key: string, qty: number) =>
    setItems((cur) => cur.map((x) => (x.key === key ? { ...x, qty: Math.max(1, Math.min(qty, x.max)) } : x))), []);
  const remove = useCallback((key: string) => setItems((cur) => cur.filter((x) => x.key !== key)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => ({
    items, ready, open, setOpen, add, setQty, remove, clear,
    count: items.reduce((a, i) => a + i.qty, 0),
    subtotal: items.reduce((a, i) => a + i.qty * i.price, 0),
  }), [items, ready, open, add, setQty, remove, clear]);

  return <C.Provider value={value}>{children}</C.Provider>;
}
