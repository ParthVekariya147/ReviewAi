// data.jsx — mock data matching the Reevo DB schema exactly.
// All field names match: name, plan, status, campaign_name, token,
// scanned_at, event_type, amount_cents, etc.

const PLANS = ['free', 'starter', 'pro', 'enterprise'];
const STATUSES = ['active', 'past_due', 'canceled', 'trialing'];

const PLAN_LIMITS = {
  free:       { reviews: 100,   scans: 500,    campaigns: 2,         price_cents: 0 },
  starter:    { reviews: 500,   scans: 2000,   campaigns: 5,         price_cents: 1900 },
  pro:        { reviews: 2500,  scans: 10000,  campaigns: 10,        price_cents: 4900 },
  enterprise: { reviews: null,  scans: null,   campaigns: null,      price_cents: 19900 },
};

// 24 realistic businesses (more would be paginated)
const BUSINESSES_RAW = [
  ['Sunrise Bakery & Café',       'sofia.mendez',     'pro',        'active',      'Bakery',           'en', '#E2A52F', 'SB',  4,  '2024-08-14', 14, 8420,  true,  'Italy'],
  ['Northgate Auto Repair',       'james.okafor',     'starter',    'active',      'Auto Services',    'en', '#2F7DFB', 'NA',  4,  '2024-09-02',  6, 2104,  true,  'United Kingdom'],
  ['Bloom & Vine Florist',        'amara.rao',        'pro',        'active',      'Florist',          'en', '#7C3AED', 'BV',  4,  '2024-06-30',  9, 5712,  true,  'United States'],
  ['Cedar Creek Veterinary',      'kayla.thompson',   'enterprise', 'active',      'Veterinary',       'en', '#16A34A', 'CV', 4,   '2024-04-11', 22, 18394, true,  'United States'],
  ['Tide & Toast Diner',          'marcus.bellini',   'starter',    'past_due',    'Restaurant',       'en', '#DC2626', 'TT',  4,  '2024-11-22',  4, 1421,  true,  'Australia'],
  ['Loom Yoga Studio',            'priya.singh',      'pro',        'active',      'Wellness',         'en', '#0EA5E9', 'LY',  5,  '2024-07-08',  8, 4980,  true,  'United States'],
  ['Bishopsgate Dental',          'oliver.whitaker',  'pro',        'active',      'Dental',           'en', '#6E5BFF', 'BD',  4,  '2024-05-19', 11, 7203,  true,  'United Kingdom'],
  ['Goldhill Barbershop',         'tariq.alami',      'starter',    'active',      'Barbershop',       'en', '#0A0A14', 'GB',  4,  '2024-10-14',  3,  912,  true,  'Spain'],
  ['Mosaic Coffee Roasters',      'isla.tanaka',      'pro',        'active',      'Coffee Shop',      'en', '#6D4C2E', 'MC', 4,   '2024-03-27', 12, 9614,  true,  'Japan'],
  ['Lighthouse Family Dental',    'rachel.greene',    'free',       'active',      'Dental',           'en', '#6E5BFF', 'LF',  4,  '2025-01-08',  2,  178,  false, 'United States'],
  ['Vesper Wine Bar',             'lucia.fontana',    'pro',        'canceled',    'Bar',              'en', '#7C2D12', 'VW',  4,  '2024-06-04',  7, 3104,  true,  'France'],
  ['Mountain Pine Yoga',          'noor.hassan',      'starter',    'trialing',    'Wellness',         'en', '#16A34A', 'MP',  5,  '2025-02-12',  5, 1284,  true,  'Canada'],
  ['Olive Branch Mediterranean',  'dimitri.kostas',   'pro',        'active',      'Restaurant',       'en', '#6E5BFF', 'OB',  4,  '2024-08-29', 10, 6321,  true,  'Greece'],
  ['Halcyon Hair Studio',         'maya.ferreira',    'starter',    'active',      'Salon',            'en', '#EC4899', 'HH',  4,  '2024-09-18',  4, 1908,  true,  'Brazil'],
  ['Quokka Coffee',               'liam.parker',      'free',       'active',      'Coffee Shop',      'en', '#D97706', 'QC',  4,  '2025-02-02',  1,   84,  false, 'Australia'],
  ['Stonebridge Family Clinic',   'helena.morais',    'enterprise', 'active',      'Healthcare',       'en', '#2F7DFB', 'SF',  4,  '2024-02-21', 18, 14210, true,  'Portugal'],
  ['Birch & Burlap Home Goods',   'evelyn.shah',      'starter',    'active',      'Retail',           'en', '#6D4C2E', 'BB',  4,  '2024-11-05',  3, 1042,  true,  'United States'],
  ['Riverbed Brewing Co.',        'noah.fitzgerald',  'pro',        'active',      'Brewery',          'en', '#D97706', 'RB',  4,  '2024-07-22',  8, 4416,  true,  'Ireland'],
  ['Twin Pines Pediatrics',       'aaliyah.brooks',   'pro',        'past_due',    'Healthcare',       'en', '#16A34A', 'TP',  4,  '2024-05-30',  9, 5128,  true,  'United States'],
  ['Nori Sushi Bar',              'kenji.watanabe',   'starter',    'active',      'Restaurant',       'en', '#0A0A14', 'NS',  4,  '2024-10-26',  5, 2098,  true,  'Japan'],
  ['Wildflower Boutique',         'camille.dubois',   'free',       'active',      'Retail',           'en', '#EC4899', 'WB',  4,  '2025-01-25',  1,  152,  false, 'France'],
  ['Iron & Oak Furniture',        'samuel.eriksen',   'pro',        'active',      'Retail',           'en', '#6D4C2E', 'IO',  4,  '2024-06-16',  7, 3812,  true,  'Norway'],
  ['Periwinkle Daycare',          'jasmine.alvarez',  'starter',    'active',      'Childcare',        'en', '#6E5BFF', 'PD',  5,  '2024-09-29',  3, 1217,  true,  'United States'],
  ['Skyline Camera Repair',       'ethan.zhou',       'free',       'active',      'Electronics',      'en', '#0A0A14', 'SC',  4,  '2024-12-19',  2,  321,  true,  'Singapore'],
];

