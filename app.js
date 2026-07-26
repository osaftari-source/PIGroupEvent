(() => {
  'use strict';

  const CONFIG = window.APP_CONFIG || {};
  const CACHE_KEY = 'pi-event-dashboard-cache-v1';
  const state = { data: null, view: 'dashboard', deferredPrompt: null };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    bindNavigation();
    bindFilters();
    bindActions();
    setupInstallPrompt();
    setupServiceWorker();
    configureSheetButton();
    loadData(false);
    const seconds = Math.max(Number(CONFIG.REFRESH_SECONDS || 120), 30);
    window.setInterval(() => loadData(false, true), seconds * 1000);
  }

  function bindNavigation() {
    $$('.nav-button').forEach(button => button.addEventListener('click', () => {
      state.view = button.dataset.view;
      $$('.nav-button').forEach(b => b.classList.toggle('active', b === button));
      $$('.view').forEach(panel => panel.classList.toggle('active', panel.dataset.viewPanel === state.view));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }));
  }

  function bindFilters() {
    ['taskSearch','eventFilter','workstreamFilter','statusFilter','priorityFilter'].forEach(id => {
      $('#' + id).addEventListener('input', renderTaskList);
      $('#' + id).addEventListener('change', renderTaskList);
    });
    $('#loSearch').addEventListener('input', renderLo);
  }

  function bindActions() {
    $('#refreshButton').addEventListener('click', () => loadData(true));
    $('#retryButton').addEventListener('click', () => loadData(true));
    $('#installButton').addEventListener('click', async () => {
      if (!state.deferredPrompt) return;
      state.deferredPrompt.prompt();
      await state.deferredPrompt.userChoice;
      state.deferredPrompt = null;
      $('#installButton').hidden = true;
    });
  }

  function configureSheetButton() {
    const url = String(CONFIG.GOOGLE_SHEET_URL || '');
    if (CONFIG.SHOW_EDIT_SHEET_BUTTON && url.startsWith('http')) {
      $('#sheetButton').href = url;
      $('#sheetButton').hidden = false;
    }
  }

  async function loadData(force = false, silent = false) {
    if (!silent) showLoading();
    try {
      const result = await fetchData(force);
      state.data = result.data;
      localStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data: state.data }));
      renderAll();
      showApp();
      updateSyncBadge(result.cached ? 'cached' : 'live', result.cached ? 'Cached data' : 'Live Google Sheets data');
    } catch (error) {
      const cached = readCache();
      if (cached) {
        state.data = cached.data;
        renderAll();
        showApp();
        updateSyncBadge('cached', 'Cached data — connection failed');
      } else {
        showError(error.message || String(error));
      }
    }
  }

  async function fetchData(force) {
    const apiUrl = String(CONFIG.API_URL || '').trim();
    const isPlaceholder = !apiUrl.startsWith('http') || apiUrl.includes('PASTE_YOUR');
    if (isPlaceholder) {
      const response = await fetch(CONFIG.SAMPLE_DATA_URL || './data/sample.json', { cache: force ? 'reload' : 'default' });
      if (!response.ok) throw new Error('Sample data tidak dapat dimuat.');
      return { data: await response.json(), cached: true };
    }

    const url = new URL(apiUrl);
    url.searchParams.set('_', Date.now().toString());
    const mode = String(CONFIG.API_MODE || 'auto').toLowerCase();

    if (mode !== 'jsonp') {
      try {
        const response = await fetch(url.toString(), { cache: 'no-store', redirect: 'follow' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();
        if (!json || json.ok === false) throw new Error(json?.message || 'Invalid API response');
        return { data: json, cached: false };
      } catch (error) {
        if (mode === 'json') throw error;
      }
    }

    return { data: await fetchJsonp(url.toString()), cached: false };
  }

  function fetchJsonp(url) {
    return new Promise((resolve, reject) => {
      const callback = `piEventCallback_${Date.now()}_${Math.floor(Math.random()*1000)}`;
      const script = document.createElement('script');
      const timer = setTimeout(() => cleanup(new Error('JSONP timeout')), 15000);
      window[callback] = data => cleanup(null, data);
      const target = new URL(url);
      target.searchParams.set('prefix', callback);
      script.src = target.toString();
      script.onerror = () => cleanup(new Error('Apps Script endpoint tidak dapat diakses.'));
      document.head.appendChild(script);

      function cleanup(error, data) {
        clearTimeout(timer);
        delete window[callback];
        script.remove();
        error ? reject(error) : resolve(data);
      }
    });
  }

  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { return null; }
  }

  function renderAll() {
    const d = state.data;
    document.title = d.meta?.title || 'PI Group Event Readiness';
    $('#appTitle').textContent = d.meta?.title || 'PI Group Event Readiness';
    $('#eventPeriod').textContent = `${formatDate(d.meta?.startDate)} – ${formatDate(d.meta?.endDate)}`;
    $('#scenarioLabel').textContent = d.meta?.activeScenarioLabel || `Scenario ${d.meta?.activeScenario || '—'}`;
    $('#projectDescription').textContent = d.meta?.project || '';
    $('#rundownScenario').textContent = d.meta?.activeScenario || '—';
    $('#footerVersion').textContent = `Version ${d.meta?.dataVersion || '—'}`;
    $('#daysToEvent').textContent = daysUntil(d.meta?.startDate);
    renderKpis();
    renderEvents();
    populateFilters();
    renderTaskList();
    renderRundown();
    renderAccommodation();
    renderVenues();
    renderLo();
    renderIssues();
    renderDocuments();
    renderDashboardLists();
  }

  function renderKpis() {
    const s = state.data.summary || {};
    const cards = [
      ['Overall progress', `${number(s.overallProgress)}%`, 'Weighted by priority'],
      ['Readiness', s.readiness || '—', 'Critical task rule'],
      ['Critical pending', number(s.criticalPending), 'Critical items not verified'],
      ['Overdue', number(s.overdue), 'Past deadline'],
      ['Blocked', number(s.blocked), 'Status: Terkendala'],
      ['Awaiting verification', number(s.awaitingVerification), 'Reported complete'],
      ['Without PIC', number(s.withoutPic), 'Need assignment'],
      ['Open issues', number(s.openIssues), 'Decision / action required']
    ];
    $('#kpiGrid').innerHTML = cards.map(([label,value,hint]) => `<article class="kpi-card"><span class="label">${escapeHtml(label)}</span><span class="value">${escapeHtml(value)}</span><span class="hint">${escapeHtml(hint)}</span></article>`).join('');
  }

  function renderEvents() {
    const events = state.data.events || [];
    $('#eventCards').innerHTML = events.map(event => `
      <article class="event-card">
        <div class="panel-heading"><span class="pill ${readinessClass(event.readiness)}">${escapeHtml(event.readiness)}</span><strong>${number(event.progress)}%</strong></div>
        <h3>${escapeHtml(event.eventName)}</h3>
        <p class="venue">${escapeHtml(event.venue || 'Lintas lokasi')}</p>
        <div class="progress-track"><div class="progress-bar" style="width:${clamp(event.progress)}%"></div></div>
        <div class="event-meta"><span>${number(event.criticalPending)} critical pending</span><span>${number(event.taskCount)} tasks</span></div>
      </article>`).join('');
  }

  function populateFilters() {
    fillSelect('#eventFilter', unique((state.data.events || []).map(e => [e.eventId,e.eventName])), 'Semua event');
    fillSelect('#workstreamFilter', unique((state.data.tasks || []).map(t => [t.workstream,t.workstream])), 'Semua workstream');
    fillSelect('#statusFilter', unique((state.data.tasks || []).map(t => [t.status,t.status])), 'Semua status');
    fillSelect('#priorityFilter', [['Critical','Critical'],['High','High'],['Medium','Medium'],['Low','Low']], 'Semua prioritas');
  }

  function fillSelect(selector, options, firstLabel) {
    const select = $(selector); const current = select.value;
    select.innerHTML = `<option value="">${escapeHtml(firstLabel)}</option>` + options.map(([value,label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`).join('');
    select.value = current;
  }

  function renderTaskList() {
    if (!state.data) return;
    const query = $('#taskSearch').value.trim().toLowerCase();
    const event = $('#eventFilter').value;
    const workstream = $('#workstreamFilter').value;
    const status = $('#statusFilter').value;
    const priority = $('#priorityFilter').value;
    const eventNames = Object.fromEntries((state.data.events || []).map(e => [e.eventId,e.eventName]));
    const rows = (state.data.tasks || []).filter(t => {
      const text = [t.taskId,t.item,t.criteria,t.pic,t.bidang,t.venue,t.blocker,t.nextAction].join(' ').toLowerCase();
      return (!query || text.includes(query)) && (!event || t.eventId === event) && (!workstream || t.workstream === workstream) && (!status || t.status === status) && (!priority || t.priority === priority);
    }).sort((a,b) => priorityRank(a.priority)-priorityRank(b.priority) || String(a.deadline).localeCompare(String(b.deadline)));
    $('#taskResultCount').textContent = `${rows.length} item`;
    $('#taskList').innerHTML = rows.length ? rows.map(t => `
      <article class="task-card priority-${String(t.priority).toLowerCase()}">
        <div><div class="panel-heading"><span class="pill ${String(t.priority).toLowerCase()==='critical'?'critical':''}">${escapeHtml(t.priority)}</span><span class="pill ${readinessClass(t.readiness)}">${escapeHtml(t.readiness || t.status)}</span></div><h3 class="task-title">${escapeHtml(t.item)}</h3><p class="task-description">${escapeHtml(t.criteria || '')}</p>${t.blocker ? `<p class="task-blocker"><strong>Blocker:</strong> ${escapeHtml(t.blocker)}</p>`:''}</div>
        <div class="task-info"><strong>${escapeHtml(eventNames[t.eventId] || t.eventId)}</strong><span>${escapeHtml(t.venue || '—')}</span><span>Bidang: ${escapeHtml(t.bidang || 'Belum ditetapkan')}</span><span>Scope: ${escapeHtml(t.scopeOwner || 'TBC')}</span></div>
        <div class="task-info"><div class="task-progress"><span>${escapeHtml(t.status)}</span><strong>${number(t.progress)}%</strong></div><div class="progress-track"><div class="progress-bar" style="width:${clamp(t.progress)}%"></div></div><span>PIC: ${escapeHtml(t.pic || 'Belum ditetapkan')}</span><span>Deadline: ${formatDate(t.deadline)}</span><span>Next: ${escapeHtml(t.nextAction || '—')}</span></div>
      </article>`).join('') : '<div class="empty">Tidak ada item yang sesuai filter.</div>';
  }

  function renderRundown() {
    const rows = state.data.rundown || [];
    const groups = groupBy(rows, r => r.date || String(r.start).slice(0,10));
    $('#rundownList').innerHTML = Object.entries(groups).map(([day,items]) => `
      <article class="timeline-day"><h3>${formatDate(day, true)}</h3>${items.map(r => `
        <div class="timeline-row"><time>${formatTime(r.start)}–${formatTime(r.end)}</time><div class="audience">${escapeHtml(r.audience || '')}</div><div class="activity">${escapeHtml(r.activity)}</div><div class="venue">${escapeHtml(r.venue || '')}</div></div>`).join('')}</article>`).join('') || '<div class="empty">Rundown untuk skenario aktif belum tersedia.</div>';
  }

  function renderAccommodation() {
    const a = state.data.accommodation || {summary:{},groups:[]}; const s = a.summary || {};
    const kpis = [['Total inventory',s.totalInventory],['Occupied / reserved',s.occupied],['Available',s.available],['Ready',s.ready],['Needs action',s.needsAction]];
    $('#accommodationKpis').innerHTML = kpis.map(([label,value]) => `<article class="kpi-card"><span class="label">${escapeHtml(label)}</span><span class="value">${number(value)}</span></article>`).join('');
    $('#accommodationList').innerHTML = (a.groups || []).map(g => `<article class="list-card"><div><h3>${escapeHtml(g.name)}</h3><p>Ringkasan inventori tanpa menampilkan nama tamu atau nomor kamar.</p></div><div class="metric-stack"><div><strong>${number(g.total)}</strong><small>Total</small></div><div><strong>${number(g.occupied)}</strong><small>Occupied</small></div><div><strong>${number(g.available)}</strong><small>Available</small></div><div><strong>${number(g.needsAction)}</strong><small>Need action</small></div></div></article>`).join('');
  }

  function renderVenues() {
    const venueEvents = (state.data.events || []).filter(e => e.venue && !['Bandara / Rute Lokal','Rumah Komplek PIM & Hotel'].includes(e.venue));
    $('#venueCards').innerHTML = venueEvents.map(e => `<article class="event-card"><div class="panel-heading"><span class="pill ${readinessClass(e.readiness)}">${escapeHtml(e.readiness)}</span><strong>${number(e.progress)}%</strong></div><h3>${escapeHtml(e.venue)}</h3><p class="venue">${escapeHtml(e.eventName)}</p><div class="progress-track"><div class="progress-bar" style="width:${clamp(e.progress)}%"></div></div><div class="event-meta"><span>${number(e.criticalPending)} critical pending</span><span>${number(e.taskCount)} tasks</span></div></article>`).join('');
  }

  function renderLo() {
    if (!state.data) return;
    const query = $('#loSearch').value.trim().toLowerCase();
    const assignments = (state.data.lo?.assignments || []).filter(r => [r.company,r.vipCategory,r.lo,r.locationNote,r.status].join(' ').toLowerCase().includes(query));
    $('#loCount').textContent = `${assignments.length} assignment`;
    $('#loList').innerHTML = assignments.map(r => `<article class="list-card"><div><h3>${escapeHtml(r.company)}</h3><p>${escapeHtml(r.vipCategory)}</p><p>LO: <strong>${escapeHtml(r.lo || 'Belum ditetapkan')}</strong>${r.locationNote ? ` · ${escapeHtml(r.locationNote)}`:''}</p></div><span class="pill ${r.status==='Confirmed'?'ready':'risk'}">${escapeHtml(r.status || 'TBC')}</span></article>`).join('') || '<div class="empty">Tidak ada assignment yang sesuai.</div>';
  }

  function renderIssues() {
    const issues = (state.data.issues || []).sort((a,b) => priorityRank(a.priority)-priorityRank(b.priority) || String(a.dueDate).localeCompare(String(b.dueDate)));
    $('#issueList').innerHTML = issues.map(i => `<article class="list-card"><div><div class="panel-heading"><span class="pill ${i.priority==='Critical'?'critical':''}">${escapeHtml(i.priority)}</span><span class="pill ${String(i.status).toLowerCase()==='resolved'?'ready':'risk'}">${escapeHtml(i.status)}</span></div><h3>${escapeHtml(i.issue)}</h3><p><strong>Impact:</strong> ${escapeHtml(i.impact || '—')}</p><p><strong>Required action:</strong> ${escapeHtml(i.requiredAction || '—')}</p><p>Owner: ${escapeHtml(i.actionOwner || i.decisionOwner || 'TBC')}</p></div><div><strong>${formatDate(i.dueDate)}</strong></div></article>`).join('') || '<div class="empty">Tidak ada isu publik.</div>';
  }

  function renderDocuments() {
    const docs = state.data.documents || [];
    $('#documentList').innerHTML = docs.map(d => `<article class="list-card"><div><h3>${escapeHtml(d.name)}</h3><p>${escapeHtml(d.category)} · ${escapeHtml(d.status)}</p><p>${escapeHtml(d.notes || '')}</p></div>${String(d.link).startsWith('http') ? `<a class="button" href="${escapeHtml(d.link)}" target="_blank" rel="noopener">Buka</a>` : '<span class="pill risk">Link belum diisi</span>'}</article>`).join('') || '<div class="empty">Belum ada dokumen publik.</div>';
  }

  function renderDashboardLists() {
    const critical = (state.data.tasks || []).filter(t => t.priority === 'Critical' && t.status !== 'Selesai & Terverifikasi').sort((a,b) => String(a.deadline).localeCompare(String(b.deadline))).slice(0,6);
    $('#priorityTasks').innerHTML = critical.map(t => `<div class="mini-row"><div><strong>${escapeHtml(t.item)}</strong><small>${escapeHtml(t.pic || 'PIC belum ditetapkan')} · ${formatDate(t.deadline)}</small></div><span>${number(t.progress)}%</span></div>`).join('') || '<div class="empty">Tidak ada critical pending.</div>';
    const issues = (state.data.issues || []).filter(i => String(i.status).toLowerCase() === 'open').slice(0,6);
    $('#openIssueCount').textContent = String(issues.length);
    $('#dashboardIssues').innerHTML = issues.map(i => `<div class="mini-row"><div><strong>${escapeHtml(i.issue)}</strong><small>${escapeHtml(i.actionOwner || i.decisionOwner || 'Owner TBC')} · ${formatDate(i.dueDate)}</small></div><span class="pill ${i.priority==='Critical'?'critical':''}">${escapeHtml(i.priority)}</span></div>`).join('') || '<div class="empty">Tidak ada isu terbuka.</div>';
  }

  function showLoading() { $('#loadingState').hidden = false; $('#errorState').hidden = true; $('#appViews').hidden = true; }
  function showApp() { $('#loadingState').hidden = true; $('#errorState').hidden = true; $('#appViews').hidden = false; }
  function showError(message) { $('#loadingState').hidden = true; $('#appViews').hidden = true; $('#errorState').hidden = false; $('#errorMessage').textContent = message; updateSyncBadge('cached','No data'); }
  function updateSyncBadge(type, label) { const badge=$('#syncBadge'); badge.className=`sync-badge ${type}`; const last=state.data?.summary?.lastUpdated; badge.textContent=`${label}${last ? ` · ${formatDateTime(last)}`:''}`; }

  function setupInstallPrompt() {
    window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); state.deferredPrompt = event; $('#installButton').hidden = false; });
  }
  function setupServiceWorker() { if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(console.warn)); }

  function daysUntil(value) { const date=parseDate(value); if (!date) return '—'; return Math.max(Math.ceil((date - new Date()) / 86400000),0); }
  function formatDate(value, withWeekday=false) { const date=parseDate(value); if (!date) return '—'; return new Intl.DateTimeFormat('id-ID',{weekday:withWeekday?'long':undefined,day:'2-digit',month:'short',year:'numeric'}).format(date); }
  function formatDateTime(value) { const date=parseDate(value); return date ? new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(date) : '—'; }
  function formatTime(value) { const date=parseDate(value); return date ? new Intl.DateTimeFormat('id-ID',{hour:'2-digit',minute:'2-digit',hour12:false}).format(date) : '—'; }
  function parseDate(value) { if (!value) return null; const d=new Date(value); return Number.isNaN(d.getTime())?null:d; }
  function groupBy(items, keyFn) { return items.reduce((acc,item)=>{ const key=keyFn(item); (acc[key] ||= []).push(item); return acc; },{}); }
  function unique(pairs) { const seen=new Set(); return pairs.filter(([value])=>value && !seen.has(value) && seen.add(value)); }
  function readinessClass(value) { const v=String(value||'').toLowerCase(); return v.includes('not')?'not-ready':v.includes('risk')?'risk':v.includes('ready')?'ready':''; }
  function priorityRank(value) { return ({Critical:0,High:1,Medium:2,Low:3})[value] ?? 9; }
  function clamp(value) { return Math.max(0,Math.min(100,Number(value)||0)); }
  function number(value) { const n=Number(value); return Number.isFinite(n)?Math.round(n*10)/10:0; }
  function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
})();
