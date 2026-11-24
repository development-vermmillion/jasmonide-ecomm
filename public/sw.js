/* Minimal service worker: lets the site be installed, caches static assets, and shows a friendly page when offline. */
const V = "jm-v1";
self.addEventListener("install", (e) => { e.waitUntil(caches.open(V).then((c) => c.add("/offline.html")).then(() => self.skipWaiting())); });
self.addEventListener("activate", (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin || u.pathname.startsWith("/api") || u.pathname.startsWith("/admin")) return;
  if (r.mode === "navigate") { e.respondWith(fetch(r).catch(() => caches.match("/offline.html"))); return; }
  if (u.pathname.startsWith("/_next/static") || u.pathname.startsWith("/icons") || /\.(png|jpe?g|webp|svg|woff2?)$/.test(u.pathname)) {
    e.respondWith(caches.open(V).then((c) => c.match(r).then((hit) => hit || fetch(r).then((res) => { if (res.ok) c.put(r, res.clone()); return res; }))));
  }
});
