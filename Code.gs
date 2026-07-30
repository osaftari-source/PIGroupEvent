/**
 * PIM EVENT CONTROL 2026 — Backend API
 * Serves the control workbook as JSON for the PWA frontend.
 *
 * SETUP
 *  1. Open the Google Sheet → Extensions → Apps Script
 *  2. Paste this file over Code.gs
 *  3. Put your Sheet ID in SHEET_ID below
 *  4. Deploy → New deployment → Web app
 *       Execute as:      Me
 *       Who has access:  Anyone
 *  5. Copy the /exec URL into API_URL in index.html
 *
 * IMPORTANT: every time you change this file you must Deploy → Manage
 * deployments → edit → Version: New version. Saving alone does nothing.
 */

var SHEET_ID = '1BTAdWvVX5YOFn7IbmAbVnXZ-PX1fm90ySMkyDTCFHZw';
var TIMEZONE = 'Asia/Jakarta';

// Tab name -> row number that holds the column headers
var TABS = {
  CHECKLIST: 4,
  BIDANG: 4,
  ISSUES: 4,
  LO: 4,
  TAMU: 4,
  RUNDOWN: 4,
  AKOMODASI: 4,
  KENDARAAN: 4,
  KONSUMSI: 4
};

function doGet(e) {
  var payload;
  try {
    payload = buildPayload();
  } catch (err) {
    payload = { ok: false, error: String(err) };
  }
  var out = ContentService.createTextOutput(JSON.stringify(payload));
  out.setMimeType(ContentService.MimeType.JSON);
  return out;
}

function buildPayload() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var result = {
    ok: true,
    generatedAt: Utilities.formatDate(new Date(), TIMEZONE, "yyyy-MM-dd'T'HH:mm:ssXXX"),
    tabs: {}
  };

  Object.keys(TABS).forEach(function (name) {
    result.tabs[name] = readTab(ss, name, TABS[name]);
  });

  return result;
}

function readTab(ss, name, headerRow) {
  var sh = ss.getSheetByName(name);
  if (!sh) return [];

  var lastRow = sh.getLastRow();
  var lastCol = sh.getLastColumn();
  if (lastRow <= headerRow) return [];

  var values = sh.getRange(headerRow, 1, lastRow - headerRow + 1, lastCol).getValues();
  var headers = values[0].map(function (h) { return String(h).trim(); });
  var rows = [];

  for (var r = 1; r < values.length; r++) {
    var row = values[r];
    var obj = {};
    var empty = true;

    for (var c = 0; c < headers.length; c++) {
      if (!headers[c]) continue;
      var v = normalise(row[c], headers[c]);
      obj[headers[c]] = v;
      if (v !== '') empty = false;
    }
    // RUNDOWN may contain instruction or legend rows below the activity table.
    // Keep those instructions in the workbook, but do not expose them as API data.
    if (name === 'RUNDOWN' && !/^RD-\d+[A-Z]*$/i.test(String(obj.ID || ''))) continue;

    if (!empty) rows.push(obj);
  }
  return rows;
}

// Columns that hold a clock time or a duration rather than a calendar date.
var TIME_COLUMNS = ['Mulai Manual', 'Mulai', 'Selesai', 'Durasi', 'Harus Tersedia', 'Waktu Konsumsi'];

/**
 * Dates become plain yyyy-MM-dd strings and times become HH:mm strings, so the
 * browser never has to guess a timezone. Everything else is a trimmed string.
 *
 * RUNDOWN stores Mulai and Selesai as full date-times (that is how the duration
 * cascade survives midnight), but the app only wants the clock part.
 */
function normalise(v, header) {
  if (v === null || v === undefined) return '';

  // Empty lookup results in the LO column can arrive from Sheets as numeric zero.
  if (header === 'LO' && (v === 0 || String(v).trim() === '0')) return '';

  if (v instanceof Date) {
    if (TIME_COLUMNS.indexOf(header) !== -1) {
      return Utilities.formatDate(v, TIMEZONE, 'HH:mm');
    }
    return Utilities.formatDate(v, TIMEZONE, 'yyyy-MM-dd');
  }

  // A duration typed straight into the sheet arrives as a fraction of a day.
  if (typeof v === 'number' && TIME_COLUMNS.indexOf(header) !== -1 && v < 1) {
    var mins = Math.round(v * 24 * 60);
    return ('0' + Math.floor(mins / 60)).slice(-2) + ':' + ('0' + (mins % 60)).slice(-2);
  }

  if (typeof v === 'number') return String(v);
  return String(v).trim();
}

/** Run once from the editor to check the Sheet ID and tab names resolve. */
function testPayload() {
  var p = buildPayload();
  Object.keys(p.tabs).forEach(function (k) {
    Logger.log(k + ': ' + p.tabs[k].length + ' rows');
  });
}
