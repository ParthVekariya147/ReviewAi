"use client";

import { useState } from "react";

const faqs = [
  {
    q: "How does AI review generation work?",
    a: "When a customer scans your QR code, they land on a mobile-optimized page. After rating their experience, our AI generates 3 personalized review suggestions tailored to their star rating and your business type. They pick one, copy it, and get redirected to Google to post it.",
  },
  {
    q: "Do my customers need to create an account?",
    a: "No. The customer-facing review flow requires zero login. Customers simply scan, rate, pick a review suggestion, and post. There is no friction — average completion time is 52 seconds.",
  },
  {
    q: "How many QR codes can I create?",
    a: "It depends on your plan. Starter gets 1 QR code, Growth gets 5, and Business gets unlimited. All QR codes are dynamic — you can update the destination URL without reprinting.",
  },
  {
    q: "Is the free plan really free forever?",
    a: "Yes. The Starter plan is free with no credit card required. You get 1 location, 1 QR code, and 50 AI suggestions per month — enough to see real results before committing.",
  },
  {
    q: "Does it integrate with Google My Business?",
    a: "Reevo generates the review text and redirects customers directly to your Google Business Profile review page. We do not require a Google API integration — it works with any Google Business URL.",
  },
  {
    q: "Can I use Reevo for multiple locations?",
    a: "Absolutely. Growth and Business plans support multiple locations. Each location gets its own QR codes, analytics, and AI settings. Admins can switch between locations from a single dashboard.",
  },
  {
    q: "What happens to my data?",
    a: "We take privacy seriously. We never store customer personal information. QR scan data is anonymized and aggregated for analytics. Our full privacy policy is available at /privacy.",
  },
];

export default function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {faqs.map((faq, i) => (
        <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", background: "var(--surface)", transition: "border-color 0.15s", ...(open === i ? { borderColor: "var(--accent)", boxShadow: "0 0 0 1px var(--accent)" } : {}) }}>
          <button
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 22px", textAlign: "left", gap: 16, background: "transparent", border: 0, cursor: "pointer" }}
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            <span style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", lineHeight: 1.4 }}>{faq.q}</span>
            <svg
              width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={open === i ? "var(--accent)" : "var(--muted)"}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ flexShrink: 0, transition: "transform 0.2s, stroke 0.15s", transform: open === i ? "rotate(180deg)" : "rotate(0deg)" }}
            >
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
          <div style={{
            display: "grid",
            gridTemplateRows: open === i ? "1fr" : "0fr",
            transition: "grid-template-rows 0.22s ease",
          }}>
            <div style={{ overflow: "hidden" }}>
              <div style={{ padding: "0 22px 18px", borderTop: "1px solid var(--border)" }}>
                <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.7, margin: "14px 0 0" }}>{faq.a}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
