/* ============================================================
   666 SOUNDS DESIGN — sw.js
   Service Worker — PWA Offline Cache
   ============================================================ */

const CACHE_NAME = '666-sounds-v1';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './mobile.css',
  './app.js',
  './psycho.js',
  './engine4d.js',
  './matrix.js',
  './manifest.json',
  './icon-192.svg',
  'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&family=Inter:wght@300;400;500;600&display=swap'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
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
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => caches.match('./index.html')))
  );
});
