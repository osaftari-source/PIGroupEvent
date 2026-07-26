# PI Group Event Readiness — Google Sheets + GitHub Pages PWA

This package contains everything required to run the event readiness system for **10–12 August 2026**:

- `PI_Group_Event_Readiness_Backend.xlsx` — upload this workbook to Google Drive and open it as Google Sheets.
- `apps-script/Code.gs` — read-only sanitized JSON/JSONP endpoint plus task edit logging.
- `apps-script/appsscript.json` — Apps Script manifest.
- `pwa/` — static installable Progressive Web App ready for GitHub Pages.

The date range **12–14 August 2026 is obsolete** and is retained only as a document-reference note.

## Recommended operating model

1. PICs and selected administrators edit `Checklist_Master` in Google Sheets.
2. During coordination meetings, the administrator can update rows on behalf of each PIC.
3. `Task_Update_Log` records edits made to the checklist.
4. The PWA reads only sanitized fields where `Publish to PWA = Ya`.
5. Room numbers, badge numbers, private phone numbers, editor access, and internal-only documents are not returned by the public endpoint.

## Step 1 — Create the Google Sheets backend

1. Upload `PI_Group_Event_Readiness_Backend.xlsx` to Google Drive.
2. Open the file using **Google Sheets** and save it as a native Google Sheet.
3. Set the spreadsheet timezone to `Asia/Jakarta`.
4. Review `Lists_Settings`:
   - `ACTIVE_SCENARIO = B` is a working alternative, not a final decision.
   - Replace `PUBLIC_SHEET_URL` with the Google Sheet URL if desired.
5. Fill the email addresses in `User_Access`, then share the Sheet only with selected editors.
6. Keep protected/formula columns controlled by the administrator. PICs mainly edit Status, Progress, Blocker, Next Action, Updated By, Update Source, Evidence Link, and Notes.

## Step 2 — Add the Apps Script endpoint

1. In Google Sheets, open **Extensions → Apps Script**.
2. Replace the default code with the contents of `apps-script/Code.gs`.
3. Open Project Settings and enable viewing the manifest file if needed, then replace it with `apps-script/appsscript.json`.
4. Save the project.
5. Run a test deployment:
   - **Deploy → Test deployments → Web app**.
6. Create the production deployment:
   - **Deploy → New deployment**.
   - Select **Web app**.
   - Execute as: **Me / User deploying**.
   - Access: **Anyone** for a public PWA endpoint.
7. Copy the `/exec` Web App URL.

Official Apps Script deployment guide:
https://developers.google.com/apps-script/guides/web

### Privacy warning

The public deployment is intentionally read-only and sanitized. Do not add confidential fields to the public mapping in `Code.gs`. Anything returned by the endpoint should be treated as public internet data.

## Step 3 — Configure the PWA

Open `pwa/config.js` and replace:

```js
API_URL: "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE"
GOOGLE_SHEET_URL: "PASTE_YOUR_GOOGLE_SHEET_URL_HERE"
```

Until the API URL is replaced, the website displays the bundled sample data. This allows the PWA to be previewed before the Google Sheet and Apps Script are deployed.

## Step 4 — Deploy through GitHub Pages

1. Create a new GitHub repository, for example `PI-Group-Event-Readiness`.
2. Upload **the contents inside the `pwa` folder** to the repository root. `index.html` must be at the publishing root.
3. Commit the files to the `main` branch.
4. In the repository, open **Settings → Pages**.
5. Under **Build and deployment**, select **Deploy from a branch**.
6. Select branch `main` and folder `/(root)`, then Save.
7. Wait for the Pages deployment to finish. The URL will normally be:
   `https://<username>.github.io/<repository-name>/`

Official GitHub Pages publishing-source guide:
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

The site uses relative paths, so it works as a GitHub project site under a repository subfolder.

## Step 5 — Verify before sharing

- The PWA shows **Live Google Sheets data**, not sample/cached data.
- Event period is 10–12 August 2026.
- Scenario B is labeled Working Alternative.
- Checklist filters work on mobile and desktop.
- Rundown displays the active scenario.
- Accommodation shows totals only, not room numbers or guest names.
- LO page does not show badge numbers or phone numbers.
- Public documents contain only approved links.
- Refresh works after a Sheet update.
- Offline mode shows the latest cached dataset.

## Main workbook tabs

- `Dashboard` — executive monitoring view.
- `Checklist_Master` — 191 initial preparation items with PIC, scope, status, percentage, deadline, blocker and next action.
- `Event_Master` — events and venues.
- `Scenario_Master` — alternatives A–D.
- `Rundown` — detailed working-alternative schedule imported from the source rundown.
- `Accommodation` — consolidated room inventory from the uploaded arrangement.
- `LO_Assignment` — editable LO reference assignments.
- `Committee_Master` — provisional committee structure based on the Memo Dinas.
- `People_Master` — editable people/reference directory.
- `EO_Scope` — scope placeholder until the EO contract/proposal is available.
- `Issues_Decisions` — initial issue and decision register.
- `Document_Register` — source-document control and public/private flag.
- `User_Access` — selected editors/viewers.
- `Lists_Settings` — configuration and dropdown values.
- `Task_Update_Log` — automatic edit history generated by Apps Script.

## Updating data during a coordination meeting

1. Filter `Checklist_Master` by Bidang or PIC.
2. Ask the PIC for the status of each item.
3. Update:
   - Status
   - Progress %
   - Blocker
   - Next Action
   - Updated By
   - Update Source = `Coordination Meeting`
   - Last Updated
4. Keep the actual responsible person in the PIC column even when the administrator enters the update.
5. Refresh the PWA to confirm the new values.

## Versioning

When changing PWA files, update:

- `APP_VERSION` in `apps-script/Code.gs`
- `DATA_VERSION` in `Lists_Settings`
- `CACHE_NAME` in `pwa/sw.js`

Changing the service-worker cache name ensures visitors receive the newest static files.
