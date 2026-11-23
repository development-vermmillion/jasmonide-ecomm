import { all } from "./db";
import { getSettings } from "./catalog";
import { ruleLabel } from "./bulk-label";
export { ruleLabel };

export type BulkRule = { id: number; name: string; scope: "all" | "category" | "product"; target_id: number | null; basis: "qty" | "value"; min_qty: number; max_qty: number; min_value: number; discount_type: "percent" | "fixed"; value: number; active: number; starts_at: string; ends_at: string };
export type BulkLine = { productId: number; categoryId: number | null; price: number; qty: number };

export async function activeRules(): Promise<BulkRule[]> {
  const s = await getSettings();
  if (s.bulk_enabled !== "1") return [];
  const rows = (await all("select * from bulk_rules where active = 1")) as BulkRule[];
  const now = Date.now();
  return rows.filter((r) => (!r.starts_at || now >= new Date(r.starts_at).getTime()) && (!r.ends_at || now <= new Date(r.ends_at).getTime() + 86399000));
}

function matches(r: BulkRule, l: BulkLine) {
  return r.scope === "all" || (r.scope === "category" && l.categoryId === r.target_id) || (r.scope === "product" && l.productId === r.target_id);
}

/** Best single applicable rule (rules never stack with each other). */
export function computeBulk(rules: BulkRule[], lines: BulkLine[]) {
  let best: { discount: number; rule: BulkRule } | null = null;
  let hint = "", hintGap = Infinity;
  for (const r of rules) {
    const groups: BulkLine[][] = [lines.filter((l) => matches(r, l))];
    for (const g of groups) {
      if (!g.length) continue;
      const qty = g.reduce((a, l) => a + l.qty, 0), sub = g.reduce((a, l) => a + l.qty * l.price, 0);
      const ok = r.basis === "qty" ? qty >= r.min_qty && (!r.max_qty || qty <= r.max_qty) : sub >= r.min_value;
      if (ok) {
        const raw = r.discount_type === "percent" ? (sub * r.value) / 100 : r.basis === "qty" ? r.value * qty : r.value;
        const d = Math.round(Math.min(raw, sub) * 100) / 100;
        if (d > 0 && (!best || d > best.discount)) best = { discount: d, rule: r };
      } else {
        const gap = r.basis === "qty" ? r.min_qty - qty : r.min_value - sub;
        if (gap > 0 && gap < hintGap) {
          hintGap = gap;
          const off = r.discount_type === "percent" ? `${r.value}% off` : r.basis === "qty" ? `₹${r.value} off each` : `₹${r.value} off`;
          hint = r.basis === "qty" ? `Add ${gap} more ${gap === 1 ? "item" : "items"} to get ${off}` : `Add ₹${Math.ceil(gap)} more to get ${off}`;
        }
      }
    }
  }
  return { discount: best?.discount || 0, label: best ? best.rule.name || ruleLabel(best.rule) : "", hint: best ? "" : hint };
}
