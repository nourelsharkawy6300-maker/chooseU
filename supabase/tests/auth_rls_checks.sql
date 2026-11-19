-- ============================================================================
-- CHOOSEU STEP 1: AUTHENTICATION & RLS VERIFICATION TESTS
-- File: supabase/tests/auth_rls_checks.sql
-- Description:
--   Interactive test suite executable directly in Supabase SQL Editor.
--   Tests RLS isolation, role immutability, admin insert blocks, and minor protection.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- SETUP: Create two mock users in auth.users (if running on a clean dev DB)
-- ----------------------------------------------------------------------------
DO $$
DECLARE
  v_user_a UUID := '11111111-1111-1111-1111-111111111111';
  v_user_b UUID := '22222222-2222-2222-2222-222222222222';
BEGIN
  -- Insert or verify user A
  INSERT INTO auth.users (id, email, raw_user_meta_data)
  VALUES (v_user_a, 'student_a@test.com', '{"full_name": "طالب أ", "is_minor": false}'::jsonb)
  ON CONFLICT (id) DO NOTHING;

  -- Insert or verify user B
  INSERT INTO auth.users (id, email, raw_user_meta_data)
  VALUES (v_user_b, 'student_b@test.com', '{"full_name": "طالب ب", "is_minor": false}'::jsonb)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- ============================================================================
-- TEST (A): مستخدم يحاول يقرأ صف مستخدم تاني
-- Objective: Verify User A cannot read User B's profile row under RLS.
-- Simulation: Set authenticated session as User A (auth.uid = 11111111-...)
-- ============================================================================
BEGIN;
  -- Simulate authenticated JWT session for User A
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

  -- Query User B's profile directly:
  SELECT id, full_name, role 
  FROM public.profiles 
  WHERE id = '22222222-2222-2222-2222-222222222222';

  -- النتيجة المتوقعة (EXPECTED RESULT):
  -- (0 rows returned)
  -- RLS policy "profiles_select_own" blocks the query silently, returning zero rows.
ROLLBACK;

-- ============================================================================
-- TEST (B): مستخدم يحاول يعدّل role لنفسه إلى 'admin'
-- Objective: Verify User A cannot elevate their own role to 'admin'.
-- Simulation: Authenticated User A tries to UPDATE role to 'admin'
-- ============================================================================
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

  -- Attempt to modify own role:
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = '11111111-1111-1111-1111-111111111111';

  -- النتيجة المتوقعة (EXPECTED RESULT):
  -- ERROR: Security error: Users are not permitted to change their account role.
  -- Trigger trg_protect_profile_role fires and aborts the transaction with an exception.
ROLLBACK;

-- ============================================================================
-- TEST (C): مستخدم يحاول عمل INSERT لصف جديد بـ role='admin'
-- Objective: Verify client-side INSERT policy blocks non-student roles.
-- Simulation: Authenticated User A tries to insert a row with role = 'admin'
-- ============================================================================
BEGIN;
  SET LOCAL ROLE authenticated;
  SET LOCAL "request.jwt.claims" = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

  -- Attempt to insert as admin:
  INSERT INTO public.profiles (id, full_name, role)
  VALUES ('11111111-1111-1111-1111-111111111111', 'طالب متسلل', 'admin');

  -- النتيجة المتوقعة (EXPECTED RESULT):
  -- ERROR: new row violates row-level security policy for table "profiles"
  -- RLS policy "profiles_insert_own" strictly enforces role = 'student' and aborts.
ROLLBACK;

-- ============================================================================
-- TEST (D): تسجيل قاصر من غير إقرار ولي الأمر
-- Objective: Verify constraint check_minor_guardian_ack blocks minor without consent.
-- ============================================================================
-- Case D.1: Direct INSERT with is_minor = true but guardian_ack = false
BEGIN;
  INSERT INTO public.profiles (
    id, full_name, age_declared, is_minor, guardian_ack, guardian_ack_at, role
  ) VALUES (
    gen_random_uuid(), 'طالب قاصر بدون إقرار', true, true, false, NULL, 'student'
  );

  -- النتيجة المتوقعة (EXPECTED RESULT):
  -- ERROR: new row for relation "profiles" violates check constraint "check_minor_guardian_ack"
  -- Failing row contains (..., age_declared=true, is_minor=true, guardian_ack=false, guardian_ack_at=null)
ROLLBACK;

-- Case D.2: Signup trigger with metadata is_minor = true but guardian_ack missing
BEGIN;
  -- Trigger handle_new_user test via auth.users insert
  INSERT INTO auth.users (id, email, raw_user_meta_data)
  VALUES (
    gen_random_uuid(), 
    'minor_without_ack@test.com', 
    '{"full_name": "قاصر تجريبي", "age_declared": true, "is_minor": true, "guardian_ack": false}'::jsonb
  );

  -- النتيجة المتوقعة (EXPECTED RESULT):
  -- ERROR: Minor registration requires explicit guardian acknowledgment and consent.
  -- handle_new_user trigger validates metadata and raises an exception.
ROLLBACK;

-- ============================================================================
-- TEST (E): تعديل دور المستخدم من SQL Editor أو service_role (مسموح به للإدارة)
-- Objective: Verify direct admin operations from SQL Editor succeed.
-- ============================================================================
BEGIN;
  -- Reset to direct superuser / SQL Editor session (auth.uid() is NULL)
  RESET ROLE;

  -- Admin promotes User A to advisor:
  UPDATE public.profiles
  SET role = 'advisor'
  WHERE id = '11111111-1111-1111-1111-111111111111';

  -- النتيجة المتوقعة (EXPECTED RESULT):
  -- UPDATE 1 (نجاح التعديل للإدارة)
  -- Trigger trg_protect_profile_role detects auth.uid() IS NULL and permits the update.
ROLLBACK;
