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
