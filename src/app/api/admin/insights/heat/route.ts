import { NextResponse } from "next/server";
import { heatData } from "@/lib/insights";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const u = new URL(req.url);
  const days = [7, 30, 90].includes(Number(u.searchParams.get("days"))) ? Number(u.searchParams.get("days")) : 30;
  return NextResponse.json({ ok: true, ...(await heatData(u.searchParams.get("path") || "/", u.searchParams.get("device") === "mobile" ? "mobile" : "desktop", days)) });
}