const BUSINESSES = BUSINESSES_RAW.map((r, i) => ({
  id: `biz_${(i + 1).toString().padStart(4, '0')}`,
  name: r[0],
  owner_email: `${r[1]}@${r[0].toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 14)}.com`,
  plan: r[2],
  status: r[3],
  business_type: r[4],
  language: r[5],
  brand_color: r[6],
  logo_initials: r[7],
  min_rating_for_google: r[8],
  created_at: r[9],
  qr_campaigns: r[10],
  total_scans: r[11],
  onboarding_complete: r[12],
  country: r[13],
  google_link: `https://g.page/r/${r[7].toLowerCase()}-${i}/review`,
  review_keywords: ['friendly staff', 'quality service', 'clean space', 'fair pricing'][i % 4],
  tagline: '',
  // total business count is virtually 1247 — these are the top 24
}));

// === Padding to make pagination feel real (we just say "1,247 results")
const TOTAL_BUSINESSES = 1247;

// === QR Campaigns for the detail view (business: Sunrise Bakery & Café — biz_0001)
const QR_CAMPAIGNS = [
  { id: 'qr_001', business_id: 'biz_0001', token: 'sb-front-door',  campaign_name: 'Front Door Counter',     status: 'live',   dynamic: true,  ab_testing: true,  pause_fallback: false, scans: 4218, copy_rate: 0.71, created_at: '2024-08-14' },
  { id: 'qr_002', business_id: 'biz_0001', token: 'sb-receipt-v2',  campaign_name: 'Receipt Footer v2',      status: 'live',   dynamic: true,  ab_testing: false, pause_fallback: false, scans: 2104, copy_rate: 0.64, created_at: '2024-09-02' },
  { id: 'qr_003', business_id: 'biz_0001', token: 'sb-bakery-bag',  campaign_name: 'Bakery Bag Sticker',     status: 'live',   dynamic: true,  ab_testing: false, pause_fallback: false, scans: 1289, copy_rate: 0.58, created_at: '2024-10-11' },
  { id: 'qr_004', business_id: 'biz_0001', token: 'sb-window',      campaign_name: 'Window Decal — Patio',   status: 'paused', dynamic: true,  ab_testing: false, pause_fallback: true,  scans:  642, copy_rate: 0.49, created_at: '2024-11-04' },
  { id: 'qr_005', business_id: 'biz_0001', token: 'sb-holiday-25',  campaign_name: 'Holiday Promo 2025',     status: 'draft',  dynamic: false, ab_testing: true,  pause_fallback: false, scans:    0, copy_rate: 0,    created_at: '2025-02-09' },
  { id: 'qr_006', business_id: 'biz_0001', token: 'sb-loyalty',     campaign_name: 'Loyalty Card Insert',    status: 'live',   dynamic: true,  ab_testing: false, pause_fallback: false, scans:  167, copy_rate: 0.62, created_at: '2025-02-22' },
];

