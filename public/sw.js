const CACHE_NAME = 'ironflow-cache-v12';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css',
  '/src/hooks/useWorkoutStore.js',
  '/src/data/exercises.json',
  '/src/components/TabBar.jsx',
  '/src/components/TodayWorkout.jsx',
  '/src/components/PlanBuilder.jsx',
  '/src/components/ExerciseLibrary.jsx',
  '/src/components/StatsDashboard.jsx',
  '/src/components/ChatAssistant.jsx',
  '/src/components/FormVisualizer.jsx'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // We will perform cache.addAll on install. Since Vite builds/bundles files in production,
      // this sw.js will dynamically cache whatever it can, and intercept requests at runtime.
      return cache.addAll(ASSETS_TO_CACHE).catch(err => {
        console.warn('Pre-cache warning: some files may be generated dynamically in production', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Interceptor
self.addEventListener('fetch', (event) => {
  // Only handle HTTP/S requests (ignores chrome-extension://, etc)
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh in background to update cache for next load
        fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse.status === 200) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          })
          .catch(() => {/* Ignore network failures when offline */});
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback for offline API request if needed, or simply return failed fetch
      });
    })
  );
});
