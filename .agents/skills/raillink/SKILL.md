---
name: raillink
description: >-
  Expert guide for the RailLink project — an AI-powered block planning and defect
  management platform for Indian Railways. Use when working on any feature, bug fix,
  or infrastructure task within this codebase. Covers architecture, API routes,
  services, secrets management, database schema, deployment, and dev workflows.
---

# RailLink Project Skill

RailLink is a full-stack monorepo built for Indian Railways maintenance operations.
It covers block schedule planning, defect inspection reporting, AI photo analysis,
live section maps, and analytics — all managed through a React frontend and Node.js
Express backend backed by Supabase (PostgreSQL + Auth).

---

## Project Structure

```
RailLink/
+-- client/                  # React 18 + Vite 5 (SPA)
¦   +-- src/
¦       +-- pages/           # Dashboard, Map, Plans, Defects, Analytics, AI Studio, Admin
¦       +-- components/      # Navbar, Sidebar, shared UI components
¦       +-- store/           # Zustand global state (index.js)
¦       +-- lib/             # config.js — API base URL, railway location data
¦
+-- server/                  # Node.js 18 + Express 4 (API + SPA host)
¦   +-- src/
¦       +-- app.js           # Entry point — Express setup, static SPA serving
¦       +-- routes/          # API route handlers (see below)
¦       +-- services/        # External integrations (see below)
¦       +-- simulators/      # tms.js — TMS simulator for live train data
¦       +-- lib/
¦           +-- supabase.js  # Supabase client init
¦
+-- .sops.yaml               # SOPS Age encryption config for .env files
+-- server/.env.enc          # Encrypted secrets (safe to commit)
+-- render.yaml              # Render.com one-click deploy blueprint
+-- SETUP_SUPABASE_ALL_IN_ONE.sql  # Full Supabase schema (run in SQL editor)
+-- package.json             # Monorepo root scripts
```

---

## API Routes (`server/src/routes/`)

| File | Mount | Purpose |
|---|---|---|
| `auth.js` | `/api/auth` | Supabase Auth — login, register, session |
| `defects.js` | `/api/defects` | CRUD for track defect reports |
| `plans.js` | `/api/plans` | Block plan generation and management |
| `sections.js` | `/api/sections` | Railway section data + GPS corridors |
| `analytics.js` | `/api/analytics` | Defect trends, health scores, stats |
| `ai.js` | `/api/ai` | Gemini AI — copilot queries, block optimization |
| `upload.js` | `/api/upload` | Cloudinary photo upload for defect evidence |
| `blocks.js` | `/api/blocks` | Block schedule CRUD |
| `railway.js` | `/api/railway` | Live train data via RapidAPI IRCTC |
| `sync.js` | `/api/sync` | Data sync utilities |
| `simulators.js` | `/api/simulators` | TMS simulation endpoints |
| `config.js` | `/api/config` | Runtime config endpoint |

---

## Services (`server/src/services/`)

| File | Purpose |
|---|---|
| `aiService.js` | Google Gemini integration — photo defect analysis + AI Studio queries |
| `cloudinaryService.js` | Cloudinary upload, transformation, CDN delivery |
| `dataStore.js` | In-memory data store for section/block state |
| `railwayService.js` | RapidAPI IRCTC wrapper for live train data |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, React Router 6, Leaflet (maps), Zustand |
| Backend | Node.js 18, Express 4 (ESM — `"type": "module"`) |
| Database + Auth | Supabase (PostgreSQL + Row Level Security) |
| AI | Google Gemini (`gemini-2.0-flash`) — vision + text |
| Media | Cloudinary — upload, CDN, image processing |
| Maps | MapTiler satellite + HD rail vector tiles |
| Train Data | RapidAPI Indian Railway IRCTC API |
| Deployment | Render.com (single web service — serves API + built SPA) |

---

## Environment Variables

Secrets are managed with **SOPS + Age encryption**. The encrypted file is committed to git.

