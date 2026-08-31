/* app.js — the engine.
 * Fetches live jobs from company ATS boards (in the visitor's browser), normalizes them to
 * a common shape, filters to India + target roles + fresher/experience, and renders cards.
 *
 * No backend, no API keys. Every apply link points at the company's own ATS application page.
 */
(function () {
  'use strict';

  var CACHE_KEY = 'india_jobs_cache_v1';
  var CACHE_TTL_MS = 15 * 60 * 1000;   // 15 minutes
  var FETCH_TIMEOUT_MS = 12000;
  var CONCURRENCY = 6;

  /* Runtime state */
  var STATE = {
    jobs: [],                 // all normalized + India-filtered jobs
    diagnostics: [],          // per-company fetch status
    filters: { experience: 'fresher', sector: 'all', role: 'all', city: 'all', q: '' },
    loading: false
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

  /* Run tasks with bounded concurrency. tasks = array of functions returning promises. */
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

  /* ---------------- India / role / experience classification ---------------- */

  function isIndiaLocation(locText) {
    var t = lc(locText);
    if (!t) return false;
    var i, hit = false;
    for (i = 0; i < window.INDIA_LOCATIONS.length; i++) {
      if (t.indexOf(window.INDIA_LOCATIONS[i]) !== -1) { hit = true; break; }
    }
    if (!hit) return false;
    // A city can be ambiguous only rarely; if the text also names a foreign country,
    // require that "india" itself appears to keep it.
    for (i = 0; i < window.NON_INDIA_HINTS.length; i++) {
      if (t.indexOf(window.NON_INDIA_HINTS[i]) !== -1) {
        return t.indexOf('india') !== -1;
      }
    }
    return true;
  }

  /* Return array of matching role ids for a job's searchable text. */
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
    // Title signals win first.
    for (i = 0; i < window.EXPERIENCED_HINTS.length; i++) {
      if (t.indexOf(window.EXPERIENCED_HINTS[i]) !== -1) return 'experienced';
    }
    for (i = 0; i < window.FRESHER_HINTS.length; i++) {
      if (t.indexOf(window.FRESHER_HINTS[i]) !== -1) return 'fresher';
    }
    // Then body.
    for (i = 0; i < window.FRESHER_HINTS.length; i++) {
      if (b.indexOf(window.FRESHER_HINTS[i]) !== -1) return 'fresher';
    }
    for (i = 0; i < window.EXPERIENCED_HINTS.length; i++) {
      if (b.indexOf(window.EXPERIENCED_HINTS[i]) !== -1) return 'experienced';
    }
    return 'unknown';
  }

  /* Detect the city label to show (first India location keyword found, title-cased). */
  function cityOf(locText) {
    var t = lc(locText);
    var priority = ['bengaluru','bangalore','mumbai','delhi','gurugram','gurgaon','noida',
      'hyderabad','pune','chennai','kolkata','ahmedabad','jaipur','indore','chandigarh',
      'coimbatore','kochi','remote'];
    for (var i = 0; i < priority.length; i++) {
      if (t.indexOf(priority[i]) !== -1) {
        return priority[i].charAt(0).toUpperCase() + priority[i].slice(1);
      }
    }
    if (t.indexOf('india') !== -1) return 'India';
    return locText || '—';
  }

  /* ---------------- provider adapters ----------------
   * Each returns a promise of { jobs:[...], status, count }.
   * A normalized job: { id, title, company, location, department, applyUrl, provider, postedAt, rawText }
   */

  function adaptGreenhouse(co) {
    var url = 'https://boards-api.greenhouse.io/v1/boards/' + encodeURIComponent(co.slug) + '/jobs?content=true';
    return timeoutFetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (data) {
      var list = (data && data.jobs) || [];
      var jobs = list.map(function (j) {
        var loc = (j.location && j.location.name) || '';
        return {
          id: co.provider + ':' + co.slug + ':' + j.id,
          title: j.title || '',
          company: co.name,
          location: loc,
          department: (j.departments && j.departments[0] && j.departments[0].name) || '',
          applyUrl: j.absolute_url,
          provider: 'greenhouse',
          postedAt: j.updated_at || j.first_published || null,
          rawText: stripHtml(j.content || '')
        };
      });
      return { jobs: jobs, status: 200, count: jobs.length };
    });
  }

  function adaptLever(co) {
    var url = 'https://api.lever.co/v0/postings/' + encodeURIComponent(co.slug) + '?mode=json';
    return timeoutFetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (list) {
      list = list || [];
      var jobs = list.map(function (j) {
        var cats = j.categories || {};
        return {
          id: co.provider + ':' + co.slug + ':' + j.id,
          title: j.text || '',
          company: co.name,
          location: cats.location || '',
          department: cats.team || cats.department || '',
          applyUrl: j.hostedUrl || j.applyUrl,
          provider: 'lever',
          postedAt: j.createdAt ? new Date(j.createdAt).toISOString() : null,
          rawText: stripHtml(j.descriptionPlain || j.description || '')
        };
      });
      return { jobs: jobs, status: 200, count: jobs.length };
    });
  }

  function adaptAshby(co) {
    var url = 'https://api.ashbyhq.com/posting-api/job-board/' + encodeURIComponent(co.slug) + '?includeCompensation=false';
    return timeoutFetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (data) {
      var list = (data && data.jobs) || [];
      var jobs = list.map(function (j) {
        return {
          id: co.provider + ':' + co.slug + ':' + j.id,
          title: j.title || '',
          company: co.name,
          location: j.location || (j.address && j.address.postalAddress && j.address.postalAddress.addressLocality) || '',
          department: j.department || j.team || '',
          applyUrl: j.jobUrl || j.applyUrl,
          provider: 'ashby',
          postedAt: j.publishedAt || null,
          rawText: stripHtml(j.descriptionHtml || j.descriptionPlain || '')
        };
      });
      return { jobs: jobs, status: 200, count: jobs.length };
    });
  }

  function adaptSmartRecruiters(co) {
    var url = 'https://api.smartrecruiters.com/v1/companies/' + encodeURIComponent(co.slug) + '/postings?limit=100';
    return timeoutFetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (data) {
      var list = (data && data.content) || [];
      var jobs = list.map(function (j) {
        var loc = j.location || {};
        var locStr = [loc.city, loc.region, loc.country].filter(Boolean).join(', ');
        return {
          id: co.provider + ':' + co.slug + ':' + j.id,
          title: (j.name) || '',
          company: co.name,
          location: locStr,
          department: (j.department && j.department.label) || (j.function && j.function.label) || '',
          // Public, direct application page on the company's SmartRecruiters careers site:
          applyUrl: j.ref || ('https://jobs.smartrecruiters.com/' + co.slug + '/' + j.id),
          provider: 'smartrecruiters',
          postedAt: j.releasedDate || null,
          rawText: (j.name || '')
        };
      });
      return { jobs: jobs, status: 200, count: jobs.length };
    });
  }

  function adaptRecruitee(co) {
    var url = 'https://' + encodeURIComponent(co.slug) + '.recruitee.com/api/offers/';
    return timeoutFetch(url).then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (data) {
      var list = (data && data.offers) || [];
      var jobs = list.map(function (j) {
        var loc = j.location || [j.city, j.country].filter(Boolean).join(', ');
        return {
          id: co.provider + ':' + co.slug + ':' + j.id,
          title: j.title || '',
          company: co.name,
          location: loc,
          department: j.department || '',
          applyUrl: j.careers_url || j.careers_apply_url,
          provider: 'recruitee',
          postedAt: j.published_at || null,
          rawText: stripHtml(j.description || '')
        };
      });
      return { jobs: jobs, status: 200, count: jobs.length };
    });
  }

  var ADAPTERS = {
    greenhouse: adaptGreenhouse,
    lever: adaptLever,
    ashby: adaptAshby,
    smartrecruiters: adaptSmartRecruiters,
    recruitee: adaptRecruitee
  };

  /* ---------------- fetch orchestration ---------------- */

  function fetchAll() {
    var companies = window.COMPANIES || [];
    var tasks = companies.map(function (co) {
      return function () {
        var adapter = ADAPTERS[co.provider];
        if (!adapter) {
          return Promise.resolve({ co: co, jobs: [], status: 'no-adapter', count: 0, ok: false });
        }
        return adapter(co).then(function (r) {
          return { co: co, jobs: r.jobs, status: r.status, count: r.count, ok: true };
        }).catch(function (e) {
          return { co: co, jobs: [], status: (e && e.message) || 'error', count: 0, ok: false };
        });
      };
    });

    return pool(tasks, CONCURRENCY).then(function (results) {
      var all = [];
      var diags = [];
      var kept = 0;
      results.forEach(function (r) {
        if (!r) return;
        var indiaCount = 0;
        r.jobs.forEach(function (j) {
          if (!j.applyUrl) return;
          var text = j.title + ' ' + j.department + ' ' + j.rawText;
          if (!isIndiaLocation(j.location) && !isIndiaLocation(j.rawText.slice(0, 400))) return;
          var roleTags = matchRoles(j.title + ' ' + j.department);
          if (!roleTags.length) return;               // keep the board focused on target roles
          j.roleTags = roleTags;
          j.experience = classifyExperience(j.title, j.rawText);
          j.city = cityOf(j.location);
          all.push(j);
          indiaCount++;
        });
        kept += indiaCount;
        diags.push({
          company: r.co.name, provider: r.co.provider, slug: r.co.slug,
          ok: r.ok, status: r.status, raw: r.count, matched: indiaCount
        });
      });
      // De-duplicate by applyUrl.
      var seen = {}, deduped = [];
      all.forEach(function (j) {
        if (seen[j.applyUrl]) return;
        seen[j.applyUrl] = true; deduped.push(j);
      });
      STATE.jobs = deduped;
      STATE.diagnostics = diags;
      return { jobs: deduped, diagnostics: diags };
    });
  }

  /* ---------------- caching ---------------- */

  function saveCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        t: Date.now(), jobs: STATE.jobs, diagnostics: STATE.diagnostics
      }));
    } catch (e) { /* storage may be unavailable */ }
  }

  function loadCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || (Date.now() - obj.t) > CACHE_TTL_MS) return null;
      return obj;
    } catch (e) { return null; }
  }

  /* ---------------- filtering + rendering ---------------- */

  function applyFilters() {
    var f = STATE.filters;
    var sectorRoleIds = null;
    if (f.sector !== 'all' && window.SECTORS[f.sector]) {
      sectorRoleIds = window.SECTORS[f.sector].roleIds;
    }
    var q = lc(f.q).trim();

    return STATE.jobs.filter(function (j) {
      if (f.experience === 'fresher' && j.experience === 'experienced') return false;
      if (f.experience === 'experienced' && j.experience !== 'experienced') return false;
      if (f.role !== 'all' && j.roleTags.indexOf(f.role) === -1) return false;
      if (sectorRoleIds) {
        var inSector = j.roleTags.some(function (id) { return sectorRoleIds.indexOf(id) !== -1; });
        if (!inSector) return false;
      }
      if (f.city !== 'all' && lc(j.city) !== lc(f.city)) return false;
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

  function fmtDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    var days = Math.floor((Date.now() - d.getTime()) / 86400000);
    if (days <= 0) return 'today';
    if (days === 1) return '1 day ago';
    if (days < 30) return days + ' days ago';
    var mo = Math.floor(days / 30);
    return mo + (mo === 1 ? ' month ago' : ' months ago');
  }

  function esc(s) {
    return (s == null ? '' : String(s)).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function providerHost(p) {
    return {
      greenhouse: 'boards.greenhouse.io', lever: 'jobs.lever.co', ashby: 'jobs.ashbyhq.com',
      smartrecruiters: 'jobs.smartrecruiters.com', recruitee: 'recruitee.com'
    }[p] || p;
  }

  function render() {
    var list = applyFilters();
    var grid = el('grid');
    el('resultCount').textContent = list.length;

    if (!list.length) {
      grid.innerHTML = '<div class="empty">No matching live jobs right now. Try switching to ' +
        '<b>All</b> experience, clearing the role/city filter, or hitting Refresh.</div>';
      return;
    }

    // Freshers first, then most recent.
    list.sort(function (a, b) {
      var af = a.experience === 'fresher' ? 0 : 1, bf = b.experience === 'fresher' ? 0 : 1;
      if (af !== bf) return af - bf;
      return (new Date(b.postedAt || 0)) - (new Date(a.postedAt || 0));
    });

    var html = list.map(function (j) {
      var badge = j.experience === 'fresher'
        ? '<span class="badge fresher">Fresher-friendly</span>'
        : (j.experience === 'experienced' ? '<span class="badge exp">Experienced</span>' : '');
      var tags = j.roleTags.slice(0, 2).map(function (id) {
        return '<span class="tag">' + esc(roleLabel(id)) + '</span>';
      }).join('');
      var posted = fmtDate(j.postedAt);
      return '' +
        '<article class="card">' +
          '<div class="card-top">' +
            '<h3 class="job-title">' + esc(j.title) + '</h3>' + badge +
          '</div>' +
          '<div class="company">' + esc(j.company) + '</div>' +
          '<div class="meta">' +
            '<span class="loc">📍 ' + esc(j.city || j.location) + '</span>' +
            (posted ? '<span class="dot">·</span><span class="posted">' + esc(posted) + '</span>' : '') +
          '</div>' +
          '<div class="tags">' + tags + '</div>' +
          '<div class="card-foot">' +
            '<span class="src">Applies on <b>' + esc(providerHost(j.provider)) + '</b></span>' +
            '<a class="apply" href="' + esc(j.applyUrl) + '" target="_blank" rel="noopener noreferrer">Apply on company site →</a>' +
          '</div>' +
        '</article>';
    }).join('');

    grid.innerHTML = html;
  }

  /* ---------------- diagnostics panel ---------------- */

  function renderDiagnostics() {
    var box = el('diagBody');
    if (!STATE.diagnostics.length) { box.innerHTML = '<div class="empty">No data yet.</div>'; return; }
    var rows = STATE.diagnostics.slice().sort(function (a, b) { return b.matched - a.matched; })
      .map(function (d) {
        var cls = d.ok ? (d.matched > 0 ? 'ok' : 'warn') : 'err';
        var status = d.ok ? ('HTTP 200 · ' + d.raw + ' total') : ('FAILED · ' + esc(d.status));
        return '<tr class="' + cls + '">' +
          '<td>' + esc(d.company) + '</td>' +
          '<td>' + esc(d.provider) + '</td>' +
          '<td>' + esc(d.slug) + '</td>' +
          '<td>' + status + '</td>' +
          '<td class="num">' + d.matched + '</td>' +
        '</tr>';
      }).join('');
    box.innerHTML = '<table class="diag"><thead><tr><th>Company</th><th>ATS</th><th>Slug</th>' +
      '<th>Fetch status</th><th>India matches</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  /* ---------------- UI wiring ---------------- */

  function buildRoleOptions() {
    var sel = el('roleFilter');
    var html = '<option value="all">All target roles</option>';
    window.ROLES.forEach(function (r) { html += '<option value="' + r.id + '">' + esc(r.label) + '</option>'; });
    sel.innerHTML = html;
  }

  function buildCityOptions() {
    var cities = {};
    STATE.jobs.forEach(function (j) { if (j.city) cities[j.city] = true; });
    var sel = el('cityFilter');
    var keys = Object.keys(cities).sort();
    var html = '<option value="all">All cities</option>';
    keys.forEach(function (c) { html += '<option value="' + esc(c) + '">' + esc(c) + '</option>'; });
    sel.innerHTML = html;
  }

  function setStatus(msg, spinning) {
    el('status').innerHTML = (spinning ? '<span class="spin"></span> ' : '') + esc(msg);
  }

  function refresh(useCache) {
    if (STATE.loading) return;
    STATE.loading = true;
    el('refreshBtn').disabled = true;
    setStatus('Scanning ' + (window.COMPANIES || []).length + ' company career boards…', true);

    var cached = useCache ? loadCache() : null;
    if (cached) {
      STATE.jobs = cached.jobs || [];
      STATE.diagnostics = cached.diagnostics || [];
      buildCityOptions();
      render(); renderDiagnostics();
      finishStatus(true);
      STATE.loading = false;
      el('refreshBtn').disabled = false;
      return;
    }

    fetchAll().then(function () {
      buildCityOptions();
      render(); renderDiagnostics();
      saveCache();
      finishStatus(false);
    }).catch(function (e) {
      setStatus('Something went wrong while fetching. Try Refresh.', false);
    }).finally(function () {
      STATE.loading = false;
      el('refreshBtn').disabled = false;
    });
  }

  function finishStatus(fromCache) {
    var boards = STATE.diagnostics.length;
    var live = STATE.diagnostics.filter(function (d) { return d.ok && d.matched > 0; }).length;
    el('coScanned').textContent = boards;
    el('coLive').textContent = live;
    el('jobsFound').textContent = STATE.jobs.length;
    setStatus((fromCache ? 'Loaded from recent cache' : 'Live') + ' · ' +
      STATE.jobs.length + ' India jobs from ' + live + '/' + boards + ' boards', false);
  }

  function wire() {
    el('experienceFilter').addEventListener('change', function (e) { STATE.filters.experience = e.target.value; render(); });
    el('roleFilter').addEventListener('change', function (e) { STATE.filters.role = e.target.value; render(); });
    el('cityFilter').addEventListener('change', function (e) { STATE.filters.city = e.target.value; render(); });
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
    el('diagToggle').addEventListener('click', function () {
      var p = el('diagPanel');
      p.hidden = !p.hidden;
      el('diagToggle').textContent = p.hidden ? 'Diagnostics' : 'Hide diagnostics';
    });
  }

  /* ---------------- boot ---------------- */

  document.addEventListener('DOMContentLoaded', function () {
    buildRoleOptions();
    wire();
    // default sector chip = All
    var allChip = document.querySelector('.chip[data-sector="all"]');
    if (allChip) allChip.classList.add('active');
    refresh(true);   // use cache on first load for speed; user can hit Refresh for live
  });

})();
