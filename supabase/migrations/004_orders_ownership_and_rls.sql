-- ============================================================================
-- Migration 004: Consultation Orders User Ownership & Strict RLS Hardening
-- ============================================================================

-- 1. Add user_id ownership column (nullable for legacy rows, enforced by API for all new orders)
ALTER TABLE public.consultation_orders
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_consultation_orders_user_id
  ON public.consultation_orders (user_id);

-- 2. Enforce Row Level Security strictly
ALTER TABLE public.consultation_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultation_orders FORCE ROW LEVEL SECURITY;

-- 3. Drop any legacy/permissive policies if present
DROP POLICY IF EXISTS "anon_insert_orders" ON public.consultation_orders;
DROP POLICY IF EXISTS "anon_select_own_order" ON public.consultation_orders;
DROP POLICY IF EXISTS "authenticated_full_access" ON public.consultation_orders;
DROP POLICY IF EXISTS "consultation_orders_insert" ON public.consultation_orders;
DROP POLICY IF EXISTS "consultation_orders_select_admin" ON public.consultation_orders;
DROP POLICY IF EXISTS "consultation_orders_update_admin" ON public.consultation_orders;
DROP POLICY IF EXISTS "consultation_orders_delete_admin" ON public.consultation_orders;
DROP POLICY IF EXISTS "consultation_orders_select_own" ON public.consultation_orders;

-- 4. Defense-in-depth table privileges (all writes go strictly through server API routes)
REVOKE ALL ON TABLE public.consultation_orders FROM anon;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON TABLE public.consultation_orders FROM authenticated;
GRANT SELECT ON TABLE public.consultation_orders TO authenticated;

-- 5. Strict student read policy: authenticated user can read ONLY their own orders
CREATE POLICY "consultation_orders_select_own"
  ON public.consultation_orders
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);