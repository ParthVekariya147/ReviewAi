"use client";

import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    await new Promise((r) => setTimeout(r, 800));
    setStatus("sent");
  }

  return (
    <>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        <section className="section">
          <div className="container">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "flex-start" }} className="contact-grid">
              {/* Left: info */}
              <div>
                <span className="eyebrow"><span className="dot" /> Get in Touch</span>
                <h1 className="h1" style={{ marginTop: 18 }}>We&apos;d love to hear from you.</h1>
                <p className="lead" style={{ marginTop: 18 }}>
                  Have a question, want to see a demo, or need help with your account? Our team responds within one business day.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 40 }}>
                  {[
                    {
                      icon: <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>,
                      iconPath2: <polyline points="22,6 12,13 2,6" />,
                      label: "Email us",
                      value: "hello@reevo.app",
                    },
                    {
                      icon: <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>,
                      iconPath2: <circle cx="12" cy="10" r="3" />,
                      label: "Headquarters",
                      value: "San Francisco, CA",
                    },
                  ].map((c) => (
                    <div key={c.label} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                      <div style={{ width: 38, height: 38, borderRadius: 10, background: "var(--accent-soft)", display: "grid", placeItems: "center", color: "var(--accent)", flexShrink: 0 }}>
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                          {c.icon}{c.iconPath2}
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 12, color: "var(--muted)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 2 }}>{c.label}</div>
                        <div style={{ fontSize: 15, fontWeight: 500, color: "var(--ink)" }}>{c.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ padding: 20, marginTop: 40, background: "var(--accent-soft)", border: "1px solid rgba(110,91,255,0.15)" }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-ink)", marginBottom: 4 }}>Want a live demo?</div>
                      <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5 }}>We offer free 20-minute walkthroughs. Just mention &ldquo;demo&rdquo; in your message and we&apos;ll schedule one.</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: form */}
              <div>
                {status === "sent" ? (
                  <div className="card" style={{ padding: 48, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
                    <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #34A853, #1E7E34)", display: "grid", placeItems: "center", color: "white", boxShadow: "0 12px 30px -10px rgba(52,168,83,0.45)" }}>
                      <svg width={26} height={26} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>
                    </div>
                    <div>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: "var(--ink)", margin: "0 0 8px", letterSpacing: "-0.02em" }}>Message sent!</h2>
                      <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>Thanks for reaching out. We&apos;ll reply within one business day.</p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="card" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 20 }}>
                    {status === "error" && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 14px", borderRadius: 8, background: "#FEF2F2", border: "1px solid #FECACA", color: "#B91C1C", fontSize: 13 }}>
                        <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        Something went wrong. Please try again or email us directly.
                      </div>
                    )}

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-2)" }} htmlFor="name">Name</label>
                        <input id="name" name="name" type="text" required placeholder="Your full name" className="input" />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <label style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-2)" }} htmlFor="company">Company</label>
                        <input id="company" name="company" type="text" placeholder="Optional" className="input" />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-2)" }} htmlFor="email">Email</label>
                      <input id="email" name="email" type="email" required placeholder="you@company.com" className="input" />
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-2)" }} htmlFor="subject">Subject</label>
                      <select id="subject" name="subject" className="input" style={{ cursor: "pointer" }}>
                        <option>General question</option>
                        <option>Request a demo</option>
                        <option>Billing & plans</option>
                        <option>Technical support</option>
                        <option>Partnership</option>
                      </select>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <label style={{ fontSize: 13, fontWeight: 500, color: "var(--ink-2)" }} htmlFor="message">Message</label>
                      <textarea id="message" name="message" rows={5} required placeholder="How can we help?" className="input" style={{ resize: "none" }} />
                    </div>

                    <button
                      type="submit"
                      disabled={status === "sending"}
                      className="btn btn-accent"
                      style={{ width: "100%", justifyContent: "center", padding: "13px 24px", fontSize: 15, opacity: status === "sending" ? 0.6 : 1, cursor: status === "sending" ? "not-allowed" : "pointer" }}
                    >
                      {status === "sending" ? "Sending…" : "Send Message"}
                      {status !== "sending" && <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <style>{`@media (max-width: 768px) { .contact-grid { grid-template-columns: 1fr !important; gap: 48px !important; } }`}</style>
    </>
  );
}
