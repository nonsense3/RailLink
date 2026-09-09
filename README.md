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

## 🚀 Deploying to Render (render.com)

RailLink is configured for full-stack deployment on **Render** as a unified Web Service (Express API + Vite React Frontend) with zero CORS overhead.

### Step 1: Push Repository to GitHub
Ensure the project is pushed to your GitHub repository:
```bash
git remote add origin https://github.com/nonsense3/RailLink.git
git branch -M main
git push -u origin main
```

### Step 2: Create Web Service on Render
1. Log in to your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** and select **Web Service**.
3. Choose **Build and deploy from a Git repository** and connect your **`RailLink`** repository.
4. Configure the service settings:
   - **Name**: `raillink` (or any name you choose)
   - **Region**: Closest to your users (e.g., Singapore / Frankfurt)
   - **Branch**: `main`
   - **Root Directory**: Leave blank (defaults to root `.`)
   - **Environment**: `Node`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: `Free`

### Step 3: Add Environment Variables in Render
In the **Environment** section of your Render Web Service settings, add the following key-value pairs:

| Key | Description | Source / Where to get |
|---|---|---|
| `PORT` | Service Port | `10000` (Render default) |
| `NODE_ENV` | Runtime Environment | `production` |
| `VITE_API_URL` | Frontend API URL | `/api` |
| `SUPABASE_URL` | Supabase Project URL | Supabase Dashboard > Project Settings > API |
| `SUPABASE_ANON_KEY` | Supabase Public Anon Key | Supabase Dashboard > Project Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Secret Key | Supabase Dashboard > Project Settings > API |
| `VITE_SUPABASE_URL` | Supabase Project URL (Client) | Same as `SUPABASE_URL` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Anon Key (Client) | Same as `SUPABASE_ANON_KEY` |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Cloud Name | [Cloudinary Dashboard](https://cloudinary.com) |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | Cloudinary Dashboard |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | Cloudinary Dashboard |
| `RAPIDAPI_KEY` | Indian Railways IRCTC API Key | RapidAPI Dashboard |
| `RAPIDAPI_HOST` | RapidAPI IRCTC Host | `indian-railway-irctc.p.rapidapi.com` |
| `MAPTILER_API_KEY` | MapTiler Map Vector / Satellite Key | [cloud.maptiler.com](https://cloud.maptiler.com) |
| `VITE_MAPTILER_API_KEY` | MapTiler Key for Frontend | Same as `MAPTILER_API_KEY` |
| `GEMINI_API_KEY` | Google Gemini AI Key (Backend) | [aistudio.google.com](https://aistudio.google.com) |
| `VITE_GEMINI_API_KEY` | Google Gemini AI Key (Frontend) | Same as `GEMINI_API_KEY` |

5. Click **Create Web Service**. Render will automatically build the client, install server dependencies, and start the application.

---

## 🗄️ Setting Up Supabase Database

1. Log in to [Supabase](https://supabase.com).
2. Create or open your project.
3. In the left navigation, click **SQL Editor**.
4. Open the file `SETUP_SUPABASE_ALL_IN_ONE.sql` from this repository.
5. Copy the entire SQL script and paste it into the Supabase SQL Editor.
6. Click **Run**. This will:
   - Create tables: `defects`, `block_plans`, `corridors`, `profiles`.
   - Seed sample corridors, defects, and block schedules.
   - Configure public read/write Row Level Security (RLS) policies.
7. Go to **Project Settings > API**:
   - Copy **Project URL** ➔ `SUPABASE_URL` & `VITE_SUPABASE_URL`
   - Copy **anon public** key ➔ `SUPABASE_ANON_KEY` & `VITE_SUPABASE_ANON_KEY`
   - Copy **service_role secret** key ➔ `SUPABASE_SERVICE_ROLE_KEY`

---

## ☁️ Setting Up Cloudinary (Photo Inspections)

1. Log in to [Cloudinary](https://cloudinary.com).
2. On your **Dashboard**, copy:
   - **Cloud Name** ➔ `CLOUDINARY_CLOUD_NAME`
   - **API Key** ➔ `CLOUDINARY_API_KEY`
   - **API Secret** ➔ `CLOUDINARY_API_SECRET`
3. When field inspectors upload photos of rail defects, RailLink securely streams them to your Cloudinary storage and records the image URL in Supabase.

---

## 💻 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/nonsense3/RailLink.git
cd RailLink
```

### 2. Configure Environment Files
- Create `server/.env` with your Supabase, Cloudinary, and AI keys.
- Create `client/.env` with your frontend keys (`VITE_API_URL=http://localhost:3001/api`, etc.).

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
