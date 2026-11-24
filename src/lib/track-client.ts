"use client";
/** Sends shop events to Google Analytics and the Meta Pixel when they are installed. Safe to call anywhere. */
type Item = { id: number | string; name: string; price: number; qty?: number };
export function track(event: "view_item" | "add_to_cart" | "begin_checkout" | "purchase", d: { items: Item[]; value: number; id?: string }) {
  try {
    const w: any = window;
    if (w.__te !== "1") return;
    const items = d.items.map((i) => ({ item_id: String(i.id), item_name: i.name, price: i.price, quantity: i.qty || 1 }));
    if (w.gtag) w.gtag("event", event, { currency: "INR", value: d.value, items, transaction_id: d.id });
    if (w.fbq) {
      const base = { currency: "INR", value: d.value, content_type: "product", content_ids: d.items.map((i) => String(i.id)), contents: d.items.map((i) => ({ id: String(i.id), quantity: i.qty || 1 })) };
      w.fbq("track", { view_item: "ViewContent", add_to_cart: "AddToCart", begin_checkout: "InitiateCheckout", purchase: "Purchase" }[event], base);
    }
  } catch {}
}
