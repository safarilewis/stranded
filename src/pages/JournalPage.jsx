import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AccountBar from "../components/AccountBar";
import useAuth from "../hooks/useAuth";
import { createJournalEntry, deleteJournalEntry, listJournalEntries } from "../lib/journal";

const entryTypes = ["reflection", "dream", "memory", "note", "letter"];

const stickerPalettes = {
  calm: { bg: "#b8d8cf", text: "#183b34" },
  hopeful: { bg: "#f1d07b", text: "#4d3700" },
  heavy: { bg: "#b6b0d8", text: "#2d244e" },
  homesick: { bg: "#f0b8ab", text: "#5f2417" },
  anxious: { bg: "#f6c38b", text: "#5a3214" },
  lonely: { bg: "#b4c7e7", text: "#203a62" },
  grateful: { bg: "#f6e4a7", text: "#5b4d12" },
  overwhelmed: { bg: "#dfb8df", text: "#562056" },
};

const reflectionStateLabels = {
  positive_reflection: "positive reflection",
  still_concerned: "still concerned",
  dreamy: "dreamy",
  sad: "sad",
  tender: "tender",
  steady: "steady",
};

const reflectionStatePalettes = {
  positive_reflection: { bg: "#d8f0b8", text: "#2f4a12" },
  still_concerned: { bg: "#f2b8b8", text: "#652020" },
  dreamy: { bg: "#cfc1f2", text: "#3f2d70" },
  sad: { bg: "#b9c7de", text: "#24384f" },
  tender: { bg: "#f0cbc0", text: "#663126" },
  steady: { bg: "#c7dbc5", text: "#24442a" },
};

const noteRotations = ["rotate(-1.4deg)", "rotate(1.2deg)", "rotate(-0.8deg)", "rotate(1.6deg)"];
const noteMoodPalettes = {
  calm: { bg: "#cfe8df", text: "#183b34", body: "rgba(24,59,52,0.86)", meta: "rgba(24,59,52,0.58)", action: "rgba(24,59,52,0.62)", pin: "#5f9f90" },
  hopeful: { bg: "#f5dfa0", text: "#574000", body: "rgba(87,64,0,0.84)", meta: "rgba(87,64,0,0.56)", action: "rgba(87,64,0,0.62)", pin: "#d1a63c" },
  heavy: { bg: "#c8c0e5", text: "#312650", body: "rgba(49,38,80,0.86)", meta: "rgba(49,38,80,0.56)", action: "rgba(49,38,80,0.62)", pin: "#8672bc" },
  homesick: { bg: "#f4c9c0", text: "#662d24", body: "rgba(102,45,36,0.86)", meta: "rgba(102,45,36,0.56)", action: "rgba(102,45,36,0.62)", pin: "#cf7c6f" },
  anxious: { bg: "#f6d09e", text: "#653816", body: "rgba(101,56,22,0.86)", meta: "rgba(101,56,22,0.56)", action: "rgba(101,56,22,0.62)", pin: "#d28d43" },
  lonely: { bg: "#c8d8ef", text: "#274161", body: "rgba(39,65,97,0.86)", meta: "rgba(39,65,97,0.56)", action: "rgba(39,65,97,0.62)", pin: "#6c93c6" },
  grateful: { bg: "#f3ebae", text: "#5c4f18", body: "rgba(92,79,24,0.86)", meta: "rgba(92,79,24,0.56)", action: "rgba(92,79,24,0.62)", pin: "#cdb64b" },
  overwhelmed: { bg: "#e5c5e5", text: "#5a285c", body: "rgba(90,40,92,0.86)", meta: "rgba(90,40,92,0.56)", action: "rgba(90,40,92,0.62)", pin: "#ba78bc" },
};

