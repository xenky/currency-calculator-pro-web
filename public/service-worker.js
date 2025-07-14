var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
/// <reference lib="webworker" />
var sw = self;
var STATIC_CACHE_NAME = 'static-cache-v2';
var RATES_CACHE_NAME = 'rates-cache-v2';
var RATES_API_URL = 'https://raw.githubusercontent.com/xenky/exchange_rates/main/rates.json';
// URLs for the app shell to be cached
// Pre-caching external dependencies to ensure robust offline functionality
var URLS_TO_CACHE = [
    './',
    './index.html',
    'assets/manifest-Ch2sM2iT.json',
    /*'./index.css',*/
    /*'https://cdn.tailwindcss.com',*/
    'https://esm.sh/react@^19.1.0',
    'https://esm.sh/react-dom@^19.1.0/client',
    'https://esm.sh/mathjs@^14.5.2',
    'https://esm.sh/react-transition-group@^4.4.5',
    'img/icon-192.png',
    'img/icon-512.png',
];
// --- Lifecycle Events ---
sw.addEventListener('install', function (event) {
    event.waitUntil(caches.open(STATIC_CACHE_NAME).then(function (cache) {
        console.log('Service Worker: Caching App Shell and Dependencies');
        // Use addAll which fetches and caches. We can ignore errors for individual resources
        // that might fail, to not fail the entire installation.
        var cachePromises = URLS_TO_CACHE.map(function (urlToCache) {
            return cache.add(urlToCache).catch(function (err) {
                console.warn("Failed to cache ".concat(urlToCache, ":"), err);
            });
        });
        return Promise.all(cachePromises);
    }));
});
sw.addEventListener('activate', function (event) {
    var cacheWhitelist = [STATIC_CACHE_NAME, RATES_CACHE_NAME];
    event.waitUntil(caches.keys().then(function (cacheNames) {
        return Promise.all(cacheNames.map(function (cacheName) {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
                console.log('Service Worker: Deleting old cache:', cacheName);
                return caches.delete(cacheName);
            }
        }));
    }).then(function () { return sw.clients.claim(); }));
});
// --- Rate Fetching Logic ---
let lastRatesFetch = 0;
const ONE_HOUR = 3600000;

var fetchAndCacheRates = function () { return __awaiter(_this, void 0, void 0, function () {
    var now, response, cache, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                now = Date.now();
                if (now - lastRatesFetch < ONE_HOUR) {
                    // Si la última actualización fue hace menos de 1 hora, no hacer nada
                    console.log('Service Worker: Rates fetched recently, skipping fetch.');
                    return [2 /*return*/, caches.match(RATES_API_URL)];
                }
                lastRatesFetch = now;
                console.log('Service Worker: Fetching latest rates from network...');
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                return [4 /*yield*/, fetch(RATES_API_URL, { cache: 'no-store' })];
            case 2:
                response = _a.sent();
                if (!response.ok) {
                    throw new Error("Server response not ok: ".concat(response.statusText));
                }
                return [4 /*yield*/, caches.open(RATES_CACHE_NAME)];
            case 3:
                cache = _a.sent();
                console.log('Service Worker: Fetched and caching new rates.');
                return [4 /*yield*/, cache.put(RATES_API_URL, response.clone())];
            case 4:
                _a.sent();
                // Notify clients that new rates are available
                sw.clients.matchAll({ includeUncontrolled: true, type: 'window' }).then(function (clients) {
                    clients.forEach(function (client) { return client.postMessage({ type: 'RATES_UPDATED' }); });
                });
                return [2 /*return*/, response];
            case 5:
                error_1 = _a.sent();
                console.error('Service Worker: Failed to fetch rates:', error_1);
                throw error_1; // Rethrow to allow the caller to handle it (e.g., fallback to cache)
            case 6: return [2 /*return*/];
        }
    });
}); };
// --- Periodic Background Sync ---
sw.addEventListener('periodicsync', function (event) {
    if (event.tag === 'get-rates-periodic') {
        console.log('Service Worker: Periodic sync event triggered for rates.');
        event.waitUntil(fetchAndCacheRates());
    }
});
// --- Fetch Event Listener (Intercepting network requests) ---
sw.addEventListener('fetch', function (event) {
    var requestUrl = new URL(event.request.url);
    // For the rates API, use a network-first, then cache strategy
    if (requestUrl.href === RATES_API_URL) {
        event.respondWith(fetchAndCacheRates().catch(function () {
            // If network fails, try to serve from cache
            console.log('Service Worker: Network fetch for rates failed, trying cache.');
            return caches.match(RATES_API_URL).then(function (response) {
                return response || new Response(null, { status: 404, statusText: 'Not Found in Cache' });
            });
        }));
    }
    else if (event.request.method === 'GET' && requestUrl.protocol.startsWith('http')) {
        // For all other GET requests, use a cache-first, then network strategy
        event.respondWith(caches.match(event.request).then(function (response) {
            if (response) {
                return response; // Serve from cache
            }
            // Not in cache, fetch from network, cache, and return
            return fetch(event.request).then(function (networkResponse) {
                // Check if we received a valid response
                if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
                    var responseToCache_1 = networkResponse.clone();
                    caches.open(STATIC_CACHE_NAME).then(function (cache) {
                        cache.put(event.request, responseToCache_1);
                    });
                }
                return networkResponse;
            });
        }));
    }
});
