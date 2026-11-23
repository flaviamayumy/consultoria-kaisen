// Permite instalar o app e abrir rápido. Dados de login nunca são guardados aqui.
const VERSAO = 'kaisen-v2';
const ARQUIVOS = [
  './', 'index.html', 'config.js', 'manifest.webmanifest', 'css/app.css', 'js/app.js', 'js/dados.js', 'js/ui.js',
  'img/bg.jpg', 'img/dragon.jpg', 'img/enso.jpg', 'img/torii.jpg',
  'icons/favicon.svg', 'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSAO).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((n) => Promise.all(n.filter((x) => x !== VERSAO).map((x) => caches.delete(x))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.hostname.endsWith('supabase.co') || url.hostname.endsWith('supabase.in')) return;

  if (url.origin === self.location.origin) {
    // internet primeiro (sempre a versão mais nova); sem internet, usa a cópia
    e.respondWith(fetch(req).then((res) => {
      if (res.ok) { const c = res.clone(); caches.open(VERSAO).then((cache) => cache.put(req, c)); }
      return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match('index.html'))));
    return;
  }
  if (/fonts\.(googleapis|gstatic)\.com|cdn\.jsdelivr\.net/.test(url.hostname)) {
    e.respondWith(caches.match(req).then((r) => r || fetch(req).then((res) => {
      const c = res.clone(); caches.open(VERSAO).then((cache) => cache.put(req, c)); return res;
    })));
  }
});
