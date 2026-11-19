-- ============================================================================
-- CHOOSEU STEP 1: AUTHENTICATION & RLS VERIFICATION TESTS
-- File: supabase/tests/auth_rls_checks.sql
-- Description:
--   Interactive test suite executable directly in Supabase SQL Editor.
--   Tests RLS isolation, role immutability, admin insert blocks, and minor protection.
-- ============================================================================

-- ============================================================================
-- تعليمات الاستخدام وإعداد المعرفات (CONFIGURATION INSTRUCTIONS):
-- قبل تشغيل الاختبارات، استبدل القيمتين التاليتين في الملف (Find & Replace):
--   1. استبدل <UUID_A> بـ UUID لمستخدم تجريبي مسجل في (auth.users).
--   2. استبدل <UUID_B> بـ UUID لمستخدم تجريبي ثانٍ مسجل في (auth.users).
-- (تجد الـ UUIDs في لوحة Supabase Dashboard -> Authentication -> Users).
-- ============================================================================


-- ============================================================================
-- القسم الأول: اختبارات محاكاة المستخدم العادي (SET LOCAL ROLE authenticated)
-- يتم تنفيذ كل اختبار داخل BEGIN ... ROLLBACK لضمان عدم تلويث قاعدة البيانات.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- اختبار (أ): مستخدم A يحاول قراءة صف مستخدم آخر B
-- ----------------------------------------------------------------------------
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"<UUID_A>","role":"authenticated"}';

-- الاستعلام: محاولة قراءة بروفايل مستخدم آخر B
SELECT * FROM public.profiles WHERE id = '<UUID_B>';

-- النتيجة المتوقعة (EXPECTED RESULT):
-- 0 rows returned
-- سياسة "profiles_select_own" تحجب الصف تماماً وترجع جدولاً فارغاً بدون أخطاء.
ROLLBACK;


-- ----------------------------------------------------------------------------
-- اختبار (ب): مستخدم A يحاول ترقية الدور (role) لنفسه إلى 'admin'
-- ----------------------------------------------------------------------------
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"<UUID_A>","role":"authenticated"}';

-- الاستعلام: محاولة تعديل عمود role
UPDATE public.profiles
SET role = 'admin'
WHERE id = '<UUID_A>';

-- النتيجة المتوقعة (EXPECTED RESULT):
-- ERROR: Security error: Users are not permitted to change their account role.
-- التريجر trg_protect_profile_role يكتشف وجود auth.uid() ويرفض العملية فوراً.
ROLLBACK;


-- ----------------------------------------------------------------------------
-- اختبار (ج): مستخدم A يحاول إدراج صف جديد بدور 'admin'
-- ----------------------------------------------------------------------------
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"<UUID_A>","role":"authenticated"}';

-- الاستعلام: محاولة إدخال بروفايل بدور أدمن
INSERT INTO public.profiles (id, full_name, role)
VALUES ('<UUID_A>', 'مستخدم متسلل', 'admin');

-- النتيجة المتوقعة (EXPECTED RESULT):
-- ERROR: new row violates row-level security policy for table "profiles"
-- سياسة "profiles_insert_own" تشترط (role = 'student') وتمنع أي دور آخر.
ROLLBACK;


-- ----------------------------------------------------------------------------
-- اختبار (د.1): محاولة إدراج قاصر بدون إقرار ولي الأمر (فحص قيد الجدول)
-- ----------------------------------------------------------------------------
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"<UUID_A>","role":"authenticated"}';

-- الاستعلام: إدخال قاصر مع age_declared = true و is_minor = true بدون موافقة
INSERT INTO public.profiles (
  id, full_name, age_declared, is_minor, guardian_ack, guardian_ack_at, role
) VALUES (
  '<UUID_A>', 'طالب قاصر تجريبي', true, true, false, NULL, 'student'
);

-- النتيجة المتوقعة (EXPECTED RESULT):
-- ERROR: new row for relation "profiles" violates check constraint "check_minor_guardian_ack"
-- القيد check_minor_guardian_ack يمنع حفظ قاصر بدون إقرار مؤرخ.
ROLLBACK;


