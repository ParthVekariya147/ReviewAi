import type { Metadata } from "next";
import FAQPageClient from "./FAQPageClient";

export const metadata: Metadata = {
  title: "FAQ",
  description: "Answers to every common question about Reevo — setup, AI review suggestions, Google compliance, analytics, billing, and data security.",
  alternates: { canonical: "/faq" },
};

export default function FAQPage() {
  return <FAQPageClient />;
}
