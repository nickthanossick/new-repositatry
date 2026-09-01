/*!
 * CareersTiger Jobs — server-side scraper (© 2026 CareersTiger).
 *
 * Runs in GitHub Actions (Node 20, global fetch) every hour. Unlike the browser,
 * this has no CORS limits, so it reliably hits every company's public ATS feed,
 * filters to India + target roles, and ACCUMULATES results into data/jobs.json
 * (old-but-recent jobs stay; new jobs add on; anything unseen for 21 days is pruned).
 *
 * Single source of truth: it require()s the SAME roles.js + companies.js the app
 * uses, so the company list, India vocabulary and role keywords never drift.
 */
'use strict';

const fs = require('fs');
const path = require('path');

// The app's data files assign to window.* — shim a window object then load them.
global.window = {};
require('./roles.js');       // window.ROLES, INDIA_LOCATIONS, NON_INDIA_HINTS, FRESHER/EXPERIENCED_HINTS
require('./companies.js');   // window.COMPANIES
const {
  ROLES, INDIA_LOCATIONS, NON_INDIA_HINTS, FRESHER_HINTS, EXPERIENCED_HINTS, COMPANIES
} = global.window;

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'jobs.json');
const FETCH_TIMEOUT_MS = 15000;
const CONCURRENCY = 12;         // server-side: fetch aggressively
const MAX_JOBS = 2000;
const RETENTION_DAYS = 21;      // drop jobs not seen for this long

/* ---------------- shared pure logic (mirrors app.js) ---------------- */
function lc(s) { return (s == null ? '' : String(s)).toLowerCase(); }

// A usable apply link = real http(s) to a candidate-facing page (not an API/JSON endpoint).
function goodApplyUrl(u) {
  return typeof u === 'string' && /^https?:\/\//.test(u) &&
    u.indexOf('api.smartrecruiters.com') === -1 &&
    u.indexOf('boards-api.greenhouse.io') === -1;
}

function stripHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ').trim();
}

function isIndiaLocation(locText) {
  const t = lc(locText); if (!t) return false;
  for (let i = 0; i < NON_INDIA_HINTS.length; i++) if (t.indexOf(NON_INDIA_HINTS[i]) !== -1) return false;
  for (let i = 0; i < INDIA_LOCATIONS.length; i++) if (t.indexOf(INDIA_LOCATIONS[i]) !== -1) return true;
  return false;
}

function matchRoles(text) {
  const t = lc(text), out = [];
  for (let r = 0; r < ROLES.length; r++) {
    const kws = ROLES[r].keywords;
    for (let k = 0; k < kws.length; k++) {
      if (t.indexOf(kws[k]) !== -1) { out.push(ROLES[r].id); break; }
    }
  }
  return out;
}

function classifyExperience(title, body) {
  const t = lc(title), b = lc(body);
  for (let i = 0; i < EXPERIENCED_HINTS.length; i++) if (t.indexOf(EXPERIENCED_HINTS[i]) !== -1) return 'experienced';
  for (let i = 0; i < FRESHER_HINTS.length; i++) if (t.indexOf(FRESHER_HINTS[i]) !== -1) return 'fresher';
  for (let i = 0; i < FRESHER_HINTS.length; i++) if (b.indexOf(FRESHER_HINTS[i]) !== -1) return 'fresher';
  for (let i = 0; i < EXPERIENCED_HINTS.length; i++) if (b.indexOf(EXPERIENCED_HINTS[i]) !== -1) return 'experienced';
  return 'unknown';
}

function cityOf(locText) {
  const t = lc(locText);
  const priority = ['bengaluru','bangalore','mumbai','delhi','gurugram','gurgaon','noida',
    'hyderabad','pune','chennai','kolkata','ahmedabad','jaipur','indore','chandigarh',
    'coimbatore','kochi','remote'];
  for (let i = 0; i < priority.length; i++) {
    if (t.indexOf(priority[i]) !== -1) return priority[i].charAt(0).toUpperCase() + priority[i].slice(1);
  }
  if (t.indexOf('india') !== -1) return 'India';
  return locText || '—';
}

/* ---------------- fetch helpers ---------------- */
function timeoutFetch(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  return fetch(url, { signal: ctrl.signal, headers: { 'Accept': 'application/json', 'User-Agent': 'CareersTiger/1.0' } })
    .finally(() => clearTimeout(timer));
}

function pool(tasks, limit) {
  return new Promise((resolve) => {
    let i = 0, active = 0, done = 0; const results = [];
    if (!tasks.length) return resolve(results);
    function next() {
      while (active < limit && i < tasks.length) {
        ((idx) => {
          active++;
          tasks[idx]().then(r => { results[idx] = r; })
            .catch(e => { results[idx] = { error: e }; })
            .finally(() => { active--; done++; if (done === tasks.length) resolve(results); else next(); });
        })(i++);
      }
    }
    next();
  });
}

