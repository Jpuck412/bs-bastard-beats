import type { MusicModel, MusicRequest } from "./types";

const text = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";

export function parseMusicRequest(value: unknown): MusicRequest | null {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  const concept = text(body.concept, 1800);
  if (concept.length < 3) return null;

  const model: MusicModel = body.model === "lyria-3-pro-preview"
    ? "lyria-3-pro-preview"
    : "lyria-3-clip-preview";

  const rawBpm = Number(body.bpm);
  const bpm = Number.isFinite(rawBpm) ? Math.max(40, Math.min(220, Math.round(rawBpm))) : null;
  const durationSeconds = model === "lyria-3-pro-preview"
    ? Math.max(60, Math.min(184, Math.round(Number(body.durationSeconds) || 150)))
    : 30;

  return {
    title: text(body.title, 90) || "Untitled Master",
    concept,
    genre: text(body.genre, 100),
    mood: text(body.mood, 160),
    vocalStyle: text(body.vocalStyle, 180),
    production: text(body.production, 1200),
    lyrics: text(body.lyrics, 9000),
    instrumental: Boolean(body.instrumental),
    bpm,
    musicalKey: text(body.musicalKey, 30),
    durationSeconds,
    model,
  };
}

export function parseLyricRequest(value: unknown) {
  if (!value || typeof value !== "object") return null;
  const body = value as Record<string, unknown>;
  const concept = text(body.concept, 1800);
  if (concept.length < 3) return null;
  return {
    concept,
    genre: text(body.genre, 100),
    mood: text(body.mood, 160),
    vocalStyle: text(body.vocalStyle, 180),
    production: text(body.production, 1200),
    language: text(body.language, 40) || "English",
  };
}
