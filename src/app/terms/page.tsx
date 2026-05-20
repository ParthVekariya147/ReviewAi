import type { Metadata } from "next";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Terms & Conditions — Reevo",
  description: "Reevo Terms and Conditions — your agreement with us.",
};

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    body: "By using Reevo, you agree to these Terms. If you do not agree, do not use our service. These terms constitute a legally binding agreement between you and Reevo Inc. We may update these terms from time to time and will notify you via email.",
  },
  {
    title: "Use of Service",
    body: "You may use Reevo only for lawful purposes and in accordance with these Terms. You agree not to use the service for spam, fraudulent reviews, review gating, or any activity that violates Google's review policies or applicable laws.",
  },
  {
    title: "Subscriptions & Billing",
    body: "Paid plans are billed monthly or annually. You may cancel at any time. Cancellations take effect at the end of the current billing period. Refunds are issued for the unused portion of annual plans only. We reserve the right to change pricing with 30 days' notice.",
  },
  {
    title: "Intellectual Property",
    body: "Reevo and its original content, features, and functionality are owned by Reevo Inc. and are protected by intellectual property laws. AI-generated review suggestions belong to you and your customers. You retain ownership of all data you upload.",
  },
  {
    title: "Limitation of Liability",
    body: "Reevo is provided 'as is' without warranties of any kind. We are not responsible for the accuracy or quality of AI-generated content or for outcomes of reviews posted on third-party platforms such as Google. Our total liability to you shall not exceed the amount paid in the preceding 12 months.",
  },
  {
    title: "Termination",
    body: "We reserve the right to suspend or terminate accounts that violate these Terms, engage in abuse, or use the service for fraudulent purposes. You may terminate your account at any time by contacting support or via your account settings.",
  },
  {
    title: "Governing Law",
    body: "These Terms are governed by the laws of the State of California, United States, without regard to conflict of law provisions. Disputes shall be resolved through binding arbitration in San Francisco, CA.",
  },
];

export default function TermsPage() {
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
                <h1 className="h1" style={{ marginTop: 18 }}>Terms &amp; Conditions</h1>
                <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 10 }}>Last updated: January 1, 2024</p>
              </div>

              {/* Intro */}
              <div className="card" style={{ padding: 24, background: "var(--bg-soft)", border: "1px solid var(--border)", marginBottom: 40 }}>
                <p style={{ fontSize: 15, color: "var(--ink-2)", lineHeight: 1.7, margin: 0 }}>
                  Please read these terms carefully before using Reevo. By accessing or using our service, you agree to be bound by these terms and our <a href="/privacy" style={{ color: "var(--accent)", textDecoration: "none" }}>Privacy Policy</a>.
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

              {/* Contact */}
              <div style={{ marginTop: 48, padding: "24px 28px", borderRadius: 14, background: "var(--bg-soft)", border: "1px solid var(--border)" }}>
                <p style={{ fontSize: 14, color: "var(--muted)", margin: 0, lineHeight: 1.7 }}>
                  Questions about these terms? Contact us at{" "}
                  <a href="mailto:legal@reevo.app" style={{ color: "var(--accent)", textDecoration: "none" }}>legal@reevo.app</a>{" "}
                  or visit our <a href="/contact" style={{ color: "var(--accent)", textDecoration: "none" }}>contact page</a>.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