### Decrypt for local use
```powershell
$env:SOPS_AGE_KEY_FILE = "$env:APPDATA\sops\age\keys.txt"
sops --config .sops.yaml --decrypt --input-type dotenv --output-type dotenv server/.env.enc > server/.env
```

### Re-encrypt after editing
```powershell
sops --config .sops.yaml --encrypt --output server/.env.enc --input-type dotenv --output-type dotenv server/.env
```

### Variables in `server/.env`

| Variable | Service | Description |
|---|---|---|
| `PORT` | Server | Express listen port (default 3001) |
| `NODE_ENV` | Server | `development` or `production` |
| `SUPABASE_URL` | Supabase | Project URL |
| `SUPABASE_ANON_KEY` | Supabase | Anon/public JWT |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Admin JWT (server-side only) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary | Cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary | API key |
| `CLOUDINARY_API_SECRET` | Cloudinary | API secret |
| `CLOUDINARY_UPLOAD_PRESET` | Cloudinary | Upload preset (`raillink_uploads`) |
| `ML_SERVICE_URL` | ML | Python ML service URL (default `http://localhost:8000`) |
| `RAPIDAPI_KEY` | RapidAPI | IRCTC live train API key |
| `RAPIDAPI_HOST` | RapidAPI | `indian-railway-irctc.p.rapidapi.com` |
| `MAPTILER_API_KEY` | MapTiler | Satellite + rail vector tile API key |
| `GEMINI_API_KEY` | Google | Gemini AI API key |

---

## Dev Workflow

### Start development (run separately in two terminals)
```powershell
# Terminal 1 — Backend (port 3001)
npm run server:dev

# Terminal 2 — Frontend (port 5173)
npm run client:dev
```

### Frontend talks to backend via
```js
// client/src/lib/config.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
```

### Install dependencies
```powershell
npm install                          # root
npm --prefix client install          # client
npm --prefix server install          # server
```

---

## Database Setup

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Open the SQL Editor and run: `SETUP_SUPABASE_ALL_IN_ONE.sql`
3. This creates all tables, RLS policies, and seed data in one shot

**Key tables:** `defects`, `block_plans`, `sections`, `users`, `analytics_events`

---

## Deployment (Render.com)

1. Push to `main` on GitHub
2. Go to Render ? **New ? Blueprint** ? connect `nonsense3/RailLink`
3. Render reads `render.yaml` automatically
4. Add all env vars in the Render dashboard (copy from decrypted `.env`)
5. The Express server serves both `/api/*` and the built React SPA

---

## Role System

| Role | Access |
|---|---|
| `admin` | Full access — user management, all data, config |
| `supervisor` | Block plans, defects, analytics, section management |
| `inspector` | Submit defects, view assigned sections only |

Roles are enforced via **Supabase RLS** on the database and checked server-side via `SUPABASE_SERVICE_ROLE_KEY`.

---

## Secrets Management (SOPS)

- **Tool:** [SOPS](https://github.com/getsops/sops) + [Age](https://age-encryption.org/)
- **Config:** `.sops.yaml` at project root
- **Encrypted file:** `server/.env.enc` (committed to git — safe)
- **Private key location:** `%APPDATA%\sops\age\keys.txt` (never committed)

### Add a collaborator
1. They run `age-keygen` and send you their public key (`age1...`)
2. Add their key to `.sops.yaml` (comma-separated under `age:`)
3. Run `sops --config .sops.yaml --rotate --input-type dotenv --output-type dotenv --in-place server/.env.enc`
4. Commit and push the updated `.env.enc`

---

## Key Patterns & Conventions

- **ESM modules** throughout — always use `import`/`export`, never `require()`
- **Supabase client** is initialized once in `server/src/lib/supabase.js` — import `{ supabase }` from there
- **Cloudinary** uploads return a secure URL stored in the defect record
- **Gemini AI** calls go through `aiService.js` — pass image URLs directly for vision analysis
- **Error responses** always use `{ error: message }` JSON format with appropriate HTTP status codes
- **Frontend state** is managed in Zustand store at `client/src/store/index.js`
- **Map data** (GPS corridor points) lives in `server/src/routes/sections.js` — `corridorGPS` object
