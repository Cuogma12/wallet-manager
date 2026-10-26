const CACHE_PREFIX = 'monee-shell-';
const CACHE_NAME = 'monee-shell-__VERSION__';
const ASSETS = /*__ASSETS__*/ [];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      try {
        // A partially downloaded app must never be advertised as available offline.
        await cache.addAll(
          ASSETS.map((path) => new Request(path, { cache: 'reload' })),
        );
      } catch (error) {
        await caches.delete(CACHE_NAME);
        throw error;
      }
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = (await caches.keys()).filter((name) =>
        name.startsWith(CACHE_PREFIX),
      );
      const previous = names.filter((name) => name !== CACHE_NAME).slice(-1);
      await Promise.all(
        names
          .filter((name) => name !== CACHE_NAME && !previous.includes(name))
          .map((name) => caches.delete(name)),
      );
      // Only shell caches are pruned. Database/storage is never cleared by an app update.
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') void self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (
    request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    /^\/api(?:\/|$)/.test(url.pathname)
  )
    return;
  if (request.mode === 'navigate') {
    // Serve the complete installed version, not a mixture of new HTML and old cached bundles.
    event.respondWith(
      caches
        .open(CACHE_NAME)
        .then(
          async (cache) => (await cache.match('/index.html')) ?? fetch(request),
        ),
    );
  } else if (!url.search && ASSETS.includes(url.pathname)) {
    event.respondWith(
      caches
        .open(CACHE_NAME)
        .then(
          async (cache) => (await cache.match(url.pathname)) ?? fetch(request),
        ),
    );
  }
  // No runtime caching: API payloads, downloaded backups, URLs containing data and third-party requests stay out.
});
