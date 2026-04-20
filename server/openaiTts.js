const DEFAULT_MODEL = "gpt-4o-mini-tts";
const DEFAULT_VOICE = "shimmer";

export function parseBody(body) {
  if (!body) {
    return {};
  }

  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }

  return body;
}

export async function readJsonRequest(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return parseBody(rawBody);
}

export async function generateNarrationAudio({
  text,
  destinationName = "this space",
  themeName = "this theme",
  voiceInstructions = "",
  apiKey,
  model = DEFAULT_MODEL,
  voice = DEFAULT_VOICE,
}) {
  const trimmedText = text?.trim();

  if (!apiKey) {
    const error = new Error("OPENAI_API_KEY is not configured.");
    error.status = 500;
    throw error;
  }

  if (!trimmedText) {
    const error = new Error("Text is required.");
    error.status = 400;
    throw error;
  }

  const instructionParts = [
    `Narrate this reflective prompt for ${destinationName} and ${themeName}.`,
    "Sound like a gentle meditation guide.",
    "Speak noticeably slower than a normal conversation, softly and reassuringly, with spacious pauses between sentences.",
    "Keep the tone soothing, grounded, emotionally safe, and never theatrical.",
    voiceInstructions?.trim(),
    "Do not add any words that are not in the prompt.",
  ].filter(Boolean);

  const instructions = instructionParts.join(" ");

  const openAiResponse = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      voice,
      format: "mp3",
      input: trimmedText,
      instructions,
    }),
  });

  if (!openAiResponse.ok) {
    const details = await openAiResponse.text();
    const error = new Error("OpenAI TTS request failed.");
    error.status = openAiResponse.status;
    error.details = details;
    throw error;
  }

  return Buffer.from(await openAiResponse.arrayBuffer());
}
