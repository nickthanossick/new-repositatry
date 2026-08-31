# ApplyDirect — Real-time India Job Portal (Freshers · BPO · Sales)

A dependency-free, **browser-only** job portal. It fetches **live openings straight from
company Applicant Tracking Systems** (Greenhouse, Lever, Ashby, SmartRecruiters, Recruitee)
in the visitor's browser, filters them to **India + fresher/experienced + target roles**,
and shows an **Apply** button that opens the **company's own application page**.

- ✅ Real jobs, real companies, fetched in real time (no stale database).
- ✅ India-only, freshers-first, heavy on **BPO / customer support / telecalling / sales**.
- ✅ Every apply link = the hiring company's own ATS application page.
- ❌ **No** Naukri or other aggregators. **No** LinkedIn apply flow.

## Run it

It is pure static files — no build, no server, no keys.

- Open `index.html` directly in a browser, **or**
- Host the `jobs/` folder on any static host (GitHub Pages works out of the box).

> The jobs load in *your browser*, calling each company's public ATS API directly. These
> APIs are CORS-enabled, which is why no backend is needed. (Note: some corporate networks
> or ad-blockers may block third-party API calls — if the grid is empty, try another network.)

## Files

| File           | Purpose |
|----------------|---------|
| `index.html`   | Layout shell |
| `styles.css`   | Styling |
| `roles.js`     | The 30 target roles, India-location vocabulary, fresher/experience signals |
| `companies.js` | The editable registry of companies + which ATS they use |
| `app.js`       | Fetch adapters, India/role filtering, rendering, diagnostics |

## Adding / fixing companies

Open `companies.js` and add one line. Map the company's careers URL to a provider + slug:

| Careers URL looks like                | provider          | slug |
|---------------------------------------|-------------------|------|
| `boards.greenhouse.io/acme`           | `greenhouse`      | `acme` |
| `jobs.lever.co/acme`                  | `lever`           | `acme` |
| `jobs.ashbyhq.com/acme`               | `ashby`           | `acme` |
| `careers.smartrecruiters.com/Acme`    | `smartrecruiters` | `Acme` |
| `acme.recruitee.com`                  | `recruitee`       | `acme` |

Then click **Diagnostics** in the app: it shows each board's fetch status and how many
India-matching jobs it returned. Prune any row that is **FAILED** or shows **0 India matches**.

## How filtering works (in `app.js`)

1. **India filter** — a job is kept only if its location matches `india` or a known Indian
   city (`roles.js → INDIA_LOCATIONS`). Foreign locations are dropped.
2. **Role filter** — the title/department must match one of the 30 role keyword groups
   (`roles.js → ROLES`), keeping the board focused on BPO/support/sales.
3. **Experience** — inferred (fresher / experienced / unknown) from title & description.
   The UI toggle defaults to **Freshers**.
4. **Sector chips** — BPO/Support vs Sales/BD, plus free-text search, city and role dropdowns.

## Honest limitations

- Pure voice-BPO giants (Teleperformance, Concentrix, WNS, Genpact) run enterprise portals
  that browsers can't scrape, so they are **not** listed. Coverage is companies on the five
  modern ATS platforms with India offices — which do have many fresher sales/support/BDR/CS
  roles.
- "Real time" = fetched fresh in the browser on each visit / **Refresh**. A 15-minute
  `localStorage` cache speeds up reloads; **Refresh** always re-fetches live.
