/* PIM EVENT CONTROL 2026 — service worker
 *
 * Bump CACHE_VERSION every time you change index.html, otherwise phones
 * that already installed the app keep serving the old file.
 */
const CACHE_VERSION = 'pim-event-v10-0-transportasi-1';

// index.html is the only entry that MUST cache for the app to work offline.
// Everything else is decoration.
const CORE = [
  './',
  './index.html'
];
const OPTIONAL = [
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png',
  './icons/favicon-32.png',
  './icons/favicon-48.png',
  './icons/favicon.ico'
];

// {cache:'reload'} forces each shell file to come from the network rather than
// the browser's own HTTP cache. Without it a new worker can happily re-cache
// the stale index.html the browser was already holding, and the version bump
// achieves nothing.
function fetchFresh(url) {
  return fetch(new Request(url, { cache: 'reload' }));
}

// cache.addAll() is all-or-nothing: a single missing icon rejects the whole
// install, nothing gets cached, and the app silently loses offline support.
// Fetch and store each file on its own instead, and only let CORE failures
// abort the install.
async function primeCache(cache) {
  await Promise.all(CORE.map(async (url) => {
    const res = await fetchFresh(url);
    if (!res || !res.ok) throw new Error('Core shell file failed: ' + url);
    await cache.put(url, res);
  }));

  await Promise.all(OPTIONAL.map(async (url) => {
    try {
      const res = await fetchFresh(url);
      if (res && res.ok) await cache.put(url, res);
      else console.warn('[PIM Event SW] Skipped (HTTP ' + (res && res.status) + '): ' + url);
    } catch (err) {
      console.warn('[PIM Event SW] Skipped (unreachable): ' + url, err);
    }
  }));
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(primeCache)
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

  let url;
  try { url = new URL(req.url); } catch (err) { return; }

  // Sheet data is never cached by the worker — the app keeps its own copy
  // in localStorage so it can show the timestamp of what you are reading.
  if (url.hostname.endsWith('script.google.com') ||
      url.hostname.endsWith('googleusercontent.com')) {
    return;
  }

  // Only handle our own origin. Fonts and CDN scripts go straight to the
  // network, where the browser's own HTTP cache already does the right thing.
  if (url.origin !== self.location.origin) return;

  // App shell: cache first, refresh in the background.
  event.respondWith(
    caches.match(req).then((hit) => {
      const live = fetch(req).then((res) => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => hit);
      return hit || live;
    })
  );
});
