import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Particles from "../components/Particles";
import { DESTINATIONS, THEMES } from "../config/destinations";

export default function TransitionPage() {
  const { slug, themeSlug } = useParams();
  const navigate = useNavigate();
  const destination = DESTINATIONS.find((entry) => entry.slug === slug);
  const theme = themeSlug ? THEMES.find((entry) => entry.slug === themeSlug) : null;
  const [phase, setPhase] = useState(0);
  const isSceneTransition = Boolean(themeSlug);

  useEffect(() => {
    if (!destination || (themeSlug && !theme)) {
      navigate("/map", { replace: true });
      return undefined;
    }

    const phaseOneId = window.setTimeout(() => setPhase(1), 450);
    const phaseTwoId = window.setTimeout(() => setPhase(2), 1200);
    const timeoutId = window.setTimeout(() => {
      navigate(isSceneTransition ? `/destination/${slug}/${themeSlug}` : `/destination/${slug}`, { replace: true });
    }, 2800);

    return () => {
      window.clearTimeout(phaseOneId);
      window.clearTimeout(phaseTwoId);
      window.clearTimeout(timeoutId);
    };
  }, [destination, isSceneTransition, navigate, slug, theme, themeSlug]);

  if (!destination || (themeSlug && !theme)) {
    return null;
  }

  const introLine = isSceneTransition
    ? destination.themeMedia?.[theme.slug]?.introLine ||
      theme.storyPrompt ||
      "A new chapter opens."
    : destination.storyHook || "A new shoreline is unfolding ahead of you.";
  const phaseLine =
    phase === 0
      ? "The island is listening."
      : phase === 1
        ? "The air is shifting around your path."
        : "The scene is ready. Step forward.";
  const eyebrow = isSceneTransition ? "Crossing into the next chapter" : "Approaching the island";
  const subhead = isSceneTransition ? theme.name : destination.name;
  const buttonLabel = isSceneTransition ? "Enter scene" : "Enter island";
  const targetPath = isSceneTransition ? `/destination/${slug}/${themeSlug}` : `/destination/${slug}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: destination.bgGradient,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
      }}
    >
      <Particles type={destination.particleType} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(180deg, rgba(5,10,18,0.2) 0%, rgba(5,10,18,0.55) 100%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "18%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(760px, 92vw)",
          height: "340px",
          borderRadius: "999px",
          background: "radial-gradient(ellipse, rgba(255,255,255,0.12) 0%, rgba(120,170,220,0.08) 36%, transparent 72%)",
          filter: "blur(18px)",
          animation: "veilShift 8s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          width: "min(720px, 100%)",
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
            color: "rgba(255,255,255,0.4)",
            animation: "fadeIn 0.8s ease",
          }}
        >
          {eyebrow}
        </p>

        <div
          style={{
            width: "140px",
            height: "140px",
            margin: "0 auto 28px",
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
              width: "76px",
              height: "76px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "grid",
              placeItems: "center",
              fontSize: "34px",
              animation: "driftUpSoft 4.5s ease-in-out infinite",
            }}
          >
            {destination.emoji}
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
            fontSize: "clamp(34px, 6vw, 62px)",
            fontStyle: "italic",
            fontWeight: 400,
            color: "rgba(255,255,255,0.94)",
            lineHeight: 1.06,
            marginBottom: "16px",
            animation: "fadeIn 1s ease",
          }}
        >
          {destination.storyTitle || destination.name}
        </h1>

        <p
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: "14px",
            letterSpacing: "2px",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.48)",
            marginBottom: "18px",
            animation: "fadeIn 1s ease",
          }}
        >
          {subhead}
        </p>

        <p
          style={{
            maxWidth: "580px",
            margin: "0 auto 28px",
            fontSize: "18px",
            lineHeight: 1.8,
            color: "rgba(255,255,255,0.68)",
            animation: "fadeIn 1.15s ease",
          }}
        >
          {introLine}
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
          onClick={() => navigate(targetPath, { replace: true })}
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  );
}
