import { NextResponse } from "next/server";
import { maybeRunJobs } from "@/lib/jobs";
import { orderToken } from "@/lib/token";
export const dynamic = "force-dynamic";
/** Optional: point a free cron service (or cPanel cron) at /api/cron?t=TOKEN every hour. Token is shown in Admin → Backups & jobs. */
export async function GET(req: Request) {
  if (new URL(req.url).searchParams.get("t") !== orderToken("cron")) return NextResponse.json({ ok: false }, { status: 403 });
  return NextResponse.json({ ok: true, ran: await maybeRunJobs(true) });
}
