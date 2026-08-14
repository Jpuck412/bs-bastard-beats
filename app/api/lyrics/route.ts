import { NextResponse } from "next/server";
import { parseLyricRequest } from "@/lib/music/validation";

export const runtime = "nodejs";

function stripFence(value: string) {
  return value.trim().replace(/^```(?:text)?\s*/i, "").replace(/\s*```$/, "").trim();
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  try {
    const parsed = parseLyricRequest(await request.json());
    if (!parsed) {
      return NextResponse.json({ error: "A valid song concept is required.", requestId }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json({ error: "The lyric engine is not configured yet.", requestId }, { status: 503 });
    }

    const prompt = [
      `Write completely original, release-ready ${parsed.language} song lyrics.`,
      `Concept: ${parsed.concept}`,
      parsed.genre && `Genre: ${parsed.genre}`,
      parsed.mood && `Emotional arc: ${parsed.mood}`,
      parsed.vocalStyle && `Vocal phrasing: ${parsed.vocalStyle}`,
      parsed.production && `Production context: ${parsed.production}`,
      "Use [Verse 1], [Pre-Chorus], [Chorus], [Verse 2], [Bridge], and [Final Chorus] where musically appropriate.",
      "Make verse two advance the story. Make the chorus concise, specific, singable, and emotionally inevitable.",
      "Avoid generic filler and stock AI songwriting clichés. Do not imitate a named artist or quote existing lyrics.",
      "Return only the finished lyrics.",
    ].filter(Boolean).join("\n\n");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.9, maxOutputTokens: 1800 },
        }),
        signal: AbortSignal.timeout(40_000),
      },
    );

    if (!response.ok) throw new Error(`GEMINI_${response.status}`);
    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const lyrics = payload.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!lyrics?.trim()) throw new Error("GEMINI_NO_TEXT");

    return NextResponse.json({ lyrics: stripFence(lyrics).slice(0, 9000), requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    console.error("lyrics.generate.failed", { requestId, message });
    return NextResponse.json({ error: "The lyric engine could not complete this draft.", requestId }, { status: 502 });
  }
}
