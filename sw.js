// A simple service worker for caching the app shell

const CACHE_NAME = 'sweet-tech-cache-v1';
// This list should include all the core files needed for your app to run.
// For this simple setup, caching the root and index.html is enough to get started.
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  // Note: We don't cache the dynamic JS modules from the CDN in this simple example,
  // but a more advanced service worker could. The browser's HTTP cache is often sufficient.
];

// Install event: Fires when the service worker is first installed.
self.addEventListener('install', (event) => {
  // We wait until the installation phase is complete before moving on.
  event.waitUntil(
    // Open a cache by name.
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Add all the specified URLs to the cache.
        return cache.addAll(URLS_TO_CACHE);
      })
  );
});

// Fetch event: Fires every time the app makes a network request.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // Check if the request is in our cache.
    caches.match(event.request)
      .then((response) => {
        // If we have a cached response, return it.
        // Otherwise, fetch the request from the network.
        return response || fetch(event.request);
      })
  );
});
