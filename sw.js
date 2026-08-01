/* PIM EVENT CONTROL 2026 — service worker
 *
 * Bump CACHE_VERSION every time you change index.html, otherwise phones
 * that already installed the app keep serving the old file.
 */
const CACHE_VERSION = 'pim-event-v8-9';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Sheet data is never cached by the worker — the app keeps its own copy
  // in localStorage so it can show the timestamp of what you are reading.
  if (url.hostname.endsWith('script.google.com') ||
      url.hostname.endsWith('googleusercontent.com')) {
    return;
  }

  // App shell: cache first, refresh in the background.
  event.respondWith(
    caches.match(req).then((hit) => {
      const live = fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || live;
    })
  );
});
