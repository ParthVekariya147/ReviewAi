"use client";

import { useState } from "react";
import Link from "next/link";

const ITEMS = [
  {
    q: "How does the QR review funnel work?",
    a: "Customers scan your printed QR with their phone camera (no app), tap a rating, and see three AI-drafted review options based on that rating. They tap copy, get redirected to your Google Business profile, paste, and post. The whole flow takes under a minute.",
  },
  {
    q: "Is this Google compliant?",
    a: "Yes. Reevo never writes a fake review and never submits anything for the customer — it just helps them write their own. Every review is posted by a real customer from their own Google account. We follow Google's content policy and review-soliciting guidelines.",
  },
  {
    q: "Do customers need to log in?",
    a: "No login, no app, no account. Customers tap your QR and they're in the funnel. They only need to be signed into Google when they paste their review — same as any review.",
  },
  {
    q: "Can I track QR scans?",
    a: "Every scan, rating, AI generation, copy event, redirect, and posted review is tracked and tied back to the campaign, location, and device. You see the full funnel in real time.",
  },
  {
    q: "Does AI generate the review?",
    a: "AI drafts three suggestions for the customer to choose from based on the rating they selected. The customer edits, picks one, or writes their own. You're never the author — your customer is.",
  },
  {
    q: "How does subscription work?",
    a: "Pick a plan (Starter is free), pay monthly or yearly, cancel anytime from your dashboard. Yearly saves 20%. No setup fees, no charges for additional reviews, no surprises.",
  },
];

const FAQItem = ({ q, a, defaultOpen = false }: { q: string; a: string; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ all: "unset", display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "22px 0", cursor: "pointer", gap: 16 }}
      >
        <span style={{ fontSize: 17, fontWeight: 500, color: "var(--ink)", letterSpacing: "-0.01em" }}>{q}</span>
        <span style={{ width: 32, height: 32, borderRadius: "50%", border: "1px solid var(--border)", display: "grid", placeItems: "center", flexShrink: 0, background: "var(--surface)" }}>
          {open ? (
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M5 12h14" /></svg>
          ) : (
            <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M12 5v14"/><path d="M5 12h14" /></svg>
          )}
        </span>
      </button>
      <div style={{ display: "grid", gridTemplateRows: open ? "1fr" : "0fr", transition: "grid-template-rows .35s ease" }}>
        <div style={{ overflow: "hidden" }}>
          <div style={{ paddingBottom: 22, color: "var(--muted)", fontSize: 15, lineHeight: 1.6, maxWidth: 640 }}>{a}</div>
        </div>
      </div>
    </div>
  );
};

export default function HomeFAQ() {
  return (
    <section className="section">
      <div className="container narrow">
        <div style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 48px" }}>
          <span className="eyebrow"><span className="dot" /> FAQ</span>
          <h2 className="h2" style={{ marginTop: 18 }}>Questions, answered straight.</h2>
        </div>
        <div>
          {ITEMS.map((it, i) => <FAQItem key={i} q={it.q} a={it.a} defaultOpen={i === 0} />)}
        </div>
        <div style={{ textAlign: "center", marginTop: 40 }}>
          <Link href="/faq" className="btn btn-ghost">
            See all questions
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M13 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
