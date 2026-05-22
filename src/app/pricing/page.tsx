import type { Metadata } from "next";
import PricingPageClient from "./PricingPageClient";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Start free with one location and 30 AI-drafted reviews per month. Upgrade to Growth ($23/mo) or Business ($71/mo) for unlimited reviews, dynamic QR codes, and multi-location analytics.",
  alternates: { canonical: "/pricing" },
};

export default function PricingPage() {
  return <PricingPageClient />;
}
