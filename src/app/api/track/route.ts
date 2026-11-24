import { NextResponse } from "next/server";
import { run } from "@/lib/db";

const clean = (v: any, n = 40) => String(v || "").toLowerCase().replace(/[^a-z0-9:._ -]/g, "").slice(0, n);
export async function POST(req: Request) {
  try {
    const b = await req.json();
    const day = new Date().toISOString().slice(0, 10);
    await run("insert into visits (day, source, medium, campaign, n) values (?,?,?,?,1) on conflict(day, source, medium, campaign) do update set n = n + 1", [day, clean(b.source) || "direct", clean(b.medium), clean(b.campaign, 60)]);
  } catch {}
  return NextResponse.json({ ok: true });
}
