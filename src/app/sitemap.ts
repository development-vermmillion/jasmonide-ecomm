import { all } from "@/lib/db";
import { getSettings } from "@/lib/catalog";

export const dynamic = "force-dynamic";
export default async function sitemap() {
  const s = await getSettings();
  const base = s.site_url?.startsWith("http") ? s.site_url : "http://localhost:3000";
  const [p, c, b] = await Promise.all([
    all("select slug, updated_at from products where status='published'"), all("select slug from categories"),
    s.blog_enabled === "1" ? all("select slug, updated_at from blog_posts where status='published'") : Promise.resolve([]),
  ]);
  const d = (x: any) => (x ? new Date(String(x).replace(" ", "T") + "Z") : undefined);
  return [
    { url: base, priority: 1 }, { url: `${base}/shop`, priority: 0.9 },
    ...(s.blog_enabled === "1" ? [{ url: `${base}/blog`, priority: 0.7 }] : []),
    ...(s.faq_enabled === "1" ? [{ url: `${base}/faq`, priority: 0.5 }] : []),
    ...c.map((x: any) => ({ url: `${base}/category/${x.slug}`, priority: 0.8 })),
    ...p.map((x: any) => ({ url: `${base}/product/${x.slug}`, lastModified: d(x.updated_at), priority: 0.7 })),
    ...b.map((x: any) => ({ url: `${base}/blog/${x.slug}`, lastModified: d(x.updated_at), priority: 0.6 })),
  ];
}
