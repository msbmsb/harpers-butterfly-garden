/* ============================================================
   Harper's Butterfly Garden — Service Worker
   Serves the game offline after first load.
   ============================================================ */

const CACHE = 'harpers-garden-v1';

// Core files cached immediately on install
const CORE_ASSETS = [
  './index.html',
  './styles.css',
  './game.js',
  './manifest.json',
];

// ── Install: cache core files ────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

// ── Activate: delete old caches ──────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: cache-first, update cache in background ───────────
self.addEventListener('fetch', event => {
  // Only handle same-origin GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.open(CACHE).then(async cache => {
      const cached = await cache.match(event.request);

      const networkFetch = fetch(event.request)
        .then(res => {
          if (res.ok) cache.put(event.request, res.clone());
          return res;
        })
        .catch(() => null);

      // Serve from cache immediately; update in background
      return cached || networkFetch;
    })
  );
});
