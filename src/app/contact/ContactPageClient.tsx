"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

function ContactIcon({ name }: { name: string }) {
  const props = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "var(--accent)" as string, strokeWidth: "1.6", strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (name === "mail") return <svg {...props}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
  if (name === "phone") return <svg {...props}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .9h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 15.9v1.02z"/></svg>;
  return <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>;
}

const TOPICS = [
  ["demo", "Book a demo"],
  ["sales", "Sales question"],
  ["support", "Product support"],
  ["press", "Press / partnership"],
] as const;

export default function ContactPageClient() {
  const [form, setForm] = useState({ name: "", email: "", company: "", topic: "demo", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errs, setErrs] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!form.name.trim()) next.name = "Please tell us your name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "Please enter a valid email.";
    if (!form.message.trim() || form.message.length < 10) next.message = "Add a few words so we can help.";
    setErrs(next);
    if (Object.keys(next).length) return;
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setDone(true); }, 900);
  }

  return (
    <>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        <section className="section" style={{ paddingTop: 80, paddingBottom: 64, position: "relative", overflow: "hidden" }}>
          <div className="bg-gradients" />
          <div className="container" style={{ position: "relative", zIndex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: 80 }} className="contact-grid">

              {/* Left: info */}
              <div>
                <span className="eyebrow"><span className="dot" /> Contact us</span>
                <h1 className="h1" style={{ marginTop: 18, fontSize: "clamp(36px, 5vw, 60px)" }}>
                  We&apos;d love to <em>hear from you.</em>
                </h1>
                <p className="lead" style={{ marginTop: 18 }}>
                  Sales, support, partnerships, press — pick a topic and we&apos;ll route your message to the right human. Median first response: 2 hours.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 36 }}>
                  {[
                    { i: "mail", t: "hello@reevo.io", s: "General & sales" },
                    { i: "phone", t: "+1 (415) 555-2026", s: "Mon–Fri, 9am–6pm PT" },
                    { i: "building", t: "548 Market St, San Francisco", s: "HQ — by appointment only" },
                  ].map((c) => (
                    <div key={c.i} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--surface)", border: "1px solid var(--border)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                        <ContactIcon name={c.i} />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 500 }}>{c.t}</div>
                        <div style={{ fontSize: 13, color: "var(--muted)" }}>{c.s}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ marginTop: 36, padding: 20, background: "var(--bg-soft)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg, #a78bfa, #6ee7b7)", display: "grid", placeItems: "center", fontSize: 14, fontWeight: 600, color: "white", flexShrink: 0 }}>S</div>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 500 }}>Sofía Reyes</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>Head of Customer Success</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.55, margin: 0 }}>
                    &ldquo;Send a note — I read every one. Tell us about your business and we&apos;ll book the right person.&rdquo;
                  </p>
                </div>
              </div>

              {/* Right: form */}
              <div className="card" style={{ padding: 32, boxShadow: "var(--shadow-md)" }}>
                {done ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "32px 0", gap: 18 }}>
                    <div style={{ width: 56, height: 56, borderRadius: "50%", background: "linear-gradient(135deg, #34A853, #1E7E34)", display: "grid", placeItems: "center", color: "white" }}>
                      <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 22 }}>Message received.</h3>
                      <p style={{ margin: "8px 0 0", color: "var(--muted)", maxWidth: 340 }}>We&apos;ll be back to you within a few hours. In the meantime — try the free plan?</p>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <Link href="/signup" className="btn btn-primary">Start free trial</Link>
                      <button className="btn btn-ghost" onClick={() => { setDone(false); setForm({ name: "", email: "", company: "", topic: "demo", message: "" }); }}>Send another</button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <label className="label">Your name</label>
                        <input className={`input${errs.name ? " error" : ""}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jane Doe" />
                        {errs.name && <div className="err-msg">{errs.name}</div>}
                      </div>
                      <div style={{ flex: 1 }}>
                        <label className="label">Work email</label>
                        <input className={`input${errs.email ? " error" : ""}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@yourbiz.com" />
                        {errs.email && <div className="err-msg">{errs.email}</div>}
                      </div>
                    </div>

                    <div>
                      <label className="label">Business name</label>
                      <input className="input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Maison Café" />
                    </div>

                    <div>
                      <label className="label">What&apos;s this about?</label>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {TOPICS.map(([v, l]) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setForm({ ...form, topic: v })}
                            style={{
                              padding: "8px 14px", borderRadius: 999,
                              background: form.topic === v ? "var(--ink)" : "var(--surface)",
                              color: form.topic === v ? "var(--bg)" : "var(--ink-2)",
                              border: `1px solid ${form.topic === v ? "var(--ink)" : "var(--border)"}`,
                              fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "inherit",
                            }}
                          >{l}</button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="label">Tell us a bit</label>
                      <textarea
                        className={`input${errs.message ? " error" : ""}`}
                        rows={5}
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        placeholder="What's the goal? How many locations? Any timeline?"
                        style={{ resize: "vertical", minHeight: 100 }}
                      />
                      {errs.message && <div className="err-msg">{errs.message}</div>}
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ justifyContent: "center" }}>
                      {submitting ? (
                        <><span className="spinner" /> Sending…</>
                      ) : (
                        <>Send message <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg></>
                      )}
                    </button>

                    <p style={{ fontSize: 12, color: "var(--muted)", margin: 0, textAlign: "center" }}>
                      By submitting you agree to our <Link href="/privacy" style={{ textDecoration: "underline", color: "inherit" }}>privacy policy</Link>.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Offices */}
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
              ].map((o) => (
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
          </div>
        </section>
      </main>
      <Footer />

      <style>{`
        @media (max-width: 900px) { .contact-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }
        @media (max-width: 800px) { .off-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </>
  );
}
