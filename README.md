# B's Bastard Beats

Production-grade AI music creation studio built with Next.js, TypeScript, Google Lyria, and Gemini.

## What is live in v1

- Professional creative-direction console
- Full-song and 30-second Lyria render modes
- AI lyric writer with structured songwriting direction
- Server-side validation and provider isolation
- Server-only API secret handling
- Request IDs, provider timeout handling, and health endpoint
- Playable master deck with direct export
- Responsive mobile studio interface
- Vercel-native Next.js architecture
- No synthetic/fake audio fallback in production

## Required environment variable

```bash
GEMINI_API_KEY=your_server_side_key
```

Never expose that key with a `NEXT_PUBLIC_` prefix.

## Local development

```bash
npm install
npm run dev
```

## Production checks

```bash
npm run typecheck
npm run build
```

Health endpoint: `/api/health`
