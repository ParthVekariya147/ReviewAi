export interface PlatformDef {
  id:          string;
  name:        string;
  emoji:       string;
  color:       string;
  regionTags:  string[];   // display labels like 'US', 'EU', 'UK', 'RU', 'AE', 'AU'
  placeholder: string;
}

export interface ReviewPlatformEntry {
  id:      string;
  url:     string;
  enabled: boolean;
}

export const PLATFORM_DEFS: PlatformDef[] = [
  // ── Global ───────────────────────────────────────────────────
  {
    id: 'google',
    name: 'Google Reviews',
    emoji: '🔍',
    color: '#4285F4',
    regionTags: ['US', 'EU', 'UK', 'AU', 'AE', 'RU'],
    placeholder: 'https://g.page/r/…/review',
  },
  {
    id: 'tripadvisor',
    name: 'TripAdvisor',
    emoji: '🦉',
    color: '#00AF87',
    regionTags: ['US', 'EU', 'UK', 'AU', 'AE'],
    placeholder: 'https://www.tripadvisor.com/…',
  },
  {
    id: 'facebook',
    name: 'Facebook Reviews',
    emoji: '👍',
    color: '#1877F2',
    regionTags: ['US', 'EU', 'UK', 'AU', 'AE'],
    placeholder: 'https://www.facebook.com/…/reviews',
  },

  // ── USA & Australia ──────────────────────────────────────────
  {
    id: 'yelp',
    name: 'Yelp',
    emoji: '⭐',
    color: '#FF1A1A',
    regionTags: ['US', 'AU'],
    placeholder: 'https://www.yelp.com/biz/…',
  },
  {
    id: 'productreview',
    name: 'ProductReview.com.au',
    emoji: '🛒',
    color: '#E87722',
    regionTags: ['AU'],
    placeholder: 'https://www.productreview.com.au/listings/…',
  },
  {
    id: 'truelocal',
    name: 'True Local',
    emoji: '📍',
    color: '#007FC8',
    regionTags: ['AU'],
    placeholder: 'https://www.truelocal.com.au/business/…',
  },

  // ── Europe & UK ──────────────────────────────────────────────
  {
    id: 'trustpilot',
    name: 'Trustpilot',
    emoji: '🌟',
    color: '#00B67A',
    regionTags: ['EU', 'UK'],
    placeholder: 'https://www.trustpilot.com/review/…',
  },
  {
    id: 'booking',
    name: 'Booking.com',
    emoji: '🏨',
    color: '#003580',
    regionTags: ['EU', 'UK', 'AE'],
    placeholder: 'https://www.booking.com/hotel/…',
  },
  {
    id: 'checkatrade',
    name: 'Checkatrade',
    emoji: '🔧',
    color: '#005DAA',
    regionTags: ['UK'],
    placeholder: 'https://www.checkatrade.com/trades/…',
  },

  // ── Russia & CIS ─────────────────────────────────────────────
  {
    id: 'yandex',
    name: 'Yandex Maps',
    emoji: '🗺️',
    color: '#FC3F1D',
    regionTags: ['RU'],
    placeholder: 'https://yandex.ru/maps/org/…',
  },
  {
    id: '2gis',
    name: '2GIS',
    emoji: '📌',
    color: '#31A44A',
    regionTags: ['RU'],
    placeholder: 'https://2gis.ru/…',
  },
  {
    id: 'flamp',
    name: 'Flamp',
    emoji: '💬',
    color: '#FF6600',
    regionTags: ['RU'],
    placeholder: 'https://flamp.ru/…',
  },

  // ── UAE & Middle East ────────────────────────────────────────
  {
    id: 'zomato',
    name: 'Zomato',
    emoji: '🍽️',
    color: '#E23744',
    regionTags: ['AE', 'AU'],
    placeholder: 'https://www.zomato.com/…',
  },
  {
    id: 'talabat',
    name: 'Talabat',
    emoji: '🚚',
    color: '#FF6600',
    regionTags: ['AE'],
    placeholder: 'https://www.talabat.com/uae/…',
  },
];

export function getPlatformDef(id: string): PlatformDef | undefined {
  return PLATFORM_DEFS.find(p => p.id === id);
}

export function buildDefaultPlatforms(googleLink: string): ReviewPlatformEntry[] {
  return [{ id: 'google', url: googleLink, enabled: !!googleLink }];
}
