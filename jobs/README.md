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
- **Anti-copy:** the shipped single-file build ships the JS **base64-encoded** (company list
  and engine are not in plain sight), disables right-click / view-source shortcuts, and prints
  a proprietary notice to the console. These are **deterrents**, not hard security — any code
  that runs in a browser can ultimately be inspected. For real protection, move the fetching to
  a private server. The readable source lives in this `jobs/` folder for your own maintenance.

## Notes / limitations

- Pure voice-BPO giants (Teleperformance, Concentrix, WNS, Genpact) run enterprise portals
  that browsers can't scrape, so they aren't listed. Coverage is companies with India offices
  that expose a public careers feed — which do have many fresher sales/support/BDR/CS roles.
- "Real time" = fetched fresh in the browser on each visit / refresh.
