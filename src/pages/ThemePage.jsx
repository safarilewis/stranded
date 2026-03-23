import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import Particles from "../components/Particles";
import { DESTINATIONS, THEMES } from "../config/destinations";

export default function ThemePage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const destination = DESTINATIONS.find((entry) => entry.slug === slug);

  useEffect(() => {
    if (destination?.slug === "gallery") {
      navigate("/destination/gallery/gallery", { replace: true });
    }
  }, [destination, navigate]);

  if (!destination) {
    return null;
  }

  const availableThemes = THEMES.filter((theme) => destination.themeMedia?.[theme.slug]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: destination.bgGradient,
        padding: "60px 24px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Particles type={destination.particleType} />

      <div
        style={{
          maxWidth: "980px",
          margin: "0 auto",
          position: "relative",
          zIndex: 10,
        }}
      >
        <button
          type="button"
          className="back-link"
          onClick={() => navigate("/map")}
          style={{ marginBottom: "32px" }}
        >
          ← Back to island
        </button>

        <div style={{ textAlign: "center", marginBottom: "56px", animation: "fadeIn 0.8s ease" }}>
          <p className="label-upper" style={{ marginBottom: "16px" }}>
            {destination.name}
          </p>
          <h1
            style={{
              fontSize: "clamp(30px, 5vw, 46px)",
              fontStyle: "italic",
              fontWeight: 600,
              color: "rgba(255,255,255,0.9)",
            }}
          >
            What are you carrying right now?
          </h1>
          <p
            style={{
              marginTop: "18px",
              maxWidth: "640px",
              marginInline: "auto",
              fontSize: "17px",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
            }}
          >
            Choose the one space available here and step into it.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "20px",
          }}
        >
          {availableThemes.map((theme, index) => (
            <button
              key={theme.slug}
              type="button"
              onClick={() => navigate(`/destination/${destination.slug}/${theme.slug}`)}
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.03) 100%)",
                backdropFilter: "blur(12px)",
                borderRadius: "22px",
                padding: "30px 24px",
                border: "1px solid rgba(255,255,255,0.1)",
                textAlign: "left",
                color: "inherit",
                transition: "all 0.4s cubic-bezier(0.23, 1, 0.32, 1)",
                animation: `slideUp 0.6s ease ${index * 0.08}s both`,
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                event.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = "translateY(0) scale(1)";
                event.currentTarget.style.boxShadow = "none";
              }}
            >
              <div style={{ fontSize: "34px", marginBottom: "16px" }}>{theme.emoji}</div>
              <h2 style={{ fontSize: "24px", fontWeight: 600, marginBottom: "10px" }}>{theme.name}</h2>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.55)",
                  marginBottom: "12px",
                }}
              >
                {theme.tagline}
              </p>
              <p
                style={{
                  fontSize: "15px",
                  color: "var(--text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {theme.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
