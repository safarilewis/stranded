import { useNavigate } from "react-router-dom";
import AccountBar from "../components/AccountBar";
import Particles from "../components/Particles";
import { DESTINATIONS } from "../config/destinations";

const routeSteps = [
  {
    title: "Exhale on the shore",
    detail: "Begin where the island softens the noise and lets the body unclench.",
  },
  {
    title: "Lift above the weather",
    detail: "See the whole storm from a higher place before choosing what still matters.",
  },
  {
    title: "Find shelter inland",
    detail: "Step beneath something steady and stay there long enough to feel grounded.",
  },
];

const stampPalette = {
  ocean: {
    glow: "rgba(88, 183, 226, 0.26)",
    accent: "#84d7ff",
    sky: "#bdeeff",
    haze: "radial-gradient(circle at 50% 45%, rgba(117, 223, 255, 0.30) 0%, rgba(117, 223, 255, 0) 72%)",
  },
  sky: {
    glow: "rgba(199, 217, 255, 0.26)",
    accent: "#e2ecff",
    sky: "#f7fbff",
    haze: "radial-gradient(circle at 50% 40%, rgba(238, 244, 255, 0.34) 0%, rgba(238, 244, 255, 0) 72%)",
  },
  forest: {
    glow: "rgba(126, 188, 131, 0.24)",
    accent: "#b8ddb1",
    sky: "#eef8e1",
    haze: "radial-gradient(circle at 50% 40%, rgba(178, 223, 153, 0.28) 0%, rgba(178, 223, 153, 0) 74%)",
  },
  gallery: {
    glow: "rgba(238, 191, 139, 0.24)",
    accent: "#ffd9aa",
    sky: "#fff3df",
    haze: "radial-gradient(circle at 50% 42%, rgba(255, 215, 157, 0.30) 0%, rgba(255, 215, 157, 0) 72%)",
  },
};

