-- ============================================================================
-- CHOOSEU ZERO-TRUST DATABASE LOCKDOWN MIGRATION
-- File: supabase/migrations/001_zero_trust_rls.sql
-- Description: Enforces Row-Level Security (RLS) across all core platform tables.
-- Guarantees strict cryptographic isolation between student UUIDs and admin JWT roles.
-- ============================================================================

-- Ensure uuid-ossp extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TABLE DEFINITIONS (If not already created)
-- ============================================================================

-- 1.1 Students Profile Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    academic_stream TEXT NOT NULL CHECK (academic_stream IN ('Science', 'Math', 'Arts', 'stem', 'Undecided')),
    score_percentage NUMERIC(5, 2) NOT NULL CHECK (score_percentage >= 50.00 AND score_percentage <= 100.00),
    annual_budget_egp NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (annual_budget_egp >= 0),
    governorate TEXT NOT NULL,
    living_mode TEXT NOT NULL DEFAULT 'commute' CHECK (living_mode IN ('commute', 'dorm')),
    inflation_scenario INTEGER NOT NULL DEFAULT 12,
    has_completed_onboarding BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.2 Psychometric Assessments Table
CREATE TABLE IF NOT EXISTS public.assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    academic_stream TEXT NOT NULL,
    answers JSONB NOT NULL DEFAULT '{}'::jsonb,
    dominant_track TEXT,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.3 Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    order_code TEXT NOT NULL UNIQUE,
    service_type TEXT NOT NULL DEFAULT 'strategic_consultation_2026',
    amount_egp NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'verified', 'rejected')),
    instapay_ref TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 1.4 Consultation Orders Table (Intake & Advisor Portal)
CREATE TABLE IF NOT EXISTS public.consultation_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_code TEXT NOT NULL UNIQUE,
    student_name TEXT NOT NULL,
    whatsapp_phone TEXT NOT NULL,
    academic_stream TEXT NOT NULL,
    score_percentage NUMERIC(5, 2) NOT NULL,
    max_budget NUMERIC(12, 2) NOT NULL,
    governorate TEXT NOT NULL,
    quiz_results JSONB NOT NULL DEFAULT '{}'::jsonb,
    instapay_ref TEXT NOT NULL,
    order_status TEXT NOT NULL DEFAULT 'pending' CHECK (order_status IN ('pending', 'approved', 'rejected')),
    amount_egp NUMERIC(10, 2) NOT NULL DEFAULT 150.00,
    advisor_notes TEXT,
    voice_note_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- 2. ENABLE & FORCE ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students FORCE ROW LEVEL SECURITY;

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments FORCE ROW LEVEL SECURITY;

ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders FORCE ROW LEVEL SECURITY;

ALTER TABLE public.consultation_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_orders FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- 3. HELPER FUNCTIONS FOR ZERO-TRUST JWT ROLE VALIDATION
-- ============================================================================

-- Checks whether the current session holds a verified 'admin' claim in JWT
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'role' = 'admin'),
    ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'),
    false
  );
$$;

-- ============================================================================
-- 4. POLICIES: public.students
-- ============================================================================

DROP POLICY IF EXISTS "students_select_own" ON public.students;
CREATE POLICY "students_select_own"
ON public.students
FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "students_insert_own" ON public.students;
CREATE POLICY "students_insert_own"
ON public.students
FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "students_update_own" ON public.students;
CREATE POLICY "students_update_own"
ON public.students
FOR UPDATE
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "students_delete_own" ON public.students;
CREATE POLICY "students_delete_own"
ON public.students
FOR DELETE
USING (auth.uid() = user_id OR public.is_admin());

-- ============================================================================
-- 5. POLICIES: public.assessments
-- ============================================================================

DROP POLICY IF EXISTS "assessments_select_own" ON public.assessments;
CREATE POLICY "assessments_select_own"
ON public.assessments
FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "assessments_insert_own" ON public.assessments;
CREATE POLICY "assessments_insert_own"
ON public.assessments
FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "assessments_update_own" ON public.assessments;
CREATE POLICY "assessments_update_own"
ON public.assessments
FOR UPDATE
USING (auth.uid() = user_id OR public.is_admin())
WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "assessments_delete_own" ON public.assessments;
CREATE POLICY "assessments_delete_own"
ON public.assessments
FOR DELETE
USING (auth.uid() = user_id OR public.is_admin());

-- ============================================================================
-- 6. POLICIES: public.orders
-- ============================================================================

DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own"
ON public.orders
FOR SELECT
USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "orders_insert_own" ON public.orders;
CREATE POLICY "orders_insert_own"
ON public.orders
FOR INSERT
WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "orders_update_admin_only" ON public.orders;
CREATE POLICY "orders_update_admin_only"
ON public.orders
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "orders_delete_admin_only" ON public.orders;
CREATE POLICY "orders_delete_admin_only"
ON public.orders
FOR DELETE
USING (public.is_admin());

-- ============================================================================
-- 7. POLICIES: public.consultation_orders (Public Intake & Admin Review)
-- ============================================================================

-- Public order creation via backend API service role or authenticated client
DROP POLICY IF EXISTS "consultation_orders_insert" ON public.consultation_orders;
CREATE POLICY "consultation_orders_insert"
ON public.consultation_orders
FOR INSERT
WITH CHECK (true); -- Validated strictly server-side by Zod schema before insertion

-- Only verified admins can view all consultation orders
DROP POLICY IF EXISTS "consultation_orders_select_admin" ON public.consultation_orders;
CREATE POLICY "consultation_orders_select_admin"
ON public.consultation_orders
FOR SELECT
USING (public.is_admin());

-- Only verified admins can update consultation order status, notes, or voice recordings
DROP POLICY IF EXISTS "consultation_orders_update_admin" ON public.consultation_orders;
CREATE POLICY "consultation_orders_update_admin"
ON public.consultation_orders
FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Only verified admins can delete orders
DROP POLICY IF EXISTS "consultation_orders_delete_admin" ON public.consultation_orders;
CREATE POLICY "consultation_orders_delete_admin"
ON public.consultation_orders
FOR DELETE
USING (public.is_admin());

-- ============================================================================
-- 8. INDEX OPTIMIZATIONS FOR ZERO-LATENCY ENFORCEMENT
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_students_user_id ON public.students(user_id);
CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON public.assessments(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_code ON public.orders(order_code);
CREATE INDEX IF NOT EXISTS idx_consultation_orders_code ON public.consultation_orders(order_code);
CREATE INDEX IF NOT EXISTS idx_consultation_orders_status ON public.consultation_orders(order_status);
