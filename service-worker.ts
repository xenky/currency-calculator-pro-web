/// <reference lib="webworker" />
const sw = self as unknown as ServiceWorkerGlobalScope;

const STATIC_CACHE_NAME = 'static-cache-v2';
const RATES_CACHE_NAME = 'rates-cache-v2';
const RATES_API_URL = 'https://raw.githubusercontent.com/xenky/exchange_rates/main/rates.json';

// URLs for the app shell to be cached
const URLS_TO_CACHE = [
  './',
  './index.html',
];

// --- Lifecycle Events ---

sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log('Service Worker: Caching App Shell');
      return cache.addAll(URLS_TO_CACHE);
    })
  );
});

sw.addEventListener('activate', (event) => {
  const cacheWhitelist = [STATIC_CACHE_NAME, RATES_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => sw.clients.claim())
  );
});

// --- Rate Fetching Logic ---

const fetchAndCacheRates = async () => {
  console.log('Service Worker: Fetching latest rates from network...');
  try {
    const response = await fetch(RATES_API_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Server response not ok: ${response.statusText}`);
    }
    const cache = await caches.open(RATES_CACHE_NAME);
    console.log('Service Worker: Fetched and caching new rates.');
    await cache.put(RATES_API_URL, response.clone());

    // Notify clients that new rates are available
    sw.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(clients => {
      clients.forEach(client => client.postMessage({ type: 'RATES_UPDATED' }));
    });
    return response;
  } catch (error) {
    console.error('Service Worker: Failed to fetch rates:', error);
    throw error; // Rethrow to allow the caller to handle it (e.g., fallback to cache)
  }
};


// --- Periodic Background Sync ---

sw.addEventListener('periodicsync', (event: any) => {
  if (event.tag === 'get-rates-periodic') {
    console.log('Service Worker: Periodic sync event triggered for rates.');
    event.waitUntil(fetchAndCacheRates());
  }
});


// --- Fetch Event Listener (Intercepting network requests) ---

sw.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // For the rates API, use a network-first, then cache strategy
  if (requestUrl.href === RATES_API_URL) {
    event.respondWith(
      fetchAndCacheRates().catch(() => {
        // If network fails, try to serve from cache
        console.log('Service Worker: Network fetch for rates failed, trying cache.');
        return caches.match(RATES_API_URL).then(response => {
            return response || new Response(null, { status: 404, statusText: 'Not Found in Cache' });
        });
      })
    );
  } else if (event.request.method === 'GET' && requestUrl.protocol.startsWith('http')) {
    // For all other GET requests, use a cache-first, then network strategy
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) {
          return response; // Serve from cache
        }
        // Not in cache, fetch from network, cache, and return
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
              const responseToCache = networkResponse.clone();
              caches.open(STATIC_CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return networkResponse;
        });
      })
    );
  }
});