// === Subscriptions list — extends businesses with billing fields
const SUBSCRIPTIONS = BUSINESSES.map((b, i) => {
  const limit = PLAN_LIMITS[b.plan];
  return {
    id: `sub_${(i + 1).toString().padStart(4, '0')}`,
    business_id: b.id,
    business_name: b.name,
    owner_email: b.owner_email,
    plan: b.plan,
    status: b.status,
    provider: b.plan === 'free' ? null : (i % 3 === 0 ? 'stripe' : 'paddle'),
    provider_id: b.plan === 'free' ? null : `${i % 3 === 0 ? 'sub' : 'pdl'}_${Math.floor(1e9 + Math.random()*9e9).toString(36).toUpperCase()}`,
    amount_cents: limit.price_cents,
    current_period_end: ['2025-04-14','2025-04-02','2025-03-30','2025-04-11','2025-03-22','2025-04-08','2025-04-19','2025-04-14','2025-03-27','2025-04-08','2025-04-04','2025-04-12','2025-03-29','2025-04-18','2025-04-02','2025-03-21','2025-04-05','2025-04-22','2025-03-30','2025-03-26','2025-04-25','2025-03-16','2025-03-29','2025-04-19'][i],
    cancel_at_end: i === 10 || i === 18 || i === 5,
    created_at: b.created_at,
  };
});

// === Recent dashboard audit log (last 6 actions)
const DASHBOARD_AUDIT = [
  { id: 'al_3201', actor: 'admin@reevo.io',     action: 'business.suspended',  target_type: 'business',     target_id: 'biz_0011', target_name: 'Vesper Wine Bar',         meta: { reason: 'chargeback dispute' }, created_at: '2 min ago' },
  { id: 'al_3200', actor: 'priya@reevo.io',     action: 'plan.changed',        target_type: 'subscription', target_id: 'sub_0004', target_name: 'Cedar Creek Veterinary',  meta: { from: 'pro', to: 'enterprise' }, created_at: '11 min ago' },
  { id: 'al_3199', actor: 'system',             action: 'invoice.paid',        target_type: 'invoice',      target_id: 'inv_8721', target_name: 'Mosaic Coffee Roasters',  meta: { amount_cents: 4900 }, created_at: '24 min ago' },
  { id: 'al_3198', actor: 'admin@reevo.io',     action: 'qr.paused',           target_type: 'qr_code',      target_id: 'qr_4214',  target_name: 'Tide & Toast — Wall',     meta: { reason: 'abuse:bot_pattern' }, created_at: '38 min ago' },
  { id: 'al_3197', actor: 'system',             action: 'business.created',    target_type: 'business',     target_id: 'biz_1247', target_name: 'Hearth & Ember BBQ',      meta: { plan: 'free' }, created_at: '52 min ago' },
  { id: 'al_3196', actor: 'priya@reevo.io',     action: 'invoice.paid',        target_type: 'invoice',      target_id: 'inv_8719', target_name: 'Bishopsgate Dental',      meta: { amount_cents: 4900 }, created_at: '1 hr ago' },
];

