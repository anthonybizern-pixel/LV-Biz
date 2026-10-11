// Service worker : rend l'appli utilisable hors connexion.
// Stratégie : on répond tout de suite avec la version en cache, puis on la met à jour en arrière-plan.
// Après une modification des fichiers, incrémenter VERSION force un rechargement complet du cache.

const VERSION = 'v5';
const CACHE = `english-coach-${VERSION}`;
const LANG_FILES = ['config', 'data', 'grammar', 'dialogues', 'sounds', 'stories', 'lexicon'];
const FILES = [
  './',
  'index.html',
  'style.css',
  'boot.js',
  'app.js',
  ...['en', 'ca', 'de'].flatMap(code => LANG_FILES.map(f => `lang/${code}/${f}.js`)),
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png',
  'icons/favicon-64.png',
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('english-coach-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(caches.open(CACHE).then(async cache => {
    // Les navigations (ouverture de l'appli) sont servies par index.html
    const key = req.mode === 'navigate' ? 'index.html' : req;
    const cached = await cache.match(key, { ignoreSearch: true });
    const network = fetch(req)
      .then(res => { if (res.ok) cache.put(key, res.clone()); return res; })
      .catch(() => cached);
    return cached || network;
  }));
});
