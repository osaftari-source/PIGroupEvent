# Deployment Checklist

## Google Sheet
- [ ] Upload and convert `PI_Group_Event_Readiness_Backend.xlsx` to Google Sheets.
- [ ] Confirm timezone `Asia/Jakarta`.
- [ ] Confirm event dates 10–12 August 2026.
- [ ] Review selected editor permissions.
- [ ] Fill missing PICs and committee assignments.
- [ ] Confirm `Publish to PWA` flags.
- [ ] Add Google Drive links to `Document_Register`.

## Apps Script
- [ ] Paste `Code.gs`.
- [ ] Apply `appsscript.json`.
- [ ] Test `/dev` deployment.
- [ ] Deploy production `/exec` web app.
- [ ] Open the `/exec` URL and confirm JSON appears.
- [ ] Confirm private fields are absent.

## GitHub Pages
- [ ] Put the contents of `pwa/` at the repository root.
- [ ] Paste Apps Script `/exec` URL into `config.js`.
- [ ] Paste Google Sheet URL into `config.js`.
- [ ] Enable Pages from `main` and `/(root)`.
- [ ] Test desktop and mobile.
- [ ] Test install prompt.
- [ ] Test refresh after changing Google Sheets.
- [ ] Test cached fallback by temporarily disabling the network.