// Full audit log table (a couple dozen entries)
const FULL_AUDIT = [
  ...DASHBOARD_AUDIT,
  { id: 'al_3195', actor: 'system',           action: 'payment.failed',     target_type: 'subscription', target_id: 'sub_0005', target_name: 'Tide & Toast Diner',     meta: { code: 'card_declined' }, created_at: '2 hr ago' },
  { id: 'al_3194', actor: 'admin@reevo.io',   action: 'plan.changed',       target_type: 'subscription', target_id: 'sub_0023', target_name: 'Periwinkle Daycare',     meta: { from: 'free', to: 'starter' }, created_at: '3 hr ago' },
  { id: 'al_3193', actor: 'priya@reevo.io',   action: 'admin.note.added',   target_type: 'business',     target_id: 'biz_0019', target_name: 'Twin Pines Pediatrics',  meta: { note: 'Owner requested annual invoicing' }, created_at: '3 hr ago' },
  { id: 'al_3192', actor: 'system',           action: 'qr.archived',        target_type: 'qr_code',      target_id: 'qr_8121', target_name: 'Bloom & Vine — Aisle 3',  meta: {}, created_at: '4 hr ago' },
  { id: 'al_3191', actor: 'admin@reevo.io',   action: 'business.suspended', target_type: 'business',     target_id: 'biz_0731', target_name: 'PromoBot Reviews LLC',   meta: { reason: 'abuse:fake_reviews' }, created_at: '5 hr ago' },
  { id: 'al_3190', actor: 'system',           action: 'invoice.paid',       target_type: 'invoice',      target_id: 'inv_8718', target_name: 'Riverbed Brewing Co.',    meta: { amount_cents: 4900 }, created_at: '5 hr ago' },
  { id: 'al_3189', actor: 'system',           action: 'business.created',   target_type: 'business',     target_id: 'biz_1246', target_name: 'Crescent Optometry',     meta: { plan: 'free' }, created_at: '6 hr ago' },
  { id: 'al_3188', actor: 'priya@reevo.io',   action: 'plan.changed',       target_type: 'subscription', target_id: 'sub_0017', target_name: 'Birch & Burlap Home Goods', meta: { from: 'starter', to: 'pro' }, created_at: '7 hr ago' },
  { id: 'al_3187', actor: 'system',           action: 'invoice.paid',       target_type: 'invoice',      target_id: 'inv_8717', target_name: 'Loom Yoga Studio',       meta: { amount_cents: 4900 }, created_at: '7 hr ago' },
  { id: 'al_3186', actor: 'admin@reevo.io',   action: 'qr.paused',          target_type: 'qr_code',      target_id: 'qr_9012', target_name: 'AutoReview Studio — Lobby', meta: { reason: 'abuse:dead_funnel' }, created_at: '8 hr ago' },
  { id: 'al_3185', actor: 'system',           action: 'invoice.paid',       target_type: 'invoice',      target_id: 'inv_8716', target_name: 'Stonebridge Family Clinic', meta: { amount_cents: 19900 }, created_at: '9 hr ago' },
  { id: 'al_3184', actor: 'priya@reevo.io',   action: 'admin.note.added',   target_type: 'business',     target_id: 'biz_0004', target_name: 'Cedar Creek Veterinary', meta: { note: 'Multi-location rollout in May' }, created_at: '11 hr ago' },
];

