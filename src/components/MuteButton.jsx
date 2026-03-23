export default function MuteButton({ muted, onToggle }) {
  return (
    <button
      onClick={onToggle}
      style={{
        position: "fixed",
        bottom: "28px",
        right: "28px",
        zIndex: 100,
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        background: "rgba(0,0,0,0.4)",
        backdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.15)",
        color: "rgba(255,255,255,0.6)",
        fontSize: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(0,0,0,0.5)";
        e.currentTarget.style.color = "rgba(255,255,255,0.8)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(0,0,0,0.4)";
        e.currentTarget.style.color = "rgba(255,255,255,0.6)";
      }}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
