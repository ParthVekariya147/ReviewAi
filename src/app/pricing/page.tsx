import type { Metadata } from "next";
import PricingPageClient, { type PlanApiRow } from "./PricingPageClient";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Start free with one location and 30 AI-drafted reviews per month. Upgrade for unlimited reviews, dynamic QR codes, and multi-location analytics.",
  alternates: { canonical: "/pricing" },
};

async function fetchPlans(): Promise<PlanApiRow[]> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/public/plans`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.plans ?? [];
  } catch {
    return [];
  }
}

export default async function PricingPage() {
  const plans = await fetchPlans();
  return <PricingPageClient plans={plans} />;
}
