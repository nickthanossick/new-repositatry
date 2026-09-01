/*!
 * CareersTiger Jobs — © 2026 CareersTiger. All rights reserved.
 * Proprietary and confidential. Unauthorized copying, modification, or
 * distribution of this software is strictly prohibited.
 *
 * Engine: fetches live openings directly from hiring companies (in the
 * visitor's browser), filters to India + target roles + fresher/experience,
 * and ACCUMULATES them (old jobs stay, new jobs add on) up to 500.
 */
(function () {
  'use strict';

  var STORE_KEY = 'careerstiger_store_v2';   // bumped: purge any old cache with foreign jobs
  var STORE_TTL_MS = 20 * 60 * 1000;   // how "fresh" a stored snapshot is before we auto-fetch
  var FETCH_TIMEOUT_MS = 12000;
  var CONCURRENCY = 8;
  var MAX_JOBS = 2000;                   // hard cap on the accumulating pool
  var AUTO_REFRESH_MS = 90 * 1000;       // dynamic: pull new jobs every 90s

  // Server feed: a GitHub Actions scraper refreshes this file hourly (no CORS/limits
  // server-side), so the board loads a large, always-growing pool instantly — even
  // before the in-browser live fetch runs. First URL that responds wins:
  //   1) ./data/jobs.json  — when the app is hosted next to /data (GitHub Pages)
  //   2) raw.githubusercontent — works from the local single-file build too (raw = CORS *)
  var FEED_URLS = [
    './data/jobs.json',
    'https://raw.githubusercontent.com/nickthanossick/new-repositatry/claude/job-portal-scraper-nbb6bu/jobs/data/jobs.json'
  ];

  var STATE = {
    jobs: [],                 // accumulating, India-filtered, normalized jobs
    diagnostics: [],
    filters: { experience: 'fresher', sector: 'all', role: 'all', city: 'all', posted: 'week', q: '' },
    loading: false,
    lastAdded: 0,
    autoTimer: null,
    feedAt: null              // generatedAt of the server feed (jobs.json)
  };

  /* ---------------- utilities ---------------- */
  function el(id) { return document.getElementById(id); }
  function lc(s) { return (s == null ? '' : String(s)).toLowerCase(); }

  function stripHtml(html) {
    if (!html) return '';
    var d = document.createElement('div');
    d.innerHTML = html;
    return (d.textContent || d.innerText || '').replace(/\s+/g, ' ').trim();
  }

  function timeoutFetch(url) {
    var ctrl = new AbortController();
    var t = setTimeout(function () { ctrl.abort(); }, FETCH_TIMEOUT_MS);
    return fetch(url, { signal: ctrl.signal, headers: { 'Accept': 'application/json' } })
      .finally(function () { clearTimeout(t); });
  }

  function pool(tasks, limit) {
    return new Promise(function (resolve) {
      var i = 0, active = 0, done = 0, results = [];
      if (!tasks.length) return resolve(results);
      function next() {
        while (active < limit && i < tasks.length) {
          (function (idx) {
            active++;
            tasks[idx]().then(function (r) { results[idx] = r; })
              .catch(function (e) { results[idx] = { error: e }; })
              .finally(function () {
                active--; done++;
                if (done === tasks.length) resolve(results); else next();
              });
          })(i++);
        }
      }
      next();
    });
  }

  function esc(s) {
    return (s == null ? '' : String(s)).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------------- classification ---------------- */
  // Set of company names currently in the registry — jobs from removed companies are purged.
  var _validCo = null;
  function validCompany(name) {
    if (!_validCo) { _validCo = {}; (window.COMPANIES || []).forEach(function (c) { _validCo[c.name] = 1; }); }
    return !!_validCo[name];
  }
  // A usable apply link = real http(s) candidate-facing page (not an API/JSON endpoint).
  function goodApplyUrl(u) {
    return typeof u === 'string' && /^https?:\/\//.test(u) &&
      u.indexOf('api.smartrecruiters.com') === -1 &&
      u.indexOf('boards-api.greenhouse.io') === -1;
  }
  function isIndiaLocation(locText) {
    var t = lc(locText); if (!t) return false;
    var i;
    // STRICT: if the location names ANY foreign place, reject it outright — even if it also
    // lists an Indian city (multi-country postings like "India / Singapore" are dropped).
    for (i = 0; i < window.NON_INDIA_HINTS.length; i++) {
      if (t.indexOf(window.NON_INDIA_HINTS[i]) !== -1) return false;
    }
    // Keep only if it clearly names India or an Indian city.
    for (i = 0; i < window.INDIA_LOCATIONS.length; i++) {
      if (t.indexOf(window.INDIA_LOCATIONS[i]) !== -1) return true;
    }
    return false;
  }

  function matchRoles(text) {
    var t = lc(text), out = [];
    for (var r = 0; r < window.ROLES.length; r++) {
      var role = window.ROLES[r], kws = role.keywords;
      for (var k = 0; k < kws.length; k++) {
        if (t.indexOf(kws[k]) !== -1) { out.push(role.id); break; }
      }
    }
    return out;
  }

  function classifyExperience(title, body) {
    var t = lc(title), b = lc(body), i;
    for (i = 0; i < window.EXPERIENCED_HINTS.length; i++) if (t.indexOf(window.EXPERIENCED_HINTS[i]) !== -1) return 'experienced';
    for (i = 0; i < window.FRESHER_HINTS.length; i++) if (t.indexOf(window.FRESHER_HINTS[i]) !== -1) return 'fresher';
    for (i = 0; i < window.FRESHER_HINTS.length; i++) if (b.indexOf(window.FRESHER_HINTS[i]) !== -1) return 'fresher';
    for (i = 0; i < window.EXPERIENCED_HINTS.length; i++) if (b.indexOf(window.EXPERIENCED_HINTS[i]) !== -1) return 'experienced';
    return 'unknown';
  }

  function cityOf(locText) {
    var t = lc(locText);
    var priority = ['bengaluru','bangalore','mumbai','delhi','gurugram','gurgaon','noida',
      'hyderabad','pune','chennai','kolkata','ahmedabad','jaipur','indore','chandigarh',
      'coimbatore','kochi','remote'];
    for (var i = 0; i < priority.length; i++) {
      if (t.indexOf(priority[i]) !== -1) return priority[i].charAt(0).toUpperCase() + priority[i].slice(1);
    }
    if (t.indexOf('india') !== -1) return 'India';
    return locText || '—';
  }

  /* ---------------- provider adapters (source names kept internal) ---------------- */
  function adaptGreenhouse(co) {
    var url = 'https://boards-api.greenhouse.io/v1/boards/' + encodeURIComponent(co.slug) + '/jobs?content=true';
    return timeoutFetch(url).then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function (data) {
        var list = (data && data.jobs) || [];
        return { jobs: list.map(function (j) {
          return { id: co.provider + ':' + co.slug + ':' + j.id, title: j.title || '', company: co.name,
            location: (j.location && j.location.name) || '',
            department: (j.departments && j.departments[0] && j.departments[0].name) || '',
            applyUrl: j.absolute_url, postedAt: j.updated_at || j.first_published || null,
            rawText: stripHtml(j.content || '') };
        }), count: list.length };
      });
  }
  function adaptLever(co) {
    var url = 'https://api.lever.co/v0/postings/' + encodeURIComponent(co.slug) + '?mode=json';
    return timeoutFetch(url).then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function (list) {
        list = list || [];
        return { jobs: list.map(function (j) {
          var cats = j.categories || {};
          return { id: co.provider + ':' + co.slug + ':' + j.id, title: j.text || '', company: co.name,
            location: cats.location || '', department: cats.team || cats.department || '',
            applyUrl: j.hostedUrl || j.applyUrl, postedAt: j.createdAt ? new Date(j.createdAt).toISOString() : null,
            rawText: stripHtml(j.descriptionPlain || j.description || '') };
        }), count: list.length };
      });
  }
  function adaptAshby(co) {
    var url = 'https://api.ashbyhq.com/posting-api/job-board/' + encodeURIComponent(co.slug) + '?includeCompensation=false';
    return timeoutFetch(url).then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function (data) {
        var list = (data && data.jobs) || [];
        return { jobs: list.map(function (j) {
          return { id: co.provider + ':' + co.slug + ':' + j.id, title: j.title || '', company: co.name,
            location: j.location || (j.address && j.address.postalAddress && j.address.postalAddress.addressLocality) || '',
            department: j.department || j.team || '', applyUrl: j.jobUrl || j.applyUrl,
            postedAt: j.publishedAt || null, rawText: stripHtml(j.descriptionHtml || j.descriptionPlain || '') };
        }), count: list.length };
      });
  }
  function adaptSmartRecruiters(co) {
    var url = 'https://api.smartrecruiters.com/v1/companies/' + encodeURIComponent(co.slug) + '/postings?limit=100';
    return timeoutFetch(url).then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function (data) {
        var list = (data && data.content) || [];
        return { jobs: list.map(function (j) {
          var loc = j.location || {};
          var locStr = [loc.city, loc.region, loc.country].filter(Boolean).join(', ');
          return { id: co.provider + ':' + co.slug + ':' + j.id, title: j.name || '', company: co.name,
            location: locStr, department: (j.department && j.department.label) || (j.function && j.function.label) || '',
            // Public posting page (NOT j.ref — that is the API URL that opens raw JSON).
            applyUrl: 'https://jobs.smartrecruiters.com/' + co.slug + '/' + j.id,
            postedAt: j.releasedDate || null, rawText: (j.name || '') };
        }), count: list.length };
      });
  }
  function adaptRecruitee(co) {
    var url = 'https://' + encodeURIComponent(co.slug) + '.recruitee.com/api/offers/';
    return timeoutFetch(url).then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function (data) {
        var list = (data && data.offers) || [];
        return { jobs: list.map(function (j) {
          return { id: co.provider + ':' + co.slug + ':' + j.id, title: j.title || '', company: co.name,
            location: j.location || [j.city, j.country].filter(Boolean).join(', '), department: j.department || '',
            applyUrl: j.careers_url || j.careers_apply_url, postedAt: j.published_at || null,
            rawText: stripHtml(j.description || '') };
        }), count: list.length };
      });
  }
  function adaptWorkable(co) {
    // Public job-board widget API (used by embeddable careers widgets → CORS-friendly).
    var url = 'https://apply.workable.com/api/v3/accounts/' + encodeURIComponent(co.slug) + '/jobs';
    return timeoutFetch(url).then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
      .then(function (data) {
        var list = (data && (data.results || data.jobs)) || [];
        return { jobs: list.map(function (j) {
          var loc = j.location || {};
          var locStr = typeof loc === 'string' ? loc
            : [loc.city, loc.region, loc.country].filter(Boolean).join(', ');
          var code = j.shortcode || j.id;
          return { id: co.provider + ':' + co.slug + ':' + code, title: j.title || '', company: co.name,
            location: locStr, department: j.department || '',
            applyUrl: j.url || j.application_url || ('https://apply.workable.com/' + co.slug + '/j/' + code + '/'),
            postedAt: j.published_on || j.created_at || null,
            rawText: stripHtml(j.description || '') };
        }), count: list.length };
      });
  }
  var ADAPTERS = { greenhouse: adaptGreenhouse, lever: adaptLever, ashby: adaptAshby,
    smartrecruiters: adaptSmartRecruiters, recruitee: adaptRecruitee, workable: adaptWorkable };

  /* ---------------- fetch + accumulate ---------------- */
  function fetchFresh() {
    var companies = window.COMPANIES || [];
    var tasks = companies.map(function (co) {
      return function () {
        var adapter = ADAPTERS[co.provider];
        if (!adapter) return Promise.resolve({ co: co, jobs: [], status: 'no-adapter', count: 0, ok: false });
        return adapter(co).then(function (r) { return { co: co, jobs: r.jobs, status: 200, count: r.count, ok: true }; })
          .catch(function (e) { return { co: co, jobs: [], status: (e && e.message) || 'error', count: 0, ok: false }; });
      };
    });

    return pool(tasks, CONCURRENCY).then(function (results) {
      var fresh = [], diags = [];
      results.forEach(function (r) {
        if (!r) return;
        var matched = 0;
        r.jobs.forEach(function (j) {
          if (!goodApplyUrl(j.applyUrl)) return;   // usable, candidate-facing link only
          // India-ONLY: the location field itself must be India. No description fallback
          // (that used to let a few foreign jobs slip in via an Indian city in the body).
          if (!isIndiaLocation(j.location)) return;
          var roleTags = matchRoles(j.title + ' ' + j.department);
          if (!roleTags.length) return;
          fresh.push({
            id: j.id, title: j.title, company: j.company, location: j.location,
            department: j.department, applyUrl: j.applyUrl, postedAt: j.postedAt,
            roleTags: roleTags, experience: classifyExperience(j.title, j.rawText || ''),
            city: cityOf(j.location)
            // note: rawText intentionally dropped — keeps the saved pool small
          });
          matched++;
        });
        diags.push({ company: r.co.name, ok: r.ok, status: r.status, raw: r.count, matched: matched });
      });
      STATE.diagnostics = diags;
      return fresh;
    });
  }

  /* Merge fresh jobs into the accumulating pool. Old jobs stay; new ones flagged. */
  function mergeJobs(fresh) {
    var byUrl = {};
    STATE.jobs.forEach(function (j) { byUrl[j.applyUrl] = j; j.isNew = false; });
    var now = Date.now(), added = 0;
    fresh.forEach(function (j) {
      if (byUrl[j.applyUrl]) return;           // already collected earlier
      j.addedAt = now; j.isNew = true;
      STATE.jobs.push(j); byUrl[j.applyUrl] = j; added++;
    });
    if (STATE.jobs.length > MAX_JOBS) {
      STATE.jobs.sort(function (a, b) { return (b.addedAt || 0) - (a.addedAt || 0); });
      STATE.jobs = STATE.jobs.slice(0, MAX_JOBS);
    }
    STATE.lastAdded = added;
    return added;
  }

  /* ---------------- server feed (hourly-scraped jobs.json) ---------------- */
  function fetchFeedFrom(url) {
    return timeoutFetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    });
  }
  // Try each candidate URL in order; resolve with the first that returns usable data.
  function loadServerFeed() {
    var idx = 0;
    function attempt() {
      if (idx >= FEED_URLS.length) return Promise.resolve(null);
      return fetchFeedFrom(FEED_URLS[idx++])
        .then(function (data) { return (data && data.jobs) ? data : attempt(); })
        .catch(function () { return attempt(); });
    }
    return attempt();
  }
  // Merge the feed's jobs into the pool (re-validated India-only), like a browser fetch.
  function ingestFeed(data) {
    if (!data || !data.jobs) return 0;
    STATE.feedAt = data.generatedAt || null;
    var feedJobs = data.jobs.filter(function (j) { return j.applyUrl && isIndiaLocation(j.location) && validCompany(j.company); })
      .map(function (j) {
        return { id: j.id, title: j.title, company: j.company, location: j.location,
          department: j.department, applyUrl: j.applyUrl, postedAt: j.postedAt,
          roleTags: j.roleTags || [], experience: j.experience || 'unknown',
          city: j.city || cityOf(j.location) };
      });
    return mergeJobs(feedJobs);
  }
  function feedAgeText() {
    if (!STATE.feedAt) return '';
    var mins = Math.floor((Date.now() - new Date(STATE.feedAt).getTime()) / 60000);
    if (isNaN(mins) || mins < 0) return '';
    if (mins < 1) return 'updated just now';
    if (mins < 60) return 'updated ' + mins + 'm ago';
    var hrs = Math.floor(mins / 60);
    return 'updated ' + hrs + (hrs === 1 ? 'h ago' : 'h ago');
  }

  /* ---------------- persistence (the accumulating store) ---------------- */
  function saveStore() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify({ t: Date.now(), jobs: STATE.jobs, diagnostics: STATE.diagnostics })); }
    catch (e) { /* storage full/unavailable — non-fatal */ }
  }
  function loadStore() {
    try { var raw = localStorage.getItem(STORE_KEY); if (!raw) return null; return JSON.parse(raw); }
    catch (e) { return null; }
  }

  /* ---------------- filtering + rendering ---------------- */
  function applyFilters() {
    var f = STATE.filters;
    var sectorRoleIds = (f.sector !== 'all' && window.SECTORS[f.sector]) ? window.SECTORS[f.sector].roleIds : null;
    var q = lc(f.q).trim();
    return STATE.jobs.filter(function (j) {
      if (f.experience === 'fresher' && j.experience === 'experienced') return false;
      if (f.experience === 'experienced' && j.experience !== 'experienced') return false;
      if (f.role !== 'all' && j.roleTags.indexOf(f.role) === -1) return false;
      if (sectorRoleIds && !j.roleTags.some(function (id) { return sectorRoleIds.indexOf(id) !== -1; })) return false;
      if (f.city !== 'all' && lc(j.city) !== lc(f.city)) return false;
      if (f.posted !== 'any') {
        var win = POSTED_WINDOWS[f.posted];
        var ds = daysSince(j.postedAt);
        // Keep jobs within the window. Jobs added this refresh (isNew) and jobs with an
        // unknown posting date are kept too, so recent listings are never lost.
        if (ds !== null && ds > win && !j.isNew) return false;
      }
      if (q) {
        var hay = lc(j.title + ' ' + j.company + ' ' + j.location + ' ' + j.department);
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
  }

  function roleLabel(id) {
    for (var i = 0; i < window.ROLES.length; i++) if (window.ROLES[i].id === id) return window.ROLES[i].label;
    return id;
  }
  /* Days since a posting date, or null if unknown/unparseable. */
  function daysSince(iso) {
    if (!iso) return null;
    var d = new Date(iso); if (isNaN(d.getTime())) return null;
    return Math.floor((Date.now() - d.getTime()) / 86400000);
  }
  var POSTED_WINDOWS = { today: 1, week: 7, month: 30 };

  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso); if (isNaN(d.getTime())) return '';
    var days = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (days <= 0) return 'today';
    if (days === 1) return '1 day ago';
    if (days < 30) return days + ' days ago';
    var mo = Math.floor(days / 30);
    return mo + (mo === 1 ? ' month ago' : ' months ago');
  }

  function render() {
    var list = applyFilters();
    var grid = el('grid');
    el('resultCount').textContent = list.length;

    if (!list.length) {
      grid.innerHTML = '<div class="empty">No matching jobs in this view. Try widening the date to ' +
        '<b>Any time</b>, switch to <b>All levels</b>, clear the role/city filter, or hit ' +
        '<b>Fetch new jobs</b> — the board keeps growing as more companies are scanned.</div>';
      return;
    }

    // New first, then this-week, then freshers, then most recent.
    list.sort(function (a, b) {
      var an = a.isNew ? 0 : 1, bn = b.isNew ? 0 : 1; if (an !== bn) return an - bn;
      var aw = (function (x) { var d = daysSince(x.postedAt); return (d !== null && d <= 7) ? 0 : 1; })(a);
      var bw = (function (x) { var d = daysSince(x.postedAt); return (d !== null && d <= 7) ? 0 : 1; })(b);
      if (aw !== bw) return aw - bw;
      var af = a.experience === 'fresher' ? 0 : 1, bf = b.experience === 'fresher' ? 0 : 1; if (af !== bf) return af - bf;
      return (new Date(b.postedAt || 0)) - (new Date(a.postedAt || 0));
    });

    grid.innerHTML = list.map(function (j) {
      var badge = j.experience === 'fresher' ? '<span class="badge fresher">Fresher-friendly</span>'
        : (j.experience === 'experienced' ? '<span class="badge exp">Experienced</span>' : '<span class="badge fresher">Open to freshers</span>');
      var tags = j.roleTags.slice(0, 2).map(function (id) { return '<span class="tag">' + esc(roleLabel(id)) + '</span>'; }).join('');
      var posted = fmtDate(j.postedAt);
      var ds = daysSince(j.postedAt);
      var weekTag = (ds !== null && ds <= 7) ? '<span class="wk">🗓 This week</span>' : '';
      return '<article class="card' + (j.isNew ? ' is-new' : '') + '">' +
        (j.isNew ? '<span class="new-flag">NEW</span>' : '') +
        '<div class="card-top"><h3 class="job-title">' + esc(j.title) + '</h3>' + badge + '</div>' +
        '<div class="company">' + esc(j.company) + '</div>' +
        '<div class="meta"><span class="loc">📍 ' + esc(j.city || j.location) + '</span>' +
          (posted ? '<span class="dot">·</span><span class="posted">' + esc(posted) + '</span>' : '') +
          weekTag + '</div>' +
        '<div class="tags">' + tags + '</div>' +
        '<div class="card-foot">' +
          '<span class="src">✓ Direct company listing</span>' +
          '<a class="apply" href="' + esc(j.applyUrl) + '" target="_blank" rel="noopener noreferrer">Apply on company site →</a>' +
        '</div></article>';
    }).join('');
  }

  /* ---------------- CSV export ---------------- */
  function csvCell(v) {
    var s = (v == null ? '' : String(v));
    if (/[",\n\r]/.test(s)) s = '"' + s.replace(/"/g, '""') + '"';
    return s;
  }
  function exportCSV() {
    // Export the current view (respects filters); if nothing is filtered it's everything.
    var list = applyFilters();
    if (!list.length) { alert('No jobs to export in the current view. Try widening the filters.'); return; }
    var headers = ['Title', 'Company', 'City', 'Location', 'Roles', 'Experience', 'Posted Date', 'Apply Link'];
    var rows = [headers.map(csvCell).join(',')];
    list.forEach(function (j) {
      var roles = (j.roleTags || []).map(roleLabel).join(' | ');
      var posted = j.postedAt ? new Date(j.postedAt).toISOString().slice(0, 10) : '';
      rows.push([
        j.title, j.company, j.city || '', j.location || '', roles,
        j.experience || '', posted, j.applyUrl
      ].map(csvCell).join(','));
    });
    var csv = '﻿' + rows.join('\r\n');   // BOM so Excel opens UTF-8 correctly
    var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'careerstiger-jobs-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a); a.click();
    setTimeout(function () { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }

  /* Diagnostics — company + health only (source/ATS names are not exposed). */
  function renderDiagnostics() {
    var box = el('diagBody');
    if (!STATE.diagnostics.length) { box.innerHTML = '<div class="diag-note">No data yet.</div>'; return; }
    var rows = STATE.diagnostics.slice().sort(function (a, b) { return b.matched - a.matched; }).map(function (d) {
      var cls = d.ok ? (d.matched > 0 ? 'ok' : 'warn') : 'err';
      var status = d.ok ? ('OK · ' + d.raw + ' listings') : ('FAILED');
      return '<tr class="' + cls + '"><td>' + esc(d.company) + '</td><td>' + status + '</td>' +
        '<td class="num">' + d.matched + '</td></tr>';
    }).join('');
    box.innerHTML = '<table class="diag"><thead><tr><th>Company</th><th>Status</th><th>India matches</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table>';
  }

  /* ---------------- UI wiring ---------------- */
  function buildRoleOptions() {
    var html = '<option value="all">All target roles</option>';
    window.ROLES.forEach(function (r) { html += '<option value="' + r.id + '">' + esc(r.label) + '</option>'; });
    el('roleFilter').innerHTML = html;
  }
  function buildCityOptions() {
    var cities = {}, cur = el('cityFilter').value;
    STATE.jobs.forEach(function (j) { if (j.city) cities[j.city] = true; });
    var keys = Object.keys(cities).sort();
    var html = '<option value="all">All cities</option>';
    keys.forEach(function (c) { html += '<option value="' + esc(c) + '">' + esc(c) + '</option>'; });
    el('cityFilter').innerHTML = html;
    if (cur && cities[cur]) el('cityFilter').value = cur;
  }

  function updateCounters(fromCache, live, boards) {
    var total = STATE.jobs.length;
    var freshers = STATE.jobs.filter(function (j) { return j.experience !== 'experienced'; }).length;
    el('jobsFound').textContent = total;
    el('fresherCount').textContent = freshers;
    el('newCount').textContent = STATE.lastAdded;
    var progress = ' · ' + Math.min(total, MAX_JOBS) + '/' + MAX_JOBS;
    var feed = feedAgeText();
    var feedTag = feed ? ' · feed ' + feed : '';
    var msg;
    if (fromCache) {
      msg = 'Loaded ' + total + ' saved jobs · fetching more…';
    } else if (total >= MAX_JOBS) {
      msg = 'Live · ' + total + ' jobs collected (max reached) · ' + live + '/' + boards + ' companies hiring' + feedTag;
    } else if (STATE.lastAdded > 0) {
      msg = 'Live · +' + STATE.lastAdded + ' new · ' + total + ' jobs collected' + progress +
        ' · ' + live + '/' + boards + ' companies hiring' + feedTag;
    } else {
      msg = 'Up to date · ' + total + ' jobs collected' + progress +
        ' · ' + live + '/' + boards + ' companies hiring · auto-refresh on' + feedTag;
    }
    el('status').innerHTML = esc(msg);
  }

  function refresh(silent) {
    if (STATE.loading) return;
    STATE.loading = true;
    el('refreshBtn').disabled = true;
    if (!silent) el('status').innerHTML = '<span class="spin"></span> Scanning company career pages…';

    fetchFresh().then(function (fresh) {
      // ONLY-OPEN reconcile: if a company was fetched OK this pass but one of its previously
      // stored jobs is no longer listed, that listing has closed → drop it (kills dead/404
      // apply links). Companies that failed this pass (CORS/network) keep their jobs untouched.
      var freshUrls = {}; fresh.forEach(function (j) { freshUrls[j.applyUrl] = 1; });
      var okCo = {}; STATE.diagnostics.forEach(function (d) { if (d.ok) okCo[d.company] = 1; });
      STATE.jobs = STATE.jobs.filter(function (j) {
        if (!validCompany(j.company)) return false;            // company removed from registry → purge
        return !okCo[j.company] || freshUrls[j.applyUrl];
      });
      mergeJobs(fresh);
      buildCityOptions();
      render(); renderDiagnostics();
      saveStore();
      var boards = STATE.diagnostics.length;
      var live = STATE.diagnostics.filter(function (d) { return d.ok && d.matched > 0; }).length;
      updateCounters(false, live, boards);
    }).catch(function () {
      el('status').textContent = 'Could not fetch right now. Try again in a moment.';
    }).finally(function () {
      STATE.loading = false;
      el('refreshBtn').disabled = false;
    });
  }

  function startAuto() {
    if (STATE.autoTimer) clearInterval(STATE.autoTimer);
    STATE.autoTimer = setInterval(function () {
      if (el('autoRefresh').checked && !document.hidden) refresh(true);
    }, AUTO_REFRESH_MS);
  }

  function wire() {
    el('experienceFilter').addEventListener('change', function (e) { STATE.filters.experience = e.target.value; render(); });
    el('roleFilter').addEventListener('change', function (e) { STATE.filters.role = e.target.value; render(); });
    el('cityFilter').addEventListener('change', function (e) { STATE.filters.city = e.target.value; render(); });
    el('postedFilter').addEventListener('change', function (e) { STATE.filters.posted = e.target.value; render(); });
    el('search').addEventListener('input', function (e) { STATE.filters.q = e.target.value; render(); });

    var chips = document.querySelectorAll('.chip');
    chips.forEach(function (c) {
      c.addEventListener('click', function () {
        chips.forEach(function (x) { x.classList.remove('active'); });
        c.classList.add('active');
        STATE.filters.sector = c.getAttribute('data-sector');
        render();
      });
    });

    el('refreshBtn').addEventListener('click', function () { refresh(false); });
    el('exportBtn').addEventListener('click', exportCSV);
    el('autoRefresh').addEventListener('change', function (e) { if (e.target.checked) startAuto(); });
    el('diagToggle').addEventListener('click', function () {
      var p = el('diagPanel'); p.hidden = !p.hidden;
      el('diagToggle').textContent = p.hidden ? 'Diagnostics' : 'Hide diagnostics';
    });
  }

  /* ---------------- the actual app (runs only after login) ---------------- */
  function startApp() {
    if (STATE.started) return;
    STATE.started = true;
    buildRoleOptions();
    wire();
    var allChip = document.querySelector('.chip[data-sector="all"]');
    if (allChip) allChip.classList.add('active');

    // Show saved jobs instantly (dynamic feel), then fetch & accumulate more.
    var stored = loadStore();
    if (stored && stored.jobs && stored.jobs.length) {
      // Re-validate saved jobs against the current India-only rule so any stale foreign
      // listing collected by an older build is purged on load.
      STATE.jobs = stored.jobs.filter(function (j) { return isIndiaLocation(j.location) && validCompany(j.company); });
      STATE.jobs.forEach(function (j) { j.isNew = false; });
      STATE.diagnostics = stored.diagnostics || [];
      buildCityOptions();
      render(); renderDiagnostics();
      updateCounters(true, 0, STATE.diagnostics.length);
    }

    // Load the hourly-scraped server feed first (big, always-growing pool), then run
    // the in-browser live fetch on top. This is what makes the board feel like a live
    // ecosystem — jobs keep arriving every hour even when no one has the tab open.
    loadServerFeed().then(function (data) {
      if (data) {
        el('status').innerHTML = '<span class="spin"></span> Loading live jobs feed…';
        ingestFeed(data);
        buildCityOptions();
        render();
        saveStore();
        var age = feedAgeText();
        el('status').innerHTML = esc((age ? age.charAt(0).toUpperCase() + age.slice(1) + ' · ' : '') +
          STATE.jobs.length + ' jobs loaded · scanning for more…');
      }
    }).finally(function () {
      refresh(false);
      startAuto();
    });
  }

  /* ---------------- login gate (password only) ----------------
   * Note: this is a client-side gate for casual privacy, not hard security —
   * the page still runs entirely in the browser. See the anti-copy notes below.
   */
  var AUTH_KEY = 'careerstiger_auth_v1';
  // Password is checked against this token (kept out of plain sight in the shipped build).
  var PW_TOKEN = atob('TmlrQDEyMw==');   // decodes to the account password

  function revealApp() {
    var login = el('loginGate');
    if (login) { login.classList.add('gone'); setTimeout(function () { login.hidden = true; }, 450); }
    startApp();
  }

  function tryLogin() {
    var input = el('pw');
    var val = input ? input.value : '';
    if (val === PW_TOKEN) {
      try { sessionStorage.setItem(AUTH_KEY, '1'); } catch (e) {}
      revealApp();
    } else {
      var card = el('loginCard');
      if (card) { card.classList.remove('shake'); void card.offsetWidth; card.classList.add('shake'); }
      var err = el('loginErr'); if (err) err.textContent = 'Wrong password. Try again.';
      if (input) { input.value = ''; input.focus(); }
    }
  }

  function initLogin() {
    var already = false;
    try { already = sessionStorage.getItem(AUTH_KEY) === '1'; } catch (e) {}
    if (already) { revealApp(); return; }
    var btn = el('pwBtn'), input = el('pw');
    if (btn) btn.addEventListener('click', tryLogin);
    if (input) input.addEventListener('keydown', function (e) { if (e.key === 'Enter') tryLogin(); });
    if (input) input.focus();
  }

  /* ---------------- light anti-copy deterrents ----------------
   * These only discourage casual copying (browser code is always inspectable).
   */
  function antiCopy() {
    document.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    document.addEventListener('keydown', function (e) {
      var k = (e.key || '').toLowerCase();
      if (e.key === 'F12' ||
          ((e.ctrlKey || e.metaKey) && e.shiftKey && (k === 'i' || k === 'j' || k === 'c')) ||
          ((e.ctrlKey || e.metaKey) && k === 'u') ||
          ((e.ctrlKey || e.metaKey) && k === 's')) {
        e.preventDefault(); return false;
      }
    });
    try {
      console.log('%cCareersTiger Jobs — © 2026. Proprietary & confidential.',
        'background:#f97316;color:#241704;font-weight:700;padding:6px 12px;border-radius:6px');
      console.log('%cThis code is protected. Copying or redistribution is prohibited.',
        'color:#c0453a;font-weight:600');
    } catch (e) {}
  }

  /* ---------------- boot ---------------- */
  document.addEventListener('DOMContentLoaded', function () {
    antiCopy();
    initLogin();
  });

})();
