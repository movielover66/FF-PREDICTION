const CACHE_NAME = 'godeye-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './main.js',
  './manifest.json',
  './icons/Icon-192.png',   // বড় হাতের
  './icons/Icon-512.png'    // বড় হাতের
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('✅ Service Worker: ক্যাশ খোলা হয়েছে');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
