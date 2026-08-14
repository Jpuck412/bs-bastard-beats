import { NextResponse } from "next/server";

export function GET() {
  const providerReady = Boolean(process.env.GEMINI_API_KEY?.trim());
  return NextResponse.json({
    status: providerReady ? "ready" : "configuration_required",
    services: { musicProvider: providerReady, lyricProvider: providerReady },
    timestamp: new Date().toISOString(),
  }, { status: providerReady ? 200 : 503 });
}
