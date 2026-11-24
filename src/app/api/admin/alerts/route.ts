import { NextResponse } from "next/server";
import { checkLowStock } from "@/lib/notify";

export async function POST() {
  return NextResponse.json({ ok: true, results: await checkLowStock(true) });
}
