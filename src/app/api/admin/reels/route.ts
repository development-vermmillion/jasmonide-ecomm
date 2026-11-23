import { NextResponse } from "next/server";
import { run } from "@/lib/db";

export const reelValues = (b: any) => [
  String(b.title || "").trim(), String(b.url || "").trim(), b.thumb || "", b.video_url || "",
  b.product_id ? Number(b.product_id) : null, b.show_home === false || b.show_home === 0 ? 0 : 1,
  b.status === "draft" ? "draft" : "active", Number(b.sort) || 0,
];
export async function POST(req: Request) {
  const b = await req.json();
  if (!String(b.url || "").trim() && !String(b.video_url || "").trim()) return NextResponse.json({ ok: false, error: "Add an Instagram reel link or a video" }, { status: 400 });
  const r = await run("insert into reels (title,url,thumb,video_url,product_id,show_home,status,sort) values (?,?,?,?,?,?,?,?)", reelValues(b));
  return NextResponse.json({ ok: true, id: r.id });
}
