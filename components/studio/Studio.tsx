"use client";

import { useMemo, useState } from "react";
import type { MusicModel, MusicResult } from "@/lib/music/types";

type FormState = {
  title: string;
  concept: string;
  genre: string;
  mood: string;
  vocalStyle: string;
  production: string;
  lyrics: string;
  instrumental: boolean;
  bpm: string;
  musicalKey: string;
  durationSeconds: number;
  model: MusicModel;
};

const initial: FormState = {
  title: "",
  concept: "",
  genre: "Hip-hop / cinematic trap",
  mood: "Dark, confident, tense, expensive",
  vocalStyle: "Controlled lead vocal, dynamic phrasing, clear hook",
  production: "Hard drums, deep controlled sub bass, textured percussion, evolving transitions, wide atmospheric layers, no retro video-game timbres.",
  lyrics: "",
  instrumental: false,
  bpm: "92",
  musicalKey: "D minor",
  durationSeconds: 150,
  model: "lyria-3-pro-preview",
};

function audioSource(master: MusicResult) {
  return `data:${master.mimeType};base64,${master.audioBase64}`;
}

export function Studio() {
  const [form, setForm] = useState<FormState>(initial);
  const [masters, setMasters] = useState<MusicResult[]>([]);
  const [busy, setBusy] = useState<"lyrics" | "music" | null>(null);
  const [error, setError] = useState("");

  const completion = useMemo(() => {
    let score = 0;
    if (form.concept.trim().length > 12) score += 35;
    if (form.genre.trim()) score += 15;
    if (form.mood.trim()) score += 15;
    if (form.production.trim()) score += 20;
    if (form.instrumental || form.lyrics.trim()) score += 15;
    return score;
  }, [form]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function writeLyrics() {
    setBusy("lyrics");
    setError("");
    try {
      const response = await fetch("/api/lyrics", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, language: "English" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Lyric generation failed");
      set("lyrics", data.lyrics);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Lyric generation failed");
    } finally {
      setBusy(null);
    }
  }

  async function renderMaster() {
    setBusy("music");
    setError("");
    try {
      const response = await fetch("/api/music/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, bpm: Number(form.bpm) || null }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Render failed");
      setMasters((current) => [data.result, ...current]);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Render failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <main className="shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">B&apos;S BASTARD BEATS / PRODUCTION CONSOLE</div>
          <h1>Build the record, not a demo.</h1>
        </div>
        <div className="status"><span className="statusDot" /> PRO STUDIO</div>
      </header>

      <section className="workspace">
        <aside className="rail panel">
          <div className="brandMark">B³</div>
          <div className="railItem active">CREATE</div>
          <div className="railItem">MASTERS</div>
          <div className="railItem">PROJECTS</div>
          <div className="railItem">STEMS</div>
        </aside>

        <section className="composer panel">
          <div className="sectionHead">
            <div><span className="step">01</span><h2>Creative Direction</h2></div>
            <span className="meterLabel">Brief strength {completion}%</span>
          </div>
          <div className="meter"><i style={{ width: `${completion}%` }} /></div>

          <label>Record title<input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Untitled master" /></label>
          <label>What are we making?<textarea className="concept" value={form.concept} onChange={(e) => set("concept", e.target.value)} placeholder="Describe the story, energy, sound, arc, and moment this record should create..." /></label>

          <div className="grid2">
            <label>Genre palette<input value={form.genre} onChange={(e) => set("genre", e.target.value)} /></label>
            <label>Emotional arc<input value={form.mood} onChange={(e) => set("mood", e.target.value)} /></label>
            <label>BPM<input inputMode="numeric" value={form.bpm} onChange={(e) => set("bpm", e.target.value)} /></label>
            <label>Key center<input value={form.musicalKey} onChange={(e) => set("musicalKey", e.target.value)} /></label>
          </div>

          <label>Vocal direction<input value={form.vocalStyle} disabled={form.instrumental} onChange={(e) => set("vocalStyle", e.target.value)} /></label>
          <label>Production brief<textarea value={form.production} onChange={(e) => set("production", e.target.value)} /></label>

          <div className="toggleRow">
            <button className={`toggle ${form.instrumental ? "on" : ""}`} onClick={() => set("instrumental", !form.instrumental)} type="button"><span /> Instrumental only</button>
            <select value={form.model} onChange={(e) => set("model", e.target.value as MusicModel)}>
              <option value="lyria-3-pro-preview">Lyria 3 Pro / full song</option>
              <option value="lyria-3-clip-preview">Lyria 3 Clip / 30 sec</option>
            </select>
          </div>

          {!form.instrumental && (
            <div className="lyricsBlock">
              <div className="sectionHead compact">
                <div><span className="step">02</span><h2>Lyrics</h2></div>
                <button className="secondary" type="button" disabled={busy !== null || form.concept.trim().length < 3} onClick={writeLyrics}>{busy === "lyrics" ? "WRITING…" : "AI WRITE"}</button>
              </div>
              <textarea className="lyrics" value={form.lyrics} onChange={(e) => set("lyrics", e.target.value)} placeholder="Write or generate structured lyrics here..." />
            </div>
          )}

          {error && <div className="error">{error}</div>}
          <button className="render" type="button" disabled={busy !== null || form.concept.trim().length < 3} onClick={renderMaster}>
            <span>{busy === "music" ? "RENDERING MASTER…" : "RENDER MASTER"}</span><b>→</b>
          </button>
        </section>

        <section className="monitor panel">
          <div className="sectionHead"><div><span className="step">03</span><h2>Master Deck</h2></div><span className="count">{masters.length}</span></div>
          {masters.length === 0 ? (
            <div className="empty">
              <div className="disc"><span /></div>
              <h3>No disposable previews.</h3>
              <p>Completed AI renders land here as playable master candidates, ready to audition and export.</p>
            </div>
          ) : masters.map((master) => (
            <article className="master" key={master.id}>
              <div className="masterTop"><div><small>{master.provider}</small><h3>{master.title}</h3></div><span>MASTER</span></div>
              <audio controls preload="metadata" src={audioSource(master)} />
              <div className="masterMeta">
                <span>{master.model.includes("pro") ? "FULL SONG" : "30 SEC CLIP"}</span>
                <a href={audioSource(master)} download={`${master.title || "master"}.mp3`}>EXPORT MASTER ↓</a>
              </div>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
