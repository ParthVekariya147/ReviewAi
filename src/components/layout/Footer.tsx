import Link from "next/link";

const BrandMark = ({ size = 28 }: { size?: number }) => (
  <div
    className="brand-mark"
    style={{ width: size, height: size, borderRadius: size * 0.3 }}
  >
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
      <path d="M7 4h7a5 5 0 010 10h-3l5 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 4v16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  </div>
);

const SocialIcon = ({ name }: { name: string }) => {
  const paths: Record<string, React.ReactNode> = {
    twitter: <path d="M21 5.9a8 8 0 01-2.3.6 4 4 0 001.7-2.2 8 8 0 01-2.6 1A4 4 0 0011 8.5c0 .3 0 .6.1.9a11 11 0 01-8-4 4 4 0 001.2 5.3 4 4 0 01-1.8-.5v.1a4 4 0 003.2 4 4 4 0 01-1.8.1 4 4 0 003.7 2.8A8 8 0 013 18.6 11 11 0 009 20c7.2 0 11-6 11-11v-.5A8 8 0 0021 6z" fill="currentColor" stroke="none"/>,
    linkedin: <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 17v-7M7 7v.01M11 17v-4a2 2 0 014 0v4M11 10v7"/></>,
    github: <path d="M12 2a10 10 0 00-3 19c.5 0 .7-.3.7-.6v-2c-3 .6-3.6-1.3-3.6-1.3-.5-1.2-1.2-1.5-1.2-1.5-1-.7.1-.7.1-.7 1 .1 1.6 1 1.6 1 1 1.7 2.6 1.2 3.2 1 .1-.8.4-1.3.7-1.6-2.4-.3-5-1.2-5-5.4 0-1.2.4-2.2 1-3-.1-.3-.5-1.4.1-2.8 0 0 .9-.3 3 1a10 10 0 015 0c2-1.3 2.9-1 2.9-1 .6 1.4.2 2.5.1 2.8.6.8 1 1.8 1 3 0 4.2-2.6 5.1-5 5.4.4.4.7 1 .7 2.1v3.1c0 .3.2.6.7.6A10 10 0 0012 2z" fill="currentColor" stroke="none"/>,
  };
  return (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
};

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ marginBottom: 14 }}>
              <BrandMark size={28} />
              <span>Reevo</span>
            </div>
            <p style={{ fontSize: 14, color: "var(--muted)", maxWidth: 280, marginTop: 0, lineHeight: 1.55 }}>
              The AI-powered QR review platform helping local businesses turn customer visits into authentic Google reviews.
            </p>
            <div className="row" style={{ marginTop: 16, gap: 10 }}>
              {["twitter", "linkedin", "github"].map((n) => (
                <a key={n} href="#" className="chip" style={{ width: 32, height: 32, padding: 0, justifyContent: "center" }}>
                  <SocialIcon name={n} />
                </a>
              ))}
            </div>
            <div className="row" style={{ marginTop: 18, gap: 8 }}>
              <span className="chip green">
                <span style={{ width: 6, height: 6, borderRadius: 999, background: "currentColor" }} />
                All systems normal
              </span>
            </div>
          </div>

          <div>
            <h5>Product</h5>
            <Link href="/features">Features</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/industries">Industries</Link>
            <a href="#">Live demo</a>
            <a href="#">Changelog</a>
            <a href="#">Roadmap</a>
          </div>

          <div>
            <h5>Solutions</h5>
            <Link href="/industries">Restaurants</Link>
            <Link href="/industries">Salons</Link>
            <Link href="/industries">Clinics</Link>
            <Link href="/industries">Gyms</Link>
            <Link href="/industries">Retail</Link>
            <Link href="/industries">Cafés</Link>
          </div>

          <div>
            <h5>Company</h5>
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/faq">FAQ</Link>
            <a href="#">Careers</a>
            <a href="#">Press</a>
            <a href="#">Customers</a>
          </div>

          <div>
            <h5>Legal</h5>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
            <a href="#">Cookies</a>
            <a href="#">DPA</a>
            <a href="#">Security</a>
            <a href="#">Compliance</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Reevo Technologies, Inc. — Made for local businesses.</span>
          <span className="mono">v2.4.1 · SOC 2 Type II · GDPR ready</span>
        </div>
      </div>
    </footer>
  );
}
