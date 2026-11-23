type R = { basis: string; min_qty: number; max_qty: number; min_value: number; discount_type: string; value: number };
export const ruleLabel = (r: R) => {
  const off = r.discount_type === "percent" ? `${r.value}% off` : r.basis === "qty" ? `₹${r.value} off each` : `₹${r.value} off`;
  const when = r.basis === "qty" ? (r.max_qty ? `Buy ${r.min_qty}–${r.max_qty}` : `Buy ${r.min_qty}+`) : `Orders over ₹${r.min_value}`;
  return `${when}: ${off}`;
};

