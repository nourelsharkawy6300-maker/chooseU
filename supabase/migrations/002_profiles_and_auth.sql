-- ============================================================================
-- CHOOSEU STEP 1 AUTHENTICATION & PROFILES MIGRATION (Sub-task 1 & 1b)
-- File: supabase/migrations/002_profiles_and_auth.sql
-- Description:
--   1. Creates public.profiles with age_declared, minor checks, and role lockdown.
--   2. Adds minor registration protection (guardian acknowledgment constraint).
--   3. Adds automatic user profile creation trigger on auth.users INSERT.
--   4. Enforces strict RLS: authenticated users read/write their own profile only.
--   5. Strictly forbids role modification by regular authenticated users via trigger.
--   6. Allows role modification only from SQL Editor (auth.uid() IS NULL) or service_role.
--   7. Absolutely zero anon permissions or policies.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE DEFINITION
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    track TEXT CHECK (track IN ('Science', 'Math', 'Arts', 'stem', 'Undecided')),
    score NUMERIC(5, 2) CHECK (score IS NULL OR (score >= 0 AND score <= 100.00)),
    annual_budget NUMERIC(12, 2) CHECK (annual_budget IS NULL OR annual_budget >= 0),
    age_declared BOOLEAN NOT NULL DEFAULT false,
    is_minor BOOLEAN NOT NULL DEFAULT false,
    guardian_ack BOOLEAN NOT NULL DEFAULT false,
    guardian_ack_at TIMESTAMPTZ,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'advisor', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Minor compliance constraint: minors MUST have guardian acknowledgment and timestamp
    CONSTRAINT check_minor_guardian_ack CHECK (
        NOT (age_declared AND is_minor) OR (guardian_ack = true AND guardian_ack_at IS NOT NULL)
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
    _age_declared BOOLEAN := COALESCE((NEW.raw_user_meta_data->>'age_declared')::BOOLEAN, false);
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

    -- Validate minor policy at ingestion: if age is declared and user is minor, guardian acknowledgment is required
    IF _age_declared AND _is_minor AND NOT _guardian_ack THEN
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
        age_declared,
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
        _age_declared,
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
-- Rejects role modification ONLY if caller is authenticated user (auth.uid() IS NOT NULL and not service_role).
-- Explicitly permits role modifications from SQL Editor (auth.uid() IS NULL) and from service_role.
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
        -- Check if invoked in the context of an authenticated client session
        IF auth.uid() IS NOT NULL THEN
            -- Check if caller is NOT service_role
            IF COALESCE(auth.jwt()->>'role', '') <> 'service_role' AND current_user <> 'service_role' THEN
                RAISE EXCEPTION 'Security error: Users are not permitted to change their account role.';
            END IF;
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

-- 4.3 Users can insert their own profile (strictly as 'student' role only)
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id AND role = 'student');

-- 5. PERMISSION GRANTS & ZERO-ANON ENFORCEMENT
-- Strictly revoke any public and anonymous access
REVOKE ALL ON public.profiles FROM PUBLIC;
REVOKE ALL ON public.profiles FROM anon;

-- Revoke table-level UPDATE so sensitive columns (age_declared, is_minor,
-- guardian_ack, guardian_ack_at, role, id, created_at) cannot be modified directly
REVOKE UPDATE ON public.profiles FROM authenticated;

-- Grant authenticated SELECT/INSERT and column-scoped UPDATE for editable fields only
GRANT SELECT, INSERT ON public.profiles TO authenticated;
GRANT UPDATE (full_name, track, score, annual_budget, updated_at) ON public.profiles TO authenticated;

-- Service role retains full access for administrative tasks in Step 2
GRANT ALL ON public.profiles TO service_role;
