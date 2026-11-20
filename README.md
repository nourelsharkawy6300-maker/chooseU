# chooseU (تطبيق توجيه تنسيق الجامعات المصرية)

منصة استشارية لمساعدة طلاب الثانوية العامة وأولياء الأمور في مصر على استكشاف بدائل تنسيق الجامعات (حكومية، أهلية، خاصة، ساعات معتمدة) وحساب التكلفة التقديرية لسنوات الدراسة بالكامل (TCO).

---

## متطلبات التشغيل (Requirements)
- **Node.js**: v18.17 أو أحدث
- **npm**: v9 أو أحدث

---

## التشغيل المحلي والتطوير (How to Run)

1. تثبيت الحزم:
```bash
npm install
```

2. نسخ ملف المتغيرات البيئية وتعبئته:
```bash
cp .env.example .env.local
```

3. تشغيل خادم التطوير:
```bash
npm run dev
```
افتح المتصفح على: `http://localhost:3000`

---

## الفحص والبناء (Build & Lint)

```bash
# فحص الكود والأنماط
npm run lint

# فحص توافق TypeScript
npx tsc --noEmit

# بناء النسخة الإنتاجية
npm run build
```

---

## النشر في بيئة الإنتاج (Deployment)

يتم نشر التطبيق على أي منصة استضافة تدعم Next.js App Router (مثل Vercel أو Node.js Server):
1. ضبط كافة المتغيرات البيئية المطلوبة في لوحة تحكم الاستضافة (Environment Variables).
2. التأكد من تعيين `NODE_ENV=production`.
3. تنفيذ أمر البناء: `npm run build`.
4. بدء الخادم: `npm run start`.

---

## المتغيرات البيئية المطلوبة (Required Environment Variables)

(يتم توفير الأسماء فقط — انظر ملف `.env.example` للتوثيق الكامل):
- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `ADMIN_PASSCODE`
- `ADMIN_SESSION_SECRET`

---

## تدوير الأسرار والمفاتيح (Secret Rotation Procedures)

### 1. تدوير رمز مرور لوحة الإدارة (`ADMIN_PASSCODE`)
لتغيير رمز مرور المستشار الأكاديمي، قم بتحديث المتغير البيئي `ADMIN_PASSCODE` مباشرة في إعدادات البيئة (مثل لوحة تحكم Vercel) بكلمة مرور قوية وفريدة، دون الحاجة لإعادة بناء الكود (يتم التحقق منها على السيرفر في زمن ثابت عبر `crypto.timingSafeEqual`).

### 2. تدوير مفتاح الجلسة (`ADMIN_SESSION_SECRET`)
لتوليد مفتاح HMAC جديد لجلسات الإدارة (سيبطل الجلسات النشطة فورياً):
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
قم بتحديث المتغير البيئي `ADMIN_SESSION_SECRET` في خادم الإنتاج. لاحظ أن التطبيق يفشل إغلاقياً (fail-closed) ويرفض بدء التشغيل في بيئة الإنتاج إذا لم يتم ضبط هذا المتغير.

---

## خطة التراجع السريع عند الطوارئ (Rollback Note)

في حال حدوث أي خطأ في بيئة الإنتاج، يتم التراجع فوراً بإعادة نشر الـ commit السابق المستقر:
- عبر Vercel: اضغط **Redeploy** على آخر عملية نشر ناجحة سابقة من قسم Deployments.
- عبر Git / Docker:
```bash
git checkout <PREVIOUS_COMMIT_SHA>
npm run build
npm run start
```
