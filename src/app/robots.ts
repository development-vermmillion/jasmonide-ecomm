import { getSettings } from "@/lib/catalog";

export const dynamic = "force-dynamic";
const AI = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-SearchBot", "Claude-User", "PerplexityBot", "Google-Extended", "Applebot-Extended", "CCBot"];
export default async function robots() {
  const s = await getSettings();
  const base = s.site_url?.startsWith("http") ? s.site_url : "http://localhost:3000";
  if (s.seo_noindex === "1") return { rules: [{ userAgent: "*", disallow: "/" }] };
  const priv = ["/admin", "/api", "/checkout", "/cart", "/account", "/order"];
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: priv },
      ...AI.map((a) => (s.ai_crawlers_allowed === "1" ? { userAgent: a, allow: "/", disallow: priv } : { userAgent: a, disallow: "/" })),
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
