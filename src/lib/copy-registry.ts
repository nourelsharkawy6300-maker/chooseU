/**
 * ChooseU Copy Registry & Compliance Dictionary
 * 
 * Strict Legal / Compliance Guidelines:
 * Never use banned terms:
 * - "مضمون 100%"
 * - "رسمي" (except when disclaiming official status: "ليست جهة رسمية")
 * - "المعتمد / معتمد" (except academic "الساعات المعتمدة" or "ساعات معتمدة")
 * - "ضمان"
 * - "الفعلي"
 * - "حسابات حقيقية"
 * - "مدقق / التدقيق"
 * 
 * Permitted / Recommended terms:
 * - "استرشادي"
 * - "آمن"
 * - "تنبؤي"
 * - "مراجعة استرشادية"
 * - "مكتمل"
 * - "مؤكد"
 * - "المجموع المدخل"
 * - "التكلفة التقديرية"
 */

export const BANNED_TERMS_CONFIG = {
  bannedPatterns: [
    { pattern: "مضمون 100%", replacement: "فرصة قوية استرشادياً" },
    { pattern: "ضمان", replacement: "تأهيل / ترجيح" },
    { pattern: "حسابات حقيقية", replacement: "حسابات استرشادية شاملة" },
    { pattern: "الفعلي", replacement: "المدخل / التقديري" },
  ],
} as const;

export const COMPLIANCE_COPY = {
  platformName: "ChooseU",
  tagline: "المنصة الاسترشادية الذكية لتنسيق الجامعات المصرية وحساب تكلفة التعليم",
  officialDisclaimer:
    "تنبيه استرشادي: منصة ChooseU هي منصة توجيه استشاري تحليلي مستقلة. المنصة ليست جهة حكومية ولا تمثل مكتب تنسيق القبول بالجامعات والمعاهد المصرية، ولا تُغني عن التسجيل على بوابة التنسيق الحكومية.",
  advisoryReportTitle: "التقرير الاستشاري لتنسيق الجامعات والتدفق المالي",
  advisoryReportSubtitle:
    "وثيقة استشارية استرشادية مبنية على الحدود الدنيا الاسترشادية ولوائح المصروفات المعلنة",
  demoDataLabel: "نموذج توضيحي",
  lastUpdatedYear: "2026/2027",
  lastAuditTimestamp: "2026-11-17T20:00:00.000Z",
  supportContact: {
    instapayAccount: "nourelsharkawy6300@instapay",
    whatsappPhone: "01066594552",
    reportPriceEgp: 150,
  },
} as const;

export const ENTRY_COPY = {
  skipButton: "تخطي",
  scrollHint: "اسحب للأسفل للمتابعة",
  keyboardHint: "أو اضغط Enter / المسافة للمتابعة",
  loginTitle: "تسجيل الدخول إلى ChooseU",
  loginSubtitle: "تابع بطاقة رغباتك الاسترشادية، مصفوفة التكاليف، واستلم تقريرك الاستشاري",
  tabQuick: "دخول برقم الطلب / الهاتف",
  tabCredentials: "البريد وكلمة المرور",
  phoneOrOrderLabel: "رقم الهاتف (الواتساب) أو كود الطلب",
  phoneOrOrderPlaceholder: "010XXXXXXXX أو ORD-2026-...",
  phoneOrOrderHint: "إذا كان لديك طلب استشارة سابق، يمكنك إدخال كود الطلب لاستعادة ملفك مباشرة.",
  emailLabel: "البريد الإلكتروني",
  emailPlaceholder: "student@example.com",
  passwordLabel: "كلمة المرور",
  passwordPlaceholder: "••••••••",
  submitQuick: "متابعة الدخول",
  submitCredentials: "تسجيل الدخول",
  newStudentPrompt: "مستخدم جديد؟",
  startCoordinationLink: "ابدأ إدخال درجاتك والتنسيق فوراً",
  trackOrderLink: "متابعة حالة طلب استشاري بدون تسجيل",
  errors: {
    emptyIdentifier: "يرجى إدخال رقم الواتساب المسجل أو كود الطلب.",
    emptyCredentials: "يرجى إدخال البريد الإلكتروني وكلمة المرور.",
    notFound: "لم يتم العثور على سجل مطابق. تأكد من كود الطلب أو رقم الهاتف.",
    invalidCredentials: "بيانات الدخول غير صحيحة.",
    rateLimited: "تم تجاوز الحد المسموح من المحاولات مؤقتاً (429). يرجى الانتظار دقيقة والمحاولة مجدداً.",
    network: "تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة بعد قليل.",
  },
  status: {
    loadingQuick: "جاري التحقق واسترجاع الملف الاسترشادي...",
    loadingCredentials: "جاري التحقق من بيانات الدخول...",
    successRedirect: "تم تسجيل الدخول بنجاح! جاري تحويلك...",
  },
} as const;

export type EntryCopy = typeof ENTRY_COPY;
export type ComplianceCopyKey = keyof typeof COMPLIANCE_COPY;
