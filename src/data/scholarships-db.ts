import {
  MatchedScholarship,
  Scholarship,
  StreamType,
  TrackKey,
} from "@/types/chooseu";

export const SCHOLARSHIPS_DATABASE: Scholarship[] = [
  {
    id: "sawiris-distinction",
    name: "منحة ساويرس للتفوق (Sawiris Distinction Scholarship)",
    provider: "مؤسسة ساويرس للتنمية الاجتماعية",
    scope: "local",
    country: "مصر",
    supportedTracks: ["AI", "SE", "Cyber", "Data", "Biz_Fin", "Econ_Pol", "Arch_Civil"],
    supportedStreams: ["All"],
    minScore: 90,
    maxAnnualBudgetHint: 60000,
    fundingCoverageLabel: "تغطية كاملة 100% للمصروفات + بدل معيشة وكتب",
    coveragePct: 100,
    includesLiving: true,
    eligibilityConditions: [
      "مصري الجنسية ومقيم داخل مصر",
      "خريج ثانوية عامة حكومية أو مدارس STEM بمجموع لا يقل عن 90%",
      "القبول في إحدى الجامعات الشريكة (النيل، زويل، المصرية اليابانية، الجلالة، أو برامج الساعات المعتمدة بجامعة القاهرة)",
      "إثبات الاحتياج المالي والنشاط المجتمعي",
    ],
    deadline: "يوليو – أغسطس 2026",
    officialUrl: "https://sawirisfoundation.org",
    notes: "تُعد من أقوى المنح المحلية الكاملة لطلاب الثانوية العامة الحكومية والمتفوقين.",
  },
  {
    id: "qalaa-holdings",
    name: "منحة مؤسسة القلعة للمتفوقين",
    provider: "مؤسسة القلعة للمنح الدراسية",
    scope: "local",
    country: "مصر / دولي",
    supportedTracks: ["AI", "Hardware", "Arch_Civil", "Bio_Tech", "Econ_Pol", "Biz_Fin"],
    supportedStreams: ["All"],
    minScore: 88,
    maxAnnualBudgetHint: 80000,
    fundingCoverageLabel: "منحة كاملة أو جزئية (50% – 100%) حسب الاحتياج",
    coveragePct: 75,
    includesLiving: false,
    eligibilityConditions: [
      "مصري الجنسية وتفوق أكاديمي واضح",
      "الالتزام بالعودة والعمل في مصر لمدة عامين بعد التخرج للمنح الدولية",
      "اجتياز المقابلة الشخصية وخطة المسار المهني",
    ],
    deadline: "أبريل 2026",
    officialUrl: "https://qalaascholarships.org",
    notes: "مناسبة جداً للمسارات الهندسية والتقنية والاقتصادية ذات الأثر التنموي.",
  },
  {
    id: "usaid-eg-scholars",
    name: "منحة الجامعات الحكومية والأهلية للمتفوقين (USAID / AUC)",
    provider: "الجامعة الأمريكية بالقاهرة وشركاء التعليم العالي",
    scope: "local",
    country: "مصر",
    supportedTracks: ["AI", "Data", "SE", "Bio_Tech", "Med_Clinical", "Biz_Fin", "Econ_Pol"],
    supportedStreams: ["All"],
    minScore: 85,
    maxAnnualBudgetHint: 50000,
    fundingCoverageLabel: "تغطية 100% للمصروفات + تدريب لغة إنجليزية وإرشاد مهني",
    coveragePct: 100,
    includesLiving: true,
    eligibilityConditions: [
      "طالب مصري من خريجي المدارس الحكومية أو التجريبية أو STEM",
      "مجموع لا يقل عن 85% (و80% لطلاب STEM)",
      "المشاركة في أنشطة طلابية أو مجتمعية",
    ],
    deadline: "مايو – يونيو 2026",
    officialUrl: "https://www.aucegypt.edu/admissions/scholarships",
    notes: "تشمل تغطية أقسام الساعات المعتمدة بالجامعات الحكومية الكبرى وبعض الجامعات الخاصة الشريكة.",
  },
  {
    id: "zewail-merit",
    name: "منحة التفوق بجامعة العلوم والتكنولوجيا – مدينة زويل",
    provider: "مدينة زويل للعلوم والتكنولوجيا",
    scope: "university",
    country: "مصر",
    supportedTracks: ["AI", "Data", "Hardware", "Bio_Tech", "Pharma_Chem", "Cyber"],
    supportedStreams: ["Science", "Math", "stem"],
    minScore: 85,
    maxAnnualBudgetHint: 120000,
    fundingCoverageLabel: "إعفاء جزئي أو كلي من المصروفات (25% – 100%)",
    coveragePct: 50,
    includesLiving: false,
    eligibilityConditions: [
      "اجتياز اختبارات القبول بمدينة زويل للرياضيات والعلوم واللغة الإنجليزية",
      "الحفاظ على GPA >= 3.0 لاستمرار المنحة سنوياً",
      "تقديم مستندات الدخل الأسري لرفع نسبة الإعفاء",
    ],
    deadline: "أغسطس 2026",
    officialUrl: "https://www.zewailcity.edu.eg",
    notes: "من أقوى البرامج البحثية في مصر؛ تمنح خصومات تلقائية لأوائل المحافظات وطلاب STEM.",
  },
  {
    id: "ejust-merit",
    name: "منحة الجامعة المصرية اليابانية (E-JUST) للتفوق",
    provider: "الجامعة المصرية اليابانية للعلوم والتكنولوجيا – برج العرب",
    scope: "university",
    country: "مصر",
    supportedTracks: ["AI", "SE", "Cyber", "Hardware", "Arch_Civil", "Biz_Fin", "Pharma_Chem"],
    supportedStreams: ["Math", "Science", "stem", "Arts"],
    minScore: 82,
    maxAnnualBudgetHint: 130000,
    fundingCoverageLabel: "منح تفوق من 25% حتى 100% للمتفوقين وأوائل المحافظات",
    coveragePct: 40,
    includesLiving: false,
    eligibilityConditions: [
      "اجتياز اختبارات القبول والمقابلة الشخصية للجامعة",
      "أولوية المنح الكاملة لأوائل الثانوية العامة ومدارس STEM",
      "الالتزام بالمعدل التراكمي المقرر في اللائحة الداخلية",
    ],
    deadline: "أغسطس – سبتمبر 2026",
    officialUrl: "https://ejust.edu.eg",
    notes: "تجمع بين المنهج الياباني والاعتماد المصري مع فرص تبادل طلابي لليابان.",
  },
  {
    id: "nile-uni-merit",
    name: "منحة جامعة النيل الأهلية للتفوق الأكاديمي",
    provider: "جامعة النيل الأهلية – الشيخ زايد",
    scope: "university",
    country: "مصر",
    supportedTracks: ["AI", "SE", "Data", "Cyber", "Hardware", "Biz_Fin", "Bio_Tech"],
    supportedStreams: ["Math", "Science", "stem", "Arts"],
    minScore: 80,
    maxAnnualBudgetHint: 140000,
    fundingCoverageLabel: "خصم 20% – 50% (ويصل 100% لأوائل الجمهورية وSTEM)",
    coveragePct: 35,
    includesLiving: false,
    eligibilityConditions: [
      "القبول الأكاديمي في إحدى كليات جامعة النيل (الحاسبات، الهندسة، الإدارة، البيوتكنولوجي)",
      "اجتياز امتحان اللغة الإنجليزية للجامعة",
      "استمرار الخصم مشروط بـ GPA >= 3.2",
    ],
    deadline: "سبتمبر 2026",
    officialUrl: "https://nu.edu.eg/scholarships",
    notes: "جامعة بحثية رائدة في التكنولوجيا وريادة الأعمال ولها روابط قوية بشركات التقنية.",
  },
  {
    id: "national-ahli-excellence",
    name: "منح التفوق بالجامعات الأهلية المصرية (الجلالة / العلمين / المنصورة / المنوفية)",
    provider: "المجلس الأعلى للجامعات الأهلية",
    scope: "university",
    country: "مصر",
    supportedTracks: [
      "Med_Clinical",
      "Pharma_Chem",
      "Rehab_PT",
      "AI",
      "SE",
      "Cyber",
      "Hardware",
      "Arch_Civil",
      "Biz_Fin",
    ],
    supportedStreams: ["All"],
    minScore: 80,
    maxAnnualBudgetHint: 150000,
    fundingCoverageLabel: "خصم 15% – 50% للمتفوقين و100% لأوائل الثانوية العامة",
    coveragePct: 25,
    includesLiving: false,
    eligibilityConditions: [
      "تحقيق مجموع القبول المعلن للكلية الأهلية",
      "التفوق في السنة الأولى (GPA >= 3.5) أو الترتيب ضمن أوائل الشعبة",
      "تقديم طلب المنحة بشؤون الطلاب مع بداية العام الدراسي",
    ],
    deadline: "سبتمبر 2026",
    officialUrl: "https://www.mohesr.gov.eg",
    notes: "متاحة في معظم الجامعات الأهلية الأربعة الجديدة والأهلية المنبثقة.",
  },
  {
    id: "hungaricum-intl",
    name: "منحة الحكومة المجرية (Stipendium Hungaricum)",
    provider: "حكومة المجر ووزارة التعليم العالي المصرية",
    scope: "international",
    country: "المجر (أوروبا)",
    supportedTracks: ["AI", "SE", "Data", "Hardware", "Med_Clinical", "Bio_Tech", "Biz_Fin", "Arch_Civil"],
    supportedStreams: ["All"],
    minScore: 80,
    fundingCoverageLabel: "تغطية 100% للمصروفات + سكن جامعي + راتب شهري + تأمين طبي",
    coveragePct: 100,
    includesLiving: true,
    eligibilityConditions: [
      "مصري الجنسية وترشيح رسمي عبر بوابة البعثات المصرية والموقع المجري",
      "شهادة إجادة لغة إنجليزية (IELTS 5.5–6.0 أو ما يعادلها)",
      "مجموع ثانوية عامة لا يقل عن 80% للتخصصات الطبية والهندسية",
    ],
    deadline: "يناير 2027 (للعام الجامعي التالي)",
    officialUrl: "https://stipendiumhungaricum.hu",
    notes: "من أسهل وأقوى المنح الأوروبية الممولة بالكامل للطلاب المصريين بشهادة معترف بها أوروبياً.",
  },
  {
    id: "turkiye-burslari-intl",
    name: "منحة الحكومة التركية (Türkiye Bursları)",
    provider: "رئاسة الأتراك بالخارج والمجتمعات ذات الصلة (YTB)",
    scope: "international",
    country: "تركيا",
    supportedTracks: [
      "Med_Clinical",
      "Pharma_Chem",
      "AI",
      "SE",
      "Arch_Civil",
      "Biz_Fin",
      "Econ_Pol",
      "Media_Law",
      "Lang_Trans",
    ],
    supportedStreams: ["All"],
    minScore: 75,
    fundingCoverageLabel: "تغطية 100% للمصروفات + سكن + تذكرة طيران + سنة لغة + راتب شهري",
    coveragePct: 100,
    includesLiving: true,
    eligibilityConditions: [
      "السن أقل من 21 عاماً لدرجة البكالوريوس",
      "مجموع لا يقل عن 70% (و90% لكليات الطب والصيدلة والأسنان)",
      "لا تشترط IELTS مسبقاً للقبول المبدئي في معظم البرامج",
    ],
    deadline: "فبراير 2027",
    officialUrl: "https://www.turkiyeburslari.gov.tr",
    notes: "مناسبة لجميع الشعب بما فيها الأدبي والعلوم والرياضة وممولة بالكامل.",
  },
  {
    id: "germany-public-daad",
    name: "الدراسة المجانية بالجامعات الحكومية الألمانية + منح DAAD",
    provider: "الهيئة الألمانية للتبادل الأكاديمي (DAAD)",
    scope: "international",
    country: "ألمانيا (أوروبا)",
    supportedTracks: ["AI", "SE", "Cyber", "Hardware", "Data", "Arch_Civil", "Bio_Tech", "Econ_Pol"],
    supportedStreams: ["Math", "Science", "stem"],
    minScore: 82,
    fundingCoverageLabel: "مصروفات دراسية مجانية (0 يورو) + إمكانية منحة معيشة جزئية",
    coveragePct: 85,
    includesLiving: false,
    eligibilityConditions: [
      "استيفاء شروط السنة التحضيرية (Studienkolleg) أو سنة جامعية ناجحة في مصر",
      "إثبات لغة ألمانية (B1/B2) أو إنجليزية للبرامج الدولية",
      "حساب بنكي مغلق لتكاليف المعيشة ما لم يحصل الطالب على تمويل إضافي",
    ],
    deadline: "مايو – يوليو 2026",
    officialUrl: "https://www.daad.eg",
    notes: "جودة تعليم هندسي وتقني عالمي بدون مصروفات دراسية في الجامعات الحكومية الألمانية.",
  },
];

