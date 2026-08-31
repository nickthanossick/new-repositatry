/* companies.js — editable registry of companies whose LIVE jobs we pull.
 *
 * Each entry:  { name, provider, slug, sectors }
 *   provider : 'greenhouse' | 'lever' | 'ashby' | 'smartrecruiters' | 'recruitee'
 *   slug     : the company's board slug on that ATS (the {slug} in the API URL)
 *   sectors  : free-form tags, just for your own reference
 *
 * HOW TO ADD A COMPANY
 *   1. Find their public careers page. If the URL looks like:
 *        boards.greenhouse.io/ACME        -> provider:'greenhouse', slug:'acme'
 *        jobs.lever.co/ACME               -> provider:'lever',      slug:'acme'
 *        jobs.ashbyhq.com/ACME            -> provider:'ashby',      slug:'acme'
 *        careers.smartrecruiters.com/ACME -> provider:'smartrecruiters', slug:'ACME'
 *        acme.recruitee.com               -> provider:'recruitee',  slug:'acme'
 *   2. Add one line below. Save. Refresh the portal.
 *
 * These seeds are a best-effort starting set of India-hiring companies on modern ATS
 * platforms. Some slugs may be stale — open the Diagnostics panel in the app to see which
 * boards returned jobs and prune the dead ones. Every apply link produced from these boards
 * lands on the company's OWN application page (never Naukri / LinkedIn).
 */

window.COMPANIES = [
  /* ---------- Lever ---------- */
  { name: 'LeadSquared',     provider: 'lever', slug: 'leadsquared',   sectors: ['saas','sales','support'] },
  { name: 'BrowserStack',    provider: 'lever', slug: 'browserstack',  sectors: ['saas','sales','support'] },
  { name: 'MindTickle',      provider: 'lever', slug: 'mindtickle',    sectors: ['saas','sales'] },
  { name: 'Netcore Cloud',   provider: 'lever', slug: 'netcore',       sectors: ['saas','sales','support'] },
  { name: 'Whatfix',         provider: 'lever', slug: 'whatfix',       sectors: ['saas','sales','support'] },
  { name: 'Spinny',          provider: 'lever', slug: 'spinny',        sectors: ['auto','sales','ops'] },
  { name: 'Simplilearn',     provider: 'lever', slug: 'simplilearn',   sectors: ['edtech','sales','support'] },
  { name: 'upGrad',          provider: 'lever', slug: 'upgrad',        sectors: ['edtech','sales'] },
  { name: 'MoEngage',        provider: 'lever', slug: 'moengage',      sectors: ['saas','sales','support'] },
  { name: 'CleverTap',       provider: 'lever', slug: 'clevertap',     sectors: ['saas','sales','support'] },

  /* ---------- Greenhouse ---------- */
  { name: 'Postman',         provider: 'greenhouse', slug: 'postman',       sectors: ['saas','sales','support'] },
  { name: 'Hasura',          provider: 'greenhouse', slug: 'hasura',        sectors: ['saas','sales'] },
  { name: 'Innovaccer',      provider: 'greenhouse', slug: 'innovaccer',    sectors: ['health-saas','sales','ops'] },
  { name: 'Gupshup',         provider: 'greenhouse', slug: 'gupshup',       sectors: ['saas','sales','support'] },
  { name: 'Amplitude',       provider: 'greenhouse', slug: 'amplitude',     sectors: ['saas','sales'] },
  { name: 'MongoDB',         provider: 'greenhouse', slug: 'mongodb',       sectors: ['saas','sales'] },
  { name: 'Twilio',          provider: 'greenhouse', slug: 'twilio',        sectors: ['saas','sales','support'] },
  { name: 'Zscaler',         provider: 'greenhouse', slug: 'zscaler',       sectors: ['security','sales','support'] },
  { name: 'HackerRank',      provider: 'greenhouse', slug: 'hackerrank',    sectors: ['saas','sales','support'] },
  { name: 'Coursera',        provider: 'greenhouse', slug: 'coursera',      sectors: ['edtech','sales','support'] },

  /* ---------- Ashby ---------- */
  { name: 'Atlan',           provider: 'ashby', slug: 'atlan',          sectors: ['saas','sales'] },
  { name: 'Zluri',           provider: 'ashby', slug: 'zluri',          sectors: ['saas','sales'] },
  { name: 'SptaTrained',     provider: 'ashby', slug: 'spot',           sectors: ['saas','support'] },
  { name: 'Fountane',        provider: 'ashby', slug: 'fountane',       sectors: ['saas','ops'] },
  { name: 'Nextbillion.ai',  provider: 'ashby', slug: 'nextbillion',    sectors: ['saas','sales'] },
  { name: 'Sprinto',         provider: 'ashby', slug: 'sprinto',        sectors: ['saas','sales','support'] },
  { name: 'Fetch',           provider: 'ashby', slug: 'fetchrewards',   sectors: ['app','support'] },

  /* ---------- SmartRecruiters ---------- */
  { name: 'Publicis Sapient', provider: 'smartrecruiters', slug: 'PublicisSapient', sectors: ['it-services','ops','support'] },
  { name: 'Bosch',            provider: 'smartrecruiters', slug: 'BoschGroup',      sectors: ['engineering','ops','support'] },
  { name: 'Visa',             provider: 'smartrecruiters', slug: 'Visa',            sectors: ['fintech','sales','support'] },
  { name: 'Ubisoft',          provider: 'smartrecruiters', slug: 'Ubisoft2',        sectors: ['gaming','support'] },

  /* ---------- Recruitee ---------- */
  { name: 'Chargebee',       provider: 'recruitee', slug: 'chargebee',     sectors: ['saas','sales','support'] },
  { name: 'Toddle',          provider: 'recruitee', slug: 'toddle',        sectors: ['edtech','sales','support'] }
];
