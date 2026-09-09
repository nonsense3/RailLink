-- ==============================================================================
-- RailLink Supabase PostgreSQL Master Setup Script
-- Copy and paste this ENTIRE script into your Supabase Dashboard:
-- Supabase Project -> SQL Editor -> New Query -> Run
-- ==============================================================================

-- 1. DEFECTS TABLE (TMS, SMMS, TDMS integrated track assets)
CREATE TABLE IF NOT EXISTS public.defects (
    id TEXT PRIMARY KEY,
    department TEXT NOT NULL,
    source_system TEXT DEFAULT 'TMS',
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

-- 5. USERS & PROFILES TABLE (Demo railway operators & department heads)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'planner',
    department TEXT NOT NULL,
    designation TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed Demo Users into public.users
INSERT INTO public.users (id, email, name, role, department, designation)
VALUES
    ('c3e8dcef-1fed-42f8-ad8d-c795cc4952a6', 'admin@raillink.in', 'Rajesh Kumar', 'admin', 'Operations', 'Chief Operations Manager'),
    ('b703b4f0-4e9c-4ac6-b715-c99377a443a1', 'planner@raillink.in', 'Priya Sharma', 'planner', 'Planning', 'Senior Block Planner'),
    ('a636818b-5b51-41c1-ad70-7770eb302531', 'engg@raillink.in', 'Vikram Singh', 'dept_head', 'Engineering', 'Divisional Engineer (Track)'),
    ('ecd6b7bb-34ec-4f91-9c3e-e1804c474283', 'snt@raillink.in', 'Anita Verma', 'dept_head', 'Signal & Telecom', 'Senior Divisional Signal Engineer'),
    ('7d965d33-5859-44f6-873c-53efee0d0e46', 'trd@raillink.in', 'Suresh Patel', 'dept_head', 'Traction Distribution', 'Senior Electrical Engineer (TRD)')
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    designation = EXCLUDED.designation;

-- ==============================================================================
-- 6. GRANT COMPLETE ACCESS TO ANON, AUTHENTICATED, AND SERVICE_ROLE
-- This completely prevents "permission denied (42501)" errors!
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- Disable RLS to allow seamless demo operation without permission blocks
ALTER TABLE public.defects DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.block_plans DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.corridors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 7. ENABLE REALTIME BROADCASTING
-- ==============================================================================
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.defects;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.block_requests;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.block_plans;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;
