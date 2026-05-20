/* global React, Icon */

const { useState, useEffect, useRef, useMemo, useCallback } = React;
/* ============================================================
   LegalShell — used by Privacy + Terms
   ============================================================ */
const LegalShell = ({ title, lastUpdated, sections, screenLabel }) => {
  const [active, setActive] = useState(0);
  const refs = useRef({});

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY + 160;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = refs.current[i];
        if (el && el.offsetTop <= y) { setActive(i); break; }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sections]);

  return (
    <div data-screen-label={screenLabel}>
      <section className="section" style={{ paddingTop: 64, paddingBottom: 32, position: "relative", overflow: "hidden", borderBottom: "1px solid var(--border)" }}>
        <div className="bg-gradients" style={{ opacity: 0.6 }} />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <span className="eyebrow"><span className="dot" /> Legal</span>
          <h1 className="h1" style={{ marginTop: 18, fontSize: "clamp(40px, 5vw, 60px)" }}>{title}</h1>
          <div className="row" style={{ gap: 16, marginTop: 18, fontSize: 13, color: "var(--muted)" }}>
            <span>Last updated: {lastUpdated}</span>
            <span>·</span>
            <span>Effective immediately</span>
            <span>·</span>
            <a className="row" style={{ gap: 4, color: "var(--accent)", cursor: "pointer" }}>
              <Icon name="download" size={13} /> Download PDF
            </a>
          </div>
        </div>
      </section>

      <section style={{ padding: "64px 0 100px" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 56 }} className="legal-grid">
            <div className="sticky-aside">
              <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.05em", marginBottom: 12, padding: "0 14px" }}>CONTENTS</div>
              <div className="col" style={{ gap: 2 }}>
                {sections.map((s, i) => (
                  <a key={i} onClick={() => refs.current[i]?.scrollIntoView({ behavior: "smooth", block: "start" })} style={{
                    cursor: "pointer", padding: "8px 14px", borderRadius: 8,
                    fontSize: 13, fontWeight: active === i ? 500 : 400,
                    color: active === i ? "var(--accent)" : "var(--muted)",
                    background: active === i ? "var(--accent-soft)" : "transparent",
                    borderLeft: "2px solid " + (active === i ? "var(--accent)" : "transparent"),
                  }}>{s.title}</a>
                ))}
              </div>
            </div>

            <article style={{ maxWidth: 720 }}>
              {sections.map((s, i) => (
                <section key={i} ref={el => refs.current[i] = el} style={{ marginBottom: 56, scrollMarginTop: 100 }}>
                  <div className="kicker">{String(i + 1).padStart(2, "0")}</div>
                  <h2 style={{ fontSize: 26, letterSpacing: "-0.015em", margin: "6px 0 16px" }}>{s.title}</h2>
                  <div style={{ color: "var(--ink-2)", lineHeight: 1.7, fontSize: 15 }}>
                    {s.body.map((p, j) => {
                      if (typeof p === "string") return <p key={j} style={{ margin: "0 0 14px" }}>{p}</p>;
                      if (p.list) return (
                        <ul key={j} style={{ margin: "8px 0 18px", paddingLeft: 20, color: "var(--ink-2)" }}>
                          {p.list.map((li, li_i) => <li key={li_i} style={{ margin: "6px 0" }}>{li}</li>)}
                        </ul>
                      );
                      return null;
                    })}
                  </div>
                </section>
              ))}
            </article>
          </div>
          <style>{`@media (max-width: 900px) { .legal-grid { grid-template-columns: 1fr !important; } .legal-grid > div.sticky-aside { position: relative; top: 0; margin-bottom: 32px; } }`}</style>
        </div>
      </section>
    </div>
  );
};

/* ============================================================
   PRIVACY
   ============================================================ */
