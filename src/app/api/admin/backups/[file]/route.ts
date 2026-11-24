import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { BACKUP_DIR } from "@/lib/backup";

const safe = (f: string) => /^store-[\w-]+\.(db|json)$/.test(f);
export async function GET(_: Request, { params }: { params: { file: string } }) {
  if (!safe(params.file)) return new Response("Not found", { status: 404 });
  const p = path.join(BACKUP_DIR, params.file);
  if (!fs.existsSync(p)) return new Response("Not found", { status: 404 });
  return new Response(fs.readFileSync(p), { headers: { "Content-Type": "application/octet-stream", "Content-Disposition": `attachment; filename="${params.file}"` } });
}
export async function DELETE(_: Request, { params }: { params: { file: string } }) {
  if (!safe(params.file)) return NextResponse.json({ ok: false }, { status: 404 });
  try { fs.unlinkSync(path.join(BACKUP_DIR, params.file)); } catch {}
  return NextResponse.json({ ok: true });
}