-- ----------------------------------------------------------------------------
-- اختبار (د.2): محاولة تسجيل قاصر عبر تريجر auth.users بدون إقرار
-- ----------------------------------------------------------------------------
BEGIN;
-- محاكاة إنشاء مستخدم قاصر جديد في auth.users
INSERT INTO auth.users (id, email, raw_user_meta_data)
VALUES (
  gen_random_uuid(),
  'minor_test_unack@chooseu.local',
  '{"full_name": "قاصر بدون إقرار", "age_declared": true, "is_minor": true, "guardian_ack": false}'::jsonb
);

-- النتيجة المتوقعة (EXPECTED RESULT):
-- ERROR: Minor registration requires explicit guardian acknowledgment and consent.
-- دالة التريجر handle_new_user تفحص الـ metadata وترفض التسجيل.
ROLLBACK;


-- ----------------------------------------------------------------------------
-- اختبار (و.1): استدعاء declare_age لطالب راشد (18+)
-- ----------------------------------------------------------------------------
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"<UUID_A>","role":"authenticated"}';

-- الاستعلام: إعلان سن راشد
SELECT public.declare_age(false, false);

-- التحقق من تحديث البروفايل
SELECT age_declared, is_minor, guardian_ack FROM public.profiles WHERE id = '<UUID_A>';

-- النتيجة المتوقعة (EXPECTED RESULT):
-- declare_age يرجع كائن JSON بنجاح
-- الصف يظهر: age_declared = true, is_minor = false, guardian_ack = false
ROLLBACK;


-- ----------------------------------------------------------------------------
-- اختبار (و.2): استدعاء declare_age لقاصر دون إقرار ولي الأمر (فحص رفض الدالة)
-- ----------------------------------------------------------------------------
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"<UUID_A>","role":"authenticated"}';

-- الاستعلام: محاولة تسجيل قاصر بدون موافقة
SELECT public.declare_age(true, false);

-- النتيجة المتوقعة (EXPECTED RESULT):
-- ERROR: Minor registration requires explicit guardian acknowledgment and consent.
-- الدالة ترفض الحفظ وترفع استثناء فوري.
ROLLBACK;


-- ----------------------------------------------------------------------------
-- اختبار (و.3): استدعاء declare_age لقاصر مع إقرار ولي الأمر الصحيح
-- ----------------------------------------------------------------------------
BEGIN;
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims = '{"sub":"<UUID_A>","role":"authenticated"}';

-- الاستعلام: تسجيل قاصر مع إقرار ولي الأمر
SELECT public.declare_age(true, true);

-- التحقق من تحديث البروفايل
SELECT age_declared, is_minor, guardian_ack, guardian_ack_at IS NOT NULL AS has_timestamp
FROM public.profiles WHERE id = '<UUID_A>';

-- النتيجة المتوقعة (EXPECTED RESULT):
-- declare_age يرجع كائن JSON بنجاح
-- الصف يظهر: age_declared = true, is_minor = true, guardian_ack = true, has_timestamp = true
ROLLBACK;



-- ============================================================================
-- القسم الثاني: اختبارات الإدارة والصلاحيات العليا (تشغيل كـ postgres / Superuser)
-- هذا القسم معزول تماماً ولا يحتوي على محاكاة لمستخدم (auth.uid() IS NULL).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- اختبار (هـ): ترقية دور المستخدم من SQL Editor أو عبر service_role
-- ----------------------------------------------------------------------------
BEGIN;
-- جلسة مباشرة في SQL Editor بصلاحيات الإدارة (auth.uid() غير موجود = NULL):
UPDATE public.profiles
SET role = 'advisor'
WHERE id = '<UUID_A>';

-- النتيجة المتوقعة (EXPECTED RESULT):
-- UPDATE 1
-- ينجح التعديل بنجاح لأن التريجر trg_protect_profile_role يتيح لـ SQL Editor ومفتاح service_role تعديل الأدوار.
ROLLBACK;
