# RailLink — AI-Powered Automatic Block Planning & Corridor Optimization

RailLink is an intelligent corridor block planning, timetable deconfliction, and track maintenance coordination platform engineered for Indian Railways.

---

## 🌟 Key Features

- **Leaflet & MapTiler Vector / Satellite Geographic Picker**: Live dynamic area snapping (yard vs block section, track line identification, KM marker estimation).
- **AI Multi-Disciplinary Curfew Optimizer**: Synchronizes Engineering, S&T (Signal & Telecom), and TRD (Traction Distribution) maintenance windows to minimize traffic disruption.
- **OR-Tools Constraint Solver**: Validates curfew windows against live passenger timetables with zero commercial train delays.
- **Track Defect Management**: Defect logging with image inspection powered by Cloudinary and jurisdiction tracking.
- **Pointy-Roundish 4px Precision Geometry UI**: Designed for high clarity, dark/light mode responsiveness, and quick field operation.

---

## 🚀 Deployment to Vercel

RailLink is configured for seamless deployment on **Vercel**.

### Step 1: Push Repository to GitHub
Ensure the project is pushed to your GitHub repository:
```bash
git remote add origin https://github.com/nonsense3/RailLink.git
git branch -M main
git push -u origin main
```

### Step 2: Import into Vercel
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Connect your GitHub account and import **`RailLink`**.
3. Under **Project Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave default, or set to `client` if deploying frontend only)
   - **Build Command**: `cd client && npm install && npm run build`
   - **Output Directory**: `client/dist`

### Step 3: Configure Environment Variables in Vercel
Add the following in **Vercel Settings > Environment Variables**:

| Variable Name | Description | Example / Source |
|---|---|---|
| `VITE_API_URL` | API endpoint for frontend | `/api` |
| `VITE_SUPABASE_URL` | Supabase Project URL | `https://xxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Public Anon Key | From Supabase Project Settings > API |
| `VITE_MAPTILER_API_KEY` | MapTiler Map Tiles Key | From [MapTiler Cloud](https://cloud.maptiler.com) |
| `VITE_GEMINI_API_KEY` | Google Gemini AI Key | From [Google AI Studio](https://aistudio.google.com) |
| `SUPABASE_URL` | Backend Supabase URL | `https://xxxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Backend Supabase Anon Key | From Supabase Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Backend Supabase Secret Key | From Supabase Project Settings > API |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | From [Cloudinary Dashboard](https://cloudinary.com) |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | From Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | From Cloudinary Dashboard |
| `GEMINI_API_KEY` | Gemini AI Key for Backend | From [Google AI Studio](https://aistudio.google.com) |

---

## 🗄️ Setting Up Supabase Database

1. Sign up / log in to [Supabase](https://supabase.com).
2. Create a new project (e.g., `RailLink-db`).
3. In the left navigation, click on **SQL Editor**.
4. Open the file `SETUP_SUPABASE_ALL_IN_ONE.sql` from this repository.
5. Copy the entire SQL content and paste it into the Supabase SQL Editor.
6. Click **Run**. This will:
   - Create tables: `defects`, `block_plans`, `corridors`, `profiles`.
   - Seed sample corridors, defects, and block schedules.
   - Configure public read/write Row Level Security (RLS) policies.
7. Go to **Project Settings > API**:
   - Copy the **Project URL** and assign it to `SUPABASE_URL` / `VITE_SUPABASE_URL`.
   - Copy the **anon public key** and assign it to `SUPABASE_ANON_KEY` / `VITE_SUPABASE_ANON_KEY`.
   - Copy the **service_role secret key** and assign it to `SUPABASE_SERVICE_ROLE_KEY`.

---

## ☁️ Setting Up Cloudinary (Photo Inspections)

1. Sign up / log in to [Cloudinary](https://cloudinary.com).
2. Go to your **Cloudinary Dashboard**.
3. Locate:
   - **Cloud Name** -> set as `CLOUDINARY_CLOUD_NAME`
   - **API Key** -> set as `CLOUDINARY_API_KEY`
   - **API Secret** -> set as `CLOUDINARY_API_SECRET`
4. When field engineers upload photos of rail defects, RailLink securely uploads them to your Cloudinary storage and records the image URL in Supabase.

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/nonsense3/RailLink.git
cd RailLink
```

### 2. Configure Environment Files
- Copy `server/.env.example` to `server/.env` and fill in credentials.
- Copy `client/.env.example` to `client/.env` and fill in credentials.

### 3. Run Backend Server
```bash
cd server
npm install
npm run dev
```

### 4. Run Frontend Client
```bash
cd client
npm install
npm run dev
```

Visit `http://localhost:5173` to explore the dashboard.