// === Abuse table — three eye-catching outliers + a few mild ones
const ABUSE_FLAGS = [
  { id: 'flag_01', business_id: 'biz_9091', business_name: 'PromoBot Reviews LLC',  qr_id: 'qr_9091', qr_token: 'pb-lobby',        campaign_name: 'Lobby Wall Decal',     flag_type: 'bot_scan',     severity: 'critical', scan_count: 8924, copy_rate: 0.001, refresh_rate: 0.02, detected_at: '14 min ago', note: '8,924 scans in 58 minutes from 4 IPs' },
  { id: 'flag_02', business_id: 'biz_0731', business_name: 'AutoReview Studio',     qr_id: 'qr_0731', qr_token: 'ars-counter',     campaign_name: 'Counter Top Sign',     flag_type: 'dead_funnel',  severity: 'high',     scan_count: 12048, copy_rate: 0.000, refresh_rate: 0.18, detected_at: '1 hr ago',  note: '12,048 scans · 0 copies in 30 days' },
  { id: 'flag_03', business_id: 'biz_0512', business_name: 'Cascade Cleaners',      qr_id: 'qr_0512', qr_token: 'cc-receipt',      campaign_name: 'Receipt Footer',       flag_type: 'low_quality',  severity: 'high',     scan_count: 1842, copy_rate: 0.02,  refresh_rate: 0.94, detected_at: '2 hr ago',  note: '94% refresh, 2% copy — likely unsatisfied' },
  { id: 'flag_04', business_id: 'biz_0204', business_name: 'Brick Lane Tattoo',     qr_id: 'qr_0204', qr_token: 'blt-window',      campaign_name: 'Window Sign',          flag_type: 'low_quality',  severity: 'medium',   scan_count:  892, copy_rate: 0.07,  refresh_rate: 0.71, detected_at: '4 hr ago',  note: '71% refresh rate over 7 days' },
  { id: 'flag_05', business_id: 'biz_0418', business_name: 'Ironwood Tavern',       qr_id: 'qr_0418', qr_token: 'iwt-coaster',     campaign_name: 'Coaster Insert',       flag_type: 'bot_scan',     severity: 'medium',   scan_count:  612, copy_rate: 0.04,  refresh_rate: 0.31, detected_at: '6 hr ago',  note: '612 scans from 2 IPs in 12 min' },
  { id: 'flag_06', business_id: 'biz_0317', business_name: 'Phoenix Print Shop',    qr_id: 'qr_0317', qr_token: 'pps-counter',     campaign_name: 'Counter Card',         flag_type: 'dead_funnel',  severity: 'low',      scan_count:  214, copy_rate: 0.01,  refresh_rate: 0.22, detected_at: '11 hr ago', note: '214 scans, 1 copy in 14 days' },
];

// === Invoices for subscription detail (Mosaic Coffee Roasters — biz_0009, sub_0009)
const INVOICES_MOSAIC = [
  { id: 'inv_8721', subscription_id: 'sub_0009', business_id: 'biz_0009', amount_cents: 4900, currency: 'usd', status: 'paid',  provider_inv_id: 'in_1Q8jKLBPGq2',  pdf_url: '#', created_at: '2025-02-27' },
  { id: 'inv_8612', subscription_id: 'sub_0009', business_id: 'biz_0009', amount_cents: 4900, currency: 'usd', status: 'paid',  provider_inv_id: 'in_1Q7iJKBPGq2',  pdf_url: '#', created_at: '2025-01-27' },
  { id: 'inv_8503', subscription_id: 'sub_0009', business_id: 'biz_0009', amount_cents: 4900, currency: 'usd', status: 'paid',  provider_inv_id: 'in_1Q6hIJBPGq2',  pdf_url: '#', created_at: '2024-12-27' },
  { id: 'inv_8394', subscription_id: 'sub_0009', business_id: 'biz_0009', amount_cents: 4900, currency: 'usd', status: 'paid',  provider_inv_id: 'in_1Q5gHIBPGq2',  pdf_url: '#', created_at: '2024-11-27' },
  { id: 'inv_8285', subscription_id: 'sub_0009', business_id: 'biz_0009', amount_cents: 4900, currency: 'usd', status: 'paid',  provider_inv_id: 'in_1Q4fGHBPGq2',  pdf_url: '#', created_at: '2024-10-27' },
  { id: 'inv_8176', subscription_id: 'sub_0009', business_id: 'biz_0009', amount_cents: 4900, currency: 'usd', status: 'paid',  provider_inv_id: 'in_1Q3eFGBPGq2',  pdf_url: '#', created_at: '2024-09-27' },
  { id: 'inv_8067', subscription_id: 'sub_0009', business_id: 'biz_0009', amount_cents: 4900, currency: 'usd', status: 'paid',  provider_inv_id: 'in_1Q2dEFBPGq2',  pdf_url: '#', created_at: '2024-08-27' },
];

// === Chart helpers — 30 days of scans, generally rising, with weekend dip
function genDailyScans(seed = 1) {
  const days = 30;
  const base = 500;
  const out = [];
  for (let i = 0; i < days; i++) {
    const dow = (i + 4) % 7; // 0..6
    const weekend = (dow === 0 || dow === 6) ? 0.65 : 1.0;
    const trend = 1 + (i / days) * 0.55;          // upward
    const wiggle = 1 + Math.sin((i + seed) * 1.3) * 0.12;
    const v = Math.round(base * weekend * trend * wiggle + (i === 28 ? 180 : 0));
    const d = new Date(2025, 1, 1 + i);
    out.push({
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      scans: v,
      reviews: Math.round(v * 0.46),
    });
  }
  return out;
}

