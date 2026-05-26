import type { Metadata } from "next";
import { Suspense } from "react";
import CheckEmailClient from "./CheckEmailClient";

export const metadata: Metadata = {
  title: "Check Your Email — Reevo",
};

function Loading() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
      <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
        <path d="M21 12a9 9 0 11-6.219-8.56" />
      </svg>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense fallback={<Loading />}>
      <CheckEmailClient />
    </Suspense>
  );
}
