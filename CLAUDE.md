# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a monorepo for **AD Ponte** (Assembleia de Deus Ponte), a church. It contains:

- `site/adponte.com/` — Public website (Astro + Tailwind + Directus CMS)
- `appmidia/transcript/` — RunPod serverless worker for audio/video transcription (Python + faster-whisper)
- `appmidia/n8n/` — n8n workflow automation (in development)
- `appmidia/flow.md` — Architecture diagram of the full media production pipeline

---

## site/adponte.com

**Stack:** Astro 6, Tailwind CSS 4, Directus (headless CMS), TypeScript, pnpm

### Commands (run from `site/adponte.com/`)

```bash
pnpm dev          # Dev server at localhost:4321
pnpm build        # Production build to ./dist/
pnpm preview      # Preview built site
pnpm lint         # ESLint
pnpm lint:fix     # ESLint with auto-fix
pnpm format       # Prettier write
pnpm format:check # Prettier check
pnpm knip         # Dead code detection
```

**Infrastructure scripts** (require `.env` with `DIRECTUS_URL` and `DIRECTUS_ADMIN_TOKEN`):
```bash
pnpm infra:snapshot  # Snapshot current Directus schema to directus-schema.yaml
pnpm infra:sync      # Apply directus-schema.yaml to Directus instance
pnpm infra:seed      # Seed initial data
```

### Architecture

**Data layer (`lib/`):**
- `lib/directus.ts` — Directus client, TypeScript interfaces for all collections (`Post`, `Event`, `Ministry`, `Congregation`, `Channel`, `Global`, etc.), and helpers (`getAssetUrl`, `formatDate`)
- `lib/api.ts` — All fetch functions used at build-time (Astro frontmatter). Uses raw `fetch` against the Directus REST API. **Never import `lib/api.ts` in client-side `<script>` tags.**
- `lib/directus-admin.ts` — Admin-scoped Directus client for infra scripts

**Routing & i18n:**
- Default locale: `pt-BR` (no URL prefix). English at `/en/...`
- Translations in `src/i18n/pt-BR.yaml` and `src/i18n/en.yaml`
- `src/i18n/ui.ts` exposes the `useTranslations(lang)` helper
- `src/stores/lang.ts` — nanostores `persistentAtom` for client-side language preference (persisted to localStorage)

**Component structure:**
- `src/components/sections/` — Full-width page sections (Hero, Events, Sermons, etc.)
- `src/components/blocks/` — Reusable content blocks (Accordion, CTA, etc.)
- `src/components/ui/` — Primitive UI components (Button, Card, Badge, etc.)
- `src/layouts/` — `BaseLayout` (all pages), `ContentLayout` (content pages), `Layout` (bare)

**Content model:**
- Posts serve double duty: regular blog posts and sermons (distinguished by `category.slug === 'sermoes'`). Sermons have extra fields: `preacher`, `scripture_reference`, `series`, `audio_url`, `youtube_id`, `spotify_url`.

**Path alias:** `@/` maps to `src/`, `@lib/` maps to `lib/` (see `tsconfig.json`).

---

## appmidia/transcript

**Stack:** Python 3.10+, faster-whisper, RunPod serverless, Docker (CUDA)

### Commands (run from `appmidia/transcript/`)

```bash
# Dev setup
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# Lint / type check
ruff check .
ruff format .
mypy handler.py

# Build & push Docker image
docker build -t <user>/runpod-whisper:latest .
docker push <user>/runpod-whisper:latest
```

### How it works

Single-file worker (`handler.py`) deployed as a RunPod serverless endpoint:
1. Receives `{ file_url, language?, is_video }` payload
2. Downloads the file, extracts audio via FFmpeg if `is_video=true`
3. Transcribes with faster-whisper (VAD filter enabled)
4. Returns `{ language, language_probability, text, segments[] }`

Model is loaded lazily on first invocation. Configure via env vars: `WHISPER_MODEL`, `WHISPER_DEVICE`, `WHISPER_COMPUTE_TYPE`.

---

## Media Pipeline

`appmidia/flow.md` describes the full media production pipeline:
- **Capture** → upload via app → **Orchestration** via n8n → **AI Analysis** (transcription, silence detection, cut suggestions) → **Video Processing** (FFmpeg shorts, DaVinci Resolve reels) → **Human approval** via Telegram → **Publishing** via Postiz to Instagram, YouTube Shorts, etc.
- Storage: Cloudflare R2
- The `transcript` worker is step 4 (Analysis) in this pipeline
