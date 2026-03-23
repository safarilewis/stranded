import { useNavigate } from "react-router-dom";
import Particles from "../components/Particles";
import useAuth from "../hooks/useAuth";

export default function Welcome() {
  const navigate = useNavigate();
  const { session } = useAuth();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, #0a1a2e 0%, #1a2a3e 30%, #2a3a4a 60%, #1a2a3e 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Particles type="stars" />

      {/* Breathing rings */}
      <div
        style={{
          position: "absolute",
          width: "200px",
          height: "200px",
          border: "1px solid rgba(255,255,255,0.04)",
          borderRadius: "50%",
          animation: "breatheRing 6s ease-in-out infinite",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "340px",
          height: "340px",
          border: "1px solid rgba(255,255,255,0.04)",
          borderRadius: "50%",
          animation: "breatheRing 6s ease-in-out infinite",
          animationDelay: "0.4s",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "500px",
          height: "500px",
          border: "1px solid rgba(255,255,255,0.04)",
          borderRadius: "50%",
          animation: "breatheRing 6s ease-in-out infinite",
          animationDelay: "0.8s",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Content */}
      <div
        style={{
          maxWidth: "520px",
          textAlign: "center",
          animation: "fadeIn 1.2s ease",
          position: "relative",
          zIndex: 10,
          padding: "0 24px",
        }}
      >
        <p className="label-upper" style={{ marginBottom: "32px" }}>
          Stranded?
        </p>

        <h1
          style={{
            fontSize: "clamp(36px, 7vw, 56px)",
            fontWeight: 700,
            fontStyle: "italic",
            color: "rgba(255,255,255,0.9)",
            marginBottom: "24px",
            lineHeight: 1.2,
          }}
        >
          Where are you off to today?
        </h1>

        <p
          style={{
            fontSize: "18px",
            color: "rgba(255,255,255,0.45)",
            lineHeight: 1.7,
            marginBottom: "48px",
          }}
        >
          A space to breathe, reset, and reconnect. No pressure. No judgment. Just you.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "16px", flexWrap: "wrap" }}>
          <button className="gentle-btn" onClick={() => navigate(session ? "/map" : "/signin")}>
            {session ? "Enter Island" : "Sign In"}
          </button>
          {!session && (
            <button className="gentle-btn" onClick={() => navigate("/signup")}>
              Sign Up
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
