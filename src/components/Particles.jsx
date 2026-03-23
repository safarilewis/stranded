import { useMemo } from "react";

const generateParticles = (type, count) => {
  const particles = [];
  for (let i = 0; i < count; i++) {
    particles.push({
      id: i,
      type,
      ...getParticleProps(type),
    });
  }
  return particles;
};

const getParticleProps = (type) => {
  if (type === "bubbles") {
    return {
      bottom: Math.random() * -40 - 20,
      left: Math.random() * 100,
      width: Math.random() * 14 + 6,
      height: Math.random() * 14 + 6,
      duration: Math.random() * 12 + 8,
      delay: Math.random() * 10,
    };
  }
  if (type === "clouds") {
    return {
      top: Math.random() * 60 + 10,
      left: -200,
      width: Math.random() * 180 + 120,
      height: Math.random() * 30 + 40,
      duration: Math.random() * 40 + 30,
      delay: Math.random() * 20,
    };
  }
  if (type === "stars") {
    return {
      top: Math.random() * 100,
      left: Math.random() * 100,
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
      duration: Math.random() * 4 + 2,
      delay: Math.random() * 4,
    };
  }
  return {};
};

export default function Particles({ type }) {
  const particles = useMemo(() => {
    if (type === "bubbles") return generateParticles("bubbles", 20);
    if (type === "clouds") return generateParticles("clouds", 6);
    if (type === "stars") return generateParticles("stars", 40);
    return [];
  }, [type]);

  if (type === "none") return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 2,
      }}
    >
      {type === "bubbles" &&
        particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              bottom: `${p.bottom}px`,
              left: `${p.left}%`,
              width: `${p.width}px`,
              height: `${p.height}px`,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              animation: `floatUp ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

      {type === "clouds" &&
        particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              top: `${p.top}%`,
              left: `${p.left}px`,
              width: `${p.width}px`,
              height: `${p.height}px`,
              borderRadius: "60px",
              background: "rgba(255,255,255,0.06)",
              filter: "blur(8px)",
              animation: `driftRight ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}

      {type === "stars" &&
        particles.map((p) => (
          <div
            key={p.id}
            style={{
              position: "absolute",
              top: `${p.top}%`,
              left: `${p.left}%`,
              width: `${p.width}px`,
              height: `${p.height}px`,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.7)",
              animation: `twinkle ${p.duration}s ease-in-out infinite`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
    </div>
  );
}
