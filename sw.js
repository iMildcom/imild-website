/* iMild.com — service worker (offline-capable PWA shell).
 * Strategy (safe by design, cannot "freeze" the site):
 *   - HTML/navigation: network-first -> cache -> offline fallback
 *   - other same-origin GET (css/js/json/img): stale-while-revalidate
 *   - never caches non-GET or cross-origin requests
 * Bump CACHE to ship a new version; old caches are purged on activate.
 */
const CACHE = 'imild-v2';
const CORE = [
  '/',
  '/index.html',
  '/assets/style.css',
  '/assets/i18n.js',
  '/assets/site.js',
  '/assets/favicon.svg',
  '/manifest.webmanifest',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE)
      // addAll is atomic; guard each so one 404 cannot break install.
      .then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => null))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  const isHtml =
    req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHtml) {
    // network-first: always prefer fresh content; fall back to cache offline.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) => hit || caches.match('/index.html')),
        ),
    );
    return;
  }

  // stale-while-revalidate for static assets.
  event.respondWith(
    caches.match(req).then((hit) => {
      const network = fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => hit);
      return hit || network;
    }),
  );
});
