/* global React, Icon */

const { useState, useEffect, useRef, useMemo, useCallback } = React;
const BrandMark = ({ size = 28 }) => (
  <div className="brand-mark" style={{ width: size, height: size, borderRadius: size * 0.3 }}>
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
      {/* stylized R / loop */}
      <path d="M7 4h7a5 5 0 010 10h-3l5 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 4v16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  </div>
);

const Brand = ({ size = 28, onClick }) => (
  <div className="brand" onClick={onClick}>
    <BrandMark size={size} />
    <span>Reevo</span>
  </div>
);

const NAV_LINKS = [
  { key: "features", label: "Features" },
  { key: "pricing", label: "Pricing" },
  { key: "industries", label: "Industries" },
  { key: "about", label: "Company" },
  { key: "faq", label: "FAQ" },
];

const Nav = ({ page, navigate }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="nav">
      <div className="nav-inner">
        <Brand onClick={() => navigate("home")} />
        <div className="nav-links">
          {NAV_LINKS.map(l => (
            <span key={l.key} className={"nav-link" + (page === l.key ? " active" : "")} onClick={() => navigate(l.key)}>{l.label}</span>
          ))}
        </div>
        <div className="nav-right">
          <span className="nav-link" style={{ display: "none" }}>Docs</span>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate("login")} style={{ display: "inline-flex" }}>Sign in</button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate("signup")}>
            Start free trial <Icon name="arrow" size={14} />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={() => setOpen(o => !o)} style={{ padding: 8, display: "none" }} aria-label="Menu">
            <Icon name="chevron" />
          </button>
        </div>
      </div>
      {open && (
        <div style={{ borderTop: "1px solid var(--border)", padding: "8px 20px 16px" }}>
          {NAV_LINKS.map(l => (
            <div key={l.key} className="nav-link" onClick={() => { navigate(l.key); setOpen(false); }} style={{ padding: "12px 8px" }}>{l.label}</div>
          ))}
        </div>
      )}
    </div>
  );
};

const Footer = ({ navigate }) => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Brand />
            <p style={{ fontSize: 14, color: "var(--muted)", maxWidth: 280, marginTop: 14, lineHeight: 1.55 }}>
              The AI-powered QR review platform helping local businesses turn customer visits into authentic Google reviews.
            </p>
            <div className="row" style={{ marginTop: 16, gap: 10 }}>
              {["twitter", "linkedin", "github"].map(n => (
                <a key={n} className="chip" style={{ width: 32, height: 32, padding: 0, justifyContent: "center" }} href="#">
                  <Icon name={n} size={14} />
                </a>
              ))}
            </div>
            <div className="row" style={{ marginTop: 18, gap: 8 }}>
              <span className="chip green"><span style={{ width: 6, height: 6, borderRadius: 999, background: "currentColor" }} /> All systems normal</span>
            </div>
          </div>
          <div>
            <h5>Product</h5>
            <a onClick={() => navigate("features")}>Features</a>
            <a onClick={() => navigate("pricing")}>Pricing</a>
            <a onClick={() => navigate("industries")}>Industries</a>
            <a onClick={() => navigate("home")}>Live demo</a>
            <a>Changelog</a>
            <a>Roadmap</a>
          </div>
          <div>
            <h5>Solutions</h5>
            <a onClick={() => navigate("industries")}>Restaurants</a>
            <a onClick={() => navigate("industries")}>Salons</a>
            <a onClick={() => navigate("industries")}>Clinics</a>
            <a onClick={() => navigate("industries")}>Gyms</a>
            <a onClick={() => navigate("industries")}>Retail</a>
            <a onClick={() => navigate("industries")}>Cafés</a>
          </div>
          <div>
            <h5>Company</h5>
            <a onClick={() => navigate("about")}>About</a>
            <a onClick={() => navigate("contact")}>Contact</a>
            <a onClick={() => navigate("faq")}>FAQ</a>
            <a>Careers</a>
            <a>Press</a>
            <a>Customers</a>
          </div>
          <div>
            <h5>Legal</h5>
            <a onClick={() => navigate("privacy")}>Privacy</a>
            <a onClick={() => navigate("terms")}>Terms</a>
            <a>Cookies</a>
            <a>DPA</a>
            <a>Security</a>
            <a>Compliance</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 Reevo Technologies, Inc. — Made for local businesses.</span>
          <span className="mono">v2.4.1 · SOC 2 Type II · GDPR ready</span>
        </div>
      </div>
    </footer>
  );
};

Object.assign(window, { Nav, Footer, Brand, BrandMark });
