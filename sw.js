// Naikkan nama versi cache ini (misal: crs-pwa-v2, crs-pwa-v3) setiap kali Anda melakukan update kode
const CACHE_NAME = 'ArnaToys-pwa-v1';

const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Pasang Service Worker dan simpan cache dasar
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  // Langsung aktifkan Service Worker baru tanpa menunggu sesi lama ditutup
  self.skipWaiting();
});

// Bersihkan cache versi lama saat Service Worker baru aktif
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Menghapus cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Ambil data dari jaringan utama dulu, jika offline baru ambil dari cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Jika respons jaringan valid, simpan salinan terbaru ke cache
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
