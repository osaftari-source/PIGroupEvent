# PIM Event Control PWA — v8.7

## Changes in this release

- Rundown IDs beginning with `RD-` are accepted, including `RD-030B`; this restores the 9 August Batch 1 dinner in the Home timeline and Rundown page.
- Source notes are no longer displayed on the Rundown page.
- Guest cards now show only arrival/departure from `Flight Manifest Datang` and `Flight Manifest Pulang`. When a manifest field is empty, the card falls back to `Tiba di Lhokseumawe` or `Berangkat dari Lhokseumawe`.
- Guest-card flight information is shortened to day, date, and time only.
- Liaison Officer cards use the label **Menangani** and no longer display `Catatan`.
- Frontend and service-worker cache versions raised to v8.7.

## Required deployment order

1. Replace `Code.gs` in Apps Script.
2. **Deploy → Manage deployments → Edit → New version → Deploy.** Saving the script alone does not update the `/exec` API.
3. Upload `index.html`, `sw.js`, `manifest.webmanifest`, and the `icons` directory to GitHub.
4. Hard refresh once, or close/reopen the installed PWA, so service worker v8.7 replaces the old cache.

## Why the 9 August dinner was missing

The dinner row uses ID `RD-030B`. An older deployed Apps Script or cached frontend accepted only purely numeric IDs such as `RD-030`, so `RD-030B` was removed before rendering. Version 8.7 accepts every operational ID starting with `RD-`.