/* ---------------- provider adapters (same endpoints/fields as app.js) ---------------- */
function adaptGreenhouse(co) {
  const url = 'https://boards-api.greenhouse.io/v1/boards/' + encodeURIComponent(co.slug) + '/jobs?content=true';
  return timeoutFetch(url).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(data => {
      const list = (data && data.jobs) || [];
      return { jobs: list.map(j => ({
        id: co.provider + ':' + co.slug + ':' + j.id, title: j.title || '', company: co.name,
        location: (j.location && j.location.name) || '',
        department: (j.departments && j.departments[0] && j.departments[0].name) || '',
        applyUrl: j.absolute_url, postedAt: j.updated_at || j.first_published || null,
        rawText: stripHtml(j.content || '') })), count: list.length };
    });
}
function adaptLever(co) {
  const url = 'https://api.lever.co/v0/postings/' + encodeURIComponent(co.slug) + '?mode=json';
  return timeoutFetch(url).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(list => {
      list = list || [];
      return { jobs: list.map(j => {
        const cats = j.categories || {};
        return { id: co.provider + ':' + co.slug + ':' + j.id, title: j.text || '', company: co.name,
          location: cats.location || '', department: cats.team || cats.department || '',
          applyUrl: j.hostedUrl || j.applyUrl, postedAt: j.createdAt ? new Date(j.createdAt).toISOString() : null,
          rawText: stripHtml(j.descriptionPlain || j.description || '') };
      }), count: list.length };
    });
}
function adaptAshby(co) {
  const url = 'https://api.ashbyhq.com/posting-api/job-board/' + encodeURIComponent(co.slug) + '?includeCompensation=false';
  return timeoutFetch(url).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(data => {
      const list = (data && data.jobs) || [];
      return { jobs: list.map(j => ({
        id: co.provider + ':' + co.slug + ':' + j.id, title: j.title || '', company: co.name,
        location: j.location || (j.address && j.address.postalAddress && j.address.postalAddress.addressLocality) || '',
        department: j.department || j.team || '', applyUrl: j.jobUrl || j.applyUrl,
        postedAt: j.publishedAt || null, rawText: stripHtml(j.descriptionHtml || j.descriptionPlain || '') })), count: list.length };
    });
}
function adaptSmartRecruiters(co) {
  const url = 'https://api.smartrecruiters.com/v1/companies/' + encodeURIComponent(co.slug) + '/postings?limit=100';
  return timeoutFetch(url).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(data => {
      const list = (data && data.content) || [];
      return { jobs: list.map(j => {
        const loc = j.location || {};
        const locStr = [loc.city, loc.region, loc.country].filter(Boolean).join(', ');
        return { id: co.provider + ':' + co.slug + ':' + j.id, title: j.name || '', company: co.name,
          location: locStr, department: (j.department && j.department.label) || (j.function && j.function.label) || '',
          // Public posting page (NOT j.ref — that is the API URL, which opens raw JSON).
          applyUrl: 'https://jobs.smartrecruiters.com/' + co.slug + '/' + j.id,
          postedAt: j.releasedDate || null, rawText: (j.name || '') };
      }), count: list.length };
    });
}
function adaptRecruitee(co) {
  const url = 'https://' + encodeURIComponent(co.slug) + '.recruitee.com/api/offers/';
  return timeoutFetch(url).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(data => {
      const list = (data && data.offers) || [];
      return { jobs: list.map(j => ({
        id: co.provider + ':' + co.slug + ':' + j.id, title: j.title || '', company: co.name,
        location: j.location || [j.city, j.country].filter(Boolean).join(', '), department: j.department || '',
        applyUrl: j.careers_url || j.careers_apply_url, postedAt: j.published_at || null,
        rawText: stripHtml(j.description || '') })), count: list.length };
    });
}
function adaptWorkable(co) {
  const url = 'https://apply.workable.com/api/v3/accounts/' + encodeURIComponent(co.slug) + '/jobs';
  return timeoutFetch(url).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(data => {
      const list = (data && (data.results || data.jobs)) || [];
      return { jobs: list.map(j => {
        const loc = j.location || {};
        const locStr = typeof loc === 'string' ? loc : [loc.city, loc.region, loc.country].filter(Boolean).join(', ');
        const code = j.shortcode || j.id;
        return { id: co.provider + ':' + co.slug + ':' + code, title: j.title || '', company: co.name,
          location: locStr, department: j.department || '',
          applyUrl: j.url || j.application_url || ('https://apply.workable.com/' + co.slug + '/j/' + code + '/'),
          postedAt: j.published_on || j.created_at || null, rawText: stripHtml(j.description || '') };
      }), count: list.length };
    });
}
const ADAPTERS = { greenhouse: adaptGreenhouse, lever: adaptLever, ashby: adaptAshby,
  smartrecruiters: adaptSmartRecruiters, recruitee: adaptRecruitee, workable: adaptWorkable };

