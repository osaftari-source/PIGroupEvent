/**
 * PI Group Event Readiness - Google Sheets JSON endpoint
 * Bound this script to PI_Group_Event_Readiness_Backend after opening it in Google Sheets.
 */

const APP_VERSION = '2026.07.26.1';
const SHEETS = {
  settings: 'Lists_Settings',
  checklist: 'Checklist_Master',
  events: 'Event_Master',
  scenarios: 'Scenario_Master',
  rundown: 'Rundown',
  accommodation: 'Accommodation',
  lo: 'LO_Assignment',
  issues: 'Issues_Decisions',
  documents: 'Document_Register',
  updateLog: 'Task_Update_Log'
};

function doGet(e) {
  const params = (e && e.parameter) || {};
  const payload = buildPublicPayload_(params);
  const body = JSON.stringify(payload);
  const callback = String(params.prefix || params.callback || '').replace(/[^A-Za-z0-9_.$]/g, '');

  if (callback) {
    return ContentService
      .createTextOutput(`${callback}(${body});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(body)
    .setMimeType(ContentService.MimeType.JSON);
}

function buildPublicPayload_(params) {
  const settings = getSettings_();
  const activeScenario = String(params.scenario || settings.ACTIVE_SCENARIO || 'B');

  const rawTasks = getRows_(SHEETS.checklist);
  const tasks = rawTasks
    .filter(r => isYes_(r['Publish to PWA']))
    .filter(r => String(r['Status'] || '') !== 'Tidak Berlaku')
    .filter(r => scenarioMatches_(r['Scenario'], activeScenario))
    .map(taskToPublic_);

  const eventMaster = getRows_(SHEETS.events);
  const events = eventMaster.map(event => aggregateEvent_(event, tasks));

  const summary = aggregateSummary_(tasks);
  const issues = getRows_(SHEETS.issues)
    .filter(r => isYes_(r['Publish to PWA']))
    .map(issueToPublic_);
  summary.openIssues = issues.filter(i => String(i.status).toLowerCase() === 'open').length;

  const rundown = getRows_(SHEETS.rundown)
    .filter(r => isYes_(r['Publish to PWA']))
    .filter(r => String(r['Scenario'] || '') === activeScenario)
    .map(rundownToPublic_)
    .sort((a, b) => String(a.start).localeCompare(String(b.start)));

  const accommodation = aggregateAccommodation_(getRows_(SHEETS.accommodation));
  const lo = aggregateLo_(getRows_(SHEETS.lo));
  const documents = getRows_(SHEETS.documents)
    .filter(r => isYes_(r['Publish to PWA']))
    .map(documentToPublic_);

  return {
    ok: true,
    meta: {
      title: settings.APP_TITLE || 'PI Group Event Readiness Dashboard',
      project: settings.PROJECT_NAME || '',
      startDate: toIsoDate_(settings.START_DATE),
      endDate: toIsoDate_(settings.END_DATE),
      activeScenario,
      activeScenarioLabel: settings.ACTIVE_SCENARIO_LABEL || '',
      generatedAt: new Date().toISOString(),
      dataVersion: settings.DATA_VERSION || APP_VERSION,
      source: 'Google Sheets'
    },
    summary,
    events,
    tasks,
    rundown,
    accommodation,
    lo,
    issues,
    documents
  };
}

function aggregateSummary_(tasks) {
  let totalWeight = 0;
  let weightedProgress = 0;
  let criticalPending = 0;
  let overdue = 0;
  let blocked = 0;
  let awaitingVerification = 0;
  let withoutPic = 0;
  let latest = null;

  tasks.forEach(t => {
    const weight = priorityWeight_(t.priority);
    totalWeight += weight;
    weightedProgress += number_(t.progress) * weight;
    if (t.priority === 'Critical' && t.status !== 'Selesai & Terverifikasi') criticalPending++;
    if (t.overdue) overdue++;
    if (t.status === 'Terkendala') blocked++;
    if (t.status === 'Siap Diverifikasi') awaitingVerification++;
    if (!t.pic) withoutPic++;
    const d = parseDate_(t.lastUpdated);
    if (d && (!latest || d > latest)) latest = d;
  });

  const readiness = blocked > 0 || overdue > 0 ? 'Not Ready' : (criticalPending > 0 ? 'At Risk' : 'Ready');
  return {
    overallProgress: totalWeight ? round1_(weightedProgress / totalWeight) : 0,
    readiness,
    criticalPending,
    overdue,
    blocked,
    awaitingVerification,
    withoutPic,
    openIssues: 0,
    lastUpdated: latest ? latest.toISOString() : ''
  };
}

function aggregateEvent_(event, tasks) {
  const eventId = text_(event['Event ID']);
  const rows = tasks.filter(t => t.eventId === eventId);
  let totalWeight = 0;
  let weightedProgress = 0;
  let criticalPending = 0;
  let overdue = 0;
  let blocked = 0;

  rows.forEach(t => {
    const w = priorityWeight_(t.priority);
    totalWeight += w;
    weightedProgress += number_(t.progress) * w;
    if (t.priority === 'Critical' && t.status !== 'Selesai & Terverifikasi') criticalPending++;
    if (t.overdue) overdue++;
    if (t.status === 'Terkendala') blocked++;
  });

  return {
    eventId,
    eventName: text_(event['Event Name']),
    venue: text_(event['Venue']),
    progress: totalWeight ? round1_(weightedProgress / totalWeight) : 0,
    criticalPending,
    overdue,
    readiness: blocked > 0 || overdue > 0 ? 'Not Ready' : (criticalPending > 0 ? 'At Risk' : 'Ready'),
    taskCount: rows.length
  };
}

function aggregateAccommodation_(rows) {
  const groups = {};
  const summary = { totalInventory: 0, occupied: 0, available: 0, ready: 0, needsAction: 0 };

  rows.forEach(r => {
    const name = text_(r['Accommodation']) || 'Unspecified';
    if (!groups[name]) groups[name] = { name, total: 0, occupied: 0, available: 0, ready: 0, needsAction: 0 };
    const g = groups[name];
    const allocation = text_(r['Allocation Status']);
    const readiness = text_(r['Readiness Category']);

    summary.totalInventory++; g.total++;
    if (allocation === 'Occupied' || allocation === 'Reserved') { summary.occupied++; g.occupied++; }
    if (allocation === 'Available') { summary.available++; g.available++; }
    if (readiness === 'Ready') { summary.ready++; g.ready++; }
    if (readiness === 'Needs Action') { summary.needsAction++; g.needsAction++; }
  });

  return { summary, groups: Object.values(groups).sort((a, b) => a.name.localeCompare(b.name)) };
}

function aggregateLo_(rows) {
  const publicRows = rows.filter(r => isYes_(r['Publish to PWA']));
  return {
    summary: {
      records: publicRows.length,
      confirmed: publicRows.filter(r => text_(r['Status']) === 'Confirmed').length,
      needConfirmation: publicRows.filter(r => text_(r['Status']) === 'Perlu Konfirmasi').length,
      missingLo: publicRows.filter(r => !text_(r['Assigned LO'])).length
    },
    assignments: publicRows.map(r => ({
      company: text_(r['Company / Institution']),
      vipCategory: text_(r['VIP Category']),
      lo: text_(r['Assigned LO']),
      locationNote: text_(r['Location Note']),
      status: text_(r['Status'])
    }))
  };
}

function taskToPublic_(r) {
  return {
    taskId: text_(r['Task ID']),
    eventId: text_(r['Event ID']),
    venue: text_(r['Venue']),
    workstream: text_(r['Workstream']),
    item: text_(r['Checklist Item']),
    criteria: text_(r['Acceptance Criteria']),
    scopeOwner: text_(r['Scope Owner']),
    bidang: text_(r['Bidang']),
    pic: text_(r['PIC']),
    priority: text_(r['Priority']),
    plannedStart: toIsoDate_(r['Planned Start']),
    deadline: toIsoDate_(r['Deadline']),
    status: text_(r['Status']),
    progress: number_(r['Progress %']),
    readiness: text_(r['Readiness']),
    blocker: text_(r['Blocker']),
    nextAction: text_(r['Next Action']),
    updatedBy: text_(r['Updated By']),
    updateSource: text_(r['Update Source']),
    lastUpdated: toIsoDateTime_(r['Last Updated']),
    evidenceLink: text_(r['Evidence Link']),
    verification: text_(r['Verification']),
    notes: text_(r['Notes']),
    scenario: text_(r['Scenario']),
    overdue: text_(r['Overdue Flag']) === 'OVERDUE'
  };
}

function rundownToPublic_(r) {
  return {
    id: text_(r['Rundown ID']),
    scenario: text_(r['Scenario']),
    eventId: text_(r['Event ID']),
    audience: text_(r['Audience']),
    date: toIsoDate_(r['Date']),
    start: toIsoDateTime_(r['Start']),
    end: toIsoDateTime_(r['End']),
    activity: text_(r['Activity']),
    venue: text_(r['Venue']),
    pic: text_(r['PIC']),
    status: text_(r['Status'])
  };
}

function issueToPublic_(r) {
  return {
    id: text_(r['Issue ID']),
    priority: text_(r['Priority']),
    category: text_(r['Category']),
    issue: text_(r['Issue / Decision Required']),
    decisionOwner: text_(r['Decision Owner']),
    actionOwner: text_(r['Action Owner']),
    dueDate: toIsoDate_(r['Due Date']),
    status: text_(r['Status']),
    impact: text_(r['Impact']),
    requiredAction: text_(r['Required Action / Decision'])
  };
}

function documentToPublic_(r) {
  return {
    id: text_(r['Document ID']),
    name: text_(r['Document Name']),
    category: text_(r['Category']),
    status: text_(r['Status']),
    link: text_(r['Drive Link / Action']),
    notes: text_(r['Notes'])
  };
}

function getRows_(sheetName) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return [];
  const range = sheet.getDataRange();
  const values = range.getValues();
  if (values.length < 2) return [];
  const headers = values[0].map(h => String(h).trim());
  return values.slice(1)
    .filter(row => row.some(v => v !== '' && v !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
}

function getSettings_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.settings);
  if (!sheet) return {};
  const values = sheet.getRange(3, 1, Math.max(sheet.getLastRow() - 2, 1), 2).getValues();
  const result = {};
  values.forEach(([key, value]) => {
    if (key) result[String(key).trim()] = value;
  });
  return result;
}

/**
 * Simple edit logger for Checklist_Master.
 * It records changes, but Google may leave Editor Email blank depending on Workspace context.
 */
function onEdit(e) {
  if (!e || !e.range) return;
  const sheet = e.range.getSheet();
  if (sheet.getName() !== SHEETS.checklist || e.range.getRow() === 1) return;

  const ss = e.source;
  const logSheet = ss.getSheetByName(SHEETS.updateLog);
  if (!logSheet) return;

  const row = e.range.getRow();
  const col = e.range.getColumn();
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const taskId = sheet.getRange(row, 1).getDisplayValue();
  const updatedBy = sheet.getRange(row, 18).getDisplayValue();
  const updateSource = sheet.getRange(row, 19).getDisplayValue();
  let email = '';
  try { email = Session.getActiveUser().getEmail() || ''; } catch (err) {}

  logSheet.appendRow([
    new Date(), taskId, sheet.getName(), e.range.getA1Notation(), headers[col - 1] || '',
    typeof e.oldValue === 'undefined' ? '' : e.oldValue,
    typeof e.value === 'undefined' ? '' : e.value,
    email, updatedBy, updateSource
  ]);
}

function priorityWeight_(priority) {
  return priority === 'Critical' ? 4 : priority === 'High' ? 3 : priority === 'Medium' ? 2 : 1;
}
function scenarioMatches_(value, active) {
  const s = text_(value);
  return !s || s === 'Semua' || s.split(/[\/,;]/).map(v => v.trim()).includes(active);
}
function isYes_(value) { return ['ya', 'yes', 'true', '1'].includes(String(value || '').trim().toLowerCase()); }
function number_(value) { const n = Number(value); return Number.isFinite(n) ? n : 0; }
function text_(value) { return value === null || typeof value === 'undefined' ? '' : String(value).trim(); }
function round1_(value) { return Math.round(value * 10) / 10; }
function parseDate_(value) {
  if (value instanceof Date && !isNaN(value)) return value;
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d) ? null : d;
}
function toIsoDate_(value) {
  const d = parseDate_(value);
  return d ? Utilities.formatDate(d, Session.getScriptTimeZone() || 'Asia/Jakarta', 'yyyy-MM-dd') : '';
}
function toIsoDateTime_(value) {
  const d = parseDate_(value);
  return d ? d.toISOString() : '';
}
