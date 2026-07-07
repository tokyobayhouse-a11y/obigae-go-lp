// ゴジラずかん v20 - Service Worker
// コード類はプリキャッシュ、画像は初回取得時にランタイムキャッシュ(不変なのでcache-first)
const CACHE = "godzilla-zukan-v20";
const IMG_CACHE = "godzilla-zukan-img-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./data.js",
  "./data-stats.js",
  "./sfx.js",
  "./bgm.js",
  "./roar.js",
  "./games.js",
  "./extras.js",
  "./manifest.json",
  "./sounds/godzilla-theme.m4a",
  "./sounds/godzilla-roar.m4a"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE && k !== IMG_CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  const isImage = e.request.url.includes("/images/") || e.request.url.includes("/icons/");
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (res.ok && res.type === "basic") {
          const clone = res.clone();
          caches.open(isImage ? IMG_CACHE : CACHE).then(c => c.put(e.request, clone)).catch(() => {});
        }
        return res;
      }).catch(() => cached);
    })
  );
});
