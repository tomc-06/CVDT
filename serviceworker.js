const CACHE_NAME = "v1_cache";
const urlsToCache = [
  "./",
  "./index.html",
  "./styles.css",
  "./script.js",
  "./assetdata.json",
  "./sensorposition.json",
  "./manifest.json",
  "./imgs/NGT Sq Flame 32x32px.ico",
  "./imgs/ar_hand_prompt.png",
  "./imgs/ar_icon.png",
  "./models/EnronFCV-v1.glb",
  "./models/FilterMeterArea-v1.glb",
  "./models/Full Recompression Line-v1.glb",
  "./models/Hays-v1.glb",
  "./models/HPReservoir-v1.glb",
  "./models/ICIIsolation-v1.glb",
  "./models/Lanark-v3.glb",
  "./models/LanarkMainValve-v1.glb",
  "./models/LPReservoir-v1.glb",
  "./models/Spadeadam-1-Pivot.glb",
  "https://ajax.googleapis.com/ajax/libs/model-viewer/3.1.1/model-viewer.min.js",
  "https://unpkg.com/html5-qrcode",
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).then(() => self.skipWaiting());
    })
  );
});

self.addEventListener("activate", (e) => {
  const cacheWhitelist = [CACHE_NAME];
  e.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Check if we received a valid response
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        // IMPORTANT: Clone the response. A response is a stream
        // and because we want the browser to consume the response
        // as well as the cache consuming the response, we need
        // to clone it so we have two streams.
        let responseClone = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(e.request, responseClone);
        });

        return response;
      })
      .catch((err) => {
        // Fall back to the cache if the fetch fails
        return caches.match(e.request);
      })
  );
});
