import { InstagramIcon } from "./social";
import Reveal from "./Reveal";
import { getSettings, getSecret } from "@/lib/catalog";
import { getReels } from "@/lib/reels";

type Post = { img: string; href: string; alt: string };

async function livePosts(userId: string, token: string, n: number): Promise<Post[] | null> {
  try {
    const r = await fetch(`https://graph.instagram.com/${encodeURIComponent(userId)}/media?fields=id,media_type,media_url,thumbnail_url,permalink,caption&limit=${n}&access_token=${encodeURIComponent(token)}`, { next: { revalidate: 3600 } });
    if (!r.ok) return null;
    const j = await r.json();
    return (j.data || []).map((m: any) => ({ img: m.media_type === "VIDEO" ? m.thumbnail_url || m.media_url : m.media_url, href: m.permalink, alt: (m.caption || "Instagram post").slice(0, 80) })).filter((p: Post) => p.img);
  } catch { return null; }
}

/** Homepage Instagram grid: real posts when a token is set in Admin → Marketing, otherwise your reels' thumbnails. */
export default async function IgFeed() {
  const s = await getSettings();
  if (s.show_ig_feed !== "1") return null;
  const n = 6;
  const token = await getSecret("ig_access_token");
  let posts: Post[] | null = token && s.ig_user_id ? await livePosts(s.ig_user_id, token, n) : null;
  if (!posts?.length) posts = (await getReels({ limit: n })).filter((r: any) => r.thumb).map((r: any) => ({ img: r.thumb, href: r.url || s.instagram, alt: r.title || "Instagram reel" }));
  if (!posts.length) return null;
  return (
    <Reveal><section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2"><div><p className="eyebrow">{s.reels_handle || "Instagram"}</p><h2 className="h-serif mt-1 text-2xl sm:text-3xl">{s.ig_feed_title}</h2></div>
        <a href={s.instagram} target="_blank" rel="noopener" className="btn-outline"><InstagramIcon size={16} /> Follow us</a></div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-6">
        {posts.slice(0, n).map((p, i) => (
          <a key={i} href={p.href} target="_blank" rel="noopener" style={{ ["--i" as any]: i }} className="rv-item group relative block aspect-square overflow-hidden rounded-xl">
            <img src={p.img} alt={p.alt} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-110" />
            <span className="absolute inset-0 flex items-center justify-center bg-[#2a1620]/0 text-white opacity-0 transition group-hover:bg-[#2a1620]/35 group-hover:opacity-100"><InstagramIcon size={22} /></span>
          </a>))}
      </div>
    </section></Reveal>
  );
}
