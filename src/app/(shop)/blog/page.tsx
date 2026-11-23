import Link from "next/link";
import { notFound } from "next/navigation";
import { all } from "@/lib/db";
import { getSettings, placeholder } from "@/lib/catalog";
import { fdate } from "@/lib/util";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Blog", description: "Tutorials, project ideas and tips for makers." };
export default async function Blog() {
  if ((await getSettings()).blog_enabled !== "1") notFound();
  const posts = await all("select * from blog_posts where status='published' order by id desc");
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <p className="eyebrow">Journal</p><h1 className="h-serif mt-1 text-3xl sm:text-4xl">Tutorials & ideas</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p: any, i: number) => (
          <Reveal key={p.id} delay={(i % 3) * 80}>
            <Link href={`/blog/${p.slug}`} className="group block overflow-hidden rounded-2xl bg-white/60">
              <img src={p.cover || placeholder(p.title, (i * 70) % 360)} alt={p.title} loading="lazy" className="aspect-[16/10] w-full object-cover transition duration-500 group-hover:scale-105" />
              <div className="p-4"><p className="text-xs text-neutral-500">{fdate(p.created_at)}{p.tags ? ` · ${p.tags.split(",")[0]}` : ""}</p><h2 className="h-serif mt-1 text-xl">{p.title}</h2><p className="mt-1 line-clamp-2 text-sm text-neutral-600">{p.excerpt}</p></div>
            </Link>
          </Reveal>
        ))}
      </div>
      {!posts.length && <p className="py-20 text-center text-neutral-500">No posts yet.</p>}
    </div>
  );
}
