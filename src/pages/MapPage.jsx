import { useEffect, useRef, useState } from "react";
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
    glow: "rgba(88, 183, 226, 0.28)",
    accent: "#84d7ff",
    sky: "#bdeeff",
    haze: "radial-gradient(circle at 50% 45%, rgba(117, 223, 255, 0.30) 0%, rgba(117, 223, 255, 0) 74%)",
  },
  sky: {
    glow: "rgba(199, 217, 255, 0.28)",
    accent: "#e2ecff",
    sky: "#f7fbff",
    haze: "radial-gradient(circle at 50% 40%, rgba(238, 244, 255, 0.32) 0%, rgba(238, 244, 255, 0) 74%)",
  },
  forest: {
    glow: "rgba(126, 188, 131, 0.26)",
    accent: "#b8ddb1",
    sky: "#eef8e1",
    haze: "radial-gradient(circle at 50% 40%, rgba(178, 223, 153, 0.28) 0%, rgba(178, 223, 153, 0) 76%)",
  },
  gallery: {
    glow: "rgba(238, 191, 139, 0.26)",
    accent: "#ffd9aa",
    sky: "#fff3df",
    haze: "radial-gradient(circle at 50% 42%, rgba(255, 215, 157, 0.28) 0%, rgba(255, 215, 157, 0) 74%)",
  },
};

const mapNodes = {
  ocean: { left: "18%", top: "42%", delay: "0.02s" },
  sky: { left: "46%", top: "18%", delay: "0.10s" },
  forest: { left: "72%", top: "39%", delay: "0.18s" },
  gallery: { left: "50%", top: "61%", delay: "0.26s" },
};

