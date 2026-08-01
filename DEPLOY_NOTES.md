# PIM Event Control v9.6

## Design and usability update

This release applies the desktop and mobile design assessment to the PWA while preserving the workbook and Apps Script backend.

### Beranda
- Desktop hero dipadatkan agar KPI dan rundown tampil lebih cepat.
- Menambahkan critical-attention strip untuk overdue, blocked, isu prioritas tinggi, dan tamu P1 tanpa LO.
- Ukuran teks kecil, spacing, dan kontras sekunder diperbaiki.

### Mobile and accessibility
- Header mobile menampilkan nama halaman dan tanggal secara ringkas.
- Filter Checklist, Rundown, Tamu, Akomodasi, LO, dan Issues menjadi collapsible pada mobile dan tetap terbuka pada desktop.
- Accordion menggunakan chevron, area sentuh minimum 44 px, dan status open/closed disimpan selama sesi.
- Menambahkan skip link, keyboard navigation untuk tab, focus state, dan Escape untuk menutup modal report.
- Manifest tidak lagi mengunci orientasi portrait.

### Operational pages
- Checklist menggunakan hierarki Item → PIC → deadline/status → venue/owner.
- Rundown memiliki mode Daftar Agenda dan Timeline Hari pada desktop.
- Card Tamu hanya menampilkan informasi utama; akomodasi, LO, flight, dan catatan berada di detail expandable.
- Akomodasi menampilkan okupansi per lokasi beserta status penuh/kamar kosong.
- LO menampilkan alert P1 tanpa LO dan relasi visual “Menangani”.
- Issues menampilkan keputusan yang dibutuhkan, dampak, PIC, target tanggal, status, dan filter.

### Reports
- PDF Ringkas Direksi dan Lengkap Internal mempunyai struktur tetap agar tidak kehilangan konteks.
- Checkbox section hanya mengatur sheet Excel.
- Report LO membaca kolom Nama VIP/Menangani dan report Issues membaca Target Tutup/Target Tanggal serta Dampak.

## Deployment
1. Upload seluruh isi repository v9.6 ke GitHub Pages.
2. Workbook tidak perlu diganti.
3. Code.gs tidak perlu diganti.
4. Tunggu GitHub Pages selesai deploy.
5. Lakukan hard refresh atau hapus site data agar service worker v9.6 aktif.
