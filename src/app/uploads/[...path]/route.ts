import fs from "fs";
import path from "path";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml", ".pdf": "application/pdf", ".mp4": "video/mp4", ".webm": "video/webm",
};

// Serves files saved by the admin uploader from ./uploads (works in dev and production).
export async function GET(_: Request, { params }: { params: { path: string[] } }) {
  const root = path.resolve(process.cwd(), "uploads");
  const file = path.resolve(root, ...params.path);
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file)) return new Response("Not found", { status: 404 });
  const data = fs.readFileSync(file);
  return new Response(data, {
    headers: { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
