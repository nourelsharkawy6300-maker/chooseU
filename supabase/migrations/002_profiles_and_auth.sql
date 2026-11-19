-- ============================================================================
-- CHOOSEU STEP 1 AUTHENTICATION & PROFILES MIGRATION
-- File: supabase/migrations/002_profiles_and_auth.sql
-- Description:
--   1. Creates public.profiles with strict constraints and role lockdown.
--   2. Adds minor registration protection (guardian acknowledgment constraint).
--   3. Adds automatic user profile creation trigger on auth.users INSERT.
--   4. Enforces strict RLS: authenticated users read/write their own profile only.
--   5. Strictly forbids role modification by regular authenticated users.
--   6. Absolutely zero anon permissions or policies.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE DEFINITION
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    track TEXT CHECK (track IN ('Science', 'Math', 'Arts', 'stem', 'Undecided')),
    score NUMERIC(5, 2) CHECK (score IS NULL OR (score >= 0 AND score <= 100.00)),
    annual_budget NUMERIC(12, 2) CHECK (annual_budget IS NULL OR annual_budget >= 0),
    is_minor BOOLEAN NOT NULL DEFAULT false,
    guardian_ack BOOLEAN NOT NULL DEFAULT false,
    guardian_ack_at TIMESTAMPTZ,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'advisor', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Minor compliance constraint: minors MUST have guardian acknowledgment and timestamp
    CONSTRAINT check_minor_guardian_ack CHECK (
        NOT is_minor OR (guardian_ack = true AND guardian_ack_at IS NOT NULL)
    )
);

-- Index for lookup performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. AUTOMATIC PROFILE CREATION TRIGGER (auth.users -> public.profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _is_minor BOOLEAN := COALESCE((NEW.raw_user_meta_data->>'is_minor')::BOOLEAN, false);
    _guardian_ack BOOLEAN := COALESCE((NEW.raw_user_meta_data->>'guardian_ack')::BOOLEAN, false);
    _guardian_ack_at TIMESTAMPTZ := NULL;
    _track TEXT := NEW.raw_user_meta_data->>'track';
    _score NUMERIC := NULL;
    _budget NUMERIC := NULL;
BEGIN
    -- Validate track if provided
    IF _track IS NOT NULL AND _track NOT IN ('Science', 'Math', 'Arts', 'stem', 'Undecided') THEN
        _track := 'Undecided';
    END IF;

    -- Validate minor policy at ingestion
    IF _is_minor AND NOT _guardian_ack THEN
        RAISE EXCEPTION 'Minor registration requires explicit guardian acknowledgment and consent.';
    END IF;

    IF _guardian_ack THEN
        _guardian_ack_at := COALESCE(
            (NEW.raw_user_meta_data->>'guardian_ack_at')::TIMESTAMPTZ,
            NOW()
        );
    END IF;

    -- Safely parse initial score/budget if passed in signup metadata
    BEGIN
        IF NEW.raw_user_meta_data ? 'score' THEN
            _score := (NEW.raw_user_meta_data->>'score')::NUMERIC;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        _score := NULL;
    END;

    BEGIN
        IF NEW.raw_user_meta_data ? 'annual_budget' THEN
            _budget := (NEW.raw_user_meta_data->>'annual_budget')::NUMERIC;
        END IF;
    EXCEPTION WHEN OTHERS THEN
        _budget := NULL;
    END;

    INSERT INTO public.profiles (
        id,
        full_name,
        track,
        score,
        annual_budget,
        is_minor,
        guardian_ack,
        guardian_ack_at,
        role,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        _track,
        _score,
        _budget,
        _is_minor,
        _guardian_ack,
        _guardian_ack_at,
        'student', -- Strict default: Always initialize as 'student' regardless of metadata
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. STRICT ROLE IMMUTABILITY TRIGGER
-- Prevents regular authenticated users from elevating their role to admin/advisor
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        -- When called via PostgREST / client JWT (auth.role() = 'authenticated')
        IF auth.role() = 'authenticated' THEN
            RAISE EXCEPTION 'Security error: You do not have permission to modify account roles.';
        END IF;
    END IF;
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- 4. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4.1 Users can only read their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- 4.2 Users can only update their own profile
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 4.3 Users can insert their own profile (for client-side upsert safety)
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- 5. PERMISSION GRANTS & ZERO-ANON ENFORCEMENT
-- Strictly revoke any anonymous access
REVOKE ALL ON public.profiles FROM anon;

-- Grant authenticated operations
GRANT SELECT, INSERT ON public.profiles TO authenticated;

-- Grant UPDATE only on user-editable columns (extra layer of defense for role immutability)
GRANT UPDATE (full_name, track, score, annual_budget, is_minor, guardian_ack, guardian_ack_at, updated_at)
    ON public.profiles TO authenticated;

-- Service role retains full access for administrative tasks in Step 2
GRANT ALL ON public.profiles TO service_role;
