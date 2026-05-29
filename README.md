# Stranded

Stranded is a story-driven reflective web app designed to help students navigate homesickness, stress, and peer pressure through guided destination experiences.

Live app: https://stranded-zeta.vercel.app/

## Table of contents
- [Overview](#overview)
- [Core features](#core-features)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Environment variables](#environment-variables)
- [Getting started](#getting-started)
- [Data model requirements (Supabase)](#data-model-requirements-supabase)
- [API surface](#api-surface)
- [Deployment notes](#deployment-notes)
- [Known behavior and fallbacks](#known-behavior-and-fallbacks)

## Overview
Stranded delivers a guided emotional regulation flow:
1. Authenticate into a private experience.
2. Choose a destination (Ocean, Sky, Forest, Space).
3. Enter a theme (Homesickness, Stress, Peer Pressure).
4. Complete a timed reflection experience with ambient audio/video and narration.
5. Save reflections in a personal journal.
6. Read and optionally contribute to a shared quote gallery.

## Core features
- **Authentication and protected routes** with Supabase Auth.
- **Narrative island map** with multiple destinations and emotional themes.
- **Guided sessions** with:
  - configurable destination/theme prompts
  - optional video-backed scenes
  - OpenAI-powered narration audio (`/api/narrate`)
  - ambient audio and mute support
- **Journal system** with:
  - per-user entries
  - AI-assisted mood/reflection-state classification (`/api/analyze-journal`)
  - local fallback storage when Supabase is unavailable
- **Gallery quotes** sourced from Supabase with static fallbacks.
- **Graceful degradation** when optional AI or backend services are not configured.

## Architecture

### 1) Frontend application (React + Vite)
- Entry point: `src/main.jsx`
- Router and page composition: `src/App.jsx`
- Route protection: `src/components/ProtectedRoute.jsx`
- Auth state provider: `src/context/AuthContext.jsx`

Primary user flow pages:
- `src/pages/Welcome.jsx`
- `src/pages/SignIn.jsx`, `src/pages/SignUp.jsx`
- `src/pages/ArrivalPage.jsx`
- `src/pages/MapPage.jsx`
- `src/pages/ThemePage.jsx`
- `src/pages/TransitionPage.jsx`
- `src/pages/DestinationPage.jsx`
- `src/pages/JournalPage.jsx`

### 2) Client data and service layer
- Supabase client/config: `src/lib/supabase.js`
- Journal CRUD + analysis fallback logic: `src/lib/journal.js`
- Audio orchestration hook: `src/hooks/useAudio.js`
- Destination/theme content model: `src/config/destinations.js`

### 3) API layer
This project supports both local and production API execution:

- **Local dev API (Vite middleware plugin)**
  - defined in `vite.config.js`
  - mounts `/api/narrate` and `/api/analyze-journal`

- **Production API (serverless handlers)**
  - `api/narrate.js`
  - `api/analyze-journal.js`

Shared server logic:
- TTS utilities: `server/openaiTts.js`
- Journal analysis utilities: `server/openaiJournalAnalysis.js`

## Tech stack
- **Frontend:** React 19, React Router 7, Vite 8
- **Auth + database:** Supabase (`@supabase/supabase-js`)
- **AI services:** OpenAI (TTS + structured journal analysis)
- **Linting:** ESLint 9
- **Hosting:** Vercel (SPA rewrite configured in `vercel.json`)

## Project structure
```text
.
├── api/                    # Production serverless endpoints
├── server/                 # Shared server-side OpenAI logic
├── src/
│   ├── components/         # Reusable UI/auth components
│   ├── config/             # Destination/theme content definitions
│   ├── context/            # Auth context
│   ├── hooks/              # Custom hooks (auth/audio)
│   ├── lib/                # Supabase client and journal data logic
│   └── pages/              # Route pages
├── public/                 # Static assets
├── dist/                   # Build output
├── vite.config.js          # Vite config + local API middleware
└── vercel.json             # SPA rewrite
```

## Environment variables

### Required for authenticated app usage
Create a `.env` file:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

### Optional (enables AI features)
```bash
OPENAI_API_KEY=your-openai-key
OPENAI_TTS_MODEL=gpt-4o-mini-tts
OPENAI_TTS_VOICE=shimmer
OPENAI_JOURNAL_MODEL=gpt-4.1-mini
```

If OpenAI vars are missing, API-powered narration/analysis will fail gracefully and journal mood logic falls back to local heuristics.

## Getting started

```bash
npm ci
npm run dev
```

Build and lint:

```bash
npm run build
npm run lint
```

## Data model requirements (Supabase)
At minimum, the app expects:

- **`journal_entries`**
  - used for per-user journal CRUD
  - queried by `user_id`
  - fields referenced in app: `id`, `title`, `content`, `destination_slug`, `theme_slug`, `mood`, `entry_type`, `favorite`, `created_at`, `updated_at`, `user_id`

- **`gallery_quotes`**
  - used for shared community quotes
  - fields referenced in app: `id`, `text`, `attribution`, `created_at`, `destination_slug`, `theme_slug`, `user_id`

Recommended: enforce row-level security for user-owned journal data.

## API surface

### `POST /api/narrate`
Generates guided narration audio (`audio/mpeg`) from prompt text and context.

Request body (core fields):
- `text`
- `destinationName`
- `themeName`
- `voiceInstructions`

### `POST /api/analyze-journal`
Returns structured mood/reflection metadata for a journal entry.

Request body (core fields):
- `title`
- `content`
- `entryType`

Response (shape):
- `mood`
- `reflectionState` or `reflection_state`

## Deployment notes
- The app is configured as an SPA with Vercel rewrite to `index.html` (`vercel.json`).
- For production AI endpoints, deploy with serverless function support and set OpenAI env vars.
- Ensure Supabase project credentials and DB schema are provisioned before launch.

