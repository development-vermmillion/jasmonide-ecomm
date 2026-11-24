import { ArrowRight, Truck, ShieldCheck, Banknote, Headset } from "lucide-react";
import Link from "next/link";
import { all } from "@/lib/db";
import { getProducts, getCategories, getSettings, placeholder } from "@/lib/catalog";
import Rail from "@/components/Rail";
import TabbedRail from "@/components/TabbedRail";
import Reveal from "@/components/Reveal";
import ReelsSection from "@/components/ReelsSection";
import IgFeed from "@/components/IgFeed";
import { Sparkles, Gift } from "lucide-react";
import { fdate } from "@/lib/util";

const RING = ["ring-blush", "ring-mint", "ring-sky", "ring-butter", "ring-lilac", "ring-peach"];
const TONES = ["bg-sky/60", "bg-butter/60", "bg-lilac/60"];
const USP = [Truck, ShieldCheck, Banknote, Headset];
const USP_TONE = ["bg-sky/70", "bg-mint/70", "bg-butter/80", "bg-blush/70"];

export default async function Home() {
  const [s, cats, all_, sale, combos, courses, featured] = await Promise.all([
    getSettings(), getCategories(),
    getProducts({ limit: 12 }),
    getProducts({ sale: true, limit: 12 }),
    getProducts({ type: "combo", limit: 12 }),
    getProducts({ type: "digital", limit: 12 }),
    getProducts({ featured: true, limit: 12 }),
  ]);
  const topCats = cats.filter((c: any) => c.product_count > 0).slice(0, 3);
  const catRails = await Promise.all(topCats.map((c: any) => getProducts({ category: c.slug, limit: 10 })));
  const posts = s.blog_enabled === "1" && s.show_blog_home === "1" ? await all("select title, slug, cover, excerpt, created_at from blog_posts where status='published' order by id desc limit 3") : [];
  const on = (k: string) => s[k] === "1";
  const tiles = [
    { t: s.promo1_title, d: s.promo1_text, h: s.promo1_link, img: s.promo1_image, hue: 200, ok: on("combos_enabled") },
    { t: s.promo2_title, d: s.promo2_text, h: s.promo2_link, img: s.promo2_image, hue: 350, ok: on("sale_enabled") },
  ].filter((x) => x.ok);
  const usp = [1, 2, 3, 4].map((i) => [s[`usp${i}_title`], s[`usp${i}_text`]]);
  const projects = [1, 2, 3].map((i) => ({ t: s[`proj${i}_title`], img: s[`proj${i}_image`], h: s[`proj${i}_link`] || "/blog" })).filter((p) => p.t);

  return (
    <>
      <section className="mx-auto grid max-w-7xl gap-4 px-4 pt-4 sm:px-6 sm:pt-6 lg:grid-cols-3">
        <Link href={s.hero_link || "/shop"} className="group relative overflow-hidden rounded-2xl lg:col-span-2">
          {s.hero_video ? (
            <video src={s.hero_video} poster={s.hero_image || "/media/hero-poster.jpg"} autoPlay muted loop playsInline preload="metadata" aria-label={s.hero_title} className="h-[380px] w-full object-cover sm:h-[460px]" />
          ) : (
            <img src={s.hero_image || placeholder("Hero banner", 25)} alt={s.hero_title} className="kenburns h-[380px] w-full object-cover sm:h-[460px]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#2a1620]/75 via-[#2a1620]/25 to-transparent" />
          <div className="absolute bottom-0 left-0 max-w-lg p-5 text-white sm:p-10">
            {s.hero_eyebrow && <p style={{ ["--i" as any]: 0 }} className="hero-in text-[11px] font-semibold uppercase tracking-[0.25em] opacity-80">{s.hero_eyebrow}</p>}
            <h1 style={{ ["--i" as any]: 1 }} className="hero-in h-serif mt-2 text-3xl leading-tight sm:text-5xl">{s.hero_title}</h1>
            <p style={{ ["--i" as any]: 2 }} className="hero-in mt-3 text-sm opacity-90 sm:text-base">{s.hero_text}</p>
            {s.hero_cta && <span style={{ ["--i" as any]: 3 }} className="hero-in shine mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-medium text-ink transition group-hover:gap-3">{s.hero_cta} <ArrowRight size={16} /></span>}
          </div>
        </Link>
        {tiles.length > 0 && <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-1">
          {tiles.map((t, i) => (
            <Link key={t.t} href={t.h || "/shop"} className="group relative overflow-hidden rounded-2xl">
              <img src={t.img || placeholder(t.t, t.hue)} alt="" className="h-[150px] w-full object-cover transition duration-[900ms] ease-out group-hover:scale-110 sm:h-[222px]" />
              <div className="absolute inset-0 bg-[#2d2550]/40" />
              <div className="absolute bottom-0 p-3 text-white sm:p-5"><p className="hidden text-[10px] font-semibold uppercase tracking-[0.25em] opacity-80 sm:block">0{i + 2}</p><h3 className="h-serif text-lg sm:text-2xl">{t.t}</h3><p className="text-xs opacity-90 sm:text-sm">{t.d}</p></div>
            </Link>
          ))}
        </div>}
      </section>

      {on("show_usp") && (
        <Reveal><section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {usp.map(([t, d], i) => { const Icon = USP[i]; return (
              <div key={i} style={{ ["--i" as any]: i }} className={`rv-item sf-lift flex items-center gap-3 rounded-xl p-3 sm:p-4 ${USP_TONE[i]}`}>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-plum"><Icon size={20} /></span>
                <div className="min-w-0"><p className="text-sm font-semibold">{t}</p><p className="text-xs text-neutral-600">{d}</p></div>
              </div>); })}
          </div>
        </section></Reveal>
      )}

      {(on("quiz_enabled") || on("box_enabled")) && (
        <Reveal><section className="mx-auto max-w-7xl px-4 pt-2 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {on("quiz_enabled") && <Link href="/mood-finder" className="rv-item sf-lift group flex items-center gap-4 rounded-2xl bg-lilac/70 p-5 sm:p-6"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-plum"><Sparkles size={22} /></span><div className="min-w-0"><p className="h-serif text-xl">{s.quiz_title}</p><p className="text-sm text-neutral-600">Take the 30-second mood quiz</p></div><ArrowRight size={18} className="ml-auto shrink-0 transition group-hover:translate-x-1" /></Link>}
            {on("box_enabled") && <Link href="/build-a-box" style={{ ["--i" as any]: 1 }} className="rv-item sf-lift group flex items-center gap-4 rounded-2xl bg-blush/70 p-5 sm:p-6"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-plum"><Gift size={22} /></span><div className="min-w-0"><p className="h-serif text-xl">{s.box_title}</p><p className="text-sm text-neutral-600">Pick favourites · add a handwritten card</p></div><ArrowRight size={18} className="ml-auto shrink-0 transition group-hover:translate-x-1" /></Link>}
          </div>
        </section></Reveal>
      )}

      {on("show_categories") && (
        <Reveal><section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
          <p className="eyebrow">{s.cat_eyebrow}</p><h2 className="h-serif mt-1 text-2xl sm:text-3xl">{s.cat_title}</h2>
          <div className="no-scrollbar -mx-4 mt-3 flex scroll-pl-4 gap-4 overflow-x-auto px-4 pb-2 pt-2 sm:mx-0 sm:px-1">
            {cats.map((c: any, i: number) => (
              <Link key={c.id} href={`/category/${c.slug}`} style={{ ["--i" as any]: i }} className="rv-item group w-28 shrink-0 text-center sm:w-44">
                <img src={c.image || placeholder(c.name)} alt={c.name} className={`aspect-square w-full rounded-full object-cover ring-4 ${RING[i % 6]} transition duration-500 group-hover:-translate-y-1 group-hover:scale-[1.04] group-hover:ring-8`} />
                <p className="mt-3 text-sm font-medium">{c.name}</p>
              </Link>
            ))}
          </div>
        </section></Reveal>
      )}

      {on("show_about") && (
        <Reveal><section className="mx-auto max-w-7xl px-4 pb-4 sm:px-6">
          <div className="grid items-center gap-8 overflow-hidden rounded-3xl bg-gradient-to-br from-blush/70 via-butter/50 to-lilac/60 p-5 sm:p-10 md:grid-cols-5 md:gap-12">
            <div className="relative md:col-span-2">
              <img src={s.about_image || "/brand/studio.jpg"} alt="Where Jasmonoide is made" loading="lazy" className="aspect-[4/5] w-full rounded-2xl object-cover shadow-lg md:-rotate-2" />
              <span className="absolute -bottom-3 right-3 rounded-full bg-white px-4 py-1.5 text-xs font-medium shadow-md sm:right-6">🕯️ Our very first chapter</span>
            </div>
            <div className="md:col-span-3">
              <p className="eyebrow">{s.about_eyebrow}</p>
              <h2 className="h-serif mt-1 text-2xl leading-tight sm:text-4xl">{s.about_title}</h2>
              <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-neutral-700">{String(s.about_text || "").split(/\n\s*\n/).map((t, i) => <p key={i}>{t}</p>)}</div>
              {s.about_quote && <blockquote className="mt-5 border-l-4 border-clay pl-4 font-serif text-lg italic text-neutral-800">{s.about_quote}</blockquote>}
              {s.about_name && <p className="mt-3 text-sm font-medium">{s.about_name}</p>}
              <div className="mt-5 flex flex-wrap gap-2">{[s.about_p1, s.about_p2, s.about_p3].filter(Boolean).map((t) => <span key={t} className="rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium">♡ {t}</span>)}</div>
              {s.about_cta && <Link href={s.about_link || "/shop"} className="btn mt-6 inline-flex">{s.about_cta} <ArrowRight size={16} /></Link>}
            </div>
          </div>
        </section></Reveal>
      )}

      <TabbedRail tone="bg-butter/50" eyebrow={s.new_eyebrow} title={s.new_title} tabs={[{ label: "New arrivals", products: all_ }, { label: "Bestsellers", products: featured.length ? featured : all_ }]} />
      {on("sale_enabled") && <Rail tone="bg-blush/60" eyebrow={s.sale_eyebrow} title={s.sale_title} href="/sale" products={sale} />}
      <ReelsSection home eyebrow="Instagram" tone="bg-lilac/50" />
      {on("combos_enabled") && <Rail tone="bg-mint/60" eyebrow={s.combo_eyebrow} title={s.combo_title} href="/combos" products={combos} />}
      {topCats.map((c: any, i: number) => (
        <Rail key={c.id} tone={TONES[i % 3]} eyebrow={c.name} title={c.description || c.name} href={`/category/${c.slug}`} products={catRails[i]} />
      ))}
      {on("show_learn") && <Rail tone="bg-peach/60" eyebrow={s.learn_eyebrow} title={s.learn_title} href="/category/courses" products={courses} />}

      {on("show_projects") && projects.length > 0 && (
        <Reveal><section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <p className="eyebrow">{s.proj_eyebrow}</p><h2 className="h-serif mt-1 text-2xl sm:text-3xl">{s.proj_title}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {projects.map((p, i) => (
              <Link href={p.h} key={i} className={`sf-lift group overflow-hidden rounded-xl border border-white ${["bg-sky/60", "bg-blush/60", "bg-mint/60"][i % 3]}`}>
                <span className="block overflow-hidden"><img src={p.img || placeholder(p.t, 40 + i * 90)} alt={p.t} loading="lazy" className="aspect-[4/3] w-full object-cover transition duration-700 group-hover:scale-105" /></span>
                <div className="p-4"><p className="font-medium">{p.t}</p><p className="mt-2 inline-flex items-center gap-1.5 text-sm underline">Explore <ArrowRight size={14} /></p></div>
              </Link>
            ))}
          </div>
        </section></Reveal>
      )}

      {posts.length > 0 && (
        <Reveal><section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="mb-5 flex items-end justify-between"><div><p className="eyebrow">Journal</p><h2 className="h-serif mt-1 text-2xl sm:text-3xl">Latest from the blog</h2></div><Link href="/blog" className="rounded-full bg-white/70 px-4 py-1.5 text-sm font-medium">All posts</Link></div>
          <div className="grid gap-4 sm:grid-cols-3">{posts.map((p: any) => <Link key={p.slug} href={`/blog/${p.slug}`} className="group"><span className="block overflow-hidden rounded-xl"><img src={p.cover || placeholder(p.title)} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-105" /></span><p className="mt-2 text-xs text-neutral-500">{fdate(p.created_at)}</p><p className="font-medium group-hover:underline">{p.title}</p></Link>)}</div>
        </section></Reveal>
      )}

      <IgFeed />

      {on("show_story") && (
        <Reveal><section className="mx-auto my-8 max-w-7xl px-4 sm:px-6">
          <div className="grid gap-8 rounded-2xl bg-lilac p-6 text-ink sm:p-12 md:grid-cols-2">
            <div><p className="text-[11px] font-semibold uppercase tracking-[0.25em] opacity-70">Why {s.store_name}</p><h2 className="h-serif mt-2 text-3xl sm:text-4xl">{s.story_title}</h2><p className="mt-4 text-sm opacity-80">{s.story_text}</p></div>
            <div className="grid grid-cols-3 gap-4 self-center text-center">{[1, 2, 3].map((i) => <div key={i}><p className="h-serif text-2xl sm:text-4xl">{s[`stat${i}_n`]}</p><p className="mt-1 text-xs opacity-70">{s[`stat${i}_l`]}</p></div>)}</div>
          </div>
        </section></Reveal>
      )}

      {on("show_press") && s.press_names && (
        <section className="mx-auto max-w-7xl px-4 pb-6 sm:px-6"><p className="eyebrow text-center">As featured in</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-lg font-semibold text-plum/40">{s.press_names.split(",").map((n) => <span key={n} className="h-serif">{n.trim()}</span>)}</div></section>
      )}
    </>
  );
}
