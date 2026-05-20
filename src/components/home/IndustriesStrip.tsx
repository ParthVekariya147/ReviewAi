import Link from "next/link";

const Sparkline = ({ data, w = 50, h = 20, color = "var(--accent)" }: { data: number[]; w?: number; h?: number; color?: string }) => {
  const max = Math.max(...data), min = Math.min(...data);
  const xs = (i: number) => (i / (data.length - 1)) * w;
  const ys = (v: number) => h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
  const d = data.map((v, i) => `${i === 0 ? "M" : "L"}${xs(i).toFixed(1)},${ys(v).toFixed(1)}`).join(" ");
  return (
    <svg width={w} height={h} style={{ display: "block" }}>
      <path d={d} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const INDUSTRIES = [
  { name: "Restaurants", icon: "🍽️", color: "#F4A861", lift: "+340% reviews", desc: "Table tents, receipt QRs, post-meal scans.", series: [12,14,18,20,24,28,32,36] },
  { name: "Salons & Beauty", icon: "💇", color: "#E48BD3", lift: "+280% reviews", desc: "QR at the chair, post-service flow.", series: [8,10,14,18,22,24,28,32] },
  { name: "Clinics", icon: "🩺", color: "#67C3F2", lift: "+410% reviews", desc: "Reception stickers, after-care emails.", series: [6,9,12,16,22,26,32,38] },
  { name: "Dry Cleaners", icon: "👔", color: "#9C8FF1", lift: "+220% reviews", desc: "Garment tag QR, pickup-time prompt.", series: [4,6,8,10,12,16,20,24] },
  { name: "Gyms", icon: "🏋️", color: "#7CD8A9", lift: "+260% reviews", desc: "Locker QR, end-of-class flow.", series: [10,12,14,18,22,26,30,34] },
  { name: "Retail", icon: "🛍️", color: "#F58592", lift: "+190% reviews", desc: "Counter QR, bag inserts.", series: [14,16,18,20,22,26,28,30] },
  { name: "Cafés", icon: "☕", color: "#C49A6C", lift: "+310% reviews", desc: "Cup-sleeve QR, receipt nudge.", series: [10,14,18,22,28,32,36,42] },
  { name: "Service providers", icon: "🛠️", color: "#9FBE8C", lift: "+240% reviews", desc: "Invoice QR, job-done texts.", series: [6,8,12,14,16,20,22,26] },
];

export default function IndustriesStrip() {
  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "end", marginBottom: 48 }} className="ig-head">
          <div>
            <span className="eyebrow"><span className="dot" /> Industries</span>
            <h2 className="h2" style={{ marginTop: 18 }}>Built for every kind of local business.</h2>
          </div>
          <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.6, maxWidth: 460, marginBottom: 8 }}>
            Pre-tuned funnel templates and AI tone presets for the eight most common review-driven business categories.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }} className="industries-grid">
          {INDUSTRIES.map((ind, i) => (
            <Link key={i} href="/industries" className="card lift" style={{ padding: 22, display: "block", textDecoration: "none" }}>
              <div className="between" style={{ marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, color-mix(in oklab, ${ind.color} 24%, white), color-mix(in oklab, ${ind.color} 8%, white))`, display: "grid", placeItems: "center", fontSize: 22 }}>
                  {ind.icon}
                </div>
                <Sparkline data={ind.series} color={ind.color} />
              </div>
              <h4 style={{ margin: 0, fontSize: 17, letterSpacing: "-0.01em", color: "var(--ink)" }}>{ind.name}</h4>
              <p style={{ fontSize: 13, color: "var(--muted)", margin: "6px 0 14px", lineHeight: 1.5 }}>{ind.desc}</p>
              <span className="chip green">{ind.lift}</span>
            </Link>
          ))}
        </div>

        <style>{`
          @media (max-width: 1100px) { .industries-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 600px) { .industries-grid { grid-template-columns: 1fr !important; } }
          @media (max-width: 900px) { .ig-head { grid-template-columns: 1fr !important; gap: 16px !important; } }
        `}</style>
      </div>
    </section>
  );
}
