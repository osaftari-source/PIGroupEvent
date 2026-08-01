# PIM Event Control v9.4

## Perubahan
- Generator PDF tidak lagi memakai tab baru atau pop-up.
- Report dirender di iframe tersembunyi pada halaman yang sama dan langsung membuka dialog Print/Save as PDF.
- Tombol menampilkan status “Menyiapkan PDF…” selama proses.
- Pesan error ditampilkan apabila dokumen print tidak dapat dirender.
- Tombol Generate Report di dashboard tetap dihapus; akses report hanya melalui sidebar.
- Frontend/localStorage cache dan service-worker cache dinaikkan ke v9.4.
- Workbook dan Code.gs tidak berubah.

## Deployment
1. Upload seluruh isi repository ke GitHub.
2. Pastikan `index.html` dan `sw.js` tertimpa versi lama.
3. Tunggu GitHub Pages selesai deploy.
4. Lakukan hard refresh atau hapus site data agar cache v9.4 aktif.
5. Klik Generate Report pada sidebar, pilih jenis PDF, lalu klik Generate PDF. Dialog Print harus terbuka pada tab yang sama.
