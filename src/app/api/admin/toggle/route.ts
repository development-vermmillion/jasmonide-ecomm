import { NextResponse } from "next/server";
import { run } from "@/lib/db";

// One endpoint for every on/off switch in the admin lists.
const MAP: Record<string, { table: string; field: string; on: any; off: any }> = {
  products: { table: "products", field: "status", on: "published", off: "draft" },
  coupons: { table: "coupons", field: "active", on: 1, off: 0 },
  reels: { table: "reels", field: "status", on: "active", off: "draft" },
  bulk: { table: "bulk_rules", field: "active", on: 1, off: 0 },
  taught: { table: "assistant_taught", field: "active", on: 1, off: 0 },
  blog: { table: "blog_posts", field: "status", on: "published", off: "draft" },
  faqs: { table: "faqs", field: "active", on: 1, off: 0 },
  reviews: { table: "reviews", field: "status", on: "approved", off: "hidden" },
};
export async function POST(req: Request) {
  const { kind, id, on } = await req.json();
  const m = MAP[kind];
  if (!m) return NextResponse.json({ ok: false, error: "Unknown switch" }, { status: 400 });
  await run(`update ${m.table} set ${m.field} = ? where id = ?`, [on ? m.on : m.off, Number(id)]);
  return NextResponse.json({ ok: true });
}
