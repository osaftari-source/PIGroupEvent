# PIM Event Control v9.2

## Perubahan
- Desktop top bar disembunyikan; mobile header tetap dipertahankan.
- Detail Konsumsi pada mobile menjadi accordion per hari.
- Istilah roster diganti menjadi peserta terdaftar.
- PDF report memiliki dua tipe: Ringkas Direksi dan Lengkap Internal.
- PDF mencakup rundown, peserta/manifest, nama LO, akomodasi, kendaraan, konsumsi, readiness, isu terbuka beserta target tanggal, dan Plant Tour berlabel Tentative.
- Kontak dalam PDF disamarkan; detail tetap tersedia pada sistem operasional.
- Workbook dan Code.gs tidak berubah dari base v9.1/v8.9 berbasis ACARA.

## Deployment
1. Unggah `index.html`, `sw.js`, dan `manifest.webmanifest` ke GitHub Pages.
2. Tidak perlu mengganti workbook.
3. Tidak perlu memperbarui Code.gs apabila sudah memakai backend ACARA.
4. Lakukan hard refresh agar cache v9.2 aktif.
