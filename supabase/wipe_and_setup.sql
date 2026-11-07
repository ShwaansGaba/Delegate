-- ========================================================
-- DELEGATO - COMPLETE DATABASE WIPE & CLEAN MULTI-TENANT SETUP
-- Copy and paste this script into your Supabase SQL Editor and click RUN.
-- Dashboard SQL Editor: https://supabase.com/dashboard/project/znhbotfzmmrsibazlraw/sql
-- ========================================================

-- 1. Wipe all authentication accounts, emails, and session data
DELETE FROM auth.users;

-- 2. Drop existing public tables and foreign key relationships
DROP TABLE IF EXISTS public.registrations CASCADE;
DROP TABLE IF EXISTS public.portfolios CASCADE;
DROP TABLE IF EXISTS public.committees CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;

-- 3. Create Events Table (Multi-tenant with TEXT owner_id & branding)
CREATE TABLE public.events (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
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
  branding JSONB DEFAULT '{"primaryColor": "#1560BD", "accentColor": "#FFD23F", "backgroundEffect": "none", "cardStyle": "solid", "monogram": "D"}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Committees Table
CREATE TABLE public.committees (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  agenda TEXT,
  total_seats INTEGER DEFAULT 30,
  background_guide_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Portfolios Table
CREATE TABLE public.portfolios (
  id TEXT PRIMARY KEY,
  committee_id TEXT REFERENCES public.committees(id) ON DELETE CASCADE,
  country_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  allotted_registration_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Create Registrations Table
CREATE TABLE public.registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  registration_number TEXT NOT NULL UNIQUE,
  type TEXT DEFAULT 'individual',
  name TEXT,
  email TEXT,
  phone TEXT,
  school TEXT,
  class_year TEXT,
  experience_count INTEGER DEFAULT 0,
  fee_amount NUMERIC DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid',
  payment_proof_url TEXT,
  preferences JSONB DEFAULT '[]'::jsonb,
  allotment JSONB,
  delegation_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Indexes for lightning fast lookups
CREATE INDEX idx_events_owner ON public.events(owner_id);
CREATE INDEX idx_events_slug ON public.events(slug);
CREATE INDEX idx_committees_event ON public.committees(event_id);
CREATE INDEX idx_portfolios_committee ON public.portfolios(committee_id);
CREATE INDEX idx_registrations_event ON public.registrations(event_id);
CREATE INDEX idx_registrations_number ON public.registrations(registration_number);

-- 8. Enable Row Level Security (RLS) with permissive policies
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read and write on events" ON public.events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read and write on committees" ON public.committees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read and write on portfolios" ON public.portfolios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read and write on registrations" ON public.registrations FOR ALL USING (true) WITH CHECK (true);
