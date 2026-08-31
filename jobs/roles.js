/*!
 * CareersTiger Jobs — © 2026 CareersTiger. All rights reserved.
 * Proprietary and confidential. Unauthorized copying or distribution is prohibited.
 */
/* roles.js — target roles + India location vocabulary + fresher/experience signals.
 *
 * Each role is a keyword group. A job "matches" a role if any of its keywords appears
 * in the job title (or department). We deliberately bias toward BPO / customer-support /
 * sales roles that are open to freshers, per the product brief.
 *
 * Everything here is plain data so it is trivial to tweak without touching app.js.
 */

/* ----- The 30 target roles (BPO / Support / Sales heavy) ----- */
window.ROLES = [
  { id: 'cs-voice',      label: 'Customer Support (Voice)',        keywords: ['voice process', 'voice support', 'customer support', 'customer care', 'call center', 'call centre', 'inbound', 'outbound'] },
  { id: 'cs-nonvoice',   label: 'Customer Support (Non-Voice)',    keywords: ['non voice', 'non-voice', 'back office support', 'blended process'] },
  { id: 'tech-support',  label: 'Technical Support',               keywords: ['technical support', 'tech support', 'it support', 'helpdesk', 'help desk', 'support engineer', 'support associate', 'support specialist'] },
  { id: 'telecaller',    label: 'Telecaller / Telesales',          keywords: ['telecaller', 'tele caller', 'telesales', 'tele sales', 'tele calling', 'telecalling'] },
  { id: 'inside-sales',  label: 'Inside Sales',                    keywords: ['inside sales'] },
  { id: 'bde',           label: 'Business Development Executive',  keywords: ['business development executive', 'business development associate', 'bde'] },
  { id: 'sdr',           label: 'BDR / SDR',                       keywords: ['sdr', 'bdr', 'sales development', 'business development representative'] },
  { id: 'sales-exec',    label: 'Sales Executive',                 keywords: ['sales executive', 'sales associate', 'sales officer', 'sales representative', 'sales rep'] },
  { id: 'field-sales',   label: 'Field Sales',                     keywords: ['field sales', 'field officer', 'territory sales', 'area sales'] },
  { id: 'rm',            label: 'Relationship Manager',            keywords: ['relationship manager', 'relationship executive', 'relationship officer'] },
  { id: 'account-mgr',   label: 'Account Manager (entry)',         keywords: ['account manager', 'account executive', 'key account'] },
  { id: 'cs-assoc',      label: 'Customer Success',                keywords: ['customer success', 'customer experience', 'cx associate'] },
  { id: 'collections',   label: 'Collections',                     keywords: ['collections', 'recovery executive', 'debt recovery'] },
  { id: 'process-assoc', label: 'Process Associate',               keywords: ['process associate', 'process executive', 'operations associate', 'ops associate'] },
  { id: 'data-entry',    label: 'Data Entry Operator',             keywords: ['data entry', 'data operator', 'data processing'] },
  { id: 'backend-ops',   label: 'Backend Operations',              keywords: ['back office', 'backend operations', 'back end operations', 'backoffice'] },
  { id: 'chat-support',  label: 'Chat Support',                    keywords: ['chat support', 'chat process', 'live chat'] },
  { id: 'email-support', label: 'Email Support',                   keywords: ['email support', 'email process'] },
  { id: 'lead-gen',      label: 'Lead Generation',                 keywords: ['lead generation', 'lead gen', 'demand generation'] },
  { id: 'pre-sales',     label: 'Pre-Sales',                       keywords: ['pre sales', 'pre-sales', 'presales'] },
  { id: 'retention',     label: 'Retention',                       keywords: ['retention executive', 'retention associate', 'customer retention'] },
  { id: 'onboarding',    label: 'Onboarding Specialist',           keywords: ['onboarding specialist', 'onboarding associate', 'onboarding executive'] },
  { id: 'client-serv',   label: 'Client Servicing',                keywords: ['client servicing', 'client service', 'client relations'] },
  { id: 'ops-exec',      label: 'Operations Executive',            keywords: ['operations executive', 'operations officer', 'operations specialist'] },
  { id: 'qa-bpo',        label: 'Quality Analyst (BPO)',           keywords: ['quality analyst', 'quality associate', 'quality executive'] },
  { id: 'tl-voice',      label: 'Team Lead (Voice)',               keywords: ['team lead', 'team leader', 'shift lead'] },
  { id: 'sales-mgr',     label: 'Sales Manager',                   keywords: ['sales manager', 'sales lead', 'regional sales'] },
  { id: 'csr',           label: 'Customer Service Rep',            keywords: ['customer service', 'service representative', 'csr'] },
  { id: 'ins-loan',      label: 'Insurance / Loan Sales',          keywords: ['insurance sales', 'loan sales', 'financial advisor', 'insurance advisor'] },
  { id: 'trainee',       label: 'Trainee / Graduate Associate',    keywords: ['trainee', 'graduate associate', 'graduate program', 'apprentice', 'management trainee'] }
];

