-- ========================================================
-- DELEGATO - MUN CONFERENCE PLATFORM
-- Supabase Schema & Permissive Policies
-- Paste this script into your Supabase SQL Editor and click RUN
-- ========================================================

-- 1. Create Events Table
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  organization_id TEXT,
  type TEXT DEFAULT 'mun',
  name TEXT NOT NULL,
  dates TEXT,
  date_from TEXT,
  date_to TEXT,
  deadline TEXT,
  deadline_date TEXT,
  venue TEXT,
  fee NUMERIC DEFAULT 0,
  school_fee_per_student NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft',
  rules JSONB DEFAULT '{"allowSchoolTeams": true, "askPaymentProof": true, "showTakenPortfoliosLive": true, "firstComeFirstServed": true, "allotmentsPublished": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Committees Table (Cascades on event delete)
CREATE TABLE IF NOT EXISTS public.committees (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  agenda TEXT,
  total_seats INTEGER DEFAULT 30,
  background_guide_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Portfolios Table (Cascades on committee delete)
CREATE TABLE IF NOT EXISTS public.portfolios (
  id TEXT PRIMARY KEY,
  committee_id TEXT REFERENCES public.committees(id) ON DELETE CASCADE,
  country_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  status TEXT DEFAULT 'open', -- 'open' or 'taken'
  allotted_registration_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Registrations Table (Cascades on event delete)
CREATE TABLE IF NOT EXISTS public.registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  registration_number TEXT NOT NULL,
  type TEXT DEFAULT 'individual', -- 'individual' or 'school_delegation'
  name TEXT,
  email TEXT,
  phone TEXT,
  school TEXT,
  class_year TEXT,
  experience_count INTEGER DEFAULT 0,
  preferences JSONB DEFAULT '[]'::jsonb,
  payment_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  payment_proof_url TEXT,
  allotment JSONB,
  delegation_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- ENABLE ROW LEVEL SECURITY (RLS) & FULL PERMISSIVE POLICIES
-- Allows delegates to register and organizers to edit/delete
-- ========================================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Allow full access to events" ON public.events;
DROP POLICY IF EXISTS "Allow full access to committees" ON public.committees;
DROP POLICY IF EXISTS "Allow full access to portfolios" ON public.portfolios;
DROP POLICY IF EXISTS "Allow full access to registrations" ON public.registrations;

-- Create ALL (SELECT, INSERT, UPDATE, DELETE) policies for anon and authenticated users
CREATE POLICY "Allow full access to events"
  ON public.events FOR ALL
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow full access to committees"
  ON public.committees FOR ALL
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow full access to portfolios"
  ON public.portfolios FOR ALL
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow full access to registrations"
  ON public.registrations FOR ALL
  TO anon, authenticated, service_role
  USING (true)
  WITH CHECK (true);

-- Grant schema privileges
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
