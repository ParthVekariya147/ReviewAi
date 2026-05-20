import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PricingPreview from "@/components/home/PricingPreview";

export const metadata: Metadata = {
  title: "Pricing — Reevo",
  description: "Simple, transparent pricing. Start free and scale as your business grows. No hidden fees.",
};

const FAQ_ITEMS = [
  { q: "Can I change plans anytime?", a: "Yes. Upgrade or downgrade at any time. Upgrades take effect immediately; downgrades take effect at the end of your billing period." },
  { q: "Is there a free trial on paid plans?", a: "Every paid plan comes with a 14-day free trial. No credit card required to start." },
  { q: "What payment methods do you accept?", a: "We accept all major credit cards (Visa, Mastercard, Amex), and bank transfers for annual Business plans." },
  { q: "Do you offer refunds?", a: "We offer a full refund within 7 days of charge. Annual plans receive a pro-rated refund for unused months." },
];

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        {/* Hero */}
        <section className="section" style={{ textAlign: "center", paddingBottom: 0 }}>
          <div className="container" style={{ maxWidth: 680, margin: "0 auto" }}>
            <span className="eyebrow"><span className="dot" /> Simple Pricing</span>
            <h1 className="h1" style={{ marginTop: 18 }}>Start free. Scale as you grow.</h1>
            <p className="lead" style={{ margin: "16px auto 0", maxWidth: 520 }}>
              No hidden fees. Cancel anytime. Every plan includes our core AI review generation engine.
            </p>
          </div>
        </section>

        {/* Pricing cards (reuse the interactive component from home) */}
        <PricingPreview />

        {/* Feature comparison table */}
        <section className="section" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)" }}>
          <div className="container" style={{ maxWidth: 860 }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 className="h2">Compare plans</h2>
            </div>
            <div className="card" style={{ padding: 0, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border)", background: "var(--bg-soft)" }}>
                    <th style={{ padding: "14px 20px", textAlign: "left", fontWeight: 600, color: "var(--ink-2)" }}>Feature</th>
                    {["Starter", "Growth", "Business"].map((p) => (
                      <th key={p} style={{ padding: "14px 20px", textAlign: "center", fontWeight: 600, color: p === "Growth" ? "var(--accent)" : "var(--ink-2)" }}>{p}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { feature: "Business locations", starter: "1", growth: "3", business: "Unlimited" },
                    { feature: "QR codes", starter: "1", growth: "5", business: "Unlimited" },
                    { feature: "AI review suggestions/mo", starter: "50", growth: "500", business: "Unlimited" },
                    { feature: "Analytics dashboard", starter: "Basic", growth: "Advanced", business: "Revenue" },
                    { feature: "Custom branding", starter: "—", growth: "✓", business: "✓" },
                    { feature: "Priority support", starter: "—", growth: "✓", business: "✓" },
                    { feature: "White-label", starter: "—", growth: "—", business: "✓" },
                    { feature: "API access", starter: "—", growth: "—", business: "✓" },
                  ].map((row, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "13px 20px", color: "var(--ink-2)" }}>{row.feature}</td>
                      {[row.starter, row.growth, row.business].map((v, j) => (
                        <td key={j} style={{ padding: "13px 20px", textAlign: "center", color: v === "—" ? "var(--muted-2)" : v === "✓" ? "#117047" : "var(--ink)", fontWeight: v === "✓" ? 600 : 400 }}>{v}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section">
          <div className="container" style={{ maxWidth: 720 }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <h2 className="h2">Pricing FAQs</h2>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {FAQ_ITEMS.map((item) => (
                <div key={item.q} className="card" style={{ padding: "22px 26px" }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--ink)", margin: "0 0 8px" }}>{item.q}</h3>
                  <p style={{ fontSize: 14, color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", padding: "64px 0", textAlign: "center" }}>
          <div className="container" style={{ maxWidth: 500 }}>
            <h2 className="h2">Still not sure?</h2>
            <p className="lead" style={{ margin: "16px auto 28px" }}>Start with our free plan — no card needed. Upgrade when you&apos;re ready.</p>
            <div className="row" style={{ justifyContent: "center", gap: 12 }}>
              <Link href="/signup" className="btn btn-accent btn-lg">
                Start for free
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/contact" className="btn btn-ghost btn-lg">Talk to sales</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
