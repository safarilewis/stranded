import { useNavigate } from "react-router-dom";
import AccountBar from "../components/AccountBar";
import Particles from "../components/Particles";
import { DESTINATIONS } from "../config/destinations";

export default function MapPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0a1a2e 0%, #12263e 40%, #1a3048 100%)",
        padding: "60px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Particles type="stars" />

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          position: "relative",
          zIndex: 10,
        }}
      >
        <AccountBar />
        {/* Header */}
        <div
          style={{
            textAlign: "center",
            animation: "fadeIn 0.8s ease",
            marginBottom: "60px",
          }}
        >
          <p className="label-upper" style={{ marginBottom: "16px" }}>
            Choose your destination
          </p>
          <h2
            style={{
              fontSize: "clamp(28px, 5vw, 40px)",
              fontWeight: 600,
              fontStyle: "italic",
              color: "rgba(255,255,255,0.9)",
              lineHeight: 1.3,
            }}
          >
            Where does your heart want to go?
          </h2>
        </div>

        {/* Grid of destination cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
            marginBottom: "60px",
          }}
        >
          {DESTINATIONS.map((dest, i) => (
            <div
              key={dest.slug}
              onClick={() =>
                navigate(dest.slug === "gallery" ? "/destination/gallery/gallery" : `/destination/${dest.slug}`)
              }
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                backdropFilter: "blur(12px)",
                borderRadius: "20px",
                padding: "36px 28px",
                border: "1px solid rgba(255,255,255,0.08)",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
                animation: `slideUp 0.6s ease ${i * 0.08}s both`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px) scale(1.03)";
                e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: "40px", marginBottom: "16px" }}>
                {dest.emoji}
              </div>
              <h3
                style={{
                  fontSize: "22px",
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.9)",
                  marginBottom: "8px",
                }}
              >
                {dest.name}
              </h3>
              <p
                style={{
                  fontSize: "14px",
                  fontFamily: "var(--font-sans)",
                  color: "rgba(255,255,255,0.45)",
                  fontWeight: 300,
                }}
              >
                {dest.tagline}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            fontStyle: "italic",
            color: "rgba(255,255,255,0.25)",
          }}
        >
          There is no right path. Trust your instinct.
        </div>
      </div>
    </div>
  );
}
