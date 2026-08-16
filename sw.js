// NEG+ Innovations — Service Worker
const CACHE_NAME = 'negplus-v5';

// Static assets that rarely change (images, icons, fonts)
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
  '/icon-512.png'
];

// JS files served network-first so updates land without hard refresh
const NETWORK_FIRST_JS = ['/hero3d.js', '/spline.js', '/ga-events.js'];

// Install: pre-cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: delete stale caches and claim all clients immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch strategy
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
  const isHTML = request.headers.get('accept') && request.headers.get('accept').includes('text/html');

  // Network-first for JS files that change frequently
  const isNetworkFirstJS = NETWORK_FIRST_JS.some(p => url.pathname.endsWith(p.replace('/', '')));

  if (isHTML || isNetworkFirstJS) {
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

  // Cache-first for images, icons, and other static assets
  event.respondWith(
    caches.match(request).then(cached => cached || fetch(request))
  );
});
