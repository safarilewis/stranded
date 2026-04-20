import { analyzeJournalEntry } from "../server/openaiJournalAnalysis.js";
import { parseBody } from "../server/openaiTts.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const body = parseBody(req.body);

  try {
    const analysis = await analyzeJournalEntry({
      title: body.title,
      content: body.content,
      entryType: body.entryType,
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_JOURNAL_MODEL,
    });

    return res.status(200).json(analysis);
  } catch (error) {
    return res.status(error.status || 500).json({
      error: error.message || "Journal analysis failed.",
      details: error.details || "",
    });
  }
}
