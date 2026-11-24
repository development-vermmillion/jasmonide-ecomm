export const slugify = (s: string) =>
  (s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";

export const inr = (n: number | null | undefined) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2, minimumFractionDigits: Number(n || 0) % 1 ? 2 : 0 });

export const fdate = (s?: string | null) => {
  if (!s) return "";
  const d = new Date(s.includes("T") || s.includes("Z") ? s : s.replace(" ", "T") + "Z");
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
export const fdatetime = (s?: string | null) => {
  if (!s) return "";
  const d = new Date(s.includes("T") || s.includes("Z") ? s : s.replace(" ", "T") + "Z");
  return d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

export const PRODUCT_TYPES: Record<string, string> = {
  simple: "Simple product",
  variable: "Variable (sizes / options)",
  combo: "Combo / bundle",
  digital: "Digital / course",
};
export const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];
export const PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];

export function toCSV(rows: any[]): string {
  if (!rows.length) return "";
  const cols = Object.keys(rows[0]);
  const esc = (v: any) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(r[c])).join(","))].join("\n");
}

/** Minimal RFC-4180 CSV parser (quotes, commas and newlines inside quotes). Returns objects keyed by the header row. */
export function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], cur = "", q = false;
  const s = text.replace(/^﻿/, "");
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (q) { if (c === '"') { if (s[i + 1] === '"') { cur += '"'; i++; } else q = false; } else cur += c; }
    else if (c === '"') q = true;
    else if (c === ",") { row.push(cur); cur = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && s[i + 1] === "\n") i++; row.push(cur); cur = ""; if (row.some((x) => x.trim() !== "")) rows.push(row); row = []; }
    else cur += c;
  }
  row.push(cur); if (row.some((x) => x.trim() !== "")) rows.push(row);
  if (!rows.length) return [];
  const head = rows[0].map((h) => h.trim().toLowerCase());
  return rows.slice(1).map((r) => Object.fromEntries(head.map((h, i) => [h, (r[i] ?? "").trim()])));
}
