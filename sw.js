/* C.T.C.C. camp companion · service worker — offline-first for a low-signal camp. */
const CACHE = "ctcc-camp-v8";

const ASSETS = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./assets/css/styles.css",
  "./assets/js/app.js",
  "./assets/js/schedule.js",
  "./assets/fonts/fonts.css",
  "./icons/icon.svg",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/maskable-512.png",
  "./icons/apple-touch-icon.png",
  "./assets/fonts/bricolagegrotesque-25c61ceb.woff2",
  "./assets/fonts/bricolagegrotesque-a4fe79f7.woff2",
  "./assets/fonts/bricolagegrotesque-a9723242.woff2",
  "./assets/fonts/ibmplexsans-203623c0.woff2",
  "./assets/fonts/ibmplexsans-32a51760.woff2",
  "./assets/fonts/ibmplexsans-71c30cd3.woff2",
  "./assets/fonts/ibmplexsans-73efb435.woff2",
  "./assets/fonts/ibmplexsans-a68a2001.woff2",
  "./assets/fonts/ibmplexsans-c8338492.woff2",
  "./assets/fonts/jetbrainsmono-27e1b5c3.woff2",
  "./assets/fonts/jetbrainsmono-480c0625.woff2",
  "./assets/fonts/jetbrainsmono-ab7c1a7e.woff2",
  "./assets/fonts/jetbrainsmono-b1b0412a.woff2",
  "./assets/fonts/jetbrainsmono-ba16536d.woff2",
  "./assets/fonts/jetbrainsmono-fe142708.woff2",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  // Network-first for the document so updates land; fall back to cache offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put("./index.html", copy));
          return res;
        })
        .catch(() => caches.match("./index.html").then((r) => r || caches.match("./")))
    );
    return;
  }

  // Cache-first for static assets (fonts, css, js, icons).
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      if (res && res.status === 200 && res.type === "basic") {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    }).catch(() => cached))
  );
});
