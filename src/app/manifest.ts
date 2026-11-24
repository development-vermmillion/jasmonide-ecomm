import type { MetadataRoute } from "next";
import { getSettings } from "@/lib/catalog";
export const dynamic = "force-dynamic";
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await getSettings();
  const custom = s.pwa_icon || "";
  return {
    name: s.store_name, short_name: (s.store_name || "Store").slice(0, 12), description: s.site_description || s.tagline,
    start_url: "/?source=pwa", scope: "/", display: "standalone", orientation: "portrait",
    background_color: "#faf7f2", theme_color: s.theme_color || "#6d5a9c",
    icons: custom
      ? [{ src: custom, sizes: "512x512", type: "image/png", purpose: "any" }, { src: custom, sizes: "192x192", type: "image/png", purpose: "any" }]
      : [{ src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }, { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }, { src: "/icons/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }],
    shortcuts: [{ name: "Shop", url: "/shop" }, { name: "My orders", url: "/account" }, { name: "Track order", url: "/track" }],
  };
}
