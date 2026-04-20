import { generateNarrationAudio, parseBody } from "../server/openaiTts.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = parseBody(req.body);
  const destinationName = body.destinationName?.trim() || "this space";
  const themeName = body.themeName?.trim() || "this theme";

  try {
    const audioBuffer = await generateNarrationAudio({
      text: body.text,
      destinationName,
      themeName,
      voiceInstructions: body.voiceInstructions,
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_TTS_MODEL,
      voice: process.env.OPENAI_TTS_VOICE,
    });

    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).send(audioBuffer);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "Narration request failed.",
      details: error.details || "",
    });
  }
}