export function matchScholarships(params: {
  stream: StreamType;
  score: number;
  budget: number;
  topTrack?: TrackKey | null;
}): MatchedScholarship[] {
  const { stream, score, budget, topTrack } = params;

  return SCHOLARSHIPS_DATABASE.map((s) => {
    const streamOk =
      s.supportedStreams.includes("All") || s.supportedStreams.includes(stream);
    const trackOk = topTrack ? s.supportedTracks.includes(topTrack) : true;
    const scoreDiff = score - s.minScore;
    const isEligibleByScore = score >= s.minScore || (stream === "stem" && score >= s.minScore - 5);

    let matchScore = 45;
    if (streamOk) matchScore += 15;
    if (trackOk) matchScore += 20;
    if (isEligibleByScore) {
      matchScore += Math.min(15, Math.max(5, Math.round(scoreDiff) + 8));
    } else {
      matchScore -= Math.min(25, Math.round(Math.abs(scoreDiff) * 2));
    }
    if (s.maxAnnualBudgetHint && budget > 0 && budget <= s.maxAnnualBudgetHint) {
      matchScore += 5;
    }

    matchScore = Math.max(15, Math.min(99, matchScore));

    let eligibilityReason = "";
    if (!streamOk) {
      eligibilityReason = "موجهة أساساً لشعب أخرى، راجع شروط التخصص قبل التقديم.";
    } else if (isEligibleByScore && trackOk) {
      eligibilityReason = "مطابقة ممتازة لمجموعك ومسارك المقترح وميزانيتك.";
    } else if (isEligibleByScore) {
      eligibilityReason = "مجموعك يؤهلك للتقديم، وتدعم عدة تخصصات قريبة من اهتماماتك.";
    } else {
      eligibilityReason = `تحتاج مجموعاً استرشادياً لا يقل عن ${s.minScore}% (الفارق ${Math.abs(
        scoreDiff
      ).toFixed(1)}%).`;
    }

    return {
      ...s,
      matchScore,
      isEligibleByScore: isEligibleByScore && streamOk,
      eligibilityReason,
    };
  }).sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Estimates realistic tuition scholarship coverage % for a faculty based on student's score & sector
 * so Financial Planner can show Scholarship Coverage & Remaining Family Contribution.
 */
export function estimateFacultyScholarshipPct(
  facultyType: string,
  score: number,
  y1BaseFee: number
): number {
  if (y1BaseFee <= 5000) return 0; // Public tuition is already near-free
  if (facultyType === "جامعات دولية مختارة") {
    if (score >= 90) return 75;
    if (score >= 82) return 50;
    return 25;
  }
  if (score >= 95) return 50;
  if (score >= 90) return 30;
  if (score >= 85) return 20;
  if (score >= 80) return 10;
  return 0;
}