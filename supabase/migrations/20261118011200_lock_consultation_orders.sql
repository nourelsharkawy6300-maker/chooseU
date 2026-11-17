-- ============================================================================
-- Migration: Lock consultation_orders from Anonymous SELECT
-- File: supabase/migrations/20261118011200_lock_consultation_orders.sql
-- Description: Drops permissive anonymous SELECT policies on public.consultation_orders
--              and revokes direct SELECT privileges from the anon role.
--              All frontend order lookups must route through server-side /api/orders
--              using the service-role key, which returns only { order_code, order_status, progress_label }.
-- ============================================================================

-- 1. Drop the permissive anonymous SELECT policy
DROP POLICY IF EXISTS "anon_select_own_order" ON public.consultation_orders;

-- 2. Revoke SELECT privilege on public.consultation_orders from the anon role
REVOKE SELECT ON TABLE public.consultation_orders FROM anon;

-- Note: No new permissive SELECT policies are created for anon.
-- Service-role and authenticated administrative access remain governed
-- by existing backend service-role privileges and admin RBAC policies.