/* ----- Sector groupings (for the chip filters) ----- */
window.SECTORS = {
  bpo:   { label: 'BPO / Support', roleIds: ['cs-voice','cs-nonvoice','tech-support','process-assoc','data-entry','backend-ops','chat-support','email-support','ops-exec','qa-bpo','tl-voice','csr','cs-assoc','retention','onboarding','client-serv','collections'] },
  sales: { label: 'Sales / BD',    roleIds: ['telecaller','inside-sales','bde','sdr','sales-exec','field-sales','rm','account-mgr','lead-gen','pre-sales','sales-mgr','ins-loan'] }
};

/* ----- India location vocabulary ----- */
/* A job counts as "India" if its location text matches "india" or any of these cities/hubs. */
window.INDIA_LOCATIONS = [
  'india', 'bharat',
  'bengaluru', 'bangalore', 'blr',
  'mumbai', 'bombay', 'navi mumbai', 'thane',
  'delhi', 'new delhi', 'ncr',
  'gurugram', 'gurgaon',
  'noida', 'greater noida',
  'ghaziabad', 'faridabad',
  'hyderabad', 'secunderabad', 'hyd',
  'pune', 'pimpri', 'chinchwad',
  'chennai', 'madras',
  'kolkata', 'calcutta',
  'ahmedabad', 'gandhinagar',
  'jaipur', 'indore', 'bhopal', 'nagpur',
  'lucknow', 'kanpur', 'chandigarh', 'mohali',
  'coimbatore', 'kochi', 'cochin', 'trivandrum', 'thiruvananthapuram',
  'vizag', 'visakhapatnam', 'vijayawada',
  'surat', 'vadodara', 'rajkot',
  'mysore', 'mysuru', 'mangalore', 'mangaluru',
  'nashik', 'aurangabad', 'goa'
];

/* Explicit non-India signals — used to reject "Remote" jobs that clearly belong elsewhere. */
window.NON_INDIA_HINTS = [
  'united states', 'usa', 'u.s.', 'canada', 'united kingdom', 'u.k.', 'england',
  'germany', 'france', 'spain', 'netherlands', 'ireland', 'poland', 'portugal',
  'singapore', 'australia', 'philippines', 'indonesia', 'malaysia', 'vietnam',
  'dubai', 'uae', 'saudi', 'qatar', 'brazil', 'mexico', 'japan', 'china', 'emea', 'latam'
];

/* ----- Fresher vs experienced signals ----- */
window.FRESHER_HINTS = [
  'fresher', 'freshers', 'entry level', 'entry-level', 'graduate', 'trainee',
  'intern', 'apprentice', 'associate', 'junior', 'jr.', '0-1 year', '0-2 year',
  '0 to 1', '0 to 2', 'no experience', 'college', 'campus'
];

window.EXPERIENCED_HINTS = [
  'senior', 'sr.', 'lead', 'manager', 'head of', 'principal', 'director',
  '3+ year', '4+ year', '5+ year', '6+ year', '7+ year', '8+ year', '10+ year',
  '3-5 year', '5-8 year', 'minimum 3', 'minimum 4', 'minimum 5'
];
