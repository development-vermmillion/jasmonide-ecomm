"use client";
import { useEffect } from "react";

const HOSTS: [RegExp, string][] = [[/(^|\.)(instagram\.com)$/, "instagram"], [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, "facebook"], [/(^|\.)google\./, "google"], [/bing\.com$/, "bing"], [/youtube\.com$|youtu\.be$/, "youtube"],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, "twitter"], [/whatsapp\.com$|wa\.me$/, "whatsapp"], [/pinterest\./, "pinterest"], [/linkedin\.com$|lnkd\.in$/, "linkedin"], [/(^|\.)(duckduckgo\.com|yahoo\.com)$/, "search"]];

/** Remembers where each visitor came from (Instagram, Google, WhatsApp…) so Admin → Sources & carts can show sales by source. */
export default function Tracker() {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("tr")) return;
      sessionStorage.setItem("tr", "1");
      const q = new URLSearchParams(location.search);
      let source = (q.get("utm_source") || "").toLowerCase(), medium = (q.get("utm_medium") || "").toLowerCase(), campaign = q.get("utm_campaign") || "";
      if (source === "ig") source = "instagram";
      if (source === "fb") source = "facebook";
      if (!source && q.get("fbclid")) { source = "facebook"; medium = medium || "paid"; }
      if (!source && q.get("gclid")) { source = "google"; medium = medium || "cpc"; }
      if (!source && document.referrer) {
        try {
          const h = new URL(document.referrer).hostname.replace(/^(www|m|l|lm)\./, "");
          if (h !== location.hostname.replace(/^www\./, "")) { source = HOSTS.find(([re]) => re.test(h))?.[1] || "referral:" + h; medium = medium || "referral"; }
        } catch {}
      }
      const explicit = !!source;
      if (!source) source = "direct";
      const has = document.cookie.split("; ").some((c) => c.startsWith("src="));
      if (!has || explicit) document.cookie = "src=" + encodeURIComponent(JSON.stringify({ source, medium, campaign })) + "; path=/; max-age=2592000; samesite=lax";
      fetch("/api/track", { method: "POST", body: JSON.stringify({ source, medium, campaign }), keepalive: true }).catch(() => {});
    } catch {}
  }, []);
  return null;
}
