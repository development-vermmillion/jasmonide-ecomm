import "./globals.css";
import type { Metadata, Viewport } from "next";
import { getSettings } from "@/lib/catalog";

export async function generateViewport(): Promise<Viewport> {
  const s = await getSettings();
  return { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: s.theme_color || "#6d5a9c" };
}

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const base = (s.site_url || "").startsWith("http") ? s.site_url : "http://localhost:3000";
  const title = s.seo_home_title || `${s.store_name} — ${s.tagline}`;
  const desc = s.seo_home_desc || s.site_description;
  return {
    metadataBase: new URL(base),
    title: { default: title, template: `%s${s.seo_title_suffix || ` · ${s.store_name}`}` },
    description: desc,
    keywords: s.seo_keywords || undefined,
    applicationName: s.store_name,
    alternates: { canonical: "/" },
    icons: s.favicon_url ? { icon: s.favicon_url, apple: s.favicon_url } : { apple: "/icons/apple-touch.png" },
    manifest: s.pwa_enabled === "0" ? undefined : "/manifest.webmanifest",
    openGraph: { type: "website", siteName: s.store_name, title, description: desc, images: s.og_image ? [s.og_image] : undefined, locale: "en_IN" },
    twitter: { card: "summary_large_image", title, description: desc, images: s.og_image ? [s.og_image] : undefined },
    robots: s.seo_noindex === "1" ? { index: false, follow: false } : { index: true, follow: true },
    verification: { google: s.google_verification || undefined, other: s.bing_verification ? { "msvalidate.01": s.bing_verification } : undefined },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const base = (s.site_url || "").startsWith("http") ? s.site_url : "";
  const same = (s.org_sameas || "").split("\n").map((x) => x.trim()).filter(Boolean);
  const ld = [
    { "@context": "https://schema.org", "@type": "Organization", name: s.store_name, url: base || undefined, logo: s.logo_url || s.favicon_url || undefined, description: s.site_description, email: s.email, telephone: s.phone,
      address: s.business_type_note ? { "@type": "PostalAddress", addressLocality: s.business_type_note, addressCountry: "IN" } : undefined, sameAs: [s.instagram, s.youtube, ...same].filter((x) => x && x.length > 12) },
    { "@context": "https://schema.org", "@type": "WebSite", name: s.store_name, url: base || undefined,
      potentialAction: base ? { "@type": "SearchAction", target: `${base}/shop?q={search_term_string}`, "query-input": "required name=search_term_string" } : undefined },
  ];
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: "try{if(localStorage.getItem('theme')==='dark')document.documentElement.classList.add('dark')}catch(e){}" }} />
        <script dangerouslySetInnerHTML={{ __html: "document.addEventListener('error',function(e){var t=e.target;if(t&&t.tagName==='IMG'){var s=t.getAttribute('src')||'';if(s.indexOf('/api/ph')===0&&s.indexOf('svg=1')<0)t.setAttribute('src',s+'&svg=1')}},true)" }} />
        <noscript><style>{".reveal{opacity:1;transform:none}"}</style></noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        {(s.ga_id || s.meta_pixel_id) && <script dangerouslySetInnerHTML={{ __html: `window.__te=${JSON.stringify(s.track_events === "1" ? "1" : "0")};window.__lt=function(){if(window.__ltd)return;window.__ltd=1;${s.ga_id ? `var g=document.createElement('script');g.async=1;g.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(${JSON.stringify(s.ga_id)});document.head.appendChild(g);window.dataLayer=window.dataLayer||[];window.gtag=function(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config',${JSON.stringify(s.ga_id)});` : ""}${s.meta_pixel_id ? `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(s.meta_pixel_id)});fbq('track','PageView');` : ""}};try{var c=localStorage.getItem('cc');if(${s.cookie_banner_enabled === "1" ? "c==='yes'" : "c!=='no'"})window.__lt()}catch(e){window.__lt()}` }} />}
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
