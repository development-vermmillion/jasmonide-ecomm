import { NextResponse } from "next/server";
import { run, one } from "@/lib/db";
import { slugify } from "@/lib/util";

export async function uniqueSlug(base: string, id?: number) {
  let s = slugify(base) || "post", n = 1;
  while (await one("select id from blog_posts where slug = ? and id != ?", [s, id || 0])) s = `${slugify(base)}-${++n}`;
  return s;
}
export const vals = async (b: any, id?: number) => [
  String(b.title).trim(), await uniqueSlug(b.slug || b.title, id), b.excerpt || "", b.content || "", b.cover || "", b.tags || "", b.author || "",
  b.status === "published" ? "published" : "draft", b.seo_title || "", b.seo_desc || "", JSON.stringify((b.faq || []).filter((f: any) => f.q && f.a)),
];
export async function POST(req: Request) {
  const b = await req.json();
  if (!String(b.title || "").trim()) return NextResponse.json({ ok: false, error: "Title is required" }, { status: 400 });
  const r = await run("insert into blog_posts (title,slug,excerpt,content,cover,tags,author,status,seo_title,seo_desc,faq_json) values (?,?,?,?,?,?,?,?,?,?,?)", await vals(b));
  return NextResponse.json({ ok: true, id: r.id });
}
