# Deployment Notes v8.9

1. Deploy Apps Script schema 2.0 lebih dahulu dan uji endpoint `?preview=1`.
2. Isi `API_URL` di `config.js`.
3. Unggah semua file PWA, termasuk folder `icons/`.
4. Buka PWA dengan `?preview=1`, selesaikan `TEST_CHECKLIST_v8.9.md`.
5. Setelah validasi nol error, ubah workbook menjadi `Production`.
6. Buka URL tanpa parameter dan lakukan hard refresh satu kali.

Cache app shell: `pim-event-v8-9`  
Cache data: `pim-event-data-v8-9-production` dan `pim-event-data-v8-9-preview`.

Backend API tidak dicache oleh service worker. Payload tersimpan di localStorage hanya setelah schema, status workbook, dan dataset minimum lolos validasi.
