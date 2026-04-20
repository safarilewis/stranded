import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const islands = [
  {
    emoji: "🌊",
    name: "The Ocean",
    tag: "Depth & Release",
    description:
      "Let the tide carry what you're carrying. Exercises around surrender, rhythm, and the vastness of open water.",
    line: "linear-gradient(to right, transparent, rgba(80,140,220,0.42), transparent)",
    glow: "linear-gradient(to top, rgba(60,120,210,0.11), transparent)",
  },
  {
    emoji: "☁️",
    name: "The Sky",
    tag: "Clarity & Perspective",
    description:
      "Rise above the noise. Exercises around stillness, spaciousness, and seeing from a different altitude.",
    line: "linear-gradient(to right, transparent, rgba(180,200,240,0.34), transparent)",
    glow: "linear-gradient(to top, rgba(160,185,230,0.08), transparent)",
  },
  {
    emoji: "🌿",
    name: "The Forest",
    tag: "Grounding & Renewal",
    description:
      "Root down. Exercises around presence, slow breath, and the quiet that lives between old trees.",
    line: "linear-gradient(to right, transparent, rgba(80,160,120,0.4), transparent)",
    glow: "linear-gradient(to top, rgba(60,150,100,0.09), transparent)",
  },
];

const steps = [
  {
    title: "Begin the crossing",
    text: "The story opens at the shore. Choose the island path that feels closest to what you are carrying tonight.",
  },
  {
    title: "Follow the guide",
    text: "Each chapter is narrated like a quiet quest, with atmosphere, movement, and a feeling that you are being led somewhere real.",
  },
  {
    title: "Leave with a lantern",
    text: "When the path ends, you return to the island changed a little, and you can come back whenever the story needs to continue.",
  },
];

function buildStars() {
  return Array.from({ length: 72 }, (_, index) => ({
    id: index,
    top: Math.random() * 100,
    left: Math.random() * 100,
    size: Math.random() * 2.4 + 0.8,
    low: Math.random() * 0.18 + 0.12,
    high: Math.random() * 0.35 + 0.4,
    duration: `${Math.random() * 5 + 3}s`,
    delay: `${Math.random() * 4}s`,
  }));
}

