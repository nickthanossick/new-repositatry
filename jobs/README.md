# CareersTiger Jobs 🐯 — Real-time India Job Portal (Freshers · BPO · Sales)

© 2026 **CareersTiger**. All rights reserved. Proprietary & confidential.

A dependency-free, **browser-only** job portal. It fetches **live openings directly from
hiring companies** in the visitor's browser, filters them to **India + fresher/experienced +
target roles**, and shows an **Apply** button that opens the **company's own application page**.

- ✅ Real jobs, real companies, fetched in real time.
- 🔒 **Password gate** — the board opens only after the password (`Nik@123`) is entered.
- ✅ **Accumulating board** — old jobs stay, new jobs add on every refresh, up to **2000**.
- ✅ **Auto-refresh** pulls fresh openings every ~90 seconds (toggle in the UI).
- ✅ India-only, **freshers first**, heavy on **BPO / customer support / telecalling / sales**.
- ✅ Every apply link = the hiring company's own application page.
- ❌ **No** aggregators (Naukri etc.). **No** LinkedIn apply flow.

## Run it

Pure static files — no build, no server, no keys.

- Open `index.html` in a browser, **or**
- Host the `jobs/` folder on any static host (GitHub Pages works out of the box).

> Jobs load in *your browser*, calling each company's public careers feed directly. If the
> grid stays empty, a corporate network or ad-blocker may be blocking third-party calls —
> try another network.

## Files

| File           | Purpose |
|----------------|---------|
| `index.html`   | Layout, tiger mascot, branding |
| `styles.css`   | Tiger theme |
| `roles.js`     | 30 target roles, India-location vocabulary, fresher/experience signals |
| `companies.js` | Editable source registry |
| `app.js`       | Fetch, India/role filtering, accumulation store, auto-refresh, rendering |

## Adding / fixing companies

Add one line to `companies.js`. Then open **Diagnostics** in the app — it shows each
company's fetch status and how many India-matching jobs it returned. Prune any row that is
**FAILED** or shows **0 matches**.

## How it works

1. **India filter** — a job is kept only if its location matches `india` or a known Indian
   city (`roles.js → INDIA_LOCATIONS`).
2. **Role filter** — the title/department must match one of the 30 role keyword groups.
3. **Experience** — inferred (fresher / experienced / open-to-freshers). The UI defaults to
   **Freshers first**; anything not clearly senior is treated as fresher-friendly.
4. **Accumulation** — fetched jobs merge into a `localStorage` pool (deduped by apply URL),
   newest flagged **NEW**, capped at 500. **Fetch new jobs** / auto-refresh keep adding.

## Login & code protection

- **Login:** password only, `Nik@123`. Checked client-side; a valid session is remembered
  via `sessionStorage` for that browser tab.
- **Anti-copy (hardened build):** the shipped single-file `*-PROTECTED.html` runs the engine
  through a full JavaScript obfuscator — encrypted string array (RC4), control-flow flattening,
  dead-code injection, hexadecimal identifier names, self-defending code, and an **anti-debugger
  trap** that freezes the page the moment DevTools is opened. Right-click / view-source shortcuts
  are blocked and console output is disabled.
- **Honest ceiling:** this is *practically* unreadable — it stops casual copying and frustrates
  even skilled developers — but **no browser code is ever truly un-extractable**: the browser
  must download and run it, so a determined expert can eventually recover the logic. The only way
  to make code genuinely unviewable is to run it on a **private server** and ship the browser just
  data. The readable source lives in this `jobs/` folder for your own maintenance.

## Live ecosystem — hourly backend scraper

Besides the in-browser fetch, a **GitHub Actions workflow** (`.github/workflows/scrape-jobs.yml`)
runs `jobs/scrape.js` **every hour**, server-side (no CORS/limits), and commits the results to
`jobs/data/jobs.json`. The app loads that file on startup (from `./data/jobs.json`, or the
`raw.githubusercontent.com` URL for the standalone build), so the board shows a large,
**always-growing** pool instantly — jobs keep arriving hourly even when no one has the tab open.
The status bar shows `feed updated Xm ago`.

- **Accumulation + retention:** each run merges new postings by apply URL and keeps every job
  seen in the last **21 days** (cap 2000), so the pool climbs toward and holds **1000+** over
  the first hours/days of running.
- **⚠️ GitHub rule:** the hourly `schedule:` cron only fires from the repository's **default
  branch**. On a feature branch it runs on **push** and via **Run workflow** (manual). Merge the
  branch to `main` for the automatic hourly cadence.
- **Single source of truth:** the scraper `require()`s the same `roles.js` + `companies.js` the
  app uses, so the company list, India vocabulary and role keywords never drift.

## Notes / limitations

- Pure voice-BPO giants (Teleperformance, Concentrix, WNS, Genpact) run enterprise portals
  that browsers can't scrape, so they aren't listed. Coverage is companies with India offices
  that expose a public careers feed — which do have many fresher sales/support/BDR/CS roles.
- "Real time" = fetched fresh in the browser on each visit / refresh.