export default function MapPage() {
  const navigate = useNavigate();
  const storyBeat =
    "Night has settled over the archipelago. Each island offers a different ritual for crossing the same feeling, so choose the path that sounds most like your own breath right now.";

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at top, rgba(98,149,206,0.22) 0%, rgba(98,149,206,0) 28%), linear-gradient(180deg, #08111d 0%, #102234 30%, #183146 56%, #214b61 76%, #0d1822 100%)",
      }}
    >
      <Particles type="stars" />

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 20% 18%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 22%), radial-gradient(circle at 82% 20%, rgba(255,216,156,0.16) 0%, rgba(255,216,156,0) 18%)",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1220px",
          margin: "0 auto",
          padding: "34px 24px 80px",
        }}
      >
        <AccountBar />

        <section
          style={{
            position: "relative",
            marginBottom: "34px",
            padding: "32px clamp(22px, 4vw, 42px)",
            borderRadius: "32px",
            border: "1px solid rgba(214, 235, 255, 0.12)",
            background:
              "linear-gradient(160deg, rgba(6,17,27,0.78) 0%, rgba(11,29,43,0.62) 54%, rgba(18,40,56,0.58) 100%)",
            boxShadow: "0 34px 90px rgba(0,0,0,0.28)",
            overflow: "hidden",
            animation: "revealUp 0.8s ease both",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-80px",
              right: "-20px",
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(242,249,255,0.18) 0%, rgba(242,249,255,0) 70%)",
              animation: "veilShift 14s ease-in-out infinite",
            }}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "26px",
              alignItems: "end",
            }}
          >
            <div>
              <p className="label-upper" style={{ marginBottom: "14px", color: "rgba(191, 214, 232, 0.46)" }}>
                Island Navigation Deck
              </p>
              <h1
                style={{
                  fontSize: "clamp(40px, 7vw, 72px)",
                  lineHeight: 0.94,
                  fontWeight: 500,
                  color: "rgba(247, 252, 255, 0.96)",
                  marginBottom: "18px",
                }}
              >
                Choose tonight&apos;s
                <br />
                crossing.
              </h1>
              <p
                style={{
                  maxWidth: "680px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "16px",
                  lineHeight: 1.85,
                  color: "rgba(223, 235, 245, 0.68)",
                }}
              >
                {storyBeat}
              </p>
            </div>

            <div
              style={{
                justifySelf: "stretch",
                padding: "20px 20px 18px",
                borderRadius: "24px",
                border: "1px solid rgba(218, 234, 247, 0.10)",
                background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
                backdropFilter: "blur(12px)",
                animation: "revealLeft 0.9s ease 0.08s both",
              }}
            >
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "11px",
                  letterSpacing: "0.24em",
                  textTransform: "uppercase",
                  color: "rgba(216, 230, 241, 0.46)",
                  marginBottom: "10px",
                }}
              >
                Ready Room
              </p>
              <p
                style={{
                  fontSize: "23px",
                  lineHeight: 1.25,
                  color: "rgba(250, 253, 255, 0.92)",
                  marginBottom: "10px",
                }}
              >
                Keep track of what this voyage is teaching you.
              </p>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  lineHeight: 1.7,
                  color: "rgba(220, 233, 242, 0.56)",
                  marginBottom: "18px",
                }}
              >
                Open your journal for a reflection log, saved notes, and the moods you&apos;ve already named.
              </p>
              <button type="button" className="gentle-btn" onClick={() => navigate("/journal")}>
                ✎ Open Journal
              </button>
            </div>
          </div>
        </section>

        <section
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "26px",
            alignItems: "start",
          }}
        >
          <div
            style={{
              position: "relative",
              padding: "28px clamp(18px, 3vw, 30px) 34px",
              borderRadius: "34px",
              border: "1px solid rgba(201, 225, 244, 0.12)",
              background:
                "linear-gradient(180deg, rgba(9,23,35,0.80) 0%, rgba(12,29,41,0.74) 48%, rgba(18,44,57,0.68) 100%)",
              boxShadow: "0 34px 100px rgba(0,0,0,0.30)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: "8%",
                right: "8%",
                top: "140px",
                height: "2px",
                background: "linear-gradient(90deg, rgba(103,161,205,0) 0%, rgba(103,161,205,0.8) 18%, rgba(203,225,240,0.9) 50%, rgba(103,161,205,0.8) 82%, rgba(103,161,205,0) 100%)",
                transform: "rotate(-6deg)",
                opacity: 0.72,
                animation: "pulseLine 7s ease-in-out infinite",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "end",
                gap: "16px",
                flexWrap: "wrap",
                marginBottom: "26px",
              }}
            >
              <div>
                <p className="label-upper" style={{ marginBottom: "10px", color: "rgba(196, 219, 235, 0.44)" }}>
                  The Archipelago
                </p>
                <h2
                  style={{
                    fontSize: "clamp(28px, 4vw, 42px)",
                    fontStyle: "italic",
                    fontWeight: 500,
                    color: "rgba(247,252,255,0.94)",
                  }}
                >
                  Islands waiting under the moon
                </h2>
              </div>

              <p
                style={{
                  maxWidth: "340px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  lineHeight: 1.8,
                  color: "rgba(220, 233, 242, 0.46)",
                  textAlign: "right",
                }}
              >
                Hover a route marker and let it rise. Click any island to open its transition page and step into the story.
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "22px",
              }}
            >
              {DESTINATIONS.map((dest, index) => {
                const palette = stampPalette[dest.slug] || stampPalette.ocean;

                return (
                  <button
                    key={dest.slug}
                    type="button"
                    onClick={() => navigate(dest.slug === "gallery" ? "/transition/gallery/gallery" : `/transition/${dest.slug}`)}
                    style={{
                      position: "relative",
                      border: "1px solid rgba(223, 239, 250, 0.10)",
                      borderRadius: "28px",
                      padding: "0",
                      background: "transparent",
                      textAlign: "left",
                      animation: `revealUp 0.7s ease ${index * 0.08}s both`,
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        minHeight: "360px",
                        borderRadius: "28px",
                        overflow: "hidden",
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.03) 20%, rgba(7,18,28,0.12) 100%)",
                        backdropFilter: "blur(14px)",
                        transform: index % 2 === 0 ? "rotate(-1.2deg)" : "rotate(1.2deg)",
                        transition: "transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
                        boxShadow: "0 18px 48px rgba(0,0,0,0.22)",
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.transform = "translateY(-10px) scale(1.02) rotate(0deg)";
                        event.currentTarget.style.boxShadow = `0 28px 70px ${palette.glow}`;
                        event.currentTarget.style.borderColor = "rgba(255,255,255,0.18)";
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.transform = index % 2 === 0 ? "rotate(-1.2deg)" : "rotate(1.2deg)";
                        event.currentTarget.style.boxShadow = "0 18px 48px rgba(0,0,0,0.22)";
                        event.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: palette.haze,
                          opacity: 0.95,
                        }}
                      />

                      <div
                        style={{
                          position: "absolute",
                          top: "16px",
                          right: "18px",
                          width: "68px",
                          height: "68px",
                          borderRadius: "50%",
                          border: `1px solid ${palette.accent}33`,
                          background: `radial-gradient(circle at 35% 35%, ${palette.sky} 0%, ${palette.accent} 42%, rgba(255,255,255,0) 78%)`,
                          boxShadow: `0 0 36px ${palette.glow}`,
                        }}
                      />

                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          top: "32%",
                          transform: "translateX(-50%)",
                          width: "180px",
                          height: "180px",
                          borderRadius: "50%",
                          background: `radial-gradient(circle at 50% 36%, ${palette.glow} 0%, rgba(255,255,255,0) 68%)`,
                          filter: "blur(8px)",
                        }}
                      />

                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          bottom: "112px",
                          transform: "translateX(-50%)",
                          width: "160px",
                          height: "70px",
                          borderRadius: "50%",
                          background: `radial-gradient(ellipse at center, ${palette.accent}66 0%, ${palette.accent}14 56%, rgba(255,255,255,0) 78%)`,
                          filter: "blur(12px)",
                        }}
                      />

                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          bottom: "104px",
                          transform: "translateX(-50%)",
                          fontSize: "72px",
                          lineHeight: 1,
                          filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.32))",
                          animation: "driftUpSoft 8s ease-in-out infinite",
                        }}
                      >
                        {dest.emoji}
                      </div>

                      <div
                        style={{
                          position: "absolute",
                          inset: "auto 18px 18px 18px",
                          padding: "18px 18px 16px",
                          borderRadius: "22px",
                          border: "1px solid rgba(232, 241, 248, 0.10)",
                          background: "linear-gradient(180deg, rgba(6,14,22,0.74) 0%, rgba(10,20,29,0.88) 100%)",
                          backdropFilter: "blur(12px)",
                        }}
                      >
                        <p
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "10px",
                            letterSpacing: "0.22em",
                            textTransform: "uppercase",
                            color: "rgba(211, 229, 241, 0.46)",
                            marginBottom: "8px",
                          }}
                        >
                          {dest.storyTitle || "Open route"}
                        </p>
                        <h3
                          style={{
                            fontSize: "29px",
                            fontWeight: 500,
                            color: "rgba(248, 252, 255, 0.96)",
                            marginBottom: "8px",
                          }}
                        >
                          {dest.name}
                        </h3>
                        <p
                          style={{
                            fontFamily: "var(--font-sans)",
                            fontSize: "14px",
                            lineHeight: 1.6,
                            color: "rgba(220, 234, 243, 0.60)",
                            marginBottom: "10px",
                          }}
                        >
                          {dest.tagline}
                        </p>
                        {dest.storyHook && (
                          <p
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "12px",
                              lineHeight: 1.7,
                              color: "rgba(205, 222, 232, 0.46)",
                            }}
                          >
                            {dest.storyHook}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <aside
            style={{
              display: "grid",
              gap: "22px",
              alignSelf: "stretch",
            }}
          >
            <div
              style={{
                padding: "24px 22px",
                borderRadius: "28px",
                border: "1px solid rgba(211, 229, 242, 0.12)",
                background:
                  "linear-gradient(180deg, rgba(11,24,35,0.82) 0%, rgba(10,22,33,0.64) 100%)",
                boxShadow: "0 26px 70px rgba(0,0,0,0.26)",
                animation: "revealLeft 0.9s ease 0.15s both",
              }}
            >
              <p className="label-upper" style={{ marginBottom: "12px", color: "rgba(196, 219, 235, 0.42)" }}>
                Route Notes
              </p>
              <h3
                style={{
                  fontSize: "30px",
                  fontStyle: "italic",
                  fontWeight: 500,
                  color: "rgba(247,252,255,0.94)",
                  marginBottom: "18px",
                }}
              >
                Suggested order
              </h3>

              <div style={{ display: "grid", gap: "14px" }}>
                {routeSteps.map((step, index) => (
                  <div
                    key={step.title}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "40px minmax(0, 1fr)",
                      gap: "12px",
                      alignItems: "start",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "999px",
                        display: "grid",
                        placeItems: "center",
                        border: "1px solid rgba(219, 235, 247, 0.14)",
                        background: "rgba(255,255,255,0.06)",
                        fontFamily: "var(--font-sans)",
                        fontSize: "12px",
                        letterSpacing: "0.08em",
                        color: "rgba(240, 248, 255, 0.78)",
                      }}
                    >
                      0{index + 1}
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: "20px",
                          color: "rgba(247,252,255,0.9)",
                          marginBottom: "4px",
                        }}
                      >
                        {step.title}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "13px",
                          lineHeight: 1.75,
                          color: "rgba(214, 228, 238, 0.52)",
                        }}
                      >
                        {step.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                padding: "24px 22px",
                borderRadius: "28px",
                border: "1px solid rgba(223, 239, 250, 0.10)",
                background:
                  "linear-gradient(180deg, rgba(38,27,17,0.70) 0%, rgba(20,15,12,0.78) 100%)",
                boxShadow: "0 24px 64px rgba(0,0,0,0.24)",
                animation: "revealLeft 0.95s ease 0.22s both",
              }}
            >
              <p className="label-upper" style={{ marginBottom: "12px", color: "rgba(255, 226, 189, 0.38)" }}>
                Lantern Archive
              </p>
              <h3
                style={{
                  fontSize: "28px",
                  fontStyle: "italic",
                  fontWeight: 500,
                  color: "rgba(255, 246, 236, 0.94)",
                  marginBottom: "12px",
                }}
              >
                Not ready to reflect alone?
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  lineHeight: 1.8,
                  color: "rgba(248, 230, 210, 0.54)",
                  marginBottom: "18px",
                }}
              >
                Visit the Gallery to read pinned notes left by students who already made it across their own rough weather.
              </p>
              <button type="button" className="gentle-btn" onClick={() => navigate("/transition/gallery/gallery")}>
                🖼 Enter Gallery
              </button>
            </div>
          </aside>
        </section>

        <p
          style={{
            marginTop: "26px",
            textAlign: "center",
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
            letterSpacing: "0.06em",
            color: "rgba(226, 237, 245, 0.34)",
          }}
        >
          There is no wrong route tonight. The best path is the one that makes your shoulders drop a little.
        </p>
      </div>
    </div>
  );
}
