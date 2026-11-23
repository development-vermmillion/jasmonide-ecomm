import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const OK = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".pdf", ".mp4", ".webm"];
const VIDEO = [".mp4", ".webm"];

export async function POST(req: Request) {
  const form = await req.formData();
  const files = form.getAll("files") as File[];
  const dir = path.resolve(process.cwd(), "uploads");
  fs.mkdirSync(dir, { recursive: true });
  const urls: string[] = [];
  for (const f of files) {
    const ext = path.extname(f.name).toLowerCase();
    if (!OK.includes(ext)) return NextResponse.json({ error: `File type ${ext} not allowed` }, { status: 400 });
    const max = VIDEO.includes(ext) ? 40 : 8;
    if (f.size > max * 1024 * 1024) return NextResponse.json({ error: `Max file size is ${max} MB` }, { status: 400 });
    const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    fs.writeFileSync(path.join(dir, name), Buffer.from(await f.arrayBuffer()));
    urls.push(`/uploads/${name}`);
  }
  return NextResponse.json({ urls });
}
