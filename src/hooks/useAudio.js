import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export default function useAudio() {
  const ambientRef = useRef(null);
  const voiceoverRef = useRef(null);
  const fadeIntervalRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [voiceoverPlaying, setVoiceoverPlaying] = useState(false);

  // Fade audio volume over time
  const fadeVolume = useCallback((audioEl, targetVolume, duration = 300) => {
    if (!audioEl) return;

    const startVolume = audioEl.volume;
    const steps = duration / 50;
    let currentStep = 0;
    const increment = (targetVolume - startVolume) / steps;

    if (fadeIntervalRef.current) {
      clearInterval(fadeIntervalRef.current);
    }

    fadeIntervalRef.current = setInterval(() => {
      currentStep++;
      audioEl.volume = Math.max(
        0,
        Math.min(1, startVolume + increment * currentStep)
      );

      if (currentStep >= steps) {
        clearInterval(fadeIntervalRef.current);
        fadeIntervalRef.current = null;
        audioEl.volume = targetVolume;
      }
    }, 50);
  }, []);

  const playAmbient = useCallback((url) => {
    if (!url) return;

    // Stop existing ambient
    if (ambientRef.current) {
      ambientRef.current.pause();
      ambientRef.current = null;
    }

    try {
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = 0;
      if (muted) audio.muted = true;
      ambientRef.current = audio;
      audio.play().catch(() => {
        // Autoplay blocked
      });
      fadeVolume(audio, 0.3, 500);
    } catch {
      // Handle error silently
    }
  }, [fadeVolume, muted]);

  const stopAmbient = useCallback(() => {
    if (!ambientRef.current) return;
    fadeVolume(ambientRef.current, 0, 300);
    setTimeout(() => {
      if (ambientRef.current) {
        ambientRef.current.pause();
        ambientRef.current = null;
      }
    }, 300);
  }, [fadeVolume]);

  const playVoiceover = useCallback((url, onEnd) => {
    if (!url) {
      onEnd();
      return;
    }

    // Stop existing voiceover
    if (voiceoverRef.current) {
      voiceoverRef.current.pause();
      voiceoverRef.current = null;
    }

    try {
      // Duck ambient volume
      if (ambientRef.current) {
        fadeVolume(ambientRef.current, 0.1, 200);
      }

      const audio = new Audio(url);
      audio.volume = 0.85;
      if (muted) audio.muted = true;
      voiceoverRef.current = audio;
      setVoiceoverPlaying(true);

      audio.addEventListener("ended", () => {
        setVoiceoverPlaying(false);
        if (ambientRef.current) {
          fadeVolume(ambientRef.current, 0.3, 300);
        }
        voiceoverRef.current = null;
        onEnd();
      });

      audio.play().catch(() => {
        // Autoplay blocked
        setVoiceoverPlaying(false);
        if (ambientRef.current) {
          fadeVolume(ambientRef.current, 0.3, 300);
        }
        voiceoverRef.current = null;
        onEnd();
      });
    } catch {
      // Handle error
      onEnd();
    }
  }, [fadeVolume, muted]);

  const stopVoiceover = useCallback(() => {
    if (voiceoverRef.current) {
      voiceoverRef.current.pause();
      voiceoverRef.current = null;
    }
    setVoiceoverPlaying(false);
    if (ambientRef.current) {
      fadeVolume(ambientRef.current, 0.3, 200);
    }
  }, [fadeVolume]);

  const stopAll = useCallback(() => {
    stopVoiceover();
    stopAmbient();
  }, [stopAmbient, stopVoiceover]);

  const toggleMute = useCallback(() => {
    const newMuted = !muted;
    setMuted(newMuted);
    if (ambientRef.current) ambientRef.current.muted = newMuted;
    if (voiceoverRef.current) voiceoverRef.current.muted = newMuted;
  }, [muted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }

      if (voiceoverRef.current) {
        voiceoverRef.current.pause();
        voiceoverRef.current = null;
      }

      if (ambientRef.current) {
        ambientRef.current.pause();
        ambientRef.current = null;
      }
    };
  }, []);

  return useMemo(
    () => ({
      playAmbient,
      stopAmbient,
      playVoiceover,
      stopVoiceover,
      stopAll,
      toggleMute,
      muted,
      voiceoverPlaying,
    }),
    [muted, playAmbient, playVoiceover, stopAll, stopAmbient, stopVoiceover, toggleMute, voiceoverPlaying],
  );
}
