# PIM Event Control v9.3

## Perubahan
- Memperbaiki preview PDF yang sebelumnya membuka tab `about:blank`.
- Preview report sekarang menggunakan Blob URL agar kompatibel dengan Chrome dan GitHub Pages.
- Tombol Generate Report pada area dashboard dihapus.
- Tombol Generate Report tetap tersedia pada sidebar desktop.
- Frontend/localStorage cache dan service-worker cache dinaikkan ke v9.3.

## Deployment
1. Unggah seluruh isi repository ke GitHub.
2. Tidak perlu mengganti workbook atau `Code.gs`.
3. Tunggu GitHub Pages selesai melakukan deployment.
4. Lakukan hard refresh atau hapus site data agar cache v9.3 aktif.
5. Izinkan pop-up ketika browser meminta izin untuk membuka preview PDF.