const PrivacyPage = () => (
  <LegalShell
    screenLabel="10 Privacy"
    title="Privacy policy"
    lastUpdated="January 12, 2026"
    sections={[
      { title: "Overview", body: [
        "Reevo Technologies, Inc. (\"Reevo\", \"we\", \"us\") provides a software platform that helps local businesses request and convert authentic Google reviews from their real customers. This Privacy Policy describes what data we collect, why we collect it, how we use it, and the rights you have over it.",
        "We are committed to collecting the minimum information necessary to provide our service. We are GDPR and CCPA compliant by default and offer regional data residency for EU customers.",
      ]},
      { title: "Information we collect", body: [
        "From business customers, we collect: account information (name, email, business name, billing info), workspace data (campaigns, QR codes, branding settings), and usage telemetry (which pages you visit in the dashboard, which features you use).",
        "From customers of our customers (review submitters), we collect anonymous funnel events only:",
        { list: [
          "Scan timestamp and originating QR / campaign / location ID",
          "Device type, operating system, and approximate country (geolocated from IP, not stored)",
          "Rating selected, AI suggestion shown, copy action, redirect action",
          "We do not collect names, emails, or any personally identifying information from review submitters unless they voluntarily provide contact info via an optional feedback field.",
        ]},
      ]},
      { title: "How we use information", body: [
        "We use account and workspace data to operate the service: authenticate you, render your dashboard, route reviews, generate AI suggestions, and bill you.",
        "We use funnel telemetry to power the analytics in your dashboard and to improve our own product (in aggregate). We never sell data, and we never use customer funnel data to train AI models served to other Reevo customers.",
      ]},
      { title: "AI suggestions & content", body: [
        "Reevo's AI suggestion engine generates draft review text based on the customer's selected rating and your business's configured voice. The customer is always the author of the final review — they edit, choose among options, or write their own.",
        "AI prompts and outputs are stored for 30 days for debugging and abuse-prevention purposes, then deleted. They are not used to train external models or shared with third parties.",
      ]},
      { title: "How we share information", body: [
        "We never sell customer data. We share data only with subprocessors that help us operate the service (cloud hosting, payment processing, customer support tooling, email delivery), and only the minimum required.",
        "A current list of subprocessors is published at reevo.io/subprocessors and updated 30 days before any change.",
      ]},
      { title: "Data retention", body: [
        "Account data is retained for the life of your subscription. After cancellation, we hard-delete account data within 30 days unless you request earlier deletion or legal hold applies.",
        "Funnel telemetry is retained for 24 months by default, with shorter retention available on Business and Enterprise plans.",
      ]},
      { title: "Your rights", body: [
        "You have the right to access, correct, export, and delete your data. Most of this is self-serve from your dashboard settings. For anything you can't do yourself, email privacy@reevo.io and we respond within 30 days.",
        "EU and UK residents have additional GDPR rights including the right to object to processing and to lodge a complaint with a supervisory authority. California residents have additional CCPA rights including the right to know what we collect and the right to non-discrimination.",
      ]},
      { title: "Security", body: [
        "We are SOC 2 Type II certified. All data is encrypted at rest (AES-256) and in transit (TLS 1.3). Access is limited to a small set of authorized personnel and logged.",
        "Our SOC 2 report and security overview are available under NDA from security@reevo.io.",
      ]},
      { title: "Contact us", body: [
        "Privacy questions: privacy@reevo.io",
        "Data Protection Officer: dpo@reevo.io",
        "Mailing address: Reevo Technologies, Inc., 548 Market St, San Francisco, CA 94104, USA.",
      ]},
    ]}
  />
);

/* ============================================================
   TERMS
   ============================================================ */
