import type { MusicRequest } from "./types";

export function buildMusicPrompt(req: MusicRequest) {
  return [
    `Create an original, release-quality ${req.instrumental ? "instrumental track" : "song"}.`,
    `Creative brief: ${req.concept}`,
    req.genre && `Genre palette: ${req.genre}`,
    req.mood && `Emotional arc: ${req.mood}`,
    req.vocalStyle && !req.instrumental && `Vocal direction: ${req.vocalStyle}`,
    req.production && `Production direction: ${req.production}`,
    req.bpm && `Tempo: approximately ${req.bpm} BPM.`,
    req.musicalKey && `Key center: ${req.musicalKey}.`,
    req.model === "lyria-3-pro-preview" && `Target duration: approximately ${req.durationSeconds} seconds.`,
    "Use a deliberate intro, escalating section contrast, a memorable central hook, controlled low-end, clean transient separation, and a finished master-level ending.",
    "Avoid cheap retro game timbres unless explicitly requested. Favor modern, dimensional, mix-ready sound design.",
    "Do not imitate a named artist, copy an existing melody, or reproduce copyrighted lyrics.",
    req.instrumental ? "Instrumental only. No vocals or spoken words." : "Keep the vocal intelligible and naturally phrased.",
    !req.instrumental && req.lyrics ? `Custom lyrics — preserve the words and section labels:\n${req.lyrics}` : "",
  ].filter(Boolean).join("\n\n");
}
