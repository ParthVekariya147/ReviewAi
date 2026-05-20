import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — Reevo",
  description: "Reevo Privacy Policy — how we collect, use, and protect your data.",
};

const SECTIONS = [
  {
    title: "Information We Collect",
    body: "We collect information you provide directly, such as your name, email, and business details when you create an account. We also collect usage data including QR scan events and analytics, which are fully anonymized and cannot be traced back to individual customers.",
  },
  {
    title: "How We Use Your Information",
    body: "We use your information to provide and improve Reevo, send you product updates, and process payments. We never sell your data to third parties, and we never use your data for advertising.",
  },
  {
    title: "Customer Data",
    body: "We do not collect or store personal data from your customers who scan QR codes. All scan events are anonymized at the point of collection. Review suggestion content is generated on-the-fly and not stored.",
  },
  {
    title: "Data Security",
    body: "All data is encrypted at rest and in transit using industry-standard TLS 1.3. We use Supabase with row-level security to ensure strict data isolation between tenants. Regular security audits are performed by an independent third party.",
  },
  {
    title: "Your Rights",
    body: "You have the right to access, correct, or delete your personal data at any time. GDPR and CCPA rights are fully supported. Contact us at privacy@reevo.app to exercise these rights, and we will respond within 30 days.",
  },
  {
    title: "Cookies",
    body: "We use essential cookies for authentication and session management only. We do not use tracking cookies, advertising pixels, or third-party analytics that identify individual users.",
  },
  {
    title: "Contact",
    body: "For privacy-related questions, contact privacy@reevo.app. For general inquiries, visit our contact page.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        <section className="section">
          <div className="container">
            <div style={{ maxWidth: 720, margin: "0 auto" }}>
              {/* Header */}
              <div style={{ marginBottom: 48 }}>
                <span className="eyebrow"><span className="dot" /> Legal</span>
                <h1 className="h1" style={{ marginTop: 18 }}>Privacy Policy</h1>
                <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 10 }}>Last updated: January 1, 2024</p>
              </div>

              {/* Intro */}
              <div className="card" style={{ padding: 24, background: "var(--accent-soft)", border: "1px solid rgba(110,91,255,0.15)", marginBottom: 40 }}>
                <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.7, margin: 0 }}>
                  At Reevo, privacy is not an afterthought — it&apos;s built into our architecture. We collect only what we need, we protect what we have, and we give you full control over your data.
                </p>
              </div>

              {/* Sections */}
              <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
                {SECTIONS.map((s, i) => (
                  <div key={s.title} style={{ borderTop: i === 0 ? "none" : "1px solid var(--border)", paddingTop: i === 0 ? 0 : 36 }}>
                    <h2 style={{ fontSize: 19, fontWeight: 700, color: "var(--ink)", margin: "0 0 12px", letterSpacing: "-0.02em" }}>{s.title}</h2>
                    <p style={{ fontSize: 15, color: "var(--muted)", lineHeight: 1.75, margin: 0 }}>{s.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