export default function Welcome() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();

  const stars = useMemo(() => buildStars(), []);

  useEffect(() => {
    if (!loading && session) {
      navigate("/map", { replace: true });
    }
  }, [loading, navigate, session]);

  if (loading || session) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080f1a",
        }}
      />
    );
  }

  const scrollTo = (id) => {
    const element = document.getElementById(id);
    if (!element) {
      return;
    }

    const headerOffset = 104;
    const targetTop = element.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top: Math.max(targetTop, 0), behavior: "smooth" });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080f1a",
        color: "rgba(220,235,250,0.78)",
        fontFamily: "var(--font-sans)",
        position: "relative",
        overflowX: "hidden",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          overflow: "hidden",
        }}
      >
        {stars.map((star) => (
          <span
            key={star.id}
            style={{
              position: "absolute",
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              borderRadius: "999px",
              background: "white",
              opacity: star.low,
              animation: `twinkle ${star.duration} ease-in-out infinite alternate`,
              animationDelay: star.delay,
              ["--lo"]: star.low,
              ["--hi"]: star.high,
            }}
          />
        ))}
      </div>

      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "20px",
          padding: "24px clamp(24px, 5vw, 64px)",
          background: "rgba(8,15,26,0.72)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid rgba(80,120,180,0.1)",
        }}
      >
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          style={{
            border: "none",
            background: "none",
            color: "rgba(200,225,245,0.72)",
            textTransform: "uppercase",
            fontFamily: "var(--font-serif)",
            fontSize: "1.2rem",
            letterSpacing: "0.25em",
            cursor: "pointer",
          }}
        >
          Stranded
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "clamp(12px, 2vw, 28px)",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          {[
            { label: "Islands", id: "islands" },
            { label: "About", id: "about" },
            { label: "Sign Up", id: "cta" },
          ].map((link) => (
            <button
              key={link.id}
              type="button"
              onClick={() => scrollTo(link.id)}
              style={{
                border: "none",
                background: "none",
                color: "rgba(180,205,230,0.42)",
                fontSize: "0.7rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {link.label}
            </button>
          ))}
            <button
              type="button"
              onClick={() => navigate("/signin")}
              style={{
                padding: "12px 22px",
              border: "1px solid rgba(200,169,110,0.45)",
              background: "transparent",
              color: "#c8a96e",
              borderRadius: "2px",
                fontSize: "0.68rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform = "translateY(-3px)";
                event.currentTarget.style.borderColor = "rgba(200,169,110,0.72)";
                event.currentTarget.style.boxShadow = "0 10px 24px rgba(0,0,0,0.18)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = "translateY(0)";
                event.currentTarget.style.borderColor = "rgba(200,169,110,0.45)";
                event.currentTarget.style.boxShadow = "none";
              }}
            >
              Login
            </button>
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 1 }}>
        <section
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            padding: "140px 24px 96px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: "auto 0 0 0",
              height: "45%",
              background: "linear-gradient(to top, rgba(10,20,40,1) 0%, rgba(16,32,60,0.6) 40%, transparent 100%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "20%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "60%",
              height: "1px",
              background: "linear-gradient(to right, transparent, rgba(100,160,220,0.3), transparent)",
              boxShadow: "0 0 60px 20px rgba(80,140,210,0.12)",
              animation: "oceanBreathe 6.8s ease-in-out infinite",
            }}
          />

          <p
            className="label-upper"
            style={{
              marginBottom: "24px",
              color: "rgba(180,205,230,0.35)",
              letterSpacing: "0.3em",
              animation: "fadeIn 1.2s ease",
            }}
          >
            A place to drift
          </p>

          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(3.2rem, 7vw, 5.8rem)",
              fontWeight: 300,
              fontStyle: "italic",
              lineHeight: 1.06,
              color: "rgba(225,238,252,0.95)",
              marginBottom: "24px",
              position: "relative",
              animation: "fadeIn 1.2s ease",
            }}
          >
            Where are you
            <br />
            off to today?
            <span
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(90deg, transparent 0%, rgba(220,234,250,0.12) 50%, transparent 100%)",
                mixBlendMode: "screen",
                pointerEvents: "none",
                animation: "shimmerSweep 6.5s ease-in-out infinite",
              }}
            />
          </h1>

          <p
            style={{
              fontSize: "0.95rem",
              letterSpacing: "0.06em",
              lineHeight: 1.9,
              color: "rgba(180,205,230,0.42)",
              maxWidth: "430px",
              animation: "fadeIn 1.2s ease",
            }}
          >
            A story-driven island for freshmen to wander through grief, homesickness, and overwhelm
            one guided chapter at a time.
          </p>

          <div
            style={{
              marginTop: "48px",
              display: "flex",
              gap: "16px",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "center",
              animation: "fadeIn 1.2s ease",
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/signup")}
              style={{
                padding: "14px 34px",
                border: "1px solid rgba(200,169,110,0.5)",
                background: "transparent",
                color: "#c8a96e",
                borderRadius: "2px",
                fontSize: "0.7rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                cursor: "pointer",
                boxShadow: "0 0 20px rgba(200,169,110,0.06)",
                animation: "gentlePulse 5.2s ease-in-out infinite",
                transition: "transform 0.28s ease, background 0.28s ease, box-shadow 0.28s ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform = "translateY(-4px)";
                event.currentTarget.style.background = "rgba(200,169,110,0.08)";
                event.currentTarget.style.boxShadow = "0 14px 28px rgba(0,0,0,0.22)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = "translateY(0)";
                event.currentTarget.style.background = "transparent";
                event.currentTarget.style.boxShadow = "0 0 20px rgba(200,169,110,0.06)";
              }}
            >
              Enter Island
            </button>
            <button
              type="button"
              onClick={() => scrollTo("islands")}
              style={{
                padding: "14px 24px",
                background: "transparent",
                border: "none",
                color: "rgba(180,205,230,0.4)",
                fontSize: "0.7rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "transform 0.28s ease, color 0.28s ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform = "translateY(-3px)";
                event.currentTarget.style.color = "rgba(200,225,245,0.72)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = "translateY(0)";
                event.currentTarget.style.color = "rgba(180,205,230,0.4)";
              }}
            >
              Learn More ↓
            </button>
          </div>
        </section>

        <section
          id="islands"
          style={{
            padding: "112px clamp(24px, 5vw, 64px)",
            background: "linear-gradient(to bottom, #080f1a, rgba(10,20,38,1))",
          }}
        >
          <p
            className="label-upper"
            style={{ textAlign: "center", marginBottom: "12px", color: "rgba(180,205,230,0.35)" }}
          >
            Choose your escape
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.2rem, 4vw, 3.3rem)",
              fontWeight: 300,
              fontStyle: "italic",
              textAlign: "center",
              color: "rgba(220,234,250,0.88)",
              marginBottom: "16px",
            }}
          >
            Three islands. One breath.
          </h2>
          <p
            style={{
              fontSize: "0.85rem",
              color: "rgba(180,205,230,0.4)",
              textAlign: "center",
              maxWidth: "470px",
              margin: "0 auto 64px",
              lineHeight: 1.9,
              letterSpacing: "0.03em",
            }}
          >
            Each island holds a different world, shaped by its terrain, sounds, and light, but all
            of them now feel like chapters in the same nighttime journey.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "1px",
              maxWidth: "960px",
              margin: "0 auto",
              border: "1px solid rgba(80,120,180,0.1)",
              background: "rgba(80,120,180,0.1)",
            }}
          >
            {islands.map((island) => (
              <button
                key={island.name}
                type="button"
                onClick={() => navigate("/signup")}
                style={{
                  position: "relative",
                  overflow: "hidden",
                  padding: "48px 40px 40px",
                  background: "rgba(12,22,40,0.72)",
                  border: "none",
                  textAlign: "left",
                  color: "inherit",
                  cursor: "pointer",
                  animation: "revealUp 0.85s ease both",
                  transition: "transform 0.32s ease, background 0.35s ease, box-shadow 0.32s ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform = "translateY(-8px)";
                  event.currentTarget.style.background = "rgba(20,35,60,0.85)";
                  event.currentTarget.style.boxShadow = "0 22px 42px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = "translateY(0)";
                  event.currentTarget.style.background = "rgba(12,22,40,0.72)";
                  event.currentTarget.style.boxShadow = "none";
                }}
              >
                <span
                  style={{
                    display: "block",
                    fontSize: "2rem",
                    marginBottom: "24px",
                    opacity: 0.28,
                    filter: "saturate(0.5) brightness(1.5)",
                    animation: "driftUpSoft 6s ease-in-out infinite",
                  }}
                >
                  {island.emoji}
                </span>
                <p
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.6rem",
                    fontWeight: 300,
                    fontStyle: "italic",
                    color: "rgba(215,232,250,0.9)",
                    marginBottom: "10px",
                  }}
                >
                  {island.name}
                </p>
                <span
                  style={{
                    display: "inline-block",
                    fontSize: "0.58rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: "#c8a96e",
                    border: "1px solid rgba(200,169,110,0.3)",
                    padding: "0.2rem 0.6rem",
                    borderRadius: "1px",
                    marginBottom: "18px",
                  }}
                >
                  {island.tag}
                </span>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "rgba(180,205,230,0.42)",
                    lineHeight: 1.9,
                    letterSpacing: "0.03em",
                    position: "relative",
                    zIndex: 2,
                  }}
                >
                  {island.description}
                </p>
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: "1px",
                    background: island.line,
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: 0,
                    height: "48px",
                    background: island.glow,
                    opacity: 1,
                  }}
                />
              </button>
            ))}
          </div>
        </section>

        <section
          id="about"
          style={{
            padding: "128px clamp(24px, 5vw, 64px)",
            background: "rgba(10,20,38,1)",
          }}
        >
          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "56px",
              alignItems: "start",
            }}
          >
            <div>
              <p className="label-upper" style={{ marginBottom: "16px", color: "rgba(180,205,230,0.35)" }}>
                How it works
              </p>
              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(2.3rem, 4vw, 3.2rem)",
                  fontWeight: 300,
                  fontStyle: "italic",
                  lineHeight: 1,
                  color: "rgba(220,234,250,0.9)",
                  marginBottom: "24px",
                  animation: "revealLeft 0.8s ease both",
                }}
              >
                Land.
                <br />
                Wander.
                <br />
                Return.
              </h2>
              <div
                style={{
                  width: "32px",
                  height: "1px",
                  background: "rgba(200,169,110,0.5)",
                  marginBottom: "24px",
                }}
              />
              <div style={{ fontSize: "0.875rem", color: "rgba(180,205,230,0.42)", lineHeight: 2 }}>
                <p style={{ marginBottom: "18px" }}>
                  Stranded is a guided imagination tool built for the freshman experience, the
                  overwhelm, the longing, and the searching, but told more like a playable fable
                  than a utility.
                </p>
                <p>Pick an island. Enter a chapter. Follow the voice. Return with a little more room.</p>
              </div>
            </div>

            <div style={{ display: "grid", gap: "28px" }}>
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "flex-start",
                    animation: `revealLeft 0.75s ease ${index * 0.12}s both`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--font-serif)",
                      fontSize: "2rem",
                      fontStyle: "italic",
                      color: "rgba(200,169,110,0.25)",
                      lineHeight: 1,
                      width: "2rem",
                      textAlign: "right",
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "rgba(215,232,250,0.7)",
                        marginBottom: "8px",
                      }}
                    >
                      {step.title}
                    </p>
                    <p style={{ fontSize: "0.8rem", color: "rgba(180,205,230,0.42)", lineHeight: 1.85 }}>
                      {step.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="cta"
          style={{
            padding: "128px 24px",
            textAlign: "center",
            background: "linear-gradient(to bottom, rgba(10,20,38,1), #080f1a)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "600px",
              height: "300px",
              background: "radial-gradient(ellipse, rgba(60,100,180,0.1) 0%, transparent 70%)",
              pointerEvents: "none",
              animation: "ctaGlowPulse 6s ease-in-out infinite",
            }}
          />
          <p className="label-upper" style={{ marginBottom: "20px", color: "rgba(180,205,230,0.35)" }}>
            Ready to enter
          </p>
          <h2
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "clamp(2.6rem, 5vw, 4.2rem)",
              fontWeight: 300,
              fontStyle: "italic",
              color: "rgba(220,234,250,0.9)",
              marginBottom: "20px",
              lineHeight: 1.1,
              position: "relative",
              zIndex: 1,
              animation: "revealUp 0.85s ease 0.1s both",
            }}
          >
            Find your island
            <br />
            and begin.
          </h2>
          <p
            style={{
              fontSize: "0.85rem",
              color: "rgba(180,205,230,0.42)",
              maxWidth: "380px",
              margin: "0 auto 42px",
              lineHeight: 1.9,
              letterSpacing: "0.04em",
              position: "relative",
              zIndex: 1,
              animation: "revealUp 0.85s ease 0.22s both",
            }}
          >
            Create an account to step into the island map, choose a destination, and start the
            guided experience.
          </p>
          <div
            style={{
              display: "flex",
              gap: "14px",
              justifyContent: "center",
              flexWrap: "wrap",
              position: "relative",
              zIndex: 1,
              animation: "revealUp 0.85s ease 0.34s both",
            }}
          >
            <button
              type="button"
              onClick={() => navigate("/signup")}
              style={{
                padding: "14px 30px",
                background: "rgba(200,169,110,0.12)",
                border: "1px solid rgba(80,120,180,0.2)",
                color: "#c8a96e",
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "transform 0.28s ease, background 0.28s ease, box-shadow 0.28s ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform = "translateY(-4px)";
                event.currentTarget.style.background = "rgba(200,169,110,0.2)";
                event.currentTarget.style.boxShadow = "0 14px 28px rgba(0,0,0,0.2)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = "translateY(0)";
                event.currentTarget.style.background = "rgba(200,169,110,0.12)";
                event.currentTarget.style.boxShadow = "none";
              }}
            >
              Sign Up
            </button>
            <button
              type="button"
              onClick={() => navigate("/signin")}
              style={{
                padding: "14px 30px",
                background: "transparent",
                border: "1px solid rgba(80,120,180,0.2)",
                color: "rgba(220,235,250,0.62)",
                fontSize: "0.65rem",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "transform 0.28s ease, border-color 0.28s ease, color 0.28s ease",
              }}
              onMouseEnter={(event) => {
                event.currentTarget.style.transform = "translateY(-4px)";
                event.currentTarget.style.borderColor = "rgba(180,205,230,0.36)";
                event.currentTarget.style.color = "rgba(220,235,250,0.82)";
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform = "translateY(0)";
                event.currentTarget.style.borderColor = "rgba(80,120,180,0.2)";
                event.currentTarget.style.color = "rgba(220,235,250,0.62)";
              }}
            >
              Login
            </button>
          </div>
        </section>
      </main>

      <footer
        style={{
          position: "relative",
          zIndex: 1,
          padding: "32px clamp(24px, 5vw, 64px)",
          borderTop: "1px solid rgba(80,120,180,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "0.92rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(180,205,230,0.3)",
          }}
        >
          Stranded
        </p>
        <p style={{ fontSize: "0.65rem", letterSpacing: "0.12em", color: "rgba(180,205,230,0.18)" }}>
          A gentle place to breathe, reset, and return.
        </p>
      </footer>
    </div>
  );
}