/* ---------------- scrape + filter ---------------- */
function fetchAll() {
  const tasks = COMPANIES.map(co => () => {
    const adapter = ADAPTERS[co.provider];
    if (!adapter) return Promise.resolve({ co, jobs: [], status: 'no-adapter', count: 0, ok: false });
    return adapter(co).then(r => ({ co, jobs: r.jobs, status: 200, count: r.count, ok: true }))
      .catch(e => ({ co, jobs: [], status: (e && e.message) || 'error', count: 0, ok: false }));
  });
  return pool(tasks, CONCURRENCY).then(results => {
    const fresh = [], diags = [];
    results.forEach(r => {
      if (!r) return;
      let matched = 0;
      r.jobs.forEach(j => {
        if (!goodApplyUrl(j.applyUrl)) return;                    // usable, candidate-facing link only
        if (!isIndiaLocation(j.location)) return;                 // India-only
        const roleTags = matchRoles(j.title + ' ' + j.department);
        if (!roleTags.length) return;                             // must match a target role
        fresh.push({
          id: j.id, title: j.title, company: j.company, location: j.location,
          department: j.department, applyUrl: j.applyUrl, postedAt: j.postedAt,
          roleTags, experience: classifyExperience(j.title, j.rawText || ''),
          city: cityOf(j.location)
        });
        matched++;
      });
      diags.push({ company: r.co.name, ok: r.ok, status: r.status, raw: r.count, matched });
    });
    return { fresh, diags };
  });
}

/* ---------------- accumulate + retention ---------------- */
function loadExisting() {
  try { return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); }
  catch (e) { return { jobs: [] }; }
}

function main() {
  const nowIso = new Date().toISOString();
  const now = Date.now();
  const prev = loadExisting();
  const byUrl = {};
  (prev.jobs || []).forEach(j => { if (j.applyUrl) byUrl[j.applyUrl] = j; });

  return fetchAll().then(({ fresh, diags }) => {
    let added = 0, refreshed = 0;
    fresh.forEach(j => {
      const ex = byUrl[j.applyUrl];
      if (ex) {
        // keep firstSeen; refresh mutable fields + lastSeen
        ex.title = j.title; ex.company = j.company; ex.location = j.location;
        ex.city = j.city; ex.department = j.department; ex.roleTags = j.roleTags;
        ex.experience = j.experience; ex.postedAt = j.postedAt; ex.lastSeen = nowIso;
        refreshed++;
      } else {
        j.firstSeen = nowIso; j.lastSeen = nowIso;
        byUrl[j.applyUrl] = j; added++;
      }
    });

    // ONLY-OPEN policy: if a job's company was scraped successfully THIS run but the job
    // was not in the results, the listing has closed → drop it (so no dead/404 apply links).
    // Jobs whose company failed this run (transient network/CORS) are kept until it succeeds.
    // A hard safety cutoff removes anything unseen for RETENTION_DAYS (dead board).
    const okCos = {};
    diags.forEach(d => { if (d.ok) okCos[d.company] = 1; });
    const hardCutoff = now - RETENTION_DAYS * 86400000;
    let jobs = Object.keys(byUrl).map(u => byUrl[u]).filter(j => {
      if (okCos[j.company] && j.lastSeen !== nowIso) return false;   // closed listing
      const seen = Date.parse(j.lastSeen || j.firstSeen || nowIso);
      return isNaN(seen) ? true : seen >= hardCutoff;
    });

    // newest first, cap
    jobs.sort((a, b) => Date.parse(b.firstSeen || 0) - Date.parse(a.firstSeen || 0));
    if (jobs.length > MAX_JOBS) jobs = jobs.slice(0, MAX_JOBS);

    const liveCompanies = diags.filter(d => d.ok && d.matched > 0).length;
    const out = {
      generatedAt: nowIso,
      count: jobs.length,
      added, refreshed,
      companiesScanned: diags.length,
      companiesLive: liveCompanies,
      jobs,
      diagnostics: diags.sort((a, b) => b.matched - a.matched)
    };

    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(out, null, 0));
    console.log(`[scrape] total=${jobs.length} (+${added} new, ${refreshed} refreshed) · live boards=${liveCompanies}/${diags.length}`);
  });
}

main().catch(e => { console.error('[scrape] fatal', e); process.exit(1); });