// === Plan distribution donut
const PLAN_DISTRIBUTION = [
  { name: 'Free',       value: 604, plan: 'free' },
  { name: 'Starter',    value: 312, plan: 'starter' },
  { name: 'Pro',        value: 287, plan: 'pro' },
  { name: 'Enterprise', value:  44, plan: 'enterprise' },
];

// === Event funnel
const EVENT_FUNNEL = [
  { event: 'scan',     count: 18432, pct: 1.000 },
  { event: 'generate', count: 16215, pct: 0.880 },
  { event: 'refresh',  count:  4128, pct: 0.224 },
  { event: 'copy',     count: 11823, pct: 0.642 },
  { event: 'redirect', count: 10980, pct: 0.596 },
  { event: 'complete', count:  9412, pct: 0.511 },
];

const DEVICE_SPLIT = [
  { name: 'Mobile',  value: 15834 },
  { name: 'Tablet',  value:  1421 },
  { name: 'Desktop', value:  1177 },
];

const TOP_COUNTRIES = [
  { country: 'United States',   scans: 6824 },
  { country: 'United Kingdom',  scans: 2914 },
  { country: 'Australia',       scans: 1602 },
  { country: 'Canada',          scans: 1487 },
  { country: 'Germany',         scans: 1184 },
  { country: 'France',          scans:  912 },
  { country: 'Japan',           scans:  704 },
  { country: 'Spain',           scans:  611 },
  { country: 'Italy',           scans:  548 },
  { country: 'Netherlands',     scans:  421 },
];

const TOP_BUSINESSES_BY_SCANS = [
  { name: 'Cedar Creek Veterinary',    scans: 18394 },
  { name: 'Stonebridge Family Clinic', scans: 14210 },
  { name: 'Mosaic Coffee Roasters',    scans:  9614 },
  { name: 'Sunrise Bakery & Café',     scans:  8420 },
  { name: 'Bishopsgate Dental',        scans:  7203 },
  { name: 'Olive Branch Mediterranean',scans:  6321 },
  { name: 'Bloom & Vine Florist',      scans:  5712 },
  { name: 'Twin Pines Pediatrics',     scans:  5128 },
  { name: 'Loom Yoga Studio',          scans:  4980 },
  { name: 'Riverbed Brewing Co.',      scans:  4416 },
];

const DRAFT_ACCEPTANCE = [
  { name: 'Draft 1',  value: 8412 },
  { name: 'Draft 2',  value: 3411 },
];

const MRR_SERIES = [
  { month: 'Sep', mrr: 28400 },
  { month: 'Oct', mrr: 31200 },
  { month: 'Nov', mrr: 35800 },
  { month: 'Dec', mrr: 39100 },
  { month: 'Jan', mrr: 43700 },
  { month: 'Feb', mrr: 48324 },
];

// Helpers
function fmtMoney(cents, currency = 'usd') {
  const n = (cents / 100);
  return n.toLocaleString('en-US', { style: 'currency', currency: currency.toUpperCase() });
}
function fmtNum(n) {
  return n.toLocaleString('en-US');
}
function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtDateShort(s) {
  if (!s) return '—';
  const d = new Date(s);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

Object.assign(window, {
  PLANS, STATUSES, PLAN_LIMITS,
  BUSINESSES, TOTAL_BUSINESSES,
  QR_CAMPAIGNS, SUBSCRIPTIONS,
  DASHBOARD_AUDIT, FULL_AUDIT,
  ABUSE_FLAGS, INVOICES_MOSAIC,
  PLAN_DISTRIBUTION, EVENT_FUNNEL, DEVICE_SPLIT,
  TOP_COUNTRIES, TOP_BUSINESSES_BY_SCANS, DRAFT_ACCEPTANCE, MRR_SERIES,
  genDailyScans, fmtMoney, fmtNum, fmtDate, fmtDateShort,
});
