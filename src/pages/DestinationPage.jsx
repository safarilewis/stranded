import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DESTINATIONS, THEMES } from "../config/destinations";
import MuteButton from "../components/MuteButton";
import Particles from "../components/Particles";
import VideoBackground from "../components/VideoBackground";
import useAudio from "../hooks/useAudio";
import useAuth from "../hooks/useAuth";
import { supabase, supabaseConfigured } from "../lib/supabase";

function buildFallbackQuotes(voices) {
  return voices.map((voice, index) => ({
    id: `fallback-${index}`,
    text: voice.text,
    attribution: voice.attribution,
  }));
}

export default function DestinationPage() {
  const { slug, themeSlug } = useParams();
  const navigate = useNavigate();
  const destination = DESTINATIONS.find((entry) => entry.slug === slug);
  const theme = THEMES.find((entry) => entry.slug === themeSlug);
  const galleryDestination = DESTINATIONS.find((entry) => entry.slug === "gallery");

  useEffect(() => {
    if (!destination || !theme) {
      navigate("/map");
    }
  }, [destination, navigate, theme]);

  if (!destination || !theme) {
    return null;
  }

  return (
    <DestinationExperience
      key={`${slug}-${themeSlug}`}
      destination={destination}
      theme={theme}
      galleryDestination={galleryDestination}
      navigate={navigate}
    />
  );
}

