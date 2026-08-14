import { NextResponse } from "next/server";
import { generateMusic } from "@/lib/music/google";
import { parseMusicRequest } from "@/lib/music/validation";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();

  try {
    const parsed = parseMusicRequest(await request.json());
    if (!parsed) {
      return NextResponse.json({ error: "A valid creative brief is required.", requestId }, { status: 400 });
    }

    const result = await generateMusic(parsed);
    return NextResponse.json({ result, requestId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "UNKNOWN";
    const status = message.startsWith("MISSING_") ? 503 : message.startsWith("LYRIA_4") ? 400 : 502;
    console.error("music.generate.failed", { requestId, message: message.slice(0, 500) });

    return NextResponse.json({
      error: status === 503
        ? "The music provider is not configured yet."
        : "The music engine could not complete this render. No fake audio was substituted.",
      requestId,
    }, { status });
  }
}
