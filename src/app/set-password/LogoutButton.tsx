"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "none", border: "none", cursor: loading ? "not-allowed" : "pointer",
        fontSize: 13, color: "var(--muted)", padding: "6px 10px", borderRadius: 6,
        opacity: loading ? 0.6 : 1,
      }}
    >
      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
      {loading ? "Logging out…" : "Logout"}
    </button>
  );
}