function DestinationExperience({ destination, theme, galleryDestination, navigate }) {
  const audio = useAudio();
  const { user } = useAuth();
  const {
    muted,
    playAmbient,
    playVoiceover,
    stopVoiceover,
    stopAll,
    toggleMute,
  } = audio;

  const [started, setStarted] = useState(theme.slug === "gallery");
  const [promptIndex, setPromptIndex] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const [galleryQuotes, setGalleryQuotes] = useState(() => buildFallbackQuotes(galleryDestination?.voices ?? []));
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [submissionState, setSubmissionState] = useState("idle");

  const timeoutRef = useRef(null);
  const galleryMediaRef = useRef(null);

  useEffect(() => {
    return () => {
      stopAll();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [stopAll]);

  const isGalleryTheme = theme?.slug === "gallery";
  const fallbackQuotes = useMemo(
    () => buildFallbackQuotes(galleryDestination?.voices ?? []),
    [galleryDestination],
  );
  const activeThemeMedia = destination?.themeMedia?.[theme?.slug] ?? {};
  const activeVideoUrl = activeThemeMedia.videoUrl ?? "";
  const configuredAmbientAudioUrl =
    activeThemeMedia.ambientAudioUrl || theme?.ambientAudioUrl || destination?.ambientAudioUrl;
  const galleryLoopSegment = isGalleryTheme ? theme?.ambientLoopSegment ?? null : null;
  const activePrompts = activeThemeMedia.prompts || destination?.prompts || [];
  const hideOverlayScript = Boolean(activeVideoUrl) && !isGalleryTheme;
  const activeAmbientAudioUrl = isGalleryTheme ? configuredAmbientAudioUrl : hideOverlayScript ? "" : configuredAmbientAudioUrl;
  const currentQuote = galleryQuotes[galleryIndex] ?? fallbackQuotes[0];
  const showGalleryPlayer = isGalleryTheme && Boolean(galleryLoopSegment?.mediaUrl || activeAmbientAudioUrl);

  useEffect(() => {
    if (!isGalleryTheme) {
      return undefined;
    }

    let active = true;

    async function loadQuotes() {
      if (!supabaseConfigured || !supabase) {
        setGalleryQuotes(fallbackQuotes);
        return;
      }

      setGalleryLoading(true);

      const { data, error } = await supabase
        .from("gallery_quotes")
        .select("id, text, attribution, created_at")
        .order("created_at", { ascending: false });

      if (!active) {
        return;
      }

      if (error || !data || data.length === 0) {
        setGalleryQuotes(fallbackQuotes);
      } else {
        setGalleryQuotes([
          ...data.map((quote) => ({
            id: quote.id,
            text: quote.text,
            attribution: quote.attribution || "Shared by a student",
          })),
          ...fallbackQuotes,
        ]);
      }

      setGalleryLoading(false);
    }

    loadQuotes();

    return () => {
      active = false;
    };
  }, [fallbackQuotes, isGalleryTheme]);

  useEffect(() => {
    if (!started || !isGalleryTheme || galleryQuotes.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setGalleryIndex((prev) => (prev + 1) % galleryQuotes.length);
      setFadeKey((prev) => prev + 1);
    }, 7000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [galleryQuotes.length, isGalleryTheme, started]);

  useEffect(() => {
    if (!isGalleryTheme || !galleryMediaRef.current || (!galleryLoopSegment?.mediaUrl && !activeAmbientAudioUrl)) {
      return undefined;
    }

    const mediaEl = galleryMediaRef.current;
    mediaEl.muted = muted;
    mediaEl.volume = 1;

    const startTime = galleryLoopSegment?.startTime ?? 0;
    const endTime = galleryLoopSegment?.endTime ?? Infinity;

    let interactionHandler;
    let metadataHandler;
    let timeUpdateHandler;

    const tryPlay = () => {
      const playAttempt = mediaEl.play();

      if (playAttempt && typeof playAttempt.catch === "function") {
        playAttempt.catch(() => {
          if (interactionHandler) {
            return;
          }

          interactionHandler = () => {
            mediaEl.play().catch(() => {});
            window.removeEventListener("pointerdown", interactionHandler);
            window.removeEventListener("keydown", interactionHandler);
          };

          window.addEventListener("pointerdown", interactionHandler, { once: true });
          window.addEventListener("keydown", interactionHandler, { once: true });
        });
      }
    };

    if (galleryLoopSegment?.mediaUrl) {
      metadataHandler = () => {
        if (Number.isFinite(startTime)) {
          mediaEl.currentTime = startTime;
        }
      };

      timeUpdateHandler = () => {
        if (mediaEl.currentTime >= endTime) {
          mediaEl.currentTime = startTime;
          mediaEl.play().catch(() => {});
        }
      };

      mediaEl.addEventListener("loadedmetadata", metadataHandler);
      mediaEl.addEventListener("timeupdate", timeUpdateHandler);

      if (mediaEl.readyState >= 1 && Number.isFinite(startTime)) {
        mediaEl.currentTime = startTime;
      }
    }

    tryPlay();

    return () => {
      if (interactionHandler) {
        window.removeEventListener("pointerdown", interactionHandler);
        window.removeEventListener("keydown", interactionHandler);
      }

      if (metadataHandler) {
        mediaEl.removeEventListener("loadedmetadata", metadataHandler);
      }

      if (timeUpdateHandler) {
        mediaEl.removeEventListener("timeupdate", timeUpdateHandler);
      }

      mediaEl.pause();
    };
  }, [activeAmbientAudioUrl, galleryLoopSegment, isGalleryTheme, muted]);

  const advancePrompt = (index) => {
    setPromptIndex(index);
    setFadeKey((prev) => prev + 1);

    if (index >= activePrompts.length) {
      return;
    }

    const prompt = activePrompts[index];

    if (prompt.voiceoverUrl) {
      playVoiceover(prompt.voiceoverUrl, () => {
        if (index < activePrompts.length - 1) {
          timeoutRef.current = window.setTimeout(() => {
            advancePrompt(index + 1);
          }, 1500);
        }
      });
      return;
    }

    if (index < activePrompts.length - 1) {
      timeoutRef.current = window.setTimeout(() => {
        advancePrompt(index + 1);
      }, 5000);
    }
  };

  const startExperience = () => {
    setStarted(true);
    setVideoEnded(false);
    if (!isGalleryTheme) {
      playAmbient(activeAmbientAudioUrl);
    }
    setPromptIndex(0);

    if (!isGalleryTheme && !hideOverlayScript) {
      advancePrompt(0);
    }
  };

  const handleNextPrompt = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    stopVoiceover();
    if (promptIndex < activePrompts.length - 1) {
      advancePrompt(promptIndex + 1);
    }
  };

  const handleReturnToThemes = () => {
    stopAll();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    navigate(isGalleryTheme ? "/map" : `/destination/${destination.slug}`);
  };

  const handleDebugSkipToEnd = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    stopVoiceover();
    setStarted(true);
    setVideoEnded(true);
  };

  const handleSubmitQuote = async (event) => {
    event.preventDefault();

    const quote = submissionText.trim();

    if (!quote) {
      setSubmissionError("Write a line before you share it.");
      return;
    }

    setSubmissionError("");
    setSubmissionState("saving");

    if (!supabaseConfigured || !supabase) {
      setSubmissionState("error");
      setSubmissionError("Gallery submissions need Supabase enabled.");
      return;
    }

    const payload = {
      text: quote,
      attribution: "Shared by a student",
      destination_slug: destination.slug,
      theme_slug: theme.slug,
      user_id: user?.id ?? null,
    };

    const { error } = await supabase.from("gallery_quotes").insert(payload);

    if (error) {
      setSubmissionState("error");
      setSubmissionError("Could not save this quote yet. Check that the gallery_quotes table exists.");
      return;
    }

    setSubmissionState("saved");
    setSubmissionText("");
  };

  const showSubmissionCard =
    !isGalleryTheme && hideOverlayScript && started && videoEnded && theme.slug === "homesickness";

  if (!started && !isGalleryTheme) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: destination.bgGradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Particles type={destination.particleType} />

        <div
          style={{
            maxWidth: "540px",
            textAlign: "center",
            animation: "fadeIn 0.8s ease",
            position: "relative",
            zIndex: 10,
            padding: "0 24px",
          }}
        >
          <div style={{ fontSize: "56px", marginBottom: "20px" }}>{theme.emoji}</div>
          <p className="label-upper" style={{ marginBottom: "16px" }}>
            {destination.name}
          </p>

          <h1
            style={{
              fontSize: "clamp(30px, 5vw, 42px)",
              fontWeight: 600,
              fontStyle: "italic",
              color: "rgba(255,255,255,0.9)",
              marginBottom: "12px",
              lineHeight: 1.2,
            }}
          >
            {theme.name}
          </h1>

          <p
            style={{
              fontSize: "17px",
              color: "rgba(255,255,255,0.5)",
              marginBottom: "20px",
              lineHeight: 1.6,
            }}
          >
            {theme.tagline}
          </p>

          <p
            style={{
              fontSize: "16px",
              color: "rgba(255,255,255,0.4)",
              lineHeight: 1.7,
              marginBottom: "32px",
            }}
          >
            {theme.description}
          </p>

          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "13px",
              color: "rgba(255,255,255,0.25)",
              marginBottom: "44px",
            }}
          >
            Press begin to open this space. If a video exists for this theme, it will play with its audio.
          </p>

          <button className="gentle-btn" onClick={startExperience}>
            Begin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background: isGalleryTheme
          ? "linear-gradient(160deg, #17110f 0%, #241813 38%, #302018 72%, #130d0b 100%)"
          : undefined,
      }}
    >
      <VideoBackground
        url={isGalleryTheme ? "" : activeVideoUrl}
        fallbackGradient={
          isGalleryTheme
            ? "linear-gradient(160deg, #17110f 0%, #241813 38%, #302018 72%, #130d0b 100%)"
            : destination.bgGradient
        }
        muted={muted}
        loop={!showSubmissionCard && !hideOverlayScript}
        onEnded={hideOverlayScript ? () => setVideoEnded(true) : undefined}
      />

      <Particles type={destination.particleType} />

      <div
        style={{
          position: "absolute",
          top: "28px",
          left: "28px",
          right: "28px",
          zIndex: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <button className="back-link" onClick={handleReturnToThemes}>
          ← {isGalleryTheme ? "Back to island" : "Back to themes"}
        </button>
        <p className="label-upper" style={{ fontSize: "11px", letterSpacing: "3px", textAlign: "right" }}>
          {destination.name} · {theme.name}
        </p>
      </div>

      {!isGalleryTheme && theme.slug === "homesickness" && !showSubmissionCard && (
        <button
          type="button"
          onClick={handleDebugSkipToEnd}
          style={{
            position: "absolute",
            right: "28px",
            bottom: "92px",
            zIndex: 20,
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.14)",
            background: "rgba(0,0,0,0.32)",
            color: "rgba(255,255,255,0.65)",
            fontFamily: "var(--font-sans)",
            fontSize: "11px",
            letterSpacing: "1.2px",
            textTransform: "uppercase",
            padding: "10px 14px",
            backdropFilter: "blur(10px)",
          }}
        >
          Debug: Skip to End
        </button>
      )}

      <MuteButton muted={muted} onToggle={toggleMute} />

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          pointerEvents: "none",
          padding: "96px 20px 36px",
        }}
      >
        {!isGalleryTheme && !hideOverlayScript && (
          <div
            style={{
              maxWidth: "560px",
              textAlign: "center",
              padding: "0 24px",
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                width: "120px",
                height: "120px",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "50%",
                animation: "breatheRing 6s ease-in-out infinite",
                margin: "0 auto 36px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "50%",
                }}
              />
            </div>

            <p className="label-upper" style={{ marginBottom: "18px", color: "rgba(255,255,255,0.38)" }}>
              {theme.name}
            </p>

            <p
              key={fadeKey}
              style={{
                fontSize: "clamp(22px, 4.5vw, 34px)",
                fontStyle: "italic",
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.6,
                textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                marginBottom: "48px",
                animation: activePrompts[promptIndex]?.voiceoverUrl
                  ? "fadeIn 0.8s ease"
                  : "fadePrompt 5s ease forwards",
              }}
            >
              {activePrompts[promptIndex]?.text || theme.description}
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "6px",
                marginBottom: "48px",
              }}
            >
              {activePrompts.map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background:
                      index <= promptIndex ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.12)",
                    transition: "background 0.5s ease",
                  }}
                />
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              {promptIndex < activePrompts.length - 1 ? (
                <button className="gentle-btn" onClick={handleNextPrompt}>
                  Next
                </button>
              ) : (
                <button className="gentle-btn" onClick={handleReturnToThemes}>
                  Return to Themes
                </button>
              )}
            </div>
          </div>
        )}

        {isGalleryTheme && (
          <div
            style={{
              width: "min(620px, 100%)",
              maxHeight: "calc(100vh - 150px)",
              padding: "32px 24px",
              borderRadius: "28px",
              background: "linear-gradient(160deg, rgba(255,248,240,0.12) 0%, rgba(255,255,255,0.04) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(18px)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.28)",
              textAlign: "center",
              pointerEvents: "auto",
              animation: "fadeIn 0.8s ease",
              overflow: "auto",
            }}
          >
            <p className="label-upper" style={{ marginBottom: "16px", color: "rgba(255,255,255,0.38)" }}>
              Shared by upperclassmen
            </p>

            <p
              key={`${currentQuote?.id ?? "quote"}-${fadeKey}`}
              style={{
                fontSize: "clamp(28px, 4.2vw, 42px)",
                fontStyle: "italic",
                color: "rgba(255,248,240,0.92)",
                lineHeight: 1.55,
                textShadow: "0 2px 20px rgba(0,0,0,0.35)",
                minHeight: "5lh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                maxWidth: "14ch",
                margin: "0 auto",
              }}
            >
              "{currentQuote?.text}"
            </p>

            <p
              style={{
                marginTop: "20px",
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                color: "rgba(255,255,255,0.42)",
                letterSpacing: "1px",
                textTransform: "uppercase",
              }}
            >
              {galleryLoading ? "Loading quotes" : currentQuote?.attribution || "Shared by a student"}
            </p>

            {showGalleryPlayer && (
              <div style={{ marginTop: "24px" }}>
                {galleryLoopSegment?.mediaUrl ? (
                  <video
                    autoPlay
                    ref={galleryMediaRef}
                    muted={muted}
                    playsInline
                    preload="auto"
                    src={galleryLoopSegment.mediaUrl}
                    style={{
                      width: 0,
                      height: 0,
                      opacity: 0,
                      pointerEvents: "none",
                    }}
                  />
                ) : (
                  <audio
                    autoPlay
                    ref={galleryMediaRef}
                    loop
                    muted={muted}
                    preload="auto"
                    src={activeAmbientAudioUrl}
                    style={{
                      width: 0,
                      height: 0,
                      opacity: 0,
                      pointerEvents: "none",
                    }}
                  />
                )}
              </div>
            )}

            {galleryQuotes.length > 1 && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "8px",
                  marginTop: "32px",
                  flexWrap: "wrap",
                }}
              >
                {galleryQuotes.map((quote, index) => (
                  <button
                    key={quote.id}
                    type="button"
                    onClick={() => {
                      setGalleryIndex(index);
                      setFadeKey((prev) => prev + 1);
                    }}
                    style={{
                      width: index === galleryIndex ? "28px" : "8px",
                      height: "8px",
                      borderRadius: "999px",
                      border: "none",
                      padding: 0,
                      background:
                        index === galleryIndex ? "rgba(255,248,240,0.7)" : "rgba(255,255,255,0.16)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </div>
            )}

            <div style={{ marginTop: "36px" }}>
              <button className="gentle-btn" onClick={handleReturnToThemes}>
                Back to Island
              </button>
            </div>
          </div>
        )}

        {showSubmissionCard && (
          <div
            style={{
              width: "min(620px, 100%)",
              padding: "32px 26px",
              borderRadius: "28px",
              background: "linear-gradient(160deg, rgba(10,14,22,0.72) 0%, rgba(15,19,28,0.62) 100%)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(18px)",
              boxShadow: "0 30px 90px rgba(0,0,0,0.35)",
              pointerEvents: "auto",
              animation: "fadeIn 0.8s ease",
            }}
          >
            <p className="label-upper" style={{ marginBottom: "14px", color: "rgba(255,255,255,0.36)" }}>
              Add to the gallery
            </p>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 42px)",
                fontStyle: "italic",
                color: "rgba(255,255,255,0.92)",
                lineHeight: 1.2,
                marginBottom: "14px",
              }}
            >
              Leave a line for the next person.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "15px",
                lineHeight: 1.7,
                color: "rgba(255,255,255,0.48)",
                marginBottom: "20px",
              }}
            >
              Share one sentence that might help someone else feel less alone.
            </p>

            <form onSubmit={handleSubmitQuote}>
              <textarea
                value={submissionText}
                onChange={(event) => setSubmissionText(event.target.value)}
                maxLength={280}
                placeholder="Something you wish someone had told you..."
                style={{
                  width: "100%",
                  minHeight: "140px",
                  resize: "vertical",
                  borderRadius: "22px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                  color: "rgba(255,255,255,0.88)",
                  padding: "18px 18px 16px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "15px",
                  lineHeight: 1.7,
                  outline: "none",
                }}
              />

              <div
                style={{
                  marginTop: "14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                  flexWrap: "wrap",
                }}
              >
                <p
                  style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: "12px",
                    color: submissionError
                      ? "rgba(255,180,180,0.9)"
                      : submissionState === "saved"
                        ? "rgba(190,235,205,0.9)"
                        : "rgba(255,255,255,0.32)",
                  }}
                >
                  {submissionError ||
                    (submissionState === "saved"
                      ? "Saved. It will appear in the gallery."
                      : `${submissionText.trim().length}/280 characters`)}
                </p>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <button className="gentle-btn" type="submit" disabled={submissionState === "saving"}>
                    {submissionState === "saving" ? "Saving..." : "Share to Gallery"}
                  </button>
                  <button className="gentle-btn" type="button" onClick={() => navigate("/destination/gallery/gallery")}>
                    View Gallery
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
