export type MusicModel = "lyria-3-clip-preview" | "lyria-3-pro-preview";

export type MusicRequest = {
  title: string;
  concept: string;
  genre: string;
  mood: string;
  vocalStyle: string;
  production: string;
  lyrics: string;
  instrumental: boolean;
  bpm: number | null;
  musicalKey: string;
  durationSeconds: number;
  model: MusicModel;
};

export type MusicResult = {
  id: string;
  title: string;
  audioBase64: string;
  mimeType: string;
  lyrics: string;
  provider: string;
  model: MusicModel;
  createdAt: string;
};
