/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakColor, TweakToggle, TweakSelect,
   Nav, Footer, HomePage, FeaturesPage, PricingPage, IndustriesPage, AboutPage, ContactPage,
   FAQPage, LoginPage, SignupPage, PrivacyPage, TermsPage */
const { useState, useEffect, useRef, useMemo, useCallback } = React;
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": ["#6E5BFF", "#2F7DFB"],
  "dark": false
}/*EDITMODE-END*/;

const PALETTES = [
  ["#6E5BFF", "#2F7DFB"], // indigo → blue (default)
  ["#7C5CFC", "#C462E8"], // violet → magenta
  ["#1E89FF", "#42D6CD"], // blue → teal
  ["#FF6B5C", "#FFB169"], // coral → amber
];

const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [page, setPage] = useState(() => (window.location.hash.replace("#", "") || "home"));

  // accent palette
  const accent = (tweaks.palette && tweaks.palette[0]) || "#6E5BFF";
  const accent2 = (tweaks.palette && tweaks.palette[1]) || "#2F7DFB";

  useEffect(() => {
    document.documentElement.style.setProperty("--accent", accent);
    document.documentElement.style.setProperty("--accent-2", accent2);
    document.documentElement.style.setProperty("--accent-soft", `color-mix(in oklab, ${accent} 12%, white)`);
    document.documentElement.style.setProperty("--accent-ink", `color-mix(in oklab, ${accent} 60%, black)`);
  }, [accent, accent2]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", tweaks.dark ? "dark" : "light");
  }, [tweaks.dark]);

  // hash routing
  useEffect(() => {
    const onHash = () => setPage(window.location.hash.replace("#", "") || "home");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const navigate = (p) => {
    window.location.hash = p;
    setPage(p);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "auto" }));
  };

  // some pages omit chrome (auth has its own)
  const noFooter = ["login", "signup"].includes(page);

  return (
    <>
      <Nav page={page} navigate={navigate} />
      <main>
        {page === "home" && <HomePage navigate={navigate} />}
        {page === "features" && <FeaturesPage navigate={navigate} />}
        {page === "pricing" && <PricingPage navigate={navigate} />}
        {page === "industries" && <IndustriesPage navigate={navigate} />}
        {page === "about" && <AboutPage navigate={navigate} />}
        {page === "contact" && <ContactPage navigate={navigate} />}
        {page === "faq" && <FAQPage navigate={navigate} />}
        {page === "login" && <LoginPage navigate={navigate} />}
        {page === "signup" && <SignupPage navigate={navigate} />}
        {page === "privacy" && <PrivacyPage navigate={navigate} />}
        {page === "terms" && <TermsPage navigate={navigate} />}
      </main>
      {!noFooter && <Footer navigate={navigate} />}

      <TweaksPanel>
        <TweakSection label="Theme">
          <TweakToggle label="Dark mode" value={tweaks.dark} onChange={v => setTweak("dark", v)} />
        </TweakSection>
        <TweakSection label="Accent palette">
          <TweakColor label="Gradient" value={tweaks.palette} options={PALETTES} onChange={v => setTweak("palette", v)} />
        </TweakSection>
        <TweakSection label="Quick links">
          <div className="col" style={{ gap: 4 }}>
            {[
              ["home", "Home"],
              ["features", "Features"],
              ["pricing", "Pricing"],
              ["industries", "Industries"],
              ["about", "About"],
              ["contact", "Contact"],
              ["faq", "FAQ"],
              ["login", "Login"],
              ["signup", "Signup"],
              ["privacy", "Privacy"],
              ["terms", "Terms"],
            ].map(([k, l]) => (
              <button key={k} onClick={() => navigate(k)} style={{
                all: "unset", cursor: "pointer", padding: "6px 10px", borderRadius: 6,
                fontSize: 13, color: page === k ? "var(--accent)" : "var(--ink-2)",
                background: page === k ? "var(--accent-soft)" : "transparent",
              }}>{l}</button>
            ))}
          </div>
        </TweakSection>
      </TweaksPanel>
    </>
  );
};

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
