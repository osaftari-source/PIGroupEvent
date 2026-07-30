# PIM Event Control PWA — v8.6

## Files updated

- `Code.gs`
  - exports `KENDARAAN` and `KONSUMSI`
  - accepts rundown IDs such as `RD-030B`
  - normalizes consumption time columns
  - converts empty LO lookup values (`0`) to blank text
- `index.html`
  - event period changed to 9–12 August 2026
  - Day 0 appears in the rundown summary
  - official Raker and Plenary headcounts are read from `KONSUMSI`
  - accommodation only counts `Tipe = Rumah Komplek`
  - `Tipe = TBC` is displayed separately
  - cache/frontend version raised to v8.6
- `manifest.webmanifest` and `sw.js`
  - event period and cache version updated
  - PWA icons included

## Deployment order

1. Upload/import the latest Event Control workbook into Google Sheets.
2. Confirm sheet names and row-4 headers are unchanged.
3. Replace Apps Script `Code.gs` with this version.
4. Deploy Apps Script as a **new version**. If the `/exec` URL changes, update `CONFIG.API_URL` in `index.html`.
5. Upload all repository files to GitHub, including the `icons` folder.
6. Wait for GitHub Pages deployment, then hard-refresh the web app. Installed PWA users may need to close and reopen the app once for the new service worker to activate.

## Expected backend tabs

`CHECKLIST`, `BIDANG`, `ISSUES`, `LO`, `TAMU`, `RUNDOWN`, `AKOMODASI`, `KENDARAAN`, `KONSUMSI`.
