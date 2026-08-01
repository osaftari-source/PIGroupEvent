# PIM Event Control PWA — v8.9

## Perubahan utama

- Backend mengekspor sheet `ACARA` dan tidak lagi meminta `BIDANG`.
- Readiness Board pada Beranda dihitung langsung dari `CHECKLIST` dan dikelompokkan per acara.
- Klik card acara membuka halaman Checklist dengan filter acara yang sesuai.
- Halaman Checklist menggunakan filter: pencarian, acara, PIC, status, dan owner.
- Checklist dikelompokkan berdasarkan urutan acara operasional, bukan bidang.
- Label dan logika `Ketua Bidang` dihapus dari frontend.
- ID checklist dengan suffix huruf tetap didukung tanpa perlakuan khusus.
- Normalisasi waktu spreadsheet tetap memakai `GMT`; jangan dikembalikan ke `Asia/Jakarta`.
- `generatedAt` tetap mengikuti timezone spreadsheet.
- Cache frontend dan service worker dinaikkan seragam ke v8.9.

## File yang harus diperbarui

1. **Google Apps Script:** ganti isi `Code.gs`, simpan, lalu buat versi deployment baru.
2. **GitHub Pages/repository:** unggah `index.html`, `sw.js`, dan `manifest.webmanifest` dari rilis ini.
3. Pastikan Google Sheets memakai base workbook terbaru dengan sheet `ACARA` dan header `CHECKLIST`:
   `ID, Acara, Item, Venue, Owner, PIC, Deadline, Status, Progress %, Catatan, Update Terakhir`.

## Deployment Apps Script

1. Buka Google Sheet → **Extensions → Apps Script**.
2. Ganti isi `Code.gs` dengan file rilis v8.9.
3. Pastikan `SHEET_ID` benar.
4. Pilih **Deploy → Manage deployments**.
5. Edit deployment aktif dan pilih **New version**.
6. Pastikan akses Web App tetap **Anyone**.
7. URL `/exec` tidak perlu diubah apabila deployment yang sama diperbarui.

## Deployment GitHub Pages

Unggah seluruh isi folder repository atau minimal file perubahan berikut:

- `index.html`
- `sw.js`
- `manifest.webmanifest`

Setelah GitHub Pages selesai membangun, buka aplikasi dan lakukan refresh. Service worker v8.9 akan menghapus cache shell versi lama secara otomatis.

## Pemeriksaan rilis

- `Code.gs`: sintaks JavaScript valid; `TABS.ACARA` tersedia.
- `index.html`: JavaScript valid; tidak ada referensi runtime ke `BIDANG`, `Ketua Bidang`, atau `fBidang`.
- `sw.js`: sintaks valid dan cache `pim-event-v8-9`.
- `manifest.webmanifest`: JSON valid.
- Waktu rundown tetap mempertahankan komponen jam yang terlihat di Google Sheets.
