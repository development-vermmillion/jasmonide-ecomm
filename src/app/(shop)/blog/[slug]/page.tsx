import Link from "next/link";
import { notFound } from "next/navigation";
import { one, all } from "@/lib/db";
import { getSettings, placeholder } from "@/lib/catalog";
import { Markdown } from "@/lib/md";
import { fdate } from "@/lib/util";

async function load(slug: string) {
  const s = await getSettings();
  if (s.blog_enabled !== "1") return null;
  const p = await one("select * from blog_posts where slug = ? and status = 'published'", [slug]);
  return p ? { p, s } : null;
}
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const r = await load(params.slug);
  if (!r) return {};
  const { p } = r;
  return { title: p.seo_title || p.title, description: p.seo_desc || p.excerpt, alternates: { canonical: `/blog/${p.slug}` }, openGraph: { type: "article", title: p.seo_title || p.title, description: p.seo_desc || p.excerpt, images: p.cover ? [p.cover] : undefined } };
}
export default async function Post({ params }: { params: { slug: string } }) {
  const r = await load(params.slug);
  if (!r) notFound();
  const { p, s } = r;
  const more = await all("select title, slug, cover from blog_posts where status='published' and id != ? order by id desc limit 3", [p.id]);
  let faq: { q: string; a: string }[] = [];
  try { faq = JSON.parse(p.faq_json || "[]"); } catch {}
  const base = s.site_url?.startsWith("http") ? s.site_url : "";
  const ld: any[] = [{ "@context": "https://schema.org", "@type": "Article", headline: p.title, description: p.seo_desc || p.excerpt, image: p.cover || undefined, datePublished: p.created_at, dateModified: p.updated_at,
    author: { "@type": "Person", name: p.author || s.store_name }, publisher: { "@type": "Organization", name: s.store_name, logo: s.logo_url || undefined }, mainEntityOfPage: base ? `${base}/blog/${p.slug}` : undefined }];
  if (faq.length) ld.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) });
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <Link href="/blog" className="text-sm underline">← All posts</Link>
      <h1 className="h-serif mt-3 text-3xl leading-tight sm:text-5xl">{p.title}</h1>
      <p className="mt-2 text-sm text-neutral-500">{fdate(p.created_at)}{p.author ? ` · by ${p.author}` : ""}</p>
      {p.cover && <img src={p.cover} alt={p.title} className="mt-6 w-full rounded-2xl" />}
      <div className="mt-8"><Markdown text={p.content} /></div>
      {faq.length > 0 && <section className="mt-10"><h2 className="h-serif mb-3 text-2xl">Frequently asked questions</h2><div className="space-y-2">{faq.map((f, i) => <details key={i} className="card p-4"><summary className="cursor-pointer font-medium">{f.q}</summary><p className="mt-2 text-sm text-neutral-700">{f.a}</p></details>)}</div></section>}
      {more.length > 0 && <section className="mt-12 border-t border-neutral-200 pt-8"><p className="eyebrow mb-3">Keep reading</p><div className="grid gap-4 sm:grid-cols-3">{more.map((m: any) => <Link key={m.slug} href={`/blog/${m.slug}`}><img src={m.cover || placeholder(m.title)} alt="" className="aspect-[16/10] w-full rounded-lg object-cover" /><p className="mt-2 text-sm font-medium">{m.title}</p></Link>)}</div></section>}
    </article>
  );
}
