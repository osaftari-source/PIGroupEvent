# PIM Event Control PWA — v8.8

## Perbaikan utama

Versi ini memperbaiki pergeseran waktu pada data Google Sheets:

- `08:45` sebelumnya terbaca `15:45`
- `12:30` sebelumnya terbaca `19:30`
- `19:30` sebelumnya terbaca `02:30`
- durasi `01:10` sebelumnya terbaca `08:17`

Penyebabnya adalah sel tanggal/waktu spreadsheet diformat kembali menggunakan
zona `Asia/Jakarta`. Nilai serial Google Sheets kemudian mendapat tambahan
tujuh jam, dan durasi lama juga dapat terkena offset historis tujuh menit.

`Code.gs` v8.8 sekarang:

- memakai `GMT` hanya untuk membaca komponen tanggal/waktu dari sel spreadsheet;
- tetap memakai zona waktu spreadsheet untuk `generatedAt`;
- mempertahankan waktu rundown sesuai yang terlihat di workbook;
- menyediakan fungsi `testSundayTimes()` untuk pengecekan cepat.

Nilai yang diharapkan untuk Minggu, 9 Agustus:

- RD-029: 08:45–09:55
- RD-030: 12:30–13:30
- RD-030B: 19:30–20:30

## File yang perlu diterapkan

### Google Apps Script

Ganti seluruh isi `Code.gs`, lalu:

1. **Deploy**
2. **Manage deployments**
3. Edit deployment web app
4. Pilih **New version**
5. **Deploy**

Menyimpan script tanpa membuat versi deployment baru tidak memperbarui API `/exec`.

### GitHub Pages / PWA

Unggah seluruh file dan folder berikut:

- `index.html`
- `sw.js`
- `manifest.webmanifest`
- folder `icons/`

`index.html` dan `sw.js` sudah dinaikkan ke v8.8. Kunci cache data juga berubah,
sehingga payload v8.7 yang memiliki waktu salah tidak digunakan kembali.

## Verifikasi setelah deployment

1. Jalankan `testSundayTimes()` dari Apps Script editor.
2. Buka URL `/exec` dan cari `RD-029`, `RD-030`, serta `RD-030B`.
3. Pastikan API mengirim:
   - `08:45`, `09:55`
   - `12:30`, `13:30`
   - `19:30`, `20:30`
4. Upload file GitHub.
5. Hard refresh browser atau tutup dan buka ulang PWA.
6. Bila masih melihat data lama, hapus site data/cache satu kali lalu buka kembali.

## Catatan

Workbook tidak perlu diubah untuk masalah waktu ini. Perbaikannya berada pada
normalisasi tanggal/waktu di backend Apps Script dan pembaruan cache PWA.
