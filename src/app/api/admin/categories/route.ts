import { NextResponse } from "next/server";
import { run, one } from "@/lib/db";
import { slugify } from "@/lib/util";

export async function POST(req: Request) {
  const b = await req.json();
  if (!b.name?.trim()) return NextResponse.json({ ok: false, error: "Name required" }, { status: 400 });
  let slug = slugify(b.slug || b.name), n = 1;
  while (await one("select id from categories where slug = ?", [slug])) slug = `${slugify(b.name)}-${++n}`;
  const r = await run("insert into categories (name,slug,description,image,sort) values (?,?,?,?,?)", [b.name.trim(), slug, b.description || "", b.image || "", Number(b.sort) || 0]);
  return NextResponse.json({ ok: true, id: r.id });
}
