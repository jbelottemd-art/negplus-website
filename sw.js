// NEG+ Innovations — Service Worker
const CACHE_NAME = 'negplus-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/investors.html',
  '/rd.html',
  '/clinops.html',
  '/team.html',
  '/pllc.html',
  '/news.html',
  '/faq.html',
  '/consulting.html',
  '/manifest.json',
  '/favicon.png',
  '/logo.svg',
  '/og-image.png',
  '/icon-192.png',
  '/icon-512.png',
  '/hero3d.js',
  '/spline.js'
];

// Install: cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for HTML, cache-first for assets
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Never intercept data room, portal, or external requests
  if (
    url.pathname.includes('dataroom') ||
    url.pathname.includes('portal') ||
    url.origin !== self.location.origin
  ) {
    return;
  }

  // Network-first for HTML pages
  if (request.headers.get('accept') && request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Cache-first for static assets
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});
