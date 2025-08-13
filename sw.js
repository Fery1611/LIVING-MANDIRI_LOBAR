/*
 * PENTING: Salin kode ini dan simpan di file bernama 'service-worker.js'
 * di direktori yang sama dengan 'index.html'
 */

// Nama cache untuk versi aplikasi ini
const CACHE_NAME = 'living-mandiri-cache-v6'; // Ubah versi cache untuk memicu update

// Daftar URL yang akan di-cache saat Service Worker diinstal.
// Ini penting agar aplikasi tetap bisa berjalan saat offline.
const urlsToCache = [
    '/',
    './index.html',
    // Semua file PDF harus didaftarkan di sini
    './images/dikes.pdf',
    './images/bapenda.pdf',
    './images/perkim.pdf',
    './images/dislutkan.pdf',
    './images/kominpo.pdf',
    './images/disnaker.pdf',
    './images/diskop.pdf',
    './images/pangan.pdf',
    './images/dishub.pdf',
    './images/disperindag.pdf',
    './images/pertanian.pdf',
    './images/lh.pdf',
    './images/putr.pdf',
    './images/perizinan.pdf',
    './images/PROSPEKTUS SUMMARY IPRO-GILIGEDE _INA - 24 Jan 2022 (final) (1) copy.pdf',

    // Aset-aset lain yang dibutuhkan
    'https://cdn.tailwindcss.com',
    'https://unpkg.com/lucide@latest',
    // Memastikan versi PDF.js sesuai dengan yang di HTML (v3.4.120)
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js',
    // Tambahkan URL gambar placeholder yang digunakan, atau URL gambar yang benar
    'https://placehold.co/400x400/cccccc/000000?text=Gagal+Memuat',
    'https://placehold.co/800x600/cccccc/000000?text=Gambar+Tidak+Tersedia',
    'https://placehold.co/600x400/cccccc/000000?text=Gambar+Tidak+Tersedia'
];

self.addEventListener('install', event => {
    console.log('Service Worker: Instalasi dan pre-caching dimulai.');
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            console.log('Service Worker: Cache dibuka, menambahkan file ke cache...');
            return cache.addAll(urlsToCache);
        })
        .catch(error => {
            console.error('Service Worker: Gagal melakukan pre-caching.', error);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Aktivasi dimulai.');
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('Service Worker: Menghapus cache lama:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    // Strategi: Cache, then network. Untuk aset seperti PDF, gambar, dan stylesheet.
    // Ini memastikan dokumen yang sudah dibuka bisa diakses offline.
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            if (response) {
                console.log('Service Worker: Menyajikan dari cache:', event.request.url);
                return response;
            }
            console.log('Service Worker: Aset tidak ada di cache, mengambil dari jaringan:', event.request.url);
            return fetch(event.request)
                .then(networkResponse => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                })
                .catch(error => {
                    console.error('Service Worker: Gagal mengambil aset:', event.request.url, error);
                    // Fallback jika tidak ada di cache dan network gagal
                    return new Response("Aset tidak tersedia secara offline.", {
                        status: 503,
                        statusText: "Offline",
                        headers: { 'Content-Type': 'text/plain' }
                    });
                });
        })
    );
});