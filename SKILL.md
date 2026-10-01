---
name: raillink
description: >-
  Expert guide for the RailLink project - an AI-powered block planning and defect
  management platform for Indian Railways. Use when working on any feature, bug fix,
  or infrastructure task within this codebase. Covers architecture, API routes,
  services, secrets management, database schema, deployment, and dev workflows.
---

# RailLink Project Skill

RailLink is a full-stack monorepo for Indian Railways maintenance operations.
It covers block schedule planning, defect inspection reporting, AI photo analysis,
live section maps, and analytics - React frontend + Node.js Express backend + Supabase.

**Root:** `d:\codes\Railsync\`

---

## Project Structure

```
d:\codes\Railsync\
|-- client\                        # React 18 + Vite 5 (SPA, port 5173)
|   -- src\
|       |-- pages\                 # Dashboard, Map, Plans, Defects, Analytics, AI Studio, Admin
|       |-- components\            # Navbar, Sidebar, shared UI
|       |-- store\index.js         # Zustand global state
|       -- lib\config.js          # API base URL + railway location data
|
|-- server\                        # Node.js 18 + Express 4 (API + SPA host, port 3001)
|   |-- src\
|   |   |-- app.js                 # Express entry point - routes + static SPA serving
|   |   |-- routes\                # 12 API route handlers (see Routes section)
|   |   |-- services\              # External integrations (Gemini, Cloudinary, IRCTC)
|   |   |-- simulators\tms.js      # TMS live train simulator
|   |   -- lib\supabase.js        # Supabase client singleton
|   |-- .env                       # Plaintext secrets (NEVER commit - git ignored)
|   -- .env.enc                   # SOPS-encrypted secrets (safe to commit)
|
|-- .sops.yaml                     # SOPS Age encryption config
|-- render.yaml                    # Render.com one-click deploy blueprint
|-- SETUP_SUPABASE_ALL_IN_ONE.sql  # Full DB schema - run once in Supabase SQL editor
|-- SKILL.md                       # This file
-- package.json                   # Monorepo root scripts
```

---

## API Routes (`server\src\routes\`)

| File | Mount | Purpose |
|---|---|---|
| `auth.js` | `/api/auth` | Supabase Auth - login, register, session |
| `defects.js` | `/api/defects` | CRUD for track defect reports |
| `plans.js` | `/api/plans` | Block plan generation and management |
| `sections.js` | `/api/sections` | Railway section data + GPS corridors |
| `analytics.js` | `/api/analytics` | Defect trends, health scores, stats |
| `ai.js` | `/api/ai` | Gemini AI - copilot queries, block optimization |
| `upload.js` | `/api/upload` | Cloudinary photo upload for defect evidence |
| `blocks.js` | `/api/blocks` | Block schedule CRUD |
| `railway.js` | `/api/railway` | Live train data via RapidAPI IRCTC |
| `sync.js` | `/api/sync` | Data sync utilities |
| `simulators.js` | `/api/simulators` | TMS simulation endpoints |
| `config.js` | `/api/config` | Runtime config endpoint |

---

## Services (`server\src\services\`)

| File | Purpose |
|---|---|
| `aiService.js` | Google Gemini - photo defect analysis + AI Studio text queries |
| `cloudinaryService.js` | Cloudinary upload, transformation, CDN delivery |
| `dataStore.js` | In-memory data store for section/block state |
| `railwayService.js` | RapidAPI IRCTC wrapper for live train data |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 5, React Router 6, Leaflet (maps), Zustand |
| Backend | Node.js 18, Express 4 (ESM - `"type": "module"`) |
| Database + Auth | Supabase (PostgreSQL + Row Level Security) |
| AI | Google Gemini (`gemini-2.0-flash`) - vision + text |
| Media | Cloudinary - upload, CDN, image processing |
| Maps | MapTiler satellite + HD rail vector tiles |
| Train Data | RapidAPI Indian Railway IRCTC API |
| Deployment | Render.com (single web service - serves API + built SPA) |

---

## Environment Variables (`server\.env`)

Secrets are managed with **SOPS + Age encryption**.

### Decrypt for local use
```powershell
$env:SOPS_AGE_KEY_FILE = "$env:APPDATA\sops\age\keys.txt"
sops --config d:\codes\Railsync\.sops.yaml --decrypt --input-type dotenv --output-type dotenv server\.env.enc > server\.env
```

### Re-encrypt after editing
```powershell
sops --config d:\codes\Railsync\.sops.yaml --encrypt --output server\.env.enc --input-type dotenv --output-type dotenv server\.env
```

### Variable Reference

| Variable | Service | Purpose |
|---|---|---|
| `PORT` | Server | Express port (default 3001) |
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

```powershell
# Terminal 1 - Backend (http://localhost:3001)
npm run server:dev

# Terminal 2 - Frontend (http://localhost:5173)
npm run client:dev
```

Frontend proxies API calls via `client\src\lib\config.js`:
```js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'
```

### Install dependencies
```powershell
npm install                      # root
npm --prefix client install      # client only
npm --prefix server install      # server only
```

---

## Database Setup

1. Create a Supabase project at https://supabase.com
2. Open SQL Editor and run: `d:\codes\Railsync\SETUP_SUPABASE_ALL_IN_ONE.sql`
3. Creates all tables, RLS policies, and seed data in one shot

**Key tables:** `defects`, `block_plans`, `sections`, `users`, `analytics_events`

---

## Deployment (Render.com)

1. Push to `main` on GitHub (`nonsense3/RailLink`)
2. Render → **New > Blueprint** → connect repo
3. `render.yaml` is auto-read - defines the web service
4. Add all env vars in Render dashboard (from decrypted `.env`)
5. Express serves both `/api/*` and the built React SPA

---

## Role System

| Role | Access |
|---|---|
| `admin` | Full access - user management, all data, config |
| `supervisor` | Block plans, defects, analytics, section management |
| `inspector` | Submit defects, view assigned sections only |

Enforced via **Supabase RLS** on DB and verified server-side with `SUPABASE_SERVICE_ROLE_KEY`.

---

## SOPS Secrets - Add Collaborator

1. Collaborator runs `age-keygen` and sends you their public key (`age1...`)
2. Add their key to `d:\codes\Railsync\.sops.yaml` (comma-separated)
3. Rotate the encrypted file:
```powershell
sops --config d:\codes\Railsync\.sops.yaml --rotate --input-type dotenv --output-type dotenv --in-place server\.env.enc
```
4. Commit and push updated `server\.env.enc`

---

## Code Conventions

- **ESM only** - always `import`/`export`, never `require()`
- **Supabase client** - import `{ supabase }` from `server\src\lib\supabase.js`
- **Error responses** - always `{ error: message }` JSON with correct HTTP status
- **Cloudinary URLs** - stored in defect record after upload, passed to Gemini for vision
- **Frontend state** - Zustand at `client\src\store\index.js`
- **GPS corridor data** - lives in `sections.js` as `corridorGPS` object
- **AI calls** - always go through `aiService.js`, pass image URLs for vision analysis