export default function MapPage() {
  const navigate = useNavigate();
  const archipelagoRef = useRef(null);
  const [viewportWidth, setViewportWidth] = useState(
    typeof window === "undefined" ? 1600 : window.innerWidth,
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const compactLayout = viewportWidth < 1100;

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
          "radial-gradient(circle at 50% -8%, rgba(116,170,214,0.28) 0%, rgba(116,170,214,0) 26%), linear-gradient(180deg, #07101b 0%, #0d1c2d 24%, #12304a 52%, #1b485f 76%, #0d1720 100%)",
      }}
    >
      <Particles type="stars" />

      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(circle at 18% 18%, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 20%), radial-gradient(circle at 80% 16%, rgba(255,228,185,0.12) 0%, rgba(255,228,185,0) 16%), linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 30%)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: "auto 0 0 0",
          height: "38vh",
          background:
            "radial-gradient(ellipse at 50% 10%, rgba(113, 184, 219, 0.18) 0%, rgba(113, 184, 219, 0.03) 36%, rgba(0,0,0,0) 72%)",
          pointerEvents: "none",
          animation: "oceanBreathe 12s ease-in-out infinite",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "100vw",
          margin: "0 auto",
          padding: "34px clamp(18px, 2.5vw, 36px) 88px",
        }}
      >
        <AccountBar />

        <section
          style={{
            position: "relative",
            marginBottom: "30px",
            padding: "46px clamp(22px, 7vw, 104px) 54px",
            minHeight: "520px",
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            animation: "revealUp 0.8s ease both",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 35%, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0) 18%)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "-140px",
              left: "-40px",
              width: "360px",
              height: "360px",
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(129,177,212,0.12) 0%, rgba(129,177,212,0) 72%)",
              filter: "blur(6px)",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              maxWidth: "880px",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "12px",
                padding: "11px 18px",
                borderRadius: "999px",
                border: "1px solid rgba(188, 213, 230, 0.14)",
                background: "rgba(255,255,255,0.03)",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "999px",
                  background: "rgba(130, 179, 206, 0.82)",
                  boxShadow: "0 0 18px rgba(130, 179, 206, 0.36)",
                }}
              />
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "15px",
                  letterSpacing: "0.02em",
                  color: "rgba(217, 228, 236, 0.72)",
                }}
              >
                Moonlit, unsettled
              </p>
            </div>

            <h1
              style={{
                fontSize: "clamp(50px, 10vw, 100px)",
                lineHeight: 0.96,
                fontWeight: 400,
                color: "rgba(248, 250, 253, 0.98)",
                marginBottom: "28px",
                maxWidth: "820px",
              }}
            >
              Choose tonight&apos;s
              <br />
              crossing.
            </h1>

            <p
              style={{
                maxWidth: "620px",
                fontFamily: "var(--font-sans)",
                fontSize: "17px",
                lineHeight: 1.9,
                color: "rgba(220, 231, 239, 0.54)",
                marginBottom: "42px",
              }}
            >
              Pick the island that sounds like your breath right now.
            </p>

            <div
              style={{
                display: "flex",
                gap: "14px",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button
                type="button"
                onClick={() => archipelagoRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "16px",
                  padding: "22px 34px",
                  borderRadius: "999px",
                  border: "1px solid rgba(214, 225, 236, 0.16)",
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(239, 245, 250, 0.88)",
                  fontFamily: "var(--font-sans)",
                  fontSize: "18px",
                  letterSpacing: "0.01em",
                  backdropFilter: "blur(12px)",
                  transition: "transform 0.3s ease, background 0.3s ease, border-color 0.3s ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform = "translateY(-4px)";
                  event.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  event.currentTarget.style.borderColor = "rgba(214,225,236,0.24)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = "translateY(0)";
                  event.currentTarget.style.background = "rgba(255,255,255,0.05)";
                  event.currentTarget.style.borderColor = "rgba(214,225,236,0.16)";
                }}
              >
                <span style={{ fontSize: "34px", lineHeight: 1 }}>↓</span>
                <span>See the islands</span>
              </button>

              <button type="button" className="back-link" onClick={() => navigate("/journal")}>
                Open journal
              </button>
            </div>
          </div>
        </section>

        <section
          ref={archipelagoRef}
          style={{
            marginBottom: "24px",
            padding: "8px clamp(18px, 6vw, 72px) 0",
          }}
        >
          <div
            style={{
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div style={{ maxWidth: "1180px", marginBottom: "8px" }}>
              <p className="label-upper" style={{ marginBottom: "14px", color: "rgba(201, 222, 236, 0.42)" }}>
                The Archipelago
              </p>
              <h2
                style={{
                  fontSize: "clamp(52px, 8vw, 88px)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  lineHeight: 0.98,
                  color: "rgba(247,252,255,0.96)",
                  marginBottom: "24px",
                }}
              >
                Islands waiting under the moon
              </h2>
              <p
                style={{
                  maxWidth: "560px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "16px",
                  lineHeight: 1.8,
                  color: "rgba(224, 236, 245, 0.46)",
                }}
              >
                Hover an island and let it rise before you enter.
              </p>
            </div>

            <div
              style={{
                position: "relative",
                minHeight: compactLayout ? "1080px" : "860px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage:
                    "linear-gradient(rgba(215,230,244,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(215,230,244,0.04) 1px, transparent 1px)",
                  backgroundSize: "68px 68px",
                  opacity: 0.18,
                }}
              />

              <svg
                viewBox="0 0 1000 720"
                preserveAspectRatio="none"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  opacity: 0.76,
                }}
              >
                <path
                  d="M220 440 C 300 360, 370 250, 470 190 S 615 315, 690 365"
                  fill="none"
                  stroke="rgba(201,225,244,0.20)"
                  strokeWidth="2"
                  strokeDasharray="10 12"
                />
                <path
                  d="M250 470 C 330 545, 385 610, 470 660"
                  fill="none"
                  stroke="rgba(173,216,230,0.16)"
                  strokeWidth="2"
                  strokeDasharray="8 12"
                />
                <path
                  d="M590 390 C 655 440, 700 520, 520 720"
                  fill="none"
                  stroke="rgba(204,182,132,0.16)"
                  strokeWidth="2"
                  strokeDasharray="8 12"
                />
              </svg>

              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  style={{
                    position: "absolute",
                    width: `${140 + index * 30}px`,
                    height: `${140 + index * 30}px`,
                    borderRadius: "50%",
                    border: "1px solid rgba(223,239,250,0.06)",
                    left: `${10 + index * 26}%`,
                    top: `${10 + (index % 2) * 18}%`,
                    animation: `slowSpin ${32 + index * 8}s linear infinite`,
                    opacity: 0.16,
                  }}
                />
              ))}

              {DESTINATIONS.map((dest) => {
                const palette = stampPalette[dest.slug] || stampPalette.ocean;
                const node = compactLayout
                  ? {
                      ocean: { left: "24%", top: "28%", delay: "0.02s" },
                      sky: { left: "50%", top: "8%", delay: "0.10s" },
                      forest: { left: "72%", top: "30%", delay: "0.18s" },
                      gallery: { left: "50%", top: "54%", delay: "0.26s" },
                    }[dest.slug] || { left: "50%", top: "50%", delay: "0s" }
                  : mapNodes[dest.slug] || { left: "50%", top: "50%", delay: "0s" };
                const isSky = dest.slug === "sky";
                const isGallery = dest.slug === "gallery";
                const innerCopyMaxWidth = isSky ? "68%" : "100%";
                const bodyCopy = isGallery
                  ? "Words from those who've already been there."
                  : dest.storyHook;

                return (
                  <button
                    key={dest.slug}
                    type="button"
                    onClick={() => navigate(dest.slug === "gallery" ? "/transition/gallery/gallery" : `/transition/${dest.slug}`)}
                    style={{
                      position: "absolute",
                      left: node.left,
                      top: node.top,
                      transform: "translate(-50%, -50%)",
                      width: isSky ? "clamp(240px, 23vw, 300px)" : isGallery ? "clamp(176px, 16vw, 210px)" : "clamp(184px, 17vw, 220px)",
                      padding: 0,
                      border: "none",
                      background: "transparent",
                      textAlign: "left",
                      animation: `revealUp 0.8s ease ${node.delay} both`,
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        minHeight: isSky ? "clamp(340px, 34vw, 410px)" : isGallery ? "188px" : "322px",
                        borderRadius: "30px",
                        border: "1px solid rgba(231, 241, 249, 0.10)",
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 24%, rgba(6,14,22,0.26) 100%)",
                        backdropFilter: "blur(12px)",
                        overflow: "hidden",
                        boxShadow: "0 26px 62px rgba(0,0,0,0.26)",
                        transition: "transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.transform = "translateY(-12px) scale(1.03)";
                        event.currentTarget.style.boxShadow = `0 34px 82px ${palette.glow}`;
                        event.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.transform = "translateY(0) scale(1)";
                        event.currentTarget.style.boxShadow = "0 26px 62px rgba(0,0,0,0.26)";
                        event.currentTarget.style.borderColor = "rgba(231, 241, 249, 0.10)";
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
                          inset: "14px 16px 16px 16px",
                          padding: isSky ? "20px 18px 18px" : "18px 16px 16px",
                          borderRadius: "22px",
                          border: "1px solid rgba(232,241,248,0.10)",
                          background: "linear-gradient(180deg, rgba(5,12,19,0.76) 0%, rgba(8,18,27,0.90) 100%)",
                          overflow: "hidden",
                        }}
                      >
                        <div style={{ maxWidth: innerCopyMaxWidth }}>
                          <p
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: "10px",
                              letterSpacing: "0.2em",
                              textTransform: "uppercase",
                              color: "rgba(214,230,241,0.56)",
                              marginBottom: "8px",
                            }}
                          >
                            {dest.storyTitle || "Open route"}
                          </p>
                          <h3
                            style={{
                              fontSize: isSky ? "clamp(34px, 3.7vw, 46px)" : isGallery ? "clamp(22px, 2.2vw, 26px)" : "clamp(22px, 2.2vw, 28px)",
                              fontWeight: 500,
                              color: "rgba(249,252,255,0.96)",
                              marginBottom: "8px",
                            }}
                          >
                            {dest.name}
                          </h3>
                          <p
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: isSky ? "14px" : "12px",
                              lineHeight: 1.45,
                              color: "rgba(223,235,244,0.72)",
                              marginBottom: "12px",
                            }}
                          >
                            {dest.tagline}
                          </p>
                          <p
                            style={{
                              fontFamily: "var(--font-sans)",
                              fontSize: isSky ? "13px" : "11px",
                              lineHeight: 1.65,
                              color: "rgba(208,223,233,0.60)",
                              display: "-webkit-box",
                              WebkitBoxOrient: "vertical",
                              WebkitLineClamp: isSky ? 5 : isGallery ? 3 : 4,
                              overflow: "hidden",
                            }}
                          >
                            {bodyCopy}
                          </p>
                          {!isGallery && (
                            <p
                              style={{
                                marginTop: isSky ? "16px" : "12px",
                                fontFamily: "var(--font-sans)",
                                fontSize: "11px",
                                letterSpacing: "0.14em",
                                textTransform: "uppercase",
                                color: palette.accent,
                              }}
                            >
                              Enter crossing →
                            </p>
                          )}
                        </div>
                      </div>

                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          top: isSky ? "24%" : dest.slug === "forest" ? "22%" : "24%",
                          transform: "translateX(-50%)",
                          width: isSky ? "168px" : isGallery ? "126px" : "116px",
                          height: isSky ? "168px" : isGallery ? "126px" : "116px",
                          borderRadius: "50%",
                          background: `radial-gradient(circle at 50% 35%, ${palette.glow} 0%, rgba(255,255,255,0) 70%)`,
                          filter: "blur(10px)",
                        }}
                      />

                      <div
                        style={{
                          position: "absolute",
                          right: "18px",
                          top: isSky ? "22px" : "18px",
                          width: isSky ? "64px" : "52px",
                          height: isSky ? "64px" : "52px",
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
                          bottom: isGallery ? "78px" : isSky ? "76px" : "64px",
                          transform: "translateX(-50%)",
                          width: isSky ? "124px" : "108px",
                          height: isSky ? "50px" : "44px",
                          borderRadius: "50%",
                          background: `radial-gradient(ellipse at center, ${palette.accent}66 0%, ${palette.accent}16 60%, rgba(255,255,255,0) 80%)`,
                          filter: "blur(12px)",
                        }}
                      />

                      <div
                        style={{
                          position: "absolute",
                          left: "50%",
                          bottom: isGallery ? "72px" : isSky ? "70px" : "58px",
                          transform: "translateX(-50%)",
                          fontSize: isSky ? "54px" : isGallery ? "50px" : "44px",
                          lineHeight: 1,
                          filter: "drop-shadow(0 12px 18px rgba(0,0,0,0.32))",
                          animation: "driftUpSoft 8s ease-in-out infinite",
                        }}
                      >
                        {dest.emoji}
                      </div>
                    </div>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => navigate("/transition/gallery/gallery")}
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: "24px",
                  transform: "translateX(-50%)",
                  width: "64px",
                  height: "64px",
                  borderRadius: "999px",
                  border: "1px solid rgba(214, 225, 236, 0.16)",
                  background: "rgba(255, 222, 178, 0.10)",
                  color: "rgba(248, 238, 224, 0.88)",
                  fontSize: "34px",
                  lineHeight: 1,
                  backdropFilter: "blur(12px)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.24)",
                  transition: "transform 0.3s ease, background 0.3s ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform = "translateX(-50%) translateY(-5px)";
                  event.currentTarget.style.background = "rgba(255, 222, 178, 0.16)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = "translateX(-50%) translateY(0)";
                  event.currentTarget.style.background = "rgba(255, 222, 178, 0.10)";
                }}
              >
                ↓
              </button>
            </div>
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            alignItems: "stretch",
            padding: "0 clamp(18px, 3vw, 36px)",
          }}
        >
          <div
            style={{
              padding: "24px 22px",
              borderRadius: "28px",
              border: "1px solid rgba(211, 229, 242, 0.12)",
              background:
                "linear-gradient(180deg, rgba(10,22,33,0.84) 0%, rgba(8,18,28,0.72) 100%)",
              boxShadow: "0 26px 70px rgba(0,0,0,0.26)",
              animation: "revealLeft 0.9s ease 0.15s both",
            }}
          >
            <p className="label-upper" style={{ marginBottom: "12px", color: "rgba(201, 222, 236, 0.48)" }}>
              Route Notes
            </p>
            <h3
              style={{
                fontSize: "30px",
                fontStyle: "italic",
                fontWeight: 500,
                color: "rgba(247,252,255,0.95)",
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
                      border: "1px solid rgba(219, 235, 247, 0.16)",
                      background: "rgba(255,255,255,0.07)",
                      fontFamily: "var(--font-sans)",
                      fontSize: "12px",
                      letterSpacing: "0.08em",
                      color: "rgba(244, 249, 255, 0.82)",
                    }}
                  >
                    0{index + 1}
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: "20px",
                        color: "rgba(247,252,255,0.93)",
                        marginBottom: "4px",
                      }}
                    >
                      {step.title}
                    </p>
                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "13px",
                        lineHeight: 1.8,
                        color: "rgba(221, 234, 243, 0.68)",
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
                "linear-gradient(180deg, rgba(17,33,26,0.82) 0%, rgba(13,22,18,0.78) 100%)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.24)",
            }}
          >
            <p className="label-upper" style={{ marginBottom: "12px", color: "rgba(198, 227, 198, 0.42)" }}>
              Voyage Hint
            </p>
            <h3
              style={{
                fontSize: "28px",
                fontStyle: "italic",
                fontWeight: 500,
                color: "rgba(241, 252, 241, 0.94)",
                marginBottom: "12px",
              }}
            >
              Let the map breathe first.
            </h3>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                lineHeight: 1.82,
                color: "rgba(219, 237, 219, 0.66)",
              }}
            >
              This page is meant to feel like a pause before the crossing. Stay for a second, watch the route lines, and choose the island that feels closest to what your body needs.
            </p>
          </div>
        </section>

        <p
          style={{
            marginTop: "26px",
            textAlign: "center",
            fontFamily: "var(--font-sans)",
            fontSize: "12px",
            letterSpacing: "0.08em",
            color: "rgba(228, 238, 246, 0.42)",
          }}
        >
          There is no wrong route tonight. The best path is the one that makes your shoulders drop a little.
        </p>
      </div>
    </div>
  );
}
