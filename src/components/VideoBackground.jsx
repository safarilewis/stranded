export default function VideoBackground({
  url,
  fallbackGradient,
  muted = true,
  loop = true,
  onEnded,
}) {
  // Empty or falsy URL: render gradient fallback
  if (!url) {
    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: fallbackGradient,
          zIndex: 0,
        }}
      />
    );
  }

  // YouTube URL: extract video ID and render iframe
  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    let videoId;
    if (url.includes("youtube.com")) {
      const match = url.match(/[?&]v=([^&]+)/);
      videoId = match ? match[1] : "";
    } else {
      const match = url.match(/youtu\.be\/([^?]+)/);
      videoId = match ? match[1] : "";
    }

    return (
      <>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${muted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&showinfo=0&modestbranding=1&playsinline=1&rel=0&disablekb=1`}
          allow="autoplay"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: "120vw",
            height: "120vh",
            transform: "translate(-50%, -50%)",
            border: "none",
            pointerEvents: "none",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 1,
          }}
        />
      </>
    );
  }

  // Direct video file: render video element
  return (
    <>
      <video
        autoPlay
        muted={muted}
        loop={loop}
        playsInline
        onEnded={onEnded}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      >
        <source src={url} />
      </video>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 1,
        }}
      />
    </>
  );
}
