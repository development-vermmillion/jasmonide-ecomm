import { all } from "./db";
import { getSettings, placeholder } from "./catalog";

/** Convert an Instagram reel/post URL to its embeddable URL. */
export function instagramEmbed(url?: string | null) {
  const m = (url || "").match(/instagram\.com\/(?:[^/]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/);
  if (!m) return "";
  return `https://www.instagram.com/${m[1] === "reels" ? "reel" : m[1]}/${m[2]}/embed`;
}

export type ReelItem = {
  id: number; title: string; url: string; embed: string; thumb: string; video: string;
  product: null | { id: number; name: string; slug: string; price: number; image: string; type: string; in_stock: boolean };
};

export async function getReels(o: { home?: boolean; productId?: number; limit?: number } = {}): Promise<ReelItem[]> {
  const s = await getSettings();
  if (s.reels_enabled !== "1") return [];
  const where = ["r.status = 'active'"], args: any[] = [];
  if (o.home) where.push("r.show_home = 1");
  if (o.productId) { where.push("r.product_id = ?"); args.push(o.productId); }
  const rows = await all(
    `select r.*, p.name as pname, p.slug as pslug, p.price as pprice, p.type as ptype, p.images as pimages, p.status as pstatus from reels r left join products p on p.id = r.product_id
     where ${where.join(" and ")} order by r.sort, r.id desc limit ${o.limit || 24}`, args);
  return rows.map((r: any) => {
    let img = "";
    try { img = JSON.parse(r.pimages || "[]")[0] || ""; } catch {}
    return {
      id: r.id, title: r.title || r.pname || "Reel", url: r.url, embed: instagramEmbed(r.url),
      thumb: r.thumb || img || placeholder(r.title || r.pname || "Reel", (r.id * 47) % 360), video: r.video_url || "",
      product: r.pname && r.pstatus === "published" ? { id: r.product_id, name: r.pname, slug: r.pslug, price: r.pprice, image: img || placeholder(r.pname), type: r.ptype, in_stock: true } : null,
    };
  });
}
