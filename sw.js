/* ============================================================
   666 SOUNDS DESIGN — sw.js
   Service Worker — PWA Offline Cache
   ============================================================ */

const CACHE_NAME = '666-sounds-v1';

// Core same-origin assets — install fails if any of these are missing.
const CORE_ASSETS = [
  './',
  './index.html',
  './style.css',
  './mobile.css',
  './app.js',
  './psycho.js',
  './engine4d.js',
  './matrix.js',
  './manifest.json',
  './icon-192.svg'
];

// Best-effort assets (cross-origin fonts) — must not break install if unreachable.
const OPTIONAL_ASSETS = [
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500;600&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      await cache.addAll(CORE_ASSETS);
      await Promise.allSettled(OPTIONAL_ASSETS.map(url => cache.add(url)));
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  // Only handle GET; let the browser deal with everything else.
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).catch(() => {
        // Offline fallback only for navigations — never substitute index.html
        // for failed sub-resource (script/style/image) requests.
        if (req.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      });
    })
  );
});
