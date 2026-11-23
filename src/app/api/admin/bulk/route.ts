import { NextResponse } from "next/server";
import { run } from "@/lib/db";

export const vals = (b: any) => [
  String(b.name || "").trim(), ["all", "category", "product"].includes(b.scope) ? b.scope : "all", b.scope === "all" ? null : Number(b.target_id) || null,
  b.basis === "value" ? "value" : "qty", Math.max(0, Math.floor(Number(b.min_qty) || 0)), Math.max(0, Math.floor(Number(b.max_qty) || 0)), Math.max(0, Number(b.min_value) || 0),
  b.discount_type === "fixed" ? "fixed" : "percent", Math.max(0, Number(b.value) || 0), b.active === false || b.active === 0 ? 0 : 1, b.starts_at || "", b.ends_at || "",
];
export function check(b: any) {
  if (!(Number(b.value) > 0)) return "Enter a discount amount";
  if (b.discount_type !== "fixed" && Number(b.value) > 100) return "Percentage can't be more than 100";
  if (b.scope !== "all" && !Number(b.target_id)) return "Choose which product or category";
  if (b.basis === "value" ? !(Number(b.min_value) > 0) : !(Number(b.min_qty) > 0)) return b.basis === "value" ? "Enter the minimum order value" : "Enter the minimum quantity";
  if (b.basis !== "value" && Number(b.max_qty) && Number(b.max_qty) < Number(b.min_qty)) return "Maximum quantity must be at least the minimum";
  return "";
}
export async function POST(req: Request) {
  const b = await req.json(); const e = check(b);
  if (e) return NextResponse.json({ ok: false, error: e }, { status: 400 });
  await run("insert into bulk_rules (name,scope,target_id,basis,min_qty,max_qty,min_value,discount_type,value,active,starts_at,ends_at) values (?,?,?,?,?,?,?,?,?,?,?,?)", vals(b));
  return NextResponse.json({ ok: true });
}
