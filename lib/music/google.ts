import { buildMusicPrompt } from "./prompt";
import type { MusicRequest, MusicResult } from "./types";

type InteractionPayload = {
  steps?: Array<{
    type?: string;
    content?: Array<{
      type?: string;
      data?: string;
      text?: string;
      mime_type?: string;
      mimeType?: string;
    }>;
  }>;
};

function extractInteraction(payload: InteractionPayload) {
  let audioBase64 = "";
  let mimeType = "audio/mpeg";
  const textParts: string[] = [];

  for (const step of payload.steps ?? []) {
    if (step.type !== "model_output") continue;
    for (const block of step.content ?? []) {
      if (!audioBase64 && block.type === "audio" && block.data) {
        audioBase64 = block.data;
        mimeType = block.mime_type || block.mimeType || mimeType;
      }
      if (block.type === "text" && block.text?.trim()) textParts.push(block.text.trim());
    }
  }

  return { audioBase64, mimeType, outputText: textParts.join("\n\n") };
}

export async function generateMusic(req: MusicRequest): Promise<MusicResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error("MISSING_GEMINI_KEY");

  const response = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      model: req.model,
      input: buildMusicPrompt(req),
    }),
    signal: AbortSignal.timeout(req.model === "lyria-3-pro-preview" ? 240_000 : 100_000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`LYRIA_${response.status}:${detail.slice(0, 400)}`);
  }

  const output = extractInteraction((await response.json()) as InteractionPayload);
  if (!output.audioBase64) throw new Error("LYRIA_NO_AUDIO");

  return {
    id: crypto.randomUUID(),
    title: req.title,
    audioBase64: output.audioBase64,
    mimeType: output.mimeType,
    lyrics: req.instrumental ? "" : req.lyrics || output.outputText,
    provider: req.model === "lyria-3-pro-preview" ? "Google Lyria 3 Pro" : "Google Lyria 3 Clip",
    model: req.model,
    createdAt: new Date().toISOString(),
  };
}
