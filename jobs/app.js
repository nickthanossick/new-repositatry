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

  var STORE_KEY = 'careerstiger_store_v1';
  var STORE_TTL_MS = 20 * 60 * 1000;   // how "fresh" a stored snapshot is before we auto-fetch
  var FETCH_TIMEOUT_MS = 12000;
  var CONCURRENCY = 8;
  var MAX_JOBS = 500;                    // hard cap on the accumulating pool
  var AUTO_REFRESH_MS = 90 * 1000;       // dynamic: pull new jobs every 90s

  var STATE = {
    jobs: [],                 // accumulating, India-filtered, normalized jobs
    diagnostics: [],
    filters: { experience: 'fresher', sector: 'all', role: 'all', city: 'all', posted: 'week', q: '' },
    loading: false,
    lastAdded: 0,
    autoTimer: null
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
  function isIndiaLocation(locText) {
    var t = lc(locText); if (!t) return false;
    var i, hit = false;
    for (i = 0; i < window.INDIA_LOCATIONS.length; i++) {
      if (t.indexOf(window.INDIA_LOCATIONS[i]) !== -1) { hit = true; break; }
    }
    if (!hit) return false;
    for (i = 0; i < window.NON_INDIA_HINTS.length; i++) {
      if (t.indexOf(window.NON_INDIA_HINTS[i]) !== -1) return t.indexOf('india') !== -1;
    }
    return true;
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
            applyUrl: j.ref || ('https://jobs.smartrecruiters.com/' + co.slug + '/' + j.id),
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
  var ADAPTERS = { greenhouse: adaptGreenhouse, lever: adaptLever, ashby: adaptAshby,
    smartrecruiters: adaptSmartRecruiters, recruitee: adaptRecruitee };

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
          if (!j.applyUrl) return;
          if (!isIndiaLocation(j.location) && !isIndiaLocation((j.rawText || '').slice(0, 400))) return;
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
    var msg;
    if (fromCache) {
      msg = 'Loaded ' + total + ' saved jobs · fetching more…';
    } else if (total >= MAX_JOBS) {
      msg = 'Live · ' + total + ' jobs collected (max reached) · ' + live + '/' + boards + ' companies hiring';
    } else if (STATE.lastAdded > 0) {
      msg = 'Live · +' + STATE.lastAdded + ' new · ' + total + ' jobs collected' + progress +
        ' · ' + live + '/' + boards + ' companies hiring';
    } else {
      msg = 'Up to date · ' + total + ' jobs collected' + progress +
        ' · ' + live + '/' + boards + ' companies hiring · auto-refresh on';
    }
    el('status').innerHTML = esc(msg);
  }

  function refresh(silent) {
    if (STATE.loading) return;
    STATE.loading = true;
    el('refreshBtn').disabled = true;
    if (!silent) el('status').innerHTML = '<span class="spin"></span> Scanning company career pages…';

    fetchFresh().then(function (fresh) {
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
    el('autoRefresh').addEventListener('change', function (e) { if (e.target.checked) startAuto(); });
    el('diagToggle').addEventListener('click', function () {
      var p = el('diagPanel'); p.hidden = !p.hidden;
      el('diagToggle').textContent = p.hidden ? 'Diagnostics' : 'Hide diagnostics';
    });
  }

  /* ---------------- boot ---------------- */
  document.addEventListener('DOMContentLoaded', function () {
    buildRoleOptions();
    wire();
    var allChip = document.querySelector('.chip[data-sector="all"]');
    if (allChip) allChip.classList.add('active');

    // Show saved jobs instantly (dynamic feel), then fetch & accumulate more.
    var stored = loadStore();
    if (stored && stored.jobs && stored.jobs.length) {
      STATE.jobs = stored.jobs;
      STATE.jobs.forEach(function (j) { j.isNew = false; });
      STATE.diagnostics = stored.diagnostics || [];
      buildCityOptions();
      render(); renderDiagnostics();
      updateCounters(true, 0, STATE.diagnostics.length);
    }
    refresh(false);
    startAuto();
  });

})();
