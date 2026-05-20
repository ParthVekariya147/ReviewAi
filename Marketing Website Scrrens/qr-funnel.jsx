/* global React, Icon, Stars, QRPattern */

const { useState, useEffect, useRef, useMemo, useCallback } = React;
/* =============================================================
   Mobile QR Funnel — interactive demo
   Steps: idle (QR) → rating → suggestions → copy → redirect → done
   ============================================================= */

const REVIEW_SUGGESTIONS = {
  5: [
    "Absolutely loved my visit to {biz}! The team was friendly, the service was fast, and the quality was outstanding. Will definitely be coming back.",
    "Exceptional experience at {biz}. From start to finish everything was perfect — clean, welcoming, and genuinely professional. Five stars all day.",
    "Easily the best in town. {biz} exceeded my expectations: amazing service, fantastic atmosphere, and very fair prices. Highly recommend!",
  ],
  4: [
    "Really good experience at {biz} — friendly staff and great quality overall. A few small things to polish but I’d come back happily.",
    "Solid visit to {biz}. Service was attentive and the place was clean. Would recommend to friends in the neighborhood.",
  ],
  3: [
    "Decent visit to {biz}. There's a lot to like, but I think a few touches could make it really shine. Open to coming back.",
  ],
};

const MobileFunnel = ({ business = "Maison Café", googleHref = "https://maps.google.com" }) => {
  const [step, setStep] = useState("idle");
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [pickedIdx, setPickedIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [typed, setTyped] = useState("");
  const [progress, setProgress] = useState(0);

  const suggestions = useMemo(() => {
    const list = REVIEW_SUGGESTIONS[rating] || REVIEW_SUGGESTIONS[5];
    return list.map(s => s.replace(/{biz}/g, business));
  }, [rating, business]);

  // typewriter when arriving at suggestions
  useEffect(() => {
    if (step !== "suggestions") return;
    setTyped("");
    const text = suggestions[pickedIdx];
    let i = 0;
    const id = setInterval(() => {
      i += 2;
      setTyped(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, 18);
    return () => clearInterval(id);
  }, [step, pickedIdx, suggestions]);

  // redirect progress sim
  useEffect(() => {
    if (step !== "redirect") return;
    setProgress(0);
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / 1800);
      setProgress(p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setStep("done");
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [step]);

  const reset = () => {
    setStep("idle"); setRating(0); setHoverRating(0); setPickedIdx(0); setCopied(false); setTyped("");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(suggestions[pickedIdx]);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch (e) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="phone">
      <div className="phone-screen">
        {/* status bar */}
        <div style={{ height: 38, display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 22px 4px", fontSize: 12, fontWeight: 600, color: "#111" }}>
          <span>9:41</span>
          <div className="row" style={{ gap: 4 }}>
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none"><path d="M1 8h2v1H1zM4 6h2v3H4zM7 4h2v5H7zM10 2h2v7h-2z" fill="#111"/></svg>
            <svg width="18" height="10" viewBox="0 0 18 10" fill="none"><rect x="0.5" y="2" width="14" height="6" rx="1.5" stroke="#111"/><rect x="2" y="3.5" width="11" height="3" fill="#111"/><rect x="15" y="4" width="1.5" height="2" fill="#111"/></svg>
          </div>
        </div>

        {/* content */}
        <div style={{ flex: 1, padding: "8px 18px 18px", display: "flex", flexDirection: "column", color: "#111" }}>
          {/* brand header */}
          <div className="between" style={{ marginBottom: 8 }}>
            <div className="row" style={{ gap: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: "linear-gradient(135deg, var(--accent), var(--accent-2))" }} />
              <span style={{ fontWeight: 600, fontSize: 13, letterSpacing: "-0.01em" }}>{business}</span>
            </div>
            <span style={{ fontSize: 11, color: "#9aa", fontFamily: "var(--font-mono)" }}>via reevo</span>
          </div>

          {step === "idle" && (
            <div className="fade-up" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", gap: 14 }}>
              <h3 style={{ fontSize: 18, margin: 0, color: "#111", letterSpacing: "-0.02em" }}>Scan to leave a review</h3>
              <div style={{ padding: 8, background: "white", border: "1px solid #EEE", borderRadius: 14, boxShadow: "0 12px 30px -16px rgba(0,0,0,0.15)" }}>
                <QRPattern size={150} label={business} />
              </div>
              <p style={{ fontSize: 12, color: "#777", margin: 0, maxWidth: 220 }}>Tap the QR — your customers see this when they scan.</p>
              <button className="btn btn-accent btn-sm" onClick={() => setStep("rating")} style={{ marginTop: 4 }}>
                Try the flow <Icon name="arrow" size={13} />
              </button>
            </div>
          )}

          {step === "rating" && (
            <div className="fade-up" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", textAlign: "center", gap: 18 }}>
                <div>
                  <h3 style={{ fontSize: 20, margin: 0, color: "#111", letterSpacing: "-0.02em", lineHeight: 1.2 }}>How was your visit?</h3>
                  <p style={{ fontSize: 13, color: "#777", margin: "8px 0 0" }}>Tap a star to continue</p>
                </div>
                <div className="row" style={{ justifyContent: "center", gap: 4 }}>
                  {[1,2,3,4,5].map(i => {
                    const active = i <= (hoverRating || rating);
                    return (
                      <button key={i}
                        onMouseEnter={() => setHoverRating(i)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => { setRating(i); setTimeout(() => setStep("suggestions"), 280); }}
                        style={{
                          background: "transparent", border: 0, padding: 4, cursor: "pointer",
                          transform: active ? "scale(1.08)" : "scale(1)",
                          transition: "transform .15s",
                        }}>
                        <svg width="34" height="34" viewBox="0 0 24 24" fill={active ? "#F5A623" : "transparent"} stroke="#F5A623" strokeWidth="1.5" strokeLinejoin="round">
                          <path d="M12 3l2.7 5.7 6.3.9-4.6 4.4 1.1 6.3L12 17.4 6.5 20.3l1.1-6.3L3 9.6l6.3-.9z" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
                <div style={{ height: 18, fontSize: 12, color: "#999" }}>
                  {hoverRating === 5 && "Excellent"}
                  {hoverRating === 4 && "Great"}
                  {hoverRating === 3 && "Okay"}
                  {hoverRating === 2 && "Below average"}
                  {hoverRating === 1 && "Poor"}
                </div>
              </div>
              <div style={{ fontSize: 10, textAlign: "center", color: "#bbb", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>STEP 1 OF 4</div>
            </div>
          )}

          {step === "suggestions" && (
            <div className="fade-up" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, paddingTop: 6 }}>
              <div style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 14%, white), color-mix(in oklab, var(--accent-2) 12%, white))", borderRadius: 12, padding: 10, border: "1px solid color-mix(in oklab, var(--accent) 22%, white)" }}>
                <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 999, background: "linear-gradient(135deg, var(--accent), var(--accent-2))", display: "grid", placeItems: "center", color: "white" }}>
                    <Icon name="sparkles" size={12} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-ink)" }}>AI suggestion</span>
                </div>
                <div style={{ fontSize: 13, lineHeight: 1.5, color: "#222", minHeight: 88 }}>
                  {typed}
                  {typed.length < suggestions[pickedIdx].length && <span style={{ display: "inline-block", width: 2, height: 14, background: "var(--accent)", marginLeft: 1, verticalAlign: "middle", animation: "pulse 1s infinite" }} />}
                </div>
              </div>

              <div className="row" style={{ gap: 6, flexWrap: "wrap" }}>
                {suggestions.map((_, i) => (
                  <button key={i} onClick={() => setPickedIdx(i)} style={{
                    padding: "5px 10px", fontSize: 11, border: "1px solid #EEE", borderRadius: 999,
                    background: i === pickedIdx ? "#111" : "white",
                    color: i === pickedIdx ? "white" : "#444",
                    cursor: "pointer", fontWeight: 500,
                  }}>Option {i + 1}</button>
                ))}
                <button onClick={() => setPickedIdx(p => (p + 1) % suggestions.length)} style={{
                  padding: "5px 10px", fontSize: 11, border: "1px solid #EEE", borderRadius: 999, background: "white", color: "#444",
                  cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4,
                }}>
                  <Icon name="sparkles" size={12} /> Regenerate
                </button>
              </div>

              <div style={{ flex: 1 }} />
              <button className="btn btn-primary" style={{ background: "#111", color: "white", borderColor: "#111", width: "100%", justifyContent: "center" }} onClick={handleCopy}>
                {copied ? <><Icon name="check" size={15} /> Copied!</> : <><Icon name="copy" size={14} /> Copy review</>}
              </button>
              <button className="btn" style={{ background: "white", color: "#111", border: "1px solid #DDD", width: "100%", justifyContent: "center" }} onClick={() => setStep("redirect")}>
                Continue to Google <Icon name="arrow" size={14} />
              </button>
              <div style={{ fontSize: 10, textAlign: "center", color: "#bbb", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>STEP 2 OF 4</div>
            </div>
          )}

          {step === "redirect" && (
            <div className="fade-up" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: "#F5F6FA", display: "grid", placeItems: "center", position: "relative" }}>
                <svg width="28" height="28" viewBox="0 0 24 24">
                  <path d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4c-.2 1.3-1 2.4-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.5z" fill="#4285F4"/>
                  <path d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2 1-3.4 1-2.6 0-4.9-1.8-5.7-4.2H3v2.7C4.7 19.8 8.1 22 12 22z" fill="#34A853"/>
                  <path d="M6.3 13.8c-.2-.6-.3-1.2-.3-1.8s.1-1.2.3-1.8V7.5H3C2.4 8.9 2 10.4 2 12s.4 3.1 1 4.5l3.3-2.7z" fill="#FBBC05"/>
                  <path d="M12 5.8c1.5 0 2.8.5 3.8 1.5l2.9-2.9C17 2.9 14.7 2 12 2 8.1 2 4.7 4.2 3 7.5l3.3 2.7C7.1 7.6 9.4 5.8 12 5.8z" fill="#EA4335"/>
                </svg>
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, color: "#111" }}>Redirecting to Google…</h3>
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#777" }}>Your review is on your clipboard. Paste & post.</p>
              </div>
              <div style={{ width: 200 }} className="progress"><span style={{ width: `${progress * 100}%` }} /></div>
              <div style={{ fontSize: 10, color: "#bbb", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>STEP 3 OF 4</div>
            </div>
          )}

          {step === "done" && (
            <div className="fade-up" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, textAlign: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: "50%", background: "linear-gradient(135deg, #34A853, #1E7E34)", display: "grid", placeItems: "center", color: "white", boxShadow: "0 12px 30px -10px rgba(52,168,83,0.45)" }}>
                <Icon name="check" size={28} stroke={2.5} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 17, color: "#111" }}>Review posted on Google ✨</h3>
                <p style={{ margin: "6px 0 0", fontSize: 12, color: "#777", maxWidth: 220 }}>Thanks for supporting {business}. Your review helps real people discover us.</p>
              </div>
              <button className="btn btn-sm btn-quiet" onClick={reset} style={{ background: "#F4F4F8", color: "#111", border: "1px solid #EEE" }}>
                Run demo again
              </button>
              <div style={{ fontSize: 10, color: "#bbb", fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}>COMPLETE</div>
            </div>
          )}
        </div>

        {/* home indicator */}
        <div style={{ height: 14, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ width: 100, height: 4, background: "#111", borderRadius: 999, opacity: 0.85 }} />
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { MobileFunnel });
