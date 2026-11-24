import { NextResponse } from "next/server";
import { backupNow } from "@/lib/backup";

export async function POST() {
  const r = await backupNow("manual");
  return NextResponse.json(r, { status: r.ok ? 200 : 500 });
}
