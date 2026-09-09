-- ==============================================================================
-- RailLink Supabase PostgreSQL Database Schema
-- Run this in your Supabase Project -> SQL Editor
-- ==============================================================================

-- 1. DEFECTS TABLE (TMS, SMMS, TDMS integrated track assets)
CREATE TABLE IF NOT EXISTS public.defects (
    id TEXT PRIMARY KEY,
    department TEXT NOT NULL,
    source_system TEXT NOT NULL,
    corridor_id TEXT,
    corridor_name TEXT,
    section_id TEXT,
    km_start NUMERIC,
    km_end NUMERIC,
    track_type TEXT,
    defect_category TEXT,
    severity TEXT NOT NULL DEFAULT 'Medium',
    overdue_days INTEGER DEFAULT 0,
    reported_at TIMESTAMPTZ DEFAULT now(),
    work_required TEXT,
    estimated_duration_min INTEGER DEFAULT 120,
    status TEXT DEFAULT 'Pending Block',
    photo_url TEXT,
    ai_confidence TEXT DEFAULT '95.4%',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. BLOCK REQUESTS TABLE (Departmental maintenance requests)
CREATE TABLE IF NOT EXISTS public.block_requests (
    id TEXT PRIMARY KEY,
    department TEXT NOT NULL,
    corridor_id TEXT NOT NULL,
    section TEXT NOT NULL,
    track TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    duration_min INTEGER NOT NULL,
    purpose TEXT NOT NULL,
    priority TEXT NOT NULL DEFAULT 'High',
    status TEXT NOT NULL DEFAULT 'Pending Review',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. BLOCK PLANS TABLE (Unified coordinated multi-department master blocks)
CREATE TABLE IF NOT EXISTS public.block_plans (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    corridor_id TEXT NOT NULL,
    corridor TEXT NOT NULL,
    track TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    duration TEXT NOT NULL,
    departments TEXT[] NOT NULL DEFAULT '{}',
    tasks JSONB DEFAULT '[]'::jsonb,
    efficiency_score TEXT DEFAULT '92%',
    coordination_index TEXT DEFAULT 'Joint Synchronized',
    ai_optimized BOOLEAN DEFAULT false,
    status TEXT NOT NULL DEFAULT 'Scheduled',
    trains_impacted INTEGER DEFAULT 0,
    type TEXT DEFAULT 'Shadow / Integrated',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. CORRIDORS TABLE (Indian Railways Trunk Routes)
CREATE TABLE IF NOT EXISTS public.corridors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    division TEXT NOT NULL,
    night_window_start TEXT DEFAULT '01:00',
    night_window_end TEXT DEFAULT '05:00',
    max_block_hours NUMERIC DEFAULT 4.0,
    typical_speed_limit INTEGER DEFAULT 130,
    daily_train_density INTEGER DEFAULT 100,
    health INTEGER DEFAULT 85,
    status TEXT DEFAULT 'healthy',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & ALLOW PUBLIC ACCESS FOR DEMO
-- ==============================================================================
ALTER TABLE public.defects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.corridors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on defects" ON public.defects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on block_requests" ON public.block_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on block_plans" ON public.block_plans FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all operations on corridors" ON public.corridors FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- ENABLE REALTIME ON DEFECTS & BLOCK REQUESTS
-- ==============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.defects;
ALTER PUBLICATION supabase_realtime ADD TABLE public.block_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.block_plans;
