/* ═══════════════════════════════════════════════
   DiNGo Service Worker  v3
   • Cache-first for app shell (HTML, fonts)
   • Network-first for Firebase (always fresh)
   • Offline fallback to cached index.html
═══════════════════════════════════════════════ */

const CACHE_NAME   = 'dingo-v3';
const OFFLINE_URL  = './index.html';

/* Files that make up the app shell — cached on install */
const APP_SHELL = [
  './index.html',
  './manifest.json'
];

/* ── Install: pre-cache the app shell ── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: wipe old caches ── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: smart routing ── */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* Always go network-first for Firebase and external APIs */
  if (
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.hostname.includes('gstatic') ||
    url.hostname.includes('fonts.') ||
    event.request.method !== 'GET'
  ) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  /* Cache-first for everything else (app shell) */
  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;
        return fetch(event.request)
          .then(response => {
            /* Only cache valid same-origin responses */
            if (
              response &&
              response.status === 200 &&
              response.type === 'basic'
            ) {
              const toCache = response.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
            }
            return response;
          })
          .catch(() => caches.match(OFFLINE_URL));
      })
  );
});

/* ── Message: force update from client ── */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
