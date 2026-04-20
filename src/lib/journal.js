import { supabase, supabaseConfigured } from "./supabase";

const STORAGE_KEY = "stranded_journal_entries";

function inferReflectionState({ mood, entryType }) {
  if (entryType === "dream") {
    return "dreamy";
  }

  if (mood === "hopeful" || mood === "grateful") {
    return "positive_reflection";
  }

  if (mood === "anxious" || mood === "overwhelmed") {
    return "still_concerned";
  }

  if (mood === "heavy") {
    return "sad";
  }

  if (mood === "homesick" || mood === "lonely") {
    return "tender";
  }

  return "steady";
}

function inferMoodFromText(content = "", entryType = "reflection") {
  const text = content.trim().toLowerCase();

  if (!text) {
    return "calm";
  }

  if (entryType === "dream") {
    return "calm";
  }

  const hasAny = (terms) => terms.some((term) => text.includes(term));

  if (hasAny(["i hate this", "hate this", "i hate it", "hate it", "worthless", "hopeless", "empty inside"])) {
    return "heavy";
  }

  if (hasAny(["overwhelmed", "too much", "breaking down", "can't do this", "cannot do this", "spiraling"])) {
    return "overwhelmed";
  }

  if (hasAny(["anxious", "anxiety", "panic", "panicking", "nervous", "afraid", "scared", "worried", "stress"])) {
    return "anxious";
  }

  if (hasAny(["homesick", "miss home", "miss my family", "miss my mom", "miss my dad", "miss everyone back home"])) {
    return "homesick";
  }

  if (hasAny(["alone", "lonely", "isolated", "no one gets it", "feel invisible"])) {
    return "lonely";
  }

  if (hasAny(["grateful", "thankful", "appreciate", "blessed"])) {
    return "grateful";
  }

  if (hasAny(["hopeful", "getting better", "i can do this", "lighter", "more at peace", "more okay"])) {
    return "hopeful";
  }

  if (hasAny(["calm", "steady", "peaceful", "grounded", "settled"])) {
    return "calm";
  }

  return "heavy";
}

async function analyzeJournalMood({ title, content, entryType }) {
  if (!content?.trim()) {
    return {
      mood: "calm",
      reflection_state: inferReflectionState({ mood: "calm", entryType }),
      analysis_debug: "",
    };
  }

  try {
    const response = await fetch("/api/analyze-journal", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content, entryType }),
    });

    if (!response.ok) {
      let debugMessage = `Journal analysis failed with status ${response.status}.`;

      try {
        const errorPayload = await response.json();
        if (errorPayload?.error || errorPayload?.details) {
          debugMessage = [errorPayload.error, errorPayload.details].filter(Boolean).join(" ");
        }
      } catch {
        try {
          const errorText = await response.text();
          if (errorText) {
            debugMessage = errorText;
          }
        } catch {
          // Keep the generic status message.
        }
      }

      throw new Error(debugMessage);
    }

    const analysis = await response.json();
    const fallbackMood = inferMoodFromText(content, entryType);
    return {
      mood: analysis.mood || fallbackMood,
      reflection_state:
        analysis.reflectionState ||
        analysis.reflection_state ||
        inferReflectionState({ mood: analysis.mood || fallbackMood, entryType }),
      analysis_debug: "",
    };
  } catch (error) {
    const fallbackMood = inferMoodFromText(content, entryType);
    return {
      mood: fallbackMood,
      reflection_state: inferReflectionState({ mood: fallbackMood, entryType }),
      analysis_debug: error?.message || "Journal analysis failed and fallback mood logic was used.",
    };
  }
}

function readLocalEntries() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeLocalEntries(entries) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function normalizeEntry(entry) {
  return {
    id: entry.id,
    title: entry.title || "Untitled entry",
    content: entry.content || "",
    destination_slug: entry.destination_slug || null,
    theme_slug: entry.theme_slug || null,
    mood: entry.mood || null,
    reflection_state:
      entry.reflection_state || inferReflectionState({ mood: entry.mood || "calm", entryType: entry.entry_type }),
    entry_type: entry.entry_type || "reflection",
    favorite: Boolean(entry.favorite),
    created_at: entry.created_at || new Date().toISOString(),
    updated_at: entry.updated_at || entry.created_at || new Date().toISOString(),
    source: entry.source || "local",
    analysis_debug: entry.analysis_debug || "",
  };
}

export async function listJournalEntries(userId) {
  if (supabaseConfigured && supabase && userId) {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("id, title, content, destination_slug, theme_slug, mood, entry_type, favorite, created_at, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (!error && Array.isArray(data)) {
      return data.map((entry) => normalizeEntry({ ...entry, source: "supabase" }));
    }
  }

  return readLocalEntries()
    .filter((entry) => entry.user_id === userId)
    .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
    .map((entry) => normalizeEntry(entry));
}

export async function createJournalEntry({
  userId,
  title,
  content,
  destinationSlug,
  themeSlug,
  mood = null,
  entryType = "reflection",
  favorite = false,
}) {
  const payload = {
    title: title?.trim() || "Untitled entry",
    content: content?.trim() || "",
    destination_slug: destinationSlug || null,
    theme_slug: themeSlug || null,
    mood,
    entry_type: entryType,
    favorite,
    user_id: userId,
  };

  const analysis = await analyzeJournalMood({
    title: payload.title,
    content: payload.content,
    entryType: payload.entry_type,
  });

  payload.mood = analysis.mood;

  if (supabaseConfigured && supabase && userId) {
    const { data, error } = await supabase
      .from("journal_entries")
      .insert(payload)
      .select("id, title, content, destination_slug, theme_slug, mood, entry_type, favorite, created_at, updated_at")
      .single();

    if (!error && data) {
      return normalizeEntry({
        ...data,
        reflection_state: analysis.reflection_state,
        analysis_debug: analysis.analysis_debug,
        source: "supabase",
      });
    }
  }

  const now = new Date().toISOString();
  const localEntry = normalizeEntry({
    id: `local-${crypto.randomUUID()}`,
    ...payload,
    created_at: now,
    updated_at: now,
    reflection_state: analysis.reflection_state,
    analysis_debug: analysis.analysis_debug,
    source: "local",
  });

  writeLocalEntries([localEntry, ...readLocalEntries()]);
  return localEntry;
}

export async function deleteJournalEntry({ id, userId, source }) {
  if (source === "supabase" && supabaseConfigured && supabase && userId) {
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (!error) {
      return;
    }
  }

  writeLocalEntries(readLocalEntries().filter((entry) => !(entry.id === id && entry.user_id === userId)));
}
