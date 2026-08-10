const CACHE_NAME = 'cakentake-v1';
const ASSETS_TO_CACHE = ['/', '/index.html', '/assets/logo.png', '/assets/favicon/favicon-192x192.png', '/assets/favicon/favicon-512x512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  if (requestUrl.pathname.startsWith('/api') || requestUrl.pathname.startsWith('/products') || requestUrl.pathname.startsWith('/category') || requestUrl.pathname.startsWith('/cart') || requestUrl.pathname.startsWith('/wishlist')) {
    return;
  }

  // Only handle http/https requests
  const url = new URL(event.request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Ignore Vite dev assets and runtime requests to avoid stale dev bundles
  if (url.pathname.startsWith('/_vite/') || url.pathname.startsWith('/vite/') || url.pathname.startsWith('/sockjs-node')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });

          return response;
        })
        .catch(() => caches.match('/index.html'));
    })
  );
});