const TermsPage = () => (
  <LegalShell
    screenLabel="11 Terms"
    title="Terms of service"
    lastUpdated="January 12, 2026"
    sections={[
      { title: "Acceptance", body: [
        "By creating a Reevo account or using the Reevo service, you agree to these Terms of Service (\"Terms\"). If you don't agree, you can't use the service.",
        "These Terms apply to any individual or business using Reevo. If you're using Reevo on behalf of a company, you confirm you have authority to bind that company to these Terms.",
      ]},
      { title: "The service", body: [
        "Reevo provides a software platform that helps businesses request and convert authentic Google reviews from their real customers via QR-based mobile funnels, AI-assisted review suggestions, and conversion analytics.",
        "Reevo does not write fake reviews. The platform helps real customers draft and post their own authentic reviews to their own Google accounts. Every review collected via Reevo is the work of a real person.",
      ]},
      { title: "Acceptable use", body: [
        "You agree to use Reevo in a way that complies with Google's review content policies and any applicable consumer protection laws. Specifically, you will not:",
        { list: [
          "Use Reevo to incentivize, bribe, or compensate customers for posting reviews",
          "Use Reevo to write or submit reviews on behalf of customers (the customer is always the author)",
          "Use Reevo to selectively hide negative reviews from Google (\"review-gating\")",
          "Use Reevo to collect reviews from non-customers or fabricate customer interactions",
          "Reverse-engineer, scrape, or abuse the Reevo platform or its underlying AI",
        ]},
        "Violation of acceptable use is grounds for immediate account termination without refund.",
      ]},
      { title: "Accounts", body: [
        "You're responsible for your account credentials and for any activity that occurs under your account. Use a strong password and don't share it. Tell us immediately if you suspect unauthorized access.",
      ]},
      { title: "Subscription & billing", body: [
        "Paid plans are billed monthly or annually in advance. All fees are non-refundable except as required by law or as expressly stated in these Terms.",
        "We offer a 30-day money-back guarantee on any new paid subscription. Email billing@reevo.io within 30 days of your first charge to receive a full refund.",
        "We may change pricing at any time. Existing subscribers are notified at least 30 days before renewal at a new price.",
        "Cancellation can be done anytime from your dashboard. Cancellation takes effect at the end of the current billing period.",
      ]},
      { title: "Intellectual property", body: [
        "Reevo retains all rights to the Reevo platform, software, design, and brand. Your content (campaigns, branding assets, customer data) remains yours.",
        "By submitting content to Reevo, you grant us a worldwide, non-exclusive license to host, process, and display that content as needed to operate the service for you.",
      ]},
      { title: "Disclaimer of warranties", body: [
        "The service is provided \"as is\" without warranties of any kind, express or implied. We do not warrant that the service will be uninterrupted, error-free, or that any specific result (such as a number of reviews) will be achieved.",
        "Review velocity depends on factors outside our control (your customer volume, the quality of your service, your QR placement, Google's policies, etc.) and we make no specific guarantees about outcomes.",
      ]},
      { title: "Limitation of liability", body: [
        "To the maximum extent permitted by law, Reevo's total liability for any claim arising out of or relating to these Terms or the service is limited to the amount you paid Reevo in the 12 months prior to the event giving rise to the claim.",
        "Reevo is not liable for indirect, incidental, special, consequential, or punitive damages, including lost profits or lost data, even if advised of the possibility.",
      ]},
      { title: "Termination", body: [
        "You can terminate your account anytime by canceling in the dashboard. We may terminate your account if you violate these Terms, fail to pay, or engage in activity that harms the service or other users.",
        "Upon termination, your right to use the service ends immediately. We retain certain data per the Privacy Policy.",
      ]},
      { title: "Governing law", body: [
        "These Terms are governed by the laws of the State of California, USA, without regard to conflicts of law principles. Disputes will be resolved in the courts located in San Francisco County, California.",
      ]},
      { title: "Changes to these terms", body: [
        "We may update these Terms from time to time. Material changes are emailed to account owners at least 30 days before taking effect. Continued use of the service after changes take effect constitutes acceptance.",
      ]},
      { title: "Contact", body: [
        "Questions about these Terms: legal@reevo.io",
        "Reevo Technologies, Inc., 548 Market St, San Francisco, CA 94104, USA.",
      ]},
    ]}
  />
);

Object.assign(window, { PrivacyPage, TermsPage, LegalShell });
