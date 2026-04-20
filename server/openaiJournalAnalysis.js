const DEFAULT_MODEL = "gpt-4.1-mini";

const allowedMoods = [
  "calm",
  "hopeful",
  "heavy",
  "homesick",
  "anxious",
  "lonely",
  "grateful",
  "overwhelmed",
];

const allowedStates = [
  "positive_reflection",
  "still_concerned",
  "dreamy",
  "sad",
  "tender",
  "steady",
];

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

export function inferReflectionState({ mood, entryType }) {
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

export async function analyzeJournalEntry({
  title = "",
  content,
  entryType = "reflection",
  apiKey,
  model = DEFAULT_MODEL,
}) {
  const trimmedContent = content?.trim();

  if (!apiKey) {
    const error = new Error("OPENAI_API_KEY is not configured.");
    error.status = 500;
    throw error;
  }

  if (!trimmedContent) {
    const error = new Error("Content is required.");
    error.status = 400;
    throw error;
  }

  const instructions = [
    "Classify the emotional tone of this journal entry.",
    `Choose mood from: ${allowedMoods.join(", ")}.`,
    `Choose reflection_state from: ${allowedStates.join(", ")}.`,
    "Prefer still_concerned when the writing suggests the person is still carrying worry, fear, or unsettled emotion.",
    "Prefer positive_reflection when the writing shows relief, gratitude, resolution, or emotional lift.",
    "Prefer dreamy when the writing feels imaginative, floating, symbolic, or dreamlike.",
    "Return strict JSON only with keys mood and reflection_state.",
  ].join(" ");

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: instructions }],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: JSON.stringify({
                title: title?.trim() || "",
                entry_type: entryType,
                content: trimmedContent,
              }),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "journal_analysis",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              mood: {
                type: "string",
                enum: allowedMoods,
              },
              reflection_state: {
                type: "string",
                enum: allowedStates,
              },
            },
            required: ["mood", "reflection_state"],
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    const error = new Error("Journal analysis request failed.");
    error.status = response.status;
    error.details = details;
    throw error;
  }

  const data = await response.json();
  const outputText = data.output_text;

  try {
    const parsed = JSON.parse(outputText);
    return {
      mood: parsed.mood,
      reflectionState: parsed.reflection_state || inferReflectionState({ mood: parsed.mood, entryType }),
    };
  } catch {
    const fallbackMood = inferMoodFromText(trimmedContent, entryType);
    return {
      mood: fallbackMood,
      reflectionState: inferReflectionState({ mood: fallbackMood, entryType }),
    };
  }
}
