// Offline-Cache. Bei Änderungen die Versionsnummer erhöhen.
const C = 'stundenbuch-1.5.9';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './werkstattauftrag.html', './pruefprotokoll.html', './pdfshare.js', './pdf-lib.min.js'];
// Jede Datei einzeln und am Zwischenspeicher vorbei laden; fehlende Dateien blockieren das Update nicht
self.addEventListener('install', e => {
  e.waitUntil(caches.open(C).then(c => Promise.all(FILES.map(f =>
    fetch(new Request(f, { cache: 'reload' })).then(r => r.ok ? c.put(f, r) : null).catch(() => null)))));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Seiten: erst Netz (frisch), bei Offline der Cache. Übrige Dateien: erst Cache.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req, { cache: 'no-store' }).then(r => { const cp = r.clone(); caches.open(C).then(c => c.put(req, cp)); return r; })
      .catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(r => r || fetch(req)));
});
