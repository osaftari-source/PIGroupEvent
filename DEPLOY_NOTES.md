# PIM Event Control v9.5

## Perbaikan
- Memperbaiki tombol Export Excel dan Generate PDF yang tidak merespons.
- Penyebab: fungsi `cleanRows()` dipanggil oleh kedua exporter tetapi tidak didefinisikan pada v9.4.
- Menambahkan penanganan error menyeluruh serta status tombol saat proses berjalan.
- Tidak ada perubahan workbook atau Code.gs.
- Frontend/localStorage cache dan service-worker cache dinaikkan ke v9.5.

## Deployment
1. Ganti file repository dengan isi paket v9.5.
2. Tidak perlu mengganti Code.gs.
3. Tunggu GitHub Pages selesai deploy.
4. Lakukan hard refresh atau hapus site data agar cache v9.5 aktif.
