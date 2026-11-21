export type ConsultantCategory =
  | "career_counselor"
  | "academic_advisor"
  | "university_rep"
  | "scholarship_financial"
  | "student_graduate";

export interface ConsultantProfile {
  id: string;
  name: string;
  roleTitle: string;
  category: ConsultantCategory;
  affiliation: string;
  experienceYears: number;
  specialties: string[];
  bio: string;
  meetingFormats: Array<
    "جلسة فيديو أونلاين" | "مكالمة صوتية" | "مراجعة مكتوبة + فويس نوت"
  >;
  nextAvailable: string;
  feeLabel: string;
  rating: number;
}

export const CONSULTANT_CATEGORY_LABELS: Record<
  ConsultantCategory | "all",
  string
> = {
  all: "كل الخبراء",
  career_counselor: "مرشدون مهنيون (Career Counselors)",
  academic_advisor: "مستشارون أكاديميون (Academic Advisors)",
  university_rep: "ممثلو جامعات (University Reps)",
  scholarship_financial: "خبراء منح وتخطيط مالي",
  student_graduate: "طلاب وخريجو جامعات (تجربة واقعية)",
};

export const CONSULTANTS_DATABASE: ConsultantProfile[] = [
  {
    id: "cons-career-1",
    name: "م. كريم عبد الرحمن",
    roleTitle: "مرشد مهني وتقني — Career Counselor",
    category: "career_counselor",
    affiliation: "خبرة في شركات التقنية والبنوك + إرشاد طلاب الثانوية",
    experienceYears: 8,
    specialties: ["تحليل الميول المهنية", "مسارات الذكاء الاصطناعي والبرمجة", "سوق العمل المصري والدولي"],
    bio: "يساعد طلاب الثانوية العامة على ربط نقاط قوتهم الفعلية بسوق العمل الحقيقي بعيداً عن كليات القمة التقليدية.",
    meetingFormats: ["جلسة فيديو أونلاين", "مكالمة صوتية"],
    nextAvailable: "اليوم 7:00 م – 10:00 م",
    feeLabel: "150 ج.م / جلسة 30 دقيقة",
    rating: 4.9,
  },
  {
    id: "cons-career-2",
    name: "د. سلمى الشاذلي",
    roleTitle: "مستشارة مسار مهني وتخصصات طبية وإدارية",
    category: "career_counselor",
    affiliation: "أخصائية توجيه مهني معتمدة للشباب",
    experienceYears: 6,
    specialties: ["المسارات الطبية مقابل البحثية", "إدارة الأعمال والاقتصاد", "التعامل مع الحيرة وضغط الأسرة"],
    bio: "تركز على بناء قرار هادئ يوازن بين شغف الطالب وفرص التوظيف العملية بعد التخرج.",
    meetingFormats: ["جلسة فيديو أونلاين", "مراجعة مكتوبة + فويس نوت"],
    nextAvailable: "غداً 5:00 م – 9:00 م",
    feeLabel: "150 ج.م / جلسة 30 دقيقة",
    rating: 4.9,
  },
  {
    id: "cons-acad-1",
    name: "أ.د. طارق المنياوي",
    roleTitle: "مستشار أكاديمي ولوائح تنسيق — Academic Advisor",
    category: "academic_advisor",
    affiliation: "خبير تنسيق الجامعات الحكومية والأهلية والساعات المعتمدة",
    experienceYears: 14,
    specialties: ["ترتيب الـ 75 رغبة", "شروط الـ GPA والتخصص الداخلي", "التحويل وتقليل الاغتراب"],
    bio: "يراجع أوراق وترتيب رغبات الطلاب لتجنب الأخطاء الشائعة في التنسيق الجغرافي ولوائح الجامعات الأهلية.",
    meetingFormats: ["جلسة فيديو أونلاين", "مراجعة مكتوبة + فويس نوت"],
    nextAvailable: "اليوم 8:00 م",
    feeLabel: "150 ج.م / مراجعة شاملة",
    rating: 5.0,
  },
  {
    id: "cons-univ-1",
    name: "أ. مريم حسام",
    roleTitle: "ممثلة قبول جامعي — الجامعات الأهلية والدولية",
    category: "university_rep",
    affiliation: "مكتب القبول والتسجيل (الجلالة / النيل / العلمين)",
    experienceYears: 5,
    specialties: ["إجراءات التقديم المباشر للأهلية", "اختبارات اللغة والقدرات", "المستندات المطلوبة للقبول"],
    bio: "تجيب بدقة عن شروط القبول الفعلية، والمصروفات الإدارية، وطرق التقسيط داخل الجامعات الأهلية والخاصة.",
    meetingFormats: ["جلسة فيديو أونلاين", "مكالمة صوتية"],
    nextAvailable: "غداً 3:00 م – 7:00 م",
    feeLabel: "100 ج.م / جلسة استفسار",
    rating: 4.8,
  },
  {
    id: "cons-schol-1",
    name: "أ. يوسف النجار",
    roleTitle: "خبير منح محلية ودولية وتخطيط مالي",
    category: "scholarship_financial",
    affiliation: "حاصل على منحة دولية وموجه لمنح ساويرس وهنغاريكم",
    experienceYears: 7,
    specialties: ["منح ساويرس والقلعة وUSAID", "منحة المجر وتركيا وألمانيا", "كتابة خطاب الدافع وخطة التمويل"],
    bio: "يساعد الطلاب وأسرهم في تقليل تكلفة الدراسة عبر تجهيز ملفات المنح المحلية والدولية بدقة.",
    meetingFormats: ["جلسة فيديو أونلاين", "مراجعة مكتوبة + فويس نوت"],
    nextAvailable: "بعد غد 6:00 م",
    feeLabel: "150 ج.م / جلسة + مراجعة ملف",
    rating: 4.9,
  },
  {
    id: "cons-grad-1",
    name: "نور الدين / خريجو الذكاء الاصطناعي والهندسة",
    roleTitle: "طالب وخريج جامعي — تجربة واقعية داخل الكلية",
    category: "student_graduate",
    affiliation: "كليات الذكاء الاصطناعي والحاسبات والهندسة بالجامعات المصرية",
    experienceYears: 4,
    specialties: ["الحياة الدراسية الحقيقية في حاسبات وAI", "الفرق بين الحكومي والأهلي في المشاريع", "التدريبات الصيفية وسوق الأمن السيبراني"],
    bio: "ينقل لك الصورة الحقيقية من داخل المدرجات والمعامل بعيداً عن الإعلانات، ويشرح ما تحتاج مذاكرته قبل سنة أولى.",
    meetingFormats: ["جلسة فيديو أونلاين", "مكالمة صوتية"],
    nextAvailable: "اليوم 9:00 م",
    feeLabel: "مجانية / رمزية للطلاب (50 ج.م)",
    rating: 4.9,
  },
  {
    id: "cons-grad-2",
    name: "د. هنا مجدي",
    roleTitle: "خريجة طب بشري وامتياز — تجربة المسار الطبي",
    category: "student_graduate",
    affiliation: "كلية الطب البشري — قصر العيني / الجامعات الحكومية",
    experienceYears: 6,
    specialties: ["واقع دراسة الطب 5+2 سنوات", "الفرق بين الطب والصيدلة والعلاج الطبيعي", "ضغط المذاكرة والمعادلات الدولية"],
    bio: "تساعد طلاب علمي علوم في فهم طبيعة الدراسة الطبية والمستقبل العملي قبل اتخاذ قرار الـ 7 سنوات.",
    meetingFormats: ["مكالمة صوتية", "جلسة فيديو أونلاين"],
    nextAvailable: "غداً 8:00 م",
    feeLabel: "رمزية للطلاب (50 ج.م)",
    rating: 4.8,
  },
];