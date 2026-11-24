import { NextResponse } from "next/server";
import { getSettings } from "@/lib/catalog";
import { deliveryFor } from "@/lib/delivery";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const s = await getSettings();
  const pin = new URL(req.url).searchParams.get("pin") || "";
  const d = deliveryFor(pin, s);
  return NextResponse.json({ ...d, cod: d.ok ? d.codOk && s.cod_enabled === "1" : undefined });
}
