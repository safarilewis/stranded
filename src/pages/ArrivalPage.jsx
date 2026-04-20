import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Particles from "../components/Particles";

export default function ArrivalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState(0);

  const continueTo = location.state?.continueTo || "/map";

  useEffect(() => {
    const phaseOneId = window.setTimeout(() => setPhase(1), 700);
    const phaseTwoId = window.setTimeout(() => setPhase(2), 1650);
    const redirectId = window.setTimeout(() => {
      navigate(continueTo, { replace: true });
    }, 3600);

    return () => {
      window.clearTimeout(phaseOneId);
      window.clearTimeout(phaseTwoId);
      window.clearTimeout(redirectId);
    };
  }, [continueTo, navigate]);

  const phaseLine =
    phase === 0
      ? "Take one breath before you step inside."
      : phase === 1
        ? "Let the weight of the day loosen at the shore."
        : "The island is ready to hold the rest for a while.";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #07111d 0%, #0c1e31 46%, #132a41 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
      }}
    >
      <Particles type="stars" />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(6,10,18,0.3) 0%, rgba(6,10,18,0.65) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "22%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(780px, 94vw)",
          height: "340px",
          borderRadius: "999px",
          background: "radial-gradient(ellipse, rgba(140,190,240,0.12) 0%, rgba(140,190,240,0.05) 36%, transparent 72%)",
          filter: "blur(18px)",
          animation: "veilShift 8s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "min(760px, 100%)",
          textAlign: "center",
          position: "relative",
          zIndex: 5,
          padding: "40px 28px",
        }}
      >
        <p
          className="label-upper"
          style={{
            marginBottom: "18px",
            color: "rgba(255,255,255,0.38)",
            animation: "fadeIn 0.8s ease",
          }}
        >
          Welcome back to the island
        </p>

        <div
          style={{
            width: "150px",
            height: "150px",
            margin: "0 auto 30px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.14)",
            display: "grid",
            placeItems: "center",
            animation: "breatheRing 5.5s ease-in-out infinite",
            boxShadow: "0 0 60px rgba(255,255,255,0.08)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "-14px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,0.08)",
              animation: "slowSpin 18s linear infinite",
            }}
          />
          <div
            style={{
              width: "82px",
              height: "82px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "grid",
              placeItems: "center",
              fontSize: "34px",
              animation: "driftUpSoft 4.5s ease-in-out infinite",
            }}
          >
            ✦
          </div>
        </div>

        <div
          style={{
            width: "min(220px, 68vw)",
            height: "1px",
            margin: "0 auto 24px",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
            animation: "pulseLine 2.8s ease-in-out infinite",
          }}
        />

        <h1
          style={{
            fontSize: "clamp(36px, 6vw, 66px)",
            fontStyle: "italic",
            fontWeight: 400,
            color: "rgba(255,255,255,0.95)",
            lineHeight: 1.04,
            marginBottom: "18px",
            animation: "fadeIn 1s ease",
          }}
        >
          Leave your worries
          <br />
          at the waterline.
        </h1>

        <p
          style={{
            maxWidth: "600px",
            margin: "0 auto 24px",
            fontSize: "18px",
            lineHeight: 1.85,
            color: "rgba(255,255,255,0.66)",
            animation: "fadeIn 1.15s ease",
          }}
        >
          You do not have to carry everything inside with you. Let the island take the noise first,
          and keep only what you need for this next chapter.
        </p>

        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "13px",
            letterSpacing: "0.08em",
            color: "rgba(255,255,255,0.38)",
            marginBottom: "26px",
            animation: "fadeIn 1.3s ease",
          }}
        >
          {phaseLine}
        </p>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "30px",
          }}
        >
          {[0, 1, 2].map((dot) => (
            <span
              key={dot}
              style={{
                width: phase === dot ? "26px" : "8px",
                height: "8px",
                borderRadius: "999px",
                background: "rgba(255,255,255,0.56)",
                transition: "width 0.35s ease, opacity 0.35s ease",
                opacity: phase >= dot ? 1 : 0.42,
                animation: `gentlePulse 1.6s ease-in-out ${dot * 0.18}s infinite`,
              }}
            />
          ))}
        </div>

        <button
          type="button"
          className="gentle-btn"
          onClick={() => navigate(continueTo, { replace: true })}
        >
          Enter island
        </button>
      </div>
    </div>
  );
}