export default function JournalPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const draftContext = useMemo(
    () => ({
      destinationSlug: location.state?.destinationSlug || "",
      themeSlug: location.state?.themeSlug || "",
      title: location.state?.title || "",
      content: location.state?.content || "",
    }),
    [location.state],
  );

  const [title, setTitle] = useState(draftContext.title);
  const [content, setContent] = useState(draftContext.content);
  const [entryType, setEntryType] = useState("reflection");
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    let active = true;
    setLoading(true);

    listJournalEntries(user.id)
      .then((result) => {
        if (active) {
          setEntries(result);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError("Could not load journal entries right now.");
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [user]);

  useEffect(() => {
    if (draftContext.title || draftContext.content) {
      setTitle(draftContext.title);
      setContent(draftContext.content);
    }
  }, [draftContext]);

  const handleSave = async (event) => {
    event.preventDefault();

    if (!user) {
      return;
    }

    if (!title.trim() && !content.trim()) {
      setError("Write something before pinning it to the board.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const entry = await createJournalEntry({
        userId: user.id,
        title,
        content,
        destinationSlug: draftContext.destinationSlug,
        themeSlug: draftContext.themeSlug,
        entryType,
        favorite,
      });

      setEntries((current) => [entry, ...current]);
      setTitle("");
      setContent("");
      setEntryType("reflection");
      setFavorite(false);
      navigate("/journal", { replace: true, state: null });
    } catch {
      setError("Could not save your reflection right now.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (entry) => {
    if (!user) {
      return;
    }

    await deleteJournalEntry({ id: entry.id, userId: user.id, source: entry.source });
    setEntries((current) => current.filter((item) => item.id !== entry.id));
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(110, 145, 126, 0.12) 0%, rgba(110, 145, 126, 0) 28%), linear-gradient(180deg, #0f1d17 0%, #13241c 50%, #0d1813 100%)",
        position: "relative",
        overflow: "hidden",
        padding: "40px 20px 72px",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "26px 26px, 34px 34px",
          backgroundPosition: "0 0, 12px 12px",
          opacity: 0.14,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
          position: "relative",
          zIndex: 5,
        }}
      >
        <AccountBar />

        <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", marginBottom: "24px" }}>
          <button type="button" className="back-link" onClick={() => navigate("/map")}>
            ← Back to map
          </button>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "12px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "rgba(229, 240, 229, 0.32)",
            }}
          >
            Reflection board
          </p>
        </div>

        

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(320px, 380px) minmax(0, 1fr)",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <form
            onSubmit={handleSave}
            style={{
              position: "sticky",
              top: "24px",
              padding: "28px 24px 24px",
              borderRadius: "20px",
              background: "#efe2b3",
              color: "#332711",
              boxShadow: "0 24px 50px rgba(0,0,0,0.24)",
              transform: "rotate(-1.1deg)",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-10px",
                left: "50%",
                transform: "translateX(-50%) rotate(1deg)",
                width: "96px",
                height: "26px",
                background: "rgba(213, 193, 158, 0.82)",
                borderRadius: "4px",
                boxShadow: "0 4px 8px rgba(0,0,0,0.08)",
              }}
            />

            <p
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "11px",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(51,39,17,0.58)",
                marginBottom: "14px",
              }}
            >
              Pin a new reflection
            </p>

            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Entry title"
              style={noteInputStyle}
            />
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder="What did this island bring up for you?"
              style={{ ...noteInputStyle, minHeight: "220px", resize: "vertical", marginTop: "14px" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginTop: "14px" }}>
             
              <select value={entryType} onChange={(event) => setEntryType(event.target.value)} style={noteInputStyle}>
                {entryTypes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginTop: "14px",
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                color: "rgba(51,39,17,0.8)",
              }}
            >
              <input type="checkbox" checked={favorite} onChange={(event) => setFavorite(event.target.checked)} />
              Mark as favorite
            </label>

            {(draftContext.destinationSlug || draftContext.themeSlug) && (
              <p
                style={{
                  marginTop: "14px",
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                  color: "rgba(51,39,17,0.58)",
                  lineHeight: 1.7,
                }}
              >
                Context: {draftContext.destinationSlug || "unknown island"}
                {draftContext.themeSlug ? ` · ${draftContext.themeSlug}` : ""}
              </p>
            )}

            {error && (
              <p style={{ marginTop: "14px", fontFamily: "var(--font-sans)", fontSize: "13px", color: "#7c2115" }}>
                {error}
              </p>
            )}

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "20px" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  padding: "12px 22px",
                  borderRadius: "999px",
                  border: "1px solid rgba(51,39,17,0.18)",
                  background: "#2c4d3d",
                  color: "#f5f0da",
                  fontFamily: "var(--font-sans)",
                  fontSize: "12px",
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                }}
              >
                {saving ? "Saving..." : "Pin to board"}
              </button>
              <button type="button" className="back-link" onClick={() => navigate("/map")} style={{ color: "rgba(51,39,17,0.62)" }}>
                Return to map
              </button>
            </div>
          </form>

          <div
            style={{
              padding: "22px",
              borderRadius: "28px",
              background: "linear-gradient(180deg, rgba(20,34,26,0.92) 0%, rgba(16,28,21,0.96) 100%)",
              border: "1px solid rgba(226, 238, 225, 0.08)",
              boxShadow: "0 30px 80px rgba(0,0,0,0.28)",
              minHeight: "640px",
            }}
          >
            <p className="label-upper" style={{ marginBottom: "18px", color: "rgba(229, 240, 229, 0.32)" }}>
              Your Past Reflections
            </p>

            {loading ? (
              <p style={emptyStyle}>Chalk dust is settling...</p>
            ) : entries.length === 0 ? (
              <p style={emptyStyle}>The board is empty. Pin your first note after a crossing.</p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "18px",
                  alignItems: "start",
                }}
              >
                {entries.map((entry, index) => {
                  const palette = stickerPalettes[entry.mood] || stickerPalettes.calm;
                  const notePalette = noteMoodPalettes[entry.mood] || noteMoodPalettes.calm;
                  const rotation = noteRotations[index % noteRotations.length];

                  return (
                    <article
                      key={entry.id}
                      style={{
                        position: "relative",
                        padding: "22px 18px 18px",
                        borderRadius: "14px",
                        background: notePalette.bg,
                        color: notePalette.text,
                        minHeight: "220px",
                        transform: rotation,
                        boxShadow: "0 18px 32px rgba(0,0,0,0.2)",
                        border: "1px solid rgba(0,0,0,0.05)",
                      }}
                    >
                      <div
                        style={{
                          position: "absolute",
                          top: "-8px",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "22px",
                          height: "22px",
                          borderRadius: "999px",
                          background: notePalette.pin,
                          boxShadow: "0 3px 7px rgba(0,0,0,0.18)",
                        }}
                      />

                      <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", alignItems: "flex-start", marginBottom: "12px" }}>
                        <h2
                          style={{
                            fontSize: "26px",
                            fontWeight: 400,
                            fontStyle: "italic",
                            lineHeight: 1.08,
                            color: notePalette.text,
                          }}
                        >
                          {entry.favorite ? "★ " : ""}
                          {entry.title}
                        </h2>
                        <button
                          type="button"
                          onClick={() => handleDelete(entry)}
                          style={{
                            border: "none",
                            background: "none",
                            color: notePalette.action,
                            fontFamily: "var(--font-sans)",
                            fontSize: "11px",
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                          }}
                        >
                          Remove
                        </button>
                      </div>

                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                        <span style={buildStickerStyle(palette)}>{entry.mood || "calm"}</span>
                        <span style={buildStickerStyle(reflectionStatePalettes[entry.reflection_state] || reflectionStatePalettes.steady)}>
                          {reflectionStateLabels[entry.reflection_state] || "steady"}
                        </span>
                        <span style={buildStickerStyle({ bg: "#d9d3be", text: "#4a4130" })}>{entry.entry_type}</span>
                      </div>

                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "14px",
                          lineHeight: 1.8,
                          color: notePalette.body,
                          whiteSpace: "pre-line",
                          marginBottom: "14px",
                        }}
                      >
                        {entry.content}
                      </p>

                      <p
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "11px",
                          color: notePalette.meta,
                          lineHeight: 1.7,
                        }}
                      >
                        {new Date(entry.updated_at).toLocaleString()}
                        {entry.destination_slug ? ` · ${entry.destination_slug}` : ""}
                        {entry.theme_slug ? ` · ${entry.theme_slug}` : ""}
                      </p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const noteInputStyle = {
  width: "100%",
  borderRadius: "14px",
  border: "1px solid rgba(60,45,21,0.12)",
  background: "rgba(255,255,255,0.38)",
  color: "#332711",
  padding: "14px 16px",
  fontFamily: "var(--font-sans)",
  fontSize: "15px",
  outline: "none",
};

const emptyStyle = {
  fontFamily: "var(--font-sans)",
  fontSize: "15px",
  lineHeight: 1.8,
  color: "rgba(229, 240, 229, 0.48)",
};

function buildStickerStyle(palette) {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "6px 10px",
    borderRadius: "999px",
    background: palette.bg,
    color: palette.text,
    fontFamily: "var(--font-sans)",
    fontSize: "11px",
    fontWeight: 500,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    boxShadow: "inset 0 -1px 0 rgba(0,0,0,0.08)",
  };
}
