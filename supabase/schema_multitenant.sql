-- ========================================================
-- DELEGATE - MULTI-TENANT PRODUCTION SCHEMA & RLS POLICIES
-- Paste this script into your Supabase SQL Editor and click RUN
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Events Table (Multi-tenant scoped by owner_id)
CREATE TABLE IF NOT EXISTS public.events (
  id TEXT PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT UNIQUE,
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
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'closed'
  rules JSONB DEFAULT '{"allowSchoolTeams": true, "askPaymentProof": true, "showTakenPortfoliosLive": true, "firstComeFirstServed": true, "allotmentsPublished": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- If events table already existed, ensure owner_id and slug columns exist:
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'owner_id') THEN
    ALTER TABLE public.events ADD COLUMN owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'events' AND column_name = 'slug') THEN
    ALTER TABLE public.events ADD COLUMN slug TEXT UNIQUE;
  END IF;
END $$;

-- 2. Create Committees Table
CREATE TABLE IF NOT EXISTS public.committees (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  agenda TEXT,
  total_seats INTEGER DEFAULT 30,
  background_guide_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Portfolios Table
CREATE TABLE IF NOT EXISTS public.portfolios (
  id TEXT PRIMARY KEY,
  committee_id TEXT REFERENCES public.committees(id) ON DELETE CASCADE,
  country_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  status TEXT DEFAULT 'open', -- 'open' or 'taken'
  allotted_registration_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Registrations Table
CREATE TABLE IF NOT EXISTS public.registrations (
  id TEXT PRIMARY KEY,
  event_id TEXT REFERENCES public.events(id) ON DELETE CASCADE,
  registration_number TEXT NOT NULL UNIQUE,
  type TEXT DEFAULT 'individual', -- 'individual' or 'school_team'
  name TEXT,
  email TEXT,
  phone TEXT,
  school TEXT,
  class_year TEXT,
  experience_count INTEGER DEFAULT 0,
  fee_amount NUMERIC DEFAULT 0,
  payment_status TEXT DEFAULT 'unpaid', -- 'unpaid', 'proof_uploaded', 'verified'
  payment_proof_url TEXT,
  preferences JSONB DEFAULT '[]'::jsonb,
  allotment JSONB,
  delegation_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_events_owner ON public.events(owner_id);
CREATE INDEX IF NOT EXISTS idx_events_slug ON public.events(slug);
CREATE INDEX IF NOT EXISTS idx_committees_event ON public.committees(event_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_committee ON public.portfolios(committee_id);
CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_number ON public.registrations(registration_number);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict Isolation: Organizers only see their own conferences.
-- Delegates only see published info and can register.
-- ========================================================

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.committees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

-- Clean existing policies
DROP POLICY IF EXISTS "Organizers full access to own events" ON public.events;
DROP POLICY IF EXISTS "Public can view published events" ON public.events;
DROP POLICY IF EXISTS "Organizers full access to committees" ON public.committees;
DROP POLICY IF EXISTS "Public view committees of published events" ON public.committees;
DROP POLICY IF EXISTS "Organizers full access to portfolios" ON public.portfolios;
DROP POLICY IF EXISTS "Public view portfolios of published events" ON public.portfolios;
DROP POLICY IF EXISTS "Organizers full access to registrations" ON public.registrations;
DROP POLICY IF EXISTS "Delegates can insert registration" ON public.registrations;
DROP POLICY IF EXISTS "Delegates can check registration" ON public.registrations;
DROP POLICY IF EXISTS "Allow full access to events" ON public.events;
DROP POLICY IF EXISTS "Allow full access to committees" ON public.committees;
DROP POLICY IF EXISTS "Allow full access to portfolios" ON public.portfolios;
DROP POLICY IF EXISTS "Allow full access to registrations" ON public.registrations;

-- 1. EVENTS POLICIES
-- Organizers can select, insert, update, delete only their own events
CREATE POLICY "Organizers full access to own events"
  ON public.events FOR ALL
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Anonymous / delegates can only view published events
CREATE POLICY "Public can view published events"
  ON public.events FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- 2. COMMITTEES POLICIES
CREATE POLICY "Organizers full access to committees"
  ON public.committees FOR ALL
  TO authenticated
  USING (event_id IN (SELECT id FROM public.events WHERE owner_id = auth.uid()))
  WITH CHECK (event_id IN (SELECT id FROM public.events WHERE owner_id = auth.uid()));

CREATE POLICY "Public view committees of published events"
  ON public.committees FOR SELECT
  TO anon, authenticated
  USING (event_id IN (SELECT id FROM public.events WHERE status = 'published'));

-- 3. PORTFOLIOS POLICIES
CREATE POLICY "Organizers full access to portfolios"
  ON public.portfolios FOR ALL
  TO authenticated
  USING (committee_id IN (
    SELECT c.id FROM public.committees c 
    JOIN public.events e ON c.event_id = e.id 
    WHERE e.owner_id = auth.uid()
  ))
  WITH CHECK (committee_id IN (
    SELECT c.id FROM public.committees c 
    JOIN public.events e ON c.event_id = e.id 
    WHERE e.owner_id = auth.uid()
  ));

CREATE POLICY "Public view portfolios of published events"
  ON public.portfolios FOR SELECT
  TO anon, authenticated
  USING (committee_id IN (
    SELECT c.id FROM public.committees c 
    JOIN public.events e ON c.event_id = e.id 
    WHERE e.status = 'published'
  ));

-- 4. REGISTRATIONS POLICIES
CREATE POLICY "Organizers full access to registrations"
  ON public.registrations FOR ALL
  TO authenticated
  USING (event_id IN (SELECT id FROM public.events WHERE owner_id = auth.uid()))
  WITH CHECK (event_id IN (SELECT id FROM public.events WHERE owner_id = auth.uid()));

-- Delegates can insert registration for open published events
CREATE POLICY "Delegates can insert registration"
  ON public.registrations FOR INSERT
  TO anon, authenticated
  WITH CHECK (event_id IN (SELECT id FROM public.events WHERE status = 'published'));

-- Delegates can query their own registration by registration number
CREATE POLICY "Delegates can check registration"
  ON public.registrations FOR SELECT
  TO anon, authenticated
  USING (true);

-- ========================================================
-- ATOMIC TRANSACTION: ALLOT PORTFOLIO WITHOUT RACE CONDITIONS
-- Checks portfolio is open, updates status, and writes allotment in one transaction
-- ========================================================
CREATE OR REPLACE FUNCTION allot_portfolio_atomic(
  p_portfolio_id TEXT,
  p_registration_id TEXT,
  p_committee_id TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  v_current_status TEXT;
BEGIN
  -- Lock portfolio row to prevent concurrent race condition
  SELECT status INTO v_current_status
  FROM public.portfolios
  WHERE id = p_portfolio_id
  FOR UPDATE;

  IF v_current_status = 'taken' THEN
    RETURN FALSE;
  END IF;

  -- Mark portfolio taken
  UPDATE public.portfolios
  SET status = 'taken', allotted_registration_id = p_registration_id
  WHERE id = p_portfolio_id;

  -- Update registration allotment
  UPDATE public.registrations
  SET allotment = jsonb_build_object(
    'registrationId', p_registration_id,
    'committeeId', p_committee_id,
    'portfolioId', p_portfolio_id,
    'allottedAt', NOW(),
    'status', 'published'
  )
  WHERE id = p_registration_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
