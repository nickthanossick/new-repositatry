/*!
 * CareersTiger Jobs — © 2026 CareersTiger. All rights reserved.
 * Proprietary and confidential. Unauthorized copying or distribution is prohibited.
 *
 * Source registry — the companies whose LIVE openings CareersTiger collects.
 * Each entry: { name, provider, slug, sectors }
 *   provider : internal fetch adapter key
 *   slug     : the company's board identifier on that system
 *   sectors  : free-form tags for your own reference
 *
 * To add a company, map its public careers URL to a provider + slug and add one line.
 * Open the in-app Diagnostics panel to see which companies returned jobs and prune the rest.
 * Every apply link produced here lands on the company's OWN application page.
 */
window.COMPANIES = [
  /* ---- group A ---- */
  { name: 'LeadSquared',      provider: 'lever', slug: 'leadsquared',   sectors: ['saas','sales','support'] },
  { name: 'BrowserStack',     provider: 'lever', slug: 'browserstack',  sectors: ['saas','sales','support'] },
  { name: 'MindTickle',       provider: 'lever', slug: 'mindtickle',    sectors: ['saas','sales'] },
  { name: 'Netcore Cloud',    provider: 'lever', slug: 'netcore',       sectors: ['saas','sales','support'] },
  { name: 'Whatfix',          provider: 'lever', slug: 'whatfix',       sectors: ['saas','sales','support'] },
  { name: 'Spinny',           provider: 'lever', slug: 'spinny',        sectors: ['auto','sales','ops'] },
  { name: 'Simplilearn',      provider: 'lever', slug: 'simplilearn',   sectors: ['edtech','sales','support'] },
  { name: 'upGrad',           provider: 'lever', slug: 'upgrad',        sectors: ['edtech','sales'] },
  { name: 'MoEngage',         provider: 'lever', slug: 'moengage',      sectors: ['saas','sales','support'] },
  { name: 'CleverTap',        provider: 'lever', slug: 'clevertap',     sectors: ['saas','sales','support'] },
  { name: 'Locus',            provider: 'lever', slug: 'locus',         sectors: ['saas','ops'] },
  { name: 'Vymo',             provider: 'lever', slug: 'vymo',          sectors: ['saas','sales'] },
  { name: 'Capillary',        provider: 'lever', slug: 'capillary',     sectors: ['saas','sales','support'] },
  { name: 'Yellow.ai',        provider: 'lever', slug: 'yellowmessenger', sectors: ['saas','support','sales'] },
  { name: 'Exotel',           provider: 'lever', slug: 'exotel',        sectors: ['saas','support','sales'] },
  { name: 'Meesho',           provider: 'lever', slug: 'meesho',        sectors: ['ecommerce','support','ops'] },

  /* ---- group B ---- */
  { name: 'Postman',          provider: 'greenhouse', slug: 'postman',       sectors: ['saas','sales','support'] },
  { name: 'Hasura',           provider: 'greenhouse', slug: 'hasura',        sectors: ['saas','sales'] },
  { name: 'Innovaccer',       provider: 'greenhouse', slug: 'innovaccer',    sectors: ['health-saas','sales','ops'] },
  { name: 'Gupshup',          provider: 'greenhouse', slug: 'gupshup',       sectors: ['saas','sales','support'] },
  { name: 'Amplitude',        provider: 'greenhouse', slug: 'amplitude',     sectors: ['saas','sales'] },
  { name: 'MongoDB',          provider: 'greenhouse', slug: 'mongodb',       sectors: ['saas','sales'] },
  { name: 'Twilio',           provider: 'greenhouse', slug: 'twilio',        sectors: ['saas','sales','support'] },
  { name: 'Zscaler',          provider: 'greenhouse', slug: 'zscaler',       sectors: ['security','sales','support'] },
  { name: 'HackerRank',       provider: 'greenhouse', slug: 'hackerrank',    sectors: ['saas','sales','support'] },
  { name: 'Coursera',         provider: 'greenhouse', slug: 'coursera',      sectors: ['edtech','sales','support'] },
  { name: 'Databricks',       provider: 'greenhouse', slug: 'databricks',    sectors: ['saas','sales'] },
  { name: 'Airbnb',           provider: 'greenhouse', slug: 'airbnb',        sectors: ['travel','support','ops'] },
  { name: 'Dropbox',          provider: 'greenhouse', slug: 'dropbox',       sectors: ['saas','sales','support'] },
  { name: 'DoorDash',         provider: 'greenhouse', slug: 'doordash',      sectors: ['ops','support'] },
  { name: 'Stripe',           provider: 'greenhouse', slug: 'stripe',        sectors: ['fintech','sales','support'] },
  { name: 'GitLab',           provider: 'greenhouse', slug: 'gitlab',        sectors: ['saas','sales','support'] },
  { name: 'Chargebee',        provider: 'greenhouse', slug: 'chargebee',     sectors: ['saas','sales','support'] },
  { name: 'Sprinklr',         provider: 'greenhouse', slug: 'sprinklr',      sectors: ['saas','sales','support'] },

  /* ---- group C ---- */
  { name: 'Atlan',            provider: 'ashby', slug: 'atlan',          sectors: ['saas','sales'] },
  { name: 'Zluri',            provider: 'ashby', slug: 'zluri',          sectors: ['saas','sales'] },
  { name: 'Sprinto',          provider: 'ashby', slug: 'sprinto',        sectors: ['saas','sales','support'] },
  { name: 'Nextbillion.ai',   provider: 'ashby', slug: 'nextbillion',    sectors: ['saas','sales'] },
  { name: 'Fountane',         provider: 'ashby', slug: 'fountane',       sectors: ['saas','ops'] },
  { name: 'Rippling',         provider: 'ashby', slug: 'rippling',       sectors: ['saas','sales','support'] },
  { name: 'Deel',             provider: 'ashby', slug: 'deel',           sectors: ['saas','sales','support'] },
  { name: 'Ramp',             provider: 'ashby', slug: 'ramp',           sectors: ['fintech','sales','support'] },
  { name: 'Runway',           provider: 'ashby', slug: 'runwayml',       sectors: ['ai','support'] },
  { name: 'Vercel',           provider: 'ashby', slug: 'vercel',         sectors: ['saas','sales','support'] },
  { name: 'Linear',           provider: 'ashby', slug: 'linear',         sectors: ['saas','support'] },

  /* ---- group D ---- */
  { name: 'Publicis Sapient', provider: 'smartrecruiters', slug: 'PublicisSapient', sectors: ['it-services','ops','support'] },
  { name: 'Bosch',            provider: 'smartrecruiters', slug: 'BoschGroup',      sectors: ['engineering','ops','support'] },
  { name: 'Visa',             provider: 'smartrecruiters', slug: 'Visa',            sectors: ['fintech','sales','support'] },
  { name: 'Ubisoft',          provider: 'smartrecruiters', slug: 'Ubisoft2',        sectors: ['gaming','support'] },
  { name: 'Kformlogic',       provider: 'smartrecruiters', slug: 'Kforce',          sectors: ['staffing','support'] },
  { name: 'McDonalds',        provider: 'smartrecruiters', slug: 'McDonalds',       sectors: ['retail','ops','support'] },

  /* ---- group E ---- */
  { name: 'Chargebee Ops',    provider: 'recruitee', slug: 'chargebee',     sectors: ['saas','sales','support'] },
  { name: 'Toddle',           provider: 'recruitee', slug: 'toddle',        sectors: ['edtech','sales','support'] }
];
