const CACHE_NAME = 'godeye-v2';
const assets = [
  './',
  './index.html',
  './manifest.json',
  './icons/Icon-192.png',
  './icons/Icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(assets)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(res => res || fetch(e.request)));
});
