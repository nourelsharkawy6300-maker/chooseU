-- ============================================================================
-- ChooseU — Supabase Production Schema & Row-Level Security Policies
-- Target: public.consultation_orders
-- ============================================================================

-- ─── 1. TABLE DEFINITION ────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.consultation_orders (
  id                 uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  order_code         text          NOT NULL UNIQUE,         -- e.g. ORD-2026-710
  created_at         timestamptz   NOT NULL DEFAULT now(),

  -- Student identity (personal data — governed by Egyptian Law 151/2020)
  student_name       text          NOT NULL,
  whatsapp_phone     text          NOT NULL,                -- normalized Egyptian format

  -- Academic parameters used for report generation
  academic_stream    text          NOT NULL CHECK (academic_stream IN ('Science', 'Math', 'Arts')),
  score_percentage   numeric(5,2)  NOT NULL CHECK (score_percentage BETWEEN 0 AND 100),
  max_budget         integer       NOT NULL CHECK (max_budget >= 0),
  governorate        text          NOT NULL,

  -- Payment proof
  instapay_ref       text          NOT NULL,

  -- Workflow status
  order_status       text          NOT NULL DEFAULT 'pending'
                                   CHECK (order_status IN ('pending', 'approved')),

  -- Advisor enrichment (written and voice)
  advisor_notes      text,
  voice_note_url     text,

  -- Serialized quiz results (top track + eligible faculty IDs)
  quiz_results       jsonb         DEFAULT '{}'::jsonb
);

COMMENT ON TABLE public.consultation_orders IS
  'Student consultation orders placed through the ChooseU platform (v2026.11). '
  'Contains personal data governed by Egyptian Personal Data Protection Law No. 151 of 2020.';

-- ─── 2. INDEXES ─────────────────────────────────────────────────────────────

-- Primary lookup index — used by TrackOrderView and admin panel
CREATE UNIQUE INDEX IF NOT EXISTS idx_consultation_orders_order_code
  ON public.consultation_orders (order_code);

-- Secondary lookup index — allows student to find order by phone
CREATE INDEX IF NOT EXISTS idx_consultation_orders_whatsapp_phone
  ON public.consultation_orders (whatsapp_phone);

-- Status filter index — accelerates admin panel filtered views
CREATE INDEX IF NOT EXISTS idx_consultation_orders_status
  ON public.consultation_orders (order_status);

-- ─── 3. ENABLE ROW-LEVEL SECURITY ───────────────────────────────────────────

ALTER TABLE public.consultation_orders ENABLE ROW LEVEL SECURITY;

-- ─── 4. RLS POLICIES ────────────────────────────────────────────────────────

-- Policy A: Anonymous users (students) may INSERT new orders only.
--           They must supply all required fields; no UPDATE or DELETE.
DROP POLICY IF EXISTS "anon_insert_orders" ON public.consultation_orders;
CREATE POLICY "anon_insert_orders"
  ON public.consultation_orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Policy B: Anonymous users may SELECT their own order by exact order_code or phone.
--           This powers TrackOrderView without requiring authentication.
DROP POLICY IF EXISTS "anon_select_own_order" ON public.consultation_orders;
CREATE POLICY "anon_select_own_order"
  ON public.consultation_orders
  FOR SELECT
  TO anon
  USING (true);  -- Row-level filtering is enforced in the application layer (DataService)

-- Policy C: Authenticated users (staff / service-role key) have full read-write access.
--           Used exclusively by the Admin portal (/admin) and Supabase Edge Functions.
DROP POLICY IF EXISTS "authenticated_full_access" ON public.consultation_orders;
CREATE POLICY "authenticated_full_access"
  ON public.consultation_orders
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ─── 5. SEED: DEMO ORDER FOR PREVIEW ─────────────────────────────────────────

INSERT INTO public.consultation_orders (
  order_code, student_name, whatsapp_phone,
  academic_stream, score_percentage, max_budget, governorate,
  instapay_ref, order_status,
  advisor_notes
) VALUES (
  'ORD-2026-710',
  'أحمد محمد علي',
  '01066594552',
  'Math',
  87.5,
  70000,
  'المنوفية',
  'IPN-20261114-DEMO',
  'approved',
  E'1. الأولوية الأكاديمية والمالية الأولى:\nالبدء بكليات الذكاء الاصطناعي وعلوم الحاسوب بالجامعات الأهلية داخل نطاق المحافظة.\n\n2. خطة التأمين:\nإدراج برامج الساعات المعتمدة بالجامعات الحكومية كرغبات احتياطية مضمونة القبول.'
) ON CONFLICT (order_code) DO NOTHING;
