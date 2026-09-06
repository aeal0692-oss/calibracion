/* Calibración — service worker
   La app entera cabe en un HTML, así que la estrategia es simple:
   - navegación: red primero, caché si no hay señal
   - todo lo demás (iconos, tipografías): caché primero */
const CACHE = "calibracion-v3";
const BASE = new URL("./", self.location).pathname;
// Único origen externo que vale la pena cachear. Todo lo demás de afuera
// —en particular el proxy del revisor— va directo a la red, sin tocar caché.
const EXTERNOS_CACHEABLES = ["fonts.googleapis.com", "fonts.gstatic.com"];
const ESENCIALES = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.webmanifest",
  BASE + "icons/icon.svg",
  BASE + "icons/apple-touch-icon.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ESENCIALES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  const propio = url.origin === self.location.origin;
  if (!propio && !EXTERNOS_CACHEABLES.includes(url.hostname)) return;

  if (req.mode === "navigate"){
    e.respondWith(
      fetch(req)
        .then(res => {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(BASE + "index.html", copia));
          return res;
        })
        .catch(() => caches.match(BASE + "index.html").then(r => r || caches.match(BASE)))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok && (res.type === "basic" || res.type === "cors")){
        const copia = res.clone();
        caches.open(CACHE).then(c => c.put(req, copia));
      }
      return res;
    }))
  );
});
