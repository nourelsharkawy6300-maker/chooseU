-- ============================================================================
-- CHOOSEU STEP 1: SUB-TASK 3B - DECLARE AGE RPC MIGRATION
-- File: supabase/migrations/003_declare_age_rpc.sql
-- Description:
--   1. Implements declare_age(p_is_minor, p_guardian_ack) stored procedure.
--   2. Enforces minor guardian acknowledgment rule at RPC execution level.
--   3. Securely updates public.profiles for the authenticated caller (auth.uid()).
--   4. Grants execute permission strictly to authenticated users.
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
    _updated_profile public.profiles;
BEGIN
    -- Require active authenticated user session
    IF _user_id IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: Active user session required.';
    END IF;

    -- Minor protection rule: If user is minor (< 18), guardian consent is strictly required
    IF p_is_minor AND NOT p_guardian_ack THEN
        RAISE EXCEPTION 'Minor registration requires explicit guardian acknowledgment and consent.';
    END IF;

    -- Update user profile with declared age and guardian confirmation timestamp
    UPDATE public.profiles
    SET
        age_declared = true,
        is_minor = p_is_minor,
        guardian_ack = CASE WHEN p_is_minor THEN p_guardian_ack ELSE false END,
        guardian_ack_at = CASE WHEN p_is_minor AND p_guardian_ack THEN NOW() ELSE NULL END,
        updated_at = NOW()
    WHERE id = _user_id
    RETURNING * INTO _updated_profile;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Profile not found for authenticated user %', _user_id;
    END IF;

    RETURN to_jsonb(_updated_profile);
END;
$$;

-- Grant execution strictly to authenticated sessions
REVOKE ALL ON FUNCTION public.declare_age(BOOLEAN, BOOLEAN) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.declare_age(BOOLEAN, BOOLEAN) FROM anon;
GRANT EXECUTE ON FUNCTION public.declare_age(BOOLEAN, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION public.declare_age(BOOLEAN, BOOLEAN) TO service_role;
