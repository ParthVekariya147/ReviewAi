// Fallback limits used when DB is unreachable.
// Source of truth is plan_prices table (columns: review_limit, scan_limit, campaign_limit).
export const PLAN_LIMITS = {
  free:       { reviews: 10,   scans: 50,    campaigns: 1  },
  starter:    { reviews: 500,  scans: 2000,  campaigns: 5  },
  pro:        { reviews: 2500, scans: 10000, campaigns: 10 },
  enterprise: { reviews: -1,   scans: -1,    campaigns: -1 },
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan as PlanName] ?? PLAN_LIMITS.free;
}

export interface DbPlanLimits {
  reviews: number;
  scans: number;
  campaigns: number;
  trial_days: number | null;
}

export function planLimitsFromRow(row: {
  review_limit: number;
  scan_limit: number;
  campaign_limit: number;
  trial_days: number | null;
}): DbPlanLimits {
  return {
    reviews:    row.review_limit,
    scans:      row.scan_limit,
    campaigns:  row.campaign_limit,
    trial_days: row.trial_days,
  };
}
