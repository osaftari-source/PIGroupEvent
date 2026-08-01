# PIM Event Control v9.7

## Perbaikan regresi v9.6
- Pilihan hari Rundown selalu terlihat melalui tombol hari, dengan select tanggal tetap tersedia.
- Filter Rundown, Tamu, Akomodasi, LO, Checklist, dan Issues terbuka secara default pada mobile serta tetap dapat dilipat.
- Search dan filter Tamu tetap memperbarui ringkasan berdasarkan hasil aktif.
- Cache data Google Sheets dipisahkan dari versi frontend (`pim-event-data-cache-v1`) agar data terakhir tidak hilang setiap update PWA.
- Cache data lama v9.0–v9.6 dimigrasikan otomatis.
- Tombol status/sinkronisasi pada desktop dan mobile sekarang benar-benar menjalankan ulang pengambilan data.
- Error render data tidak lagi diam-diam dianggap sebagai kondisi offline.
- Tidak ada perubahan pada workbook atau Code.gs.

## Penyebab utama
1. v9.6 membungkus kontrol filter dalam elemen `<details>` tertutup. Pada mobile atau viewport di bawah 860 px, kontrol tersembunyi sehingga terlihat seperti dihapus.
2. Rundown otomatis memilih tanggal pertama (Minggu, 9 Agustus) ketika tanggal saat ini belum masuk rangkaian, sedangkan pemilih tanggal berada di filter tertutup.
3. Kunci cache data diubah mengikuti versi frontend. Mobile kehilangan akses ke cache v9.5 ketika v9.6 aktif.
4. Tombol status menyarankan pengguna mengetuk untuk mencoba lagi, tetapi sebelumnya tidak memiliki event handler.

## Deployment
1. Upload seluruh isi paket v9.7 ke repository GitHub Pages.
2. Tidak perlu mengganti workbook atau Code.gs.
3. Setelah deployment selesai, buka website dan lakukan hard refresh.
4. Pada PWA mobile, tutup aplikasi sepenuhnya lalu buka lagi. Cache data lama akan dimigrasikan otomatis.
