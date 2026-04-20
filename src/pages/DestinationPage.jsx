import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DESTINATIONS, THEMES } from "../config/destinations";
import MuteButton from "../components/MuteButton";
import Particles from "../components/Particles";
import VideoBackground from "../components/VideoBackground";
import useAudio from "../hooks/useAudio";
import useAuth from "../hooks/useAuth";
import { supabase, supabaseConfigured } from "../lib/supabase";

const BACKGROUND_MEDIA_VOLUME = 0.16;
const GALLERY_BATCH_SIZE = 6;
const SESSION_DURATION_MS = 2 * 60 * 1000;
const galleryNoteRotations = ["rotate(-1.8deg)", "rotate(1.3deg)", "rotate(-0.9deg)", "rotate(1.7deg)", "rotate(-1.1deg)", "rotate(0.8deg)"];
const galleryNoteColors = ["#f5e8bf", "#efddb5", "#f0e4c8", "#edd5a8", "#f2e9cf", "#e9d7b2"];

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
  const galleryTheme = THEMES.find((entry) => entry.slug === "gallery");
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
      galleryTheme={galleryTheme}
      galleryDestination={galleryDestination}
      navigate={navigate}
    />
  );
}

function DestinationExperience({ destination, theme, galleryTheme, galleryDestination, navigate }) {
  const audio = useAudio();
  const { user } = useAuth();
  const {
    muted,
    playAmbient,
    playVoiceover,
    stopVoiceover,
    stopAll,
    toggleMute,
    voiceoverPlaying,
  } = audio;

  const [started, setStarted] = useState(theme.slug === "gallery");
  const [fadeKey, setFadeKey] = useState(0);
  const [videoEnded, setVideoEnded] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [sessionRunId, setSessionRunId] = useState(0);
  const [galleryQuotes, setGalleryQuotes] = useState(() => buildFallbackQuotes(galleryDestination?.voices ?? []));
  const [galleryBatchStart, setGalleryBatchStart] = useState(0);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [submissionText, setSubmissionText] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [submissionState, setSubmissionState] = useState("idle");

  const timeoutRef = useRef(null);
  const galleryMediaRef = useRef(null);
  const narrationBackgroundMediaRef = useRef(null);
  const narrationCacheRef = useRef(new Map());
  const narrationRequestRef = useRef(0);

  useEffect(() => {
    return () => {
      stopAll();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      narrationRequestRef.current += 1;
      narrationCacheRef.current.forEach((url) => URL.revokeObjectURL(url));
      narrationCacheRef.current.clear();
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
  const narrationBackgroundLoopSegment = !isGalleryTheme ? galleryTheme?.ambientLoopSegment ?? null : null;
  const activePrompts = activeThemeMedia.prompts || destination?.prompts || [];
  const activeVoiceInstructions =
    activeThemeMedia.voiceInstructions ||
    destination?.voiceInstructions ||
    theme?.voiceInstructions ||
    "";
  const hideOverlayScript = Boolean(activeVideoUrl) && !isGalleryTheme;
  const activeAmbientAudioUrl = isGalleryTheme ? configuredAmbientAudioUrl : hideOverlayScript ? "" : configuredAmbientAudioUrl;
  const narrationBackgroundAudioUrl =
    !isGalleryTheme && !hideOverlayScript ? galleryTheme?.ambientAudioUrl || activeAmbientAudioUrl : "";
  const showGalleryPlayer = isGalleryTheme && Boolean(galleryLoopSegment?.mediaUrl || activeAmbientAudioUrl);
  const shouldUseNarrationBackgroundPlayer =
    !isGalleryTheme &&
    !hideOverlayScript &&
    Boolean(narrationBackgroundLoopSegment?.mediaUrl || narrationBackgroundAudioUrl);
  const showNarrationBackgroundPlayer =
    started && shouldUseNarrationBackgroundPlayer;
  const combinedNarrationText = useMemo(
    () => activePrompts.map((prompt) => prompt.text?.trim()).filter(Boolean).join("\n\n"),
    [activePrompts],
  );
  const visibleGalleryQuotes = useMemo(
    () => galleryQuotes.slice(galleryBatchStart, galleryBatchStart + GALLERY_BATCH_SIZE),
    [galleryBatchStart, galleryQuotes],
  );
  const meditationCopy = sessionComplete
    ? "The two-minute practice is complete. Let the quiet settle for a moment, and carry only what feels gentle enough to keep."
    : combinedNarrationText || theme.description;

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
    if (!isGalleryTheme || !galleryMediaRef.current || (!galleryLoopSegment?.mediaUrl && !activeAmbientAudioUrl)) {
      return undefined;
    }

    const mediaEl = galleryMediaRef.current;
    mediaEl.muted = muted;
    mediaEl.volume = BACKGROUND_MEDIA_VOLUME;

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

  useEffect(() => {
    if (
      isGalleryTheme ||
      !showNarrationBackgroundPlayer ||
      !narrationBackgroundMediaRef.current ||
      (!narrationBackgroundLoopSegment?.mediaUrl && !narrationBackgroundAudioUrl)
    ) {
      return undefined;
    }

    const mediaEl = narrationBackgroundMediaRef.current;
    mediaEl.muted = muted;
    mediaEl.volume = BACKGROUND_MEDIA_VOLUME;

    const startTime = narrationBackgroundLoopSegment?.startTime ?? 0;
    const endTime = narrationBackgroundLoopSegment?.endTime ?? Infinity;

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

    if (narrationBackgroundLoopSegment?.mediaUrl) {
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
  }, [
    isGalleryTheme,
    muted,
    narrationBackgroundAudioUrl,
    narrationBackgroundLoopSegment,
    showNarrationBackgroundPlayer,
  ]);

  useEffect(() => {
    if (!started || isGalleryTheme || hideOverlayScript) {
      return undefined;
    }

    setSessionComplete(false);

    const timer = window.setTimeout(() => {
      setSessionComplete(true);
      narrationRequestRef.current += 1;
      stopVoiceover();
      setFadeKey((prev) => prev + 1);
    }, SESSION_DURATION_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [hideOverlayScript, isGalleryTheme, sessionRunId, started, stopVoiceover]);

  const fetchNarrationUrl = useCallback(async ({ text, voiceInstructions }) => {
    const cacheKey = `${destination.slug}:${theme.slug}:${text}:${voiceInstructions || ""}`;
    const cachedUrl = narrationCacheRef.current.get(cacheKey);

    if (cachedUrl) {
      return cachedUrl;
    }

    const response = await fetch("/api/narrate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text,
        destinationName: destination.name,
        themeName: theme.name,
        voiceInstructions,
      }),
    });

    if (!response.ok) {
      throw new Error("Narration request failed.");
    }

    const audioBlob = await response.blob();
    const objectUrl = URL.createObjectURL(audioBlob);
    narrationCacheRef.current.set(cacheKey, objectUrl);
    return objectUrl;
  }, [destination.name, destination.slug, theme.name, theme.slug]);

  const startContinuousNarration = useCallback(() => {
    if (!combinedNarrationText) {
      return;
    }

    setFadeKey((prev) => prev + 1);
    const requestId = ++narrationRequestRef.current;

    fetchNarrationUrl({
      text: combinedNarrationText,
      voiceInstructions: activeVoiceInstructions,
    })
      .then((generatedUrl) => {
        if (requestId !== narrationRequestRef.current) {
          return;
        }

        playVoiceover(generatedUrl, () => {});
      })
      .catch(() => {
        if (requestId !== narrationRequestRef.current) {
          return;
        }
      });
  }, [activeVoiceInstructions, combinedNarrationText, fetchNarrationUrl, playVoiceover]);

  const startExperience = () => {
    setStarted(true);
    setVideoEnded(false);
    setSessionComplete(false);
    setSessionRunId((prev) => prev + 1);
    if (!isGalleryTheme && !shouldUseNarrationBackgroundPlayer) {
      playAmbient(activeAmbientAudioUrl);
    }

    if (!isGalleryTheme && !hideOverlayScript) {
      startContinuousNarration();
    }
  };

  const handleReplayNarration = () => {
    setSessionComplete(false);
    setSessionRunId((prev) => prev + 1);
    narrationRequestRef.current += 1;
    stopVoiceover();
    startContinuousNarration();
  };

  const handleReturnToThemes = () => {
    stopAll();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    narrationRequestRef.current += 1;
    navigate(isGalleryTheme ? "/map" : `/destination/${destination.slug}`);
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

  const handleNextGalleryBatch = () => {
    if (galleryQuotes.length <= GALLERY_BATCH_SIZE) {
      return;
    }

    setGalleryBatchStart((current) => {
      const nextStart = current + GALLERY_BATCH_SIZE;
      return nextStart >= galleryQuotes.length ? 0 : nextStart;
    });
    setFadeKey((prev) => prev + 1);
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
            AI-generated narration will blend the reflection into one continuous meditation track.
          </p>

          <button className="gentle-btn" onClick={startExperience}>
            Begin
          </button>

          <div style={{ marginTop: "18px" }}>
            <button
              type="button"
              className="back-link"
              onClick={() => navigate(`/destination/${destination.slug}`)}
            >
              Exit reflection
            </button>
          </div>
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

      <MuteButton muted={muted} onToggle={toggleMute} />

      {showNarrationBackgroundPlayer && (
        narrationBackgroundLoopSegment?.mediaUrl ? (
          <video
            autoPlay
            ref={narrationBackgroundMediaRef}
            muted={muted}
            playsInline
            preload="auto"
            src={narrationBackgroundLoopSegment.mediaUrl}
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
            ref={narrationBackgroundMediaRef}
            loop
            muted={muted}
            preload="auto"
            src={narrationBackgroundAudioUrl}
            style={{
              width: 0,
              height: 0,
              opacity: 0,
              pointerEvents: "none",
            }}
          />
        )
      )}

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: isGalleryTheme ? "center" : "flex-start",
          justifyContent: "center",
          zIndex: 10,
          pointerEvents: "auto",
          padding: isGalleryTheme ? "96px 20px 36px" : "104px 20px 44px",
          overflowY: "auto",
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {!isGalleryTheme && !hideOverlayScript && (
          <div
            style={{
              maxWidth: "560px",
              width: "100%",
              textAlign: "center",
              padding: "0 24px",
              pointerEvents: "auto",
              margin: "0 auto",
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

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                flexWrap: "wrap",
                marginBottom: "28px",
              }}
            >
              <button className="gentle-btn" onClick={handleReplayNarration}>
                ↻ Replay narration
              </button>
              <button
                className="gentle-btn"
                onClick={() =>
                  navigate("/journal", {
                    state: {
                      destinationSlug: destination.slug,
                      themeSlug: theme.slug,
                      title: `${destination.name} · ${theme.name}`,
                      content: combinedNarrationText,
                    },
                  })
                }
              >
                ✎ Write in journal
              </button>
            </div>

            <div
              key={fadeKey}
              style={{
                fontSize: "clamp(20px, 3.4vw, 28px)",
                color: "rgba(255,255,255,0.85)",
                lineHeight: 1.6,
                textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                marginBottom: "48px",
                animation: "fadeIn 0.8s ease",
                whiteSpace: "pre-line",
              }}
            >
              {meditationCopy}
            </div>

            <p
              style={{
                marginBottom: "34px",
                fontFamily: "var(--font-sans)",
                fontSize: "13px",
                color: "rgba(255,255,255,0.38)",
              }}
            >
              {sessionComplete
                ? "This two-minute meditation has finished."
                : voiceoverPlaying
                  ? "Meditation narration is playing. This reflection lasts 2 minutes."
                  : "Meditation narration is ready to replay. This reflection lasts 2 minutes."}
            </p>

            <div style={{ display: "flex", justifyContent: "center", gap: "12px", flexWrap: "wrap" }}>
              <button className="gentle-btn" onClick={handleReturnToThemes}>
                ↩ Return to Themes
              </button>
            </div>

            <div style={{ marginTop: "18px" }}>
              <button type="button" className="back-link" onClick={handleReturnToThemes}>
                ← Exit reflection
              </button>
            </div>

            <p
              style={{
                marginTop: "18px",
                fontFamily: "var(--font-sans)",
                fontSize: "12px",
                letterSpacing: "0.4px",
                color: "rgba(255,255,255,0.32)",
              }}
            >
              Narration voice is AI-generated.
            </p>
          </div>
        )}

        {isGalleryTheme && (
          <div
            style={{
              width: "min(1180px, 100%)",
              maxHeight: "calc(100vh - 140px)",
              padding: "12px 8px 28px",
              pointerEvents: "auto",
              animation: "fadeIn 0.8s ease",
              overflow: "auto",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "28px" }}>
              <p className="label-upper" style={{ marginBottom: "14px", color: "rgba(255,255,255,0.34)" }}>
                Shared by upperclassmen
              </p>
              <h2
                style={{
                  fontSize: "clamp(30px, 4.6vw, 48px)",
                  fontStyle: "italic",
                  fontWeight: 400,
                  color: "rgba(255,248,240,0.92)",
                  marginBottom: "10px",
                }}
              >
                The blackboard of lantern notes
              </h2>
              <p
                style={{
                  maxWidth: "620px",
                  margin: "0 auto",
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  lineHeight: 1.8,
                  color: "rgba(255,255,255,0.42)",
                  textShadow: "0 2px 14px rgba(0,0,0,0.24)",
                }}
              >
                Messages left behind by students who already crossed this part of the island. Read a few at a time, then pull down the next cluster.
              </p>
            </div>

            <div
              key={`gallery-batch-${galleryBatchStart}-${fadeKey}`}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "26px 20px",
                alignItems: "start",
                padding: "6px 10px",
              }}
            >
              {visibleGalleryQuotes.map((quote, index) => (
                <article
                  key={quote.id}
                  style={{
                    position: "relative",
                    minHeight: "210px",
                    padding: "22px 18px 18px",
                    borderRadius: "14px",
                    background: galleryNoteColors[index % galleryNoteColors.length],
                    color: "#352714",
                    boxShadow: "0 22px 34px rgba(0,0,0,0.24)",
                    transform: galleryNoteRotations[index % galleryNoteRotations.length],
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      top: "-8px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      width: "20px",
                      height: "20px",
                      borderRadius: "999px",
                      background: "#cc504a",
                      boxShadow: "0 3px 7px rgba(0,0,0,0.18)",
                    }}
                  />
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "15px",
                      lineHeight: 1.8,
                      color: "rgba(53,39,20,0.88)",
                      whiteSpace: "pre-line",
                      marginBottom: "14px",
                    }}
                  >
                    "{quote.text}"
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "11px",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: "rgba(53,39,20,0.56)",
                    }}
                  >
                    {galleryLoading ? "Loading notes" : quote.attribution || "Shared by a student"}
                  </p>
                </article>
              ))}
            </div>

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

            <div
              style={{
                marginTop: "28px",
                display: "flex",
                justifyContent: "center",
                gap: "12px",
                flexWrap: "wrap",
                paddingBottom: "8px",
              }}
            >
              {galleryQuotes.length > GALLERY_BATCH_SIZE && (
                <button className="gentle-btn" onClick={handleNextGalleryBatch}>
                  Show next notes
                </button>
              )}
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
