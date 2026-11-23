import { NextResponse } from "next/server";
import { run } from "@/lib/db";
import { vals } from "../route";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const b = await req.json(); const id = Number(params.id);
  if (!String(b.title || "").trim()) return NextResponse.json({ ok: false, error: "Title is required" }, { status: 400 });
  await run("update blog_posts set title=?,slug=?,excerpt=?,content=?,cover=?,tags=?,author=?,status=?,seo_title=?,seo_desc=?,faq_json=?,updated_at=datetime('now') where id=?", [...(await vals(b, id)), id]);
  return NextResponse.json({ ok: true });
}
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  await run("delete from blog_posts where id = ?", [Number(params.id)]);
  return NextResponse.json({ ok: true });
}
