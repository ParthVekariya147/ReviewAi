export const PLAN_LIMITS = {
  free:       { reviews: 100,  scans: 500,   campaigns: 2  },
  starter:    { reviews: 500,  scans: 2000,  campaigns: 5  },
  pro:        { reviews: 2500, scans: 10000, campaigns: 10 },
  enterprise: { reviews: -1,   scans: -1,    campaigns: -1 }, // -1 = unlimited
} as const;

export type PlanName = keyof typeof PLAN_LIMITS;

export function getPlanLimits(plan: string) {
  return PLAN_LIMITS[plan as PlanName] ?? PLAN_LIMITS.free;
}
