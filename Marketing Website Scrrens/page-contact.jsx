/* global React, Icon, Avatar */

const { useState, useEffect, useRef, useMemo, useCallback } = React;
const ContactPage = ({ navigate }) => {
  const [form, setForm] = useState({ name: "", email: "", company: "", topic: "demo", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errs, setErrs] = useState({});

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!form.name.trim()) next.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Please enter a valid email.";
    if (!form.message.trim() || form.message.length < 10) next.message = "Add a few words so we can help.";
    setErrs(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setDone(true); }, 900);
  };

  return (
    <div data-screen-label="06 Contact">
      <section className="section" style={{ paddingTop: 80, paddingBottom: 64, position: "relative", overflow: "hidden" }}>
        <div className="bg-gradients" />
        <div className="container" style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 80 }} className="contact-grid">
            <div>
              <span className="eyebrow"><span className="dot" /> Contact us</span>
              <h1 className="h1" style={{ marginTop: 18, fontSize: "clamp(36px, 5vw, 60px)" }}>We'd love to <em>hear from you.</em></h1>
              <p className="lead" style={{ marginTop: 18 }}>
                Sales, support, partnerships, press — pick a topic and we'll route your message to the right human. Median first response: 2 hours.
              </p>

              <div className="col" style={{ gap: 14, marginTop: 36 }}>
                {[
                  { i: "mail", t: "hello@reevo.io", s: "General & sales" },
                  { i: "phone", t: "+1 (415) 555-2026", s: "Mon–Fri, 9am–6pm PT" },
                  { i: "building", t: "548 Market St, San Francisco", s: "HQ — by appointment only" },
                ].map((c, i) => (
                  <div key={i} className="row" style={{ gap: 14 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", display: "grid", placeItems: "center", color: "var(--accent)" }}>
                      <Icon name={c.i} size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 500 }}>{c.t}</div>
                      <div style={{ fontSize: 13, color: "var(--muted)" }}>{c.s}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="card" style={{ marginTop: 36, padding: 20, background: "var(--bg-soft)" }}>
                <div className="row" style={{ gap: 10, marginBottom: 8 }}>
                  <Avatar name="Sofía Reyes" size={36} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>Sofía Reyes</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>Head of Customer Success</div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55, margin: 0 }}>
                  “Send a note — I read every one. Tell us about your business and we'll book the right person.”
                </p>
              </div>
            </div>

            <div className="card" style={{ padding: 32, boxShadow: "var(--shadow-md)" }}>
              {done ? (
                <div className="col" style={{ alignItems: "center", textAlign: "center", padding: "32px 0", gap: 18 }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #34A853, #1E7E34)", display: "grid", placeItems: "center", color: "white" }}>
                    <Icon name="check" size={26} stroke={2.4} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 22 }}>Message received.</h3>
                    <p style={{ margin: "8px 0 0", color: "var(--muted)", maxWidth: 340 }}>We'll be back to you within a few hours. In the meantime — try the free plan?</p>
                  </div>
                  <div className="row" style={{ gap: 10 }}>
                    <button className="btn btn-primary" onClick={() => navigate("signup")}>Start free trial</button>
                    <button className="btn btn-ghost" onClick={() => { setDone(false); setForm({ name: "", email: "", company: "", topic: "demo", message: "" }); }}>Send another</button>
                  </div>
                </div>
              ) : (
                <form onSubmit={submit} className="col" style={{ gap: 16 }}>
                  <div className="row" style={{ gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label className="label">Your name</label>
                      <input className={"input" + (errs.name ? " error" : "")} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
                      {errs.name && <div className="err-msg">{errs.name}</div>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <label className="label">Work email</label>
                      <input className={"input" + (errs.email ? " error" : "")} value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="jane@yourbiz.com" />
                      {errs.email && <div className="err-msg">{errs.email}</div>}
                    </div>
                  </div>
                  <div>
                    <label className="label">Business name</label>
                    <input className="input" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} placeholder="Maison Café" />
                  </div>
                  <div>
                    <label className="label">What's this about?</label>
                    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
                      {[
                        ["demo", "Book a demo"],
                        ["sales", "Sales question"],
                        ["support", "Product support"],
                        ["press", "Press / partnership"],
                      ].map(([v, l]) => (
                        <button key={v} type="button" onClick={() => setForm({ ...form, topic: v })} style={{
                          padding: "8px 14px", borderRadius: 999,
                          background: form.topic === v ? "var(--ink)" : "var(--surface)",
                          color: form.topic === v ? "var(--bg)" : "var(--ink-2)",
                          border: "1px solid " + (form.topic === v ? "var(--ink)" : "var(--border)"),
                          fontSize: 13, fontWeight: 500, cursor: "pointer",
                        }}>{l}</button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="label">Tell us a bit</label>
                    <textarea className={"input" + (errs.message ? " error" : "")} rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="What's the goal? How many locations? Any timeline?" style={{ resize: "vertical", minHeight: 100 }} />
                    {errs.message && <div className="err-msg">{errs.message}</div>}
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ justifyContent: "center" }}>
                    {submitting ? <><span className="spinner" /> Sending…</> : <>Send message <Icon name="arrow" size={14} /></>}
                  </button>
                  <p style={{ fontSize: 12, color: "var(--muted)", margin: 0, textAlign: "center" }}>
                    By submitting you agree to our <a onClick={() => navigate("privacy")} style={{ textDecoration: "underline", cursor: "pointer" }}>privacy policy</a>.
                  </p>
                </form>
              )}
            </div>
          </div>
          <style>{`@media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }`}</style>
        </div>
      </section>

      <OfficesSection />
    </div>
  );
};

const OfficesSection = () => (
  <section className="section" style={{ background: "var(--bg-soft)", borderTop: "1px solid var(--border)", paddingTop: 80, paddingBottom: 80 }}>
    <div className="container">
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <span className="eyebrow"><span className="dot" /> Offices</span>
        <h2 className="h2" style={{ marginTop: 18, fontSize: "clamp(28px, 3vw, 36px)" }}>Three cities. One product.</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }} className="off-grid">
        {[
          { city: "San Francisco", country: "USA · HQ", addr: "548 Market St" },
          { city: "Bangalore", country: "India", addr: "MG Road, 12th Floor" },
          { city: "Berlin", country: "Germany", addr: "Torstraße 23" },
        ].map(o => (
          <div key={o.city} className="card lift" style={{ padding: 24 }}>
            <div style={{ height: 120, background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 24%, var(--surface-2)), color-mix(in oklab, var(--accent-2) 16%, var(--surface-2)))", borderRadius: 12, marginBottom: 16, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)", backgroundSize: "16px 16px" }} />
              <div style={{ position: "absolute", left: "50%", top: "55%", width: 18, height: 18, borderRadius: "50%", background: "var(--accent)", transform: "translate(-50%, -50%)", boxShadow: "0 0 0 8px color-mix(in oklab, var(--accent) 24%, transparent), 0 0 0 16px color-mix(in oklab, var(--accent) 12%, transparent)" }} />
            </div>
            <h4 style={{ margin: 0, fontSize: 17 }}>{o.city}</h4>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 2 }}>{o.country}</div>
            <div style={{ fontSize: 13, color: "var(--ink-2)", marginTop: 10, fontFamily: "var(--font-mono)" }}>{o.addr}</div>
          </div>
        ))}
      </div>
      <style>{`@media (max-width: 800px) { .off-grid { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  </section>
);

Object.assign(window, { ContactPage });
