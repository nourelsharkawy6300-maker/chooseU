-- ============================================================================
-- CHOOSEU STEP 1: SUB-TASK 3B - DECLARE AGE RPC MIGRATION
-- File: supabase/migrations/003_declare_age_rpc.sql
-- Description:
--   1. Implements one-time declare_age(p_is_minor, p_guardian_ack) stored procedure.
--   2. Rejects NULL inputs and prevents re-declaration (row-locked with FOR UPDATE).
--   3. Enforces minor guardian acknowledgment rule at RPC execution level.
--   4. Securely updates public.profiles for the authenticated caller (auth.uid()).
--   5. Grants execute permission strictly to authenticated users and service_role.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.declare_age(
    p_is_minor BOOLEAN,
    p_guardian_ack BOOLEAN DEFAULT false
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    _user_id UUID := auth.uid();
    _guardian_ack BOOLEAN := COALESCE(p_guardian_ack, false);
    _already_declared BOOLEAN;
    _updated_profile public.profiles;
BEGIN
    -- Require active authenticated user session
    IF _user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Active user session required.';
    END IF;

    -- Reject NULL age flag
    IF p_is_minor IS NULL THEN
        RAISE EXCEPTION 'Invalid input: p_is_minor cannot be null.';
    END IF;

    -- Minor protection rule: If user is minor (< 18), guardian consent is strictly required
    IF p_is_minor AND NOT _guardian_ack THEN
        RAISE EXCEPTION 'Minor registration requires explicit guardian acknowledgment and consent.';
    END IF;

    -- Lock profile row to prevent race conditions and block any second declaration
    SELECT age_declared
    INTO _already_declared
    FROM public.profiles
    WHERE id = _user_id
    FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profile not found for authenticated user %', _user_id;
    END IF;

    IF _already_declared THEN
        RAISE EXCEPTION 'Age has already been declared and cannot be modified.';
    END IF;

    -- Update user profile with declared age and guardian confirmation timestamp
    UPDATE public.profiles
    SET
        age_declared = true,
        is_minor = p_is_minor,
        guardian_ack = CASE WHEN p_is_minor THEN _guardian_ack ELSE false END,
        guardian_ack_at = CASE WHEN p_is_minor AND _guardian_ack THEN NOW() ELSE NULL END,
        updated_at = NOW()
    WHERE id = _user_id
      AND age_declared = false
    RETURNING * INTO _updated_profile;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Age has already been declared and cannot be modified.';
    END IF;

    RETURN to_jsonb(_updated_profile);
END;
$$;

-- Grant execution strictly to authenticated sessions
REVOKE ALL ON FUNCTION public.declare_age(BOOLEAN, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.declare_age(BOOLEAN, BOOLEAN) FROM anon;
GRANT EXECUTE ON FUNCTION public.declare_age(BOOLEAN, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.declare_age(BOOLEAN, BOOLEAN) TO service_role;