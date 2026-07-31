# Test Checklist — v8.9 / Schema 2.0

## Workbook
- [ ] Tidak ada repair warning ketika file dibuka.
- [ ] ID tidak duplikat dan referensi utama valid.
- [ ] Raker 236; Plenary 500; VIP roster 65.
- [ ] Kendaraan 41: 20 Minimum PI + 21 Tambahan PIM.
- [ ] Rumah Komplek 110 kapasitas, 72 occupied, 38 tersedia, 15 TBC.
- [ ] Konsumsi final: 55, 55, 55, 55, 28, 233, 260, 260, 77, 550, 550, 46, 260, 260, 88, 88, 80.

## Waktu
- [ ] RD-029 08:45–09:55.
- [ ] RD-030 12:30–13:30.
- [ ] RD-030B 19:30–20:30.
- [ ] Tidak ada offset +7 jam atau offset historis +7 menit.

## Apps Script
- [ ] Menu PIM Event Control muncul.
- [ ] Pembuatan ID, timestamp, changelog, snapshot, backup, reconciliation, validation bekerja.
- [ ] API mengirim `appVersion 8.9`, `schemaVersion 2.0`, dan status workbook.
- [ ] Endpoint normal menolak workbook non-Production; `?preview=1` dapat menguji Ready for Validation.

## PWA desktop & mobile
- [ ] Sembilan halaman dapat dibuka dan tidak overflow horizontal.
- [ ] Rundown dan LO tidak menampilkan catatan internal; label LO adalah “Menangani”.
- [ ] Tamu lokal menampilkan “Lokal · Tidak perlu penerbangan”.
- [ ] Label sumber membuka detail sumber.
- [ ] Backend gagal + cache valid menampilkan label umur cache.
- [ ] Backend gagal + tanpa cache menampilkan error.
- [ ] Payload schema lama ditolak dan tidak disimpan.
- [ ] Preview dan production menggunakan cache terpisah.
- [ ] Footer, service worker, dan asset menunjukkan v8.9.
