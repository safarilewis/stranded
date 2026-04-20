import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { analyzeJournalEntry } from "./server/openaiJournalAnalysis.js";
import { generateNarrationAudio, readJsonRequest } from "./server/openaiTts.js";

function localNarrationApi(mode) {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    name: "local-narration-api",
    configureServer(server) {
      server.middlewares.use("/api/narrate", async (req, res, next) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Allow", "POST");
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        try {
          const body = await readJsonRequest(req);
          const audioBuffer = await generateNarrationAudio({
            text: body.text,
            destinationName: body.destinationName?.trim() || "this space",
            themeName: body.themeName?.trim() || "this theme",
            voiceInstructions: body.voiceInstructions,
            apiKey: env.OPENAI_API_KEY,
            model: env.OPENAI_TTS_MODEL,
            voice: env.OPENAI_TTS_VOICE,
          });

          res.statusCode = 200;
          res.setHeader("Content-Type", "audio/mpeg");
          res.setHeader("Cache-Control", "no-store");
          res.end(audioBuffer);
        } catch (error) {
          res.statusCode = error.status || 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: error.message || "Narration request failed.",
              details: error.details || "",
            }),
          );
        }
      });
    },
  };
}

function localJournalAnalysisApi(mode) {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    name: "local-journal-analysis-api",
    configureServer(server) {
      server.middlewares.use("/api/analyze-journal", async (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.setHeader("Allow", "POST");
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Method not allowed" }));
          return;
        }

        try {
          const body = await readJsonRequest(req);
          const analysis = await analyzeJournalEntry({
            title: body.title,
            content: body.content,
            entryType: body.entryType,
            apiKey: env.OPENAI_API_KEY,
            model: env.OPENAI_JOURNAL_MODEL,
          });

          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(analysis));
        } catch (error) {
          res.statusCode = error.status || 500;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              error: error.message || "Journal analysis failed.",
              details: error.details || "",
            }),
          );
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), localNarrationApi(mode), localJournalAnalysisApi(mode)],
}));
