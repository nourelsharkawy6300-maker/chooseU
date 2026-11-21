import { ImageResponse } from "next/og";

export const alt = "ChooseU — دليلك الأكاديمي والمالي للجامعات المصرية";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background: "linear-gradient(135deg, #18181B 0%, #1e293b 55%, #CA8A04 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "18px",
              background: "#EAB308",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              fontWeight: 800,
              color: "#ffffff",
              boxShadow: "0 12px 30px rgba(234, 179, 8, 0.45)",
            }}
          >
            U
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontSize: "34px", fontWeight: 800, letterSpacing: "-0.02em" }}>
              ChooseU
            </span>
            <span style={{ fontSize: "18px", color: "#93c5fd" }}>
              Egypt University Guidance &amp; TCO Platform
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px", maxWidth: "960px" }}>
          <div
            style={{
              fontSize: "54px",
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            Smart Academic &amp; Financial Planning for Egyptian Universities
          </div>
          <div style={{ fontSize: "24px", color: "#cbd5e1", lineHeight: 1.4 }}>
            Compare Public, Ahli &amp; Private tracks • Calculate Total Cost of Ownership (TCO) • Verified Consultation Reports
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(148, 163, 184, 0.28)",
            paddingTop: "24px",
            fontSize: "20px",
            color: "#e2e8f0",
          }}
        >
          <span>choose-u.vercel.app</span>
          <span style={{ color: "#93c5fd", fontWeight: 600 }}>
            Thanaweya Amma &amp; STEM • 2026
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}