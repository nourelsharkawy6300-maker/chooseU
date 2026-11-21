import {
  EvaluationResult,
  Faculty,
  RankedFaculty,
  StreamType,
  TcoMetrics,
  TrackKey,
} from "../types/chooseu";
import { estimateFacultyScholarshipPct } from "../data/scholarships-db";
import {
  FACULTIES_DATABASE,
  STREAM_QUIZ_BANKS,
  TRACK_DETAILS,
} from "../data/faculties-db";

// ============================================================================
// 1. STRICT ARABIC PLURALIZATION ENGINE
// ============================================================================

export function formatFacultyCount(n: number): string {
  if (n <= 0) return "لا توجد كليات مطابقة";
  if (n === 1) return "كلية واحدة مطابقة";
  if (n === 2) return "كليتان مطابقتان";
  if (n >= 3 && n <= 10) return `${n} كليات مطابقة`;
  return `${n} كلية مطابقة`;
}

// ============================================================================
// 2. PSYCHOMETRIC AFFINITY ENGINE
// ============================================================================

export function computeDominantTrackFromAnswers(
  assessmentAnswers?: Record<number, TrackKey>
): {
  topTrack: TrackKey | null;
  trackCounts: Partial<Record<TrackKey, number>>;
} {
  const answered = Object.values(assessmentAnswers || {});
  const trackCounts: Partial<Record<TrackKey, number>> = {};
  if (answered.length === 0) {
    return { topTrack: null, trackCounts: {} };
  }
  answered.forEach((t) => {
    trackCounts[t] = (trackCounts[t] || 0) + 1;
  });
  let top: TrackKey | null = null;
  let max = 0;
  Object.entries(trackCounts).forEach(([t, c]) => {
    if (c && c > max) {
      max = c;
      top = t as TrackKey;
    }
  });
  return { topTrack: top, trackCounts };
}

export function computePsychometricAffinities(
  stream: StreamType,
  answersByStream: Record<StreamType, Record<number, TrackKey>>
) {
  const currentAnswers = answersByStream[stream] || {};
  const questions = STREAM_QUIZ_BANKS[stream] || [];
  const totalQuestions = questions.length || 6;

  const trackCounts: Partial<Record<TrackKey, number>> = {};
  Object.values(currentAnswers).forEach((track) => {
    trackCounts[track] = (trackCounts[track] || 0) + 1;
  });

  // Collect all tracks relevant to this stream bank so the radar/bar breakdown is always populated
  const streamTrackSet = new Set<TrackKey>();
  questions.forEach((q) => q.options.forEach((opt) => streamTrackSet.add(opt.track)));
  Object.keys(trackCounts).forEach((k) => streamTrackSet.add(k as TrackKey));

  const sortedAffinities = Array.from(streamTrackSet)
    .map((key) => {
      const count = trackCounts[key] || 0;
      const percentage = Math.round((count / totalQuestions) * 100);
      return {
        key,
        count,
        percentage,
        ...TRACK_DETAILS[key],
      };
    })
    .sort((a, b) => b.count - a.count);

  const defaultTrack: TrackKey =
    stream === "Science"
      ? "Med_Clinical"
      : stream === "Math"
      ? "AI"
      : "Biz_Fin";

  const topTrack: TrackKey =
    sortedAffinities.length > 0 && sortedAffinities[0].count > 0
      ? sortedAffinities[0].key
      : defaultTrack;

  return {
    trackCounts,
    sortedAffinities,
    topTrack,
    topTrackDetails: TRACK_DETAILS[topTrack],
  };
}

// ============================================================================
// 3. 4-YEAR COMPOUND TCO & GEOGRAPHIC LIVING CALCULATOR
// ============================================================================

const REGIONAL_CLUSTERS = [
  // Greater Cairo & Delta
  new Set([
    "القاهرة",
    "الجيزة",
    "القليوبية",
    "المنوفية",
    "الغربية",
    "الشرقية",
    "الدقهلية",
    "كفر الشيخ",
    "دمياط",
    "البحيرة",
    "الإسكندرية",
  ]),
  // Canal & Sinai
  new Set([
    "الإسماعيلية",
    "بورسعيد",
    "السويس",
    "شمال سيناء",
    "جنوب سيناء",
    "الشرقية",
    "دمياط",
  ]),
  // North & Middle Upper Egypt
  new Set([
    "الجيزة",
    "الفيوم",
    "بني سويف",
    "المنيا",
    "أسيوط",
  ]),
  // South Upper Egypt
  new Set([
    "أسيوط",
    "سوهاج",
    "قنا",
    "الأقصر",
    "أسوان",
    "الوادي الجديد",
    "البحر الأحمر",
  ]),
  // North Coast & Matrouh
  new Set([
    "الإسكندرية",
    "مطروح",
    "البحيرة",
  ]),
];

export function isRegionalNeighbor(govA: string, govB: string): boolean {
  if (!govA || !govB || govA === govB) return false;
  return REGIONAL_CLUSTERS.some((cluster) => cluster.has(govA) && cluster.has(govB));
}

export function computeFacultyTcoMetrics(
  f: Faculty,
  studentGov: string,
  livingMode: "commute" | "dorm",
  inflationRatePct: number
): TcoMetrics {
  const y1Base = f.y1_base_fee;
  const adminFee = f.admin_lab_fee || 900;
  const isRegularPublic = f.type === "حكومي انتظام";
  const isSameGov = f.gov === studentGov;
  const isNeighbor = !isSameGov && isRegionalNeighbor(studentGov, f.gov);

  let annualLiving: number;
  let geoTierLabel: string;
  let livingDesc: string;

  if (isSameGov) {
    annualLiving = 6000;
    geoTierLabel = "نطاق جغرافي (أ) — داخل المحافظة";
    livingDesc = "انتقال يومي محلي (~6,000 ج.م/سنة — بدون سكن)";
  } else if (livingMode === "commute" && isNeighbor) {
    annualLiving = 14500;
    geoTierLabel = "نطاق جغرافي (ب) — محافظات مجاورة";
    livingDesc = "خطوط نقل إقليمية يومية (~14,500 ج.م/سنة)";
  } else {
    annualLiving = 32000;
    geoTierLabel = isNeighbor
      ? "نطاق جغرافي (ب) — إقامة طلابية"
      : "نطاق جغرافي (ج) — اغتراب كامل";
    livingDesc = "سكن طلابي وإعاشة وانتقالات (~32,000 ج.م/سنة)";
  }

  // Duration in academic years: Prioritize specified duration_years or standard professional degrees (5 years for Engineering/Medicine)
  const defaultProfessionalYears =
    f.name.includes("هندسة") || f.name.includes("طب") ? 5 : 4;
  const years = f.duration_years || defaultProfessionalYears;

  const rate = Math.max(0, inflationRatePct) / 100;
  // Compute tuition compounding over the actual program duration (4 or 5 years)
  let compoundFactor = 0;
  for (let yr = 0; yr < years; yr++) {
    compoundFactor += isRegularPublic ? 1 + yr * 0.03 : Math.pow(1 + rate, yr);
  }

  const tuition4Yr = Math.round(y1Base * compoundFactor);
  const admin4Yr = Math.round(adminFee * (isRegularPublic ? years * 1.05 : years * 1.15));
  const living4Yr = Math.round(annualLiving * (1 + rate * 0.5) * years);
  const total4Yr = tuition4Yr + admin4Yr + living4Yr;

  const basePct = Math.max(8, Math.round((tuition4Yr / total4Yr) * 100));
  const adminPct = Math.max(5, Math.round((admin4Yr / total4Yr) * 100));
  const livingPct = Math.max(8, 100 - basePct - adminPct);

  return {
    y1Base,
    adminFee,
    annualLiving,
    geoTierLabel,
    livingDesc,
    tuition4Yr,
    admin4Yr,
    living4Yr,
    total4Yr,
    basePct,
    adminPct,
    livingPct,
  };
}

// ============================================================================
// 4. WEIGHTED RANKING & EXPLAINABLE AI EVALUATION ENGINE
// ============================================================================

const ARTS_COMPATIBLE_TRACKS = new Set<TrackKey>([
  "Biz_Fin",
  "Econ_Pol",
  "Lang_Trans",
  "Media_Law",
  "Edu_Human",
]);

function isFacultyEligibleForStream(f: Faculty, stream: StreamType): boolean {
  if (stream === "stem") {
    // STEM students are eligible for both Science and Math colleges
    return f.stream === "Science" || f.stream === "Math" || f.stream === "Both";
  }
  if (f.stream === stream) return true;
  if (f.stream === "Both") {
    if (stream === "Arts") {
      // Arts students match shared faculties in Business/BIS, Economics, Al-Alsun, Media, Education, Law, GIS, Tourism
      return f.tracks.some((t) => ARTS_COMPATIBLE_TRACKS.has(t));
    }
    // Science and Math students match shared Tech/CS/AI/Science/Business faculties
    return true;
  }
  return false;
}

const SECTOR_ALL = "الكل";

function isAllSectors(v: string | undefined | null): boolean {
  return !v || v === SECTOR_ALL || v.toLowerCase() === "all";
}

function sectorMatches(facultyType: string, filter: string): boolean {
  if (facultyType === filter) return true;
  // زر "جامعات أهلية" يغطي كل أنواع الأهلية (منبثقة، دولية...)
  if (filter === "جامعات أهلية") return facultyType.startsWith("جامعات أهلية");
  return false;
}

export function evaluateAndRankFaculties(params: {
  stream: StreamType;
  score: number;
  budget: number;
  gov: string;
  tansikShift: number;
  sectorFilter: string;
  trackCounts: Partial<Record<TrackKey, number>>;
}): EvaluationResult {
  const {
    stream,
    score,
    budget,
    gov,
    tansikShift,
    sectorFilter,
    trackCounts,
  } = params;

  const streamFaculties = FACULTIES_DATABASE.filter((f) =>
    isFacultyEligibleForStream(f, stream)
  );

  const sectorFiltered = streamFaculties.filter((f) => {
    if (isAllSectors(sectorFilter)) return true;
    return sectorMatches(f.type, sectorFilter);
  });

  // Compute minimum budget needed for score-eligible faculties (used for zero-match auto-recovery)
  const scoreEligibleUnfiltered = streamFaculties.filter(
    (f) => +(f.cutoff_2026 + tansikShift).toFixed(1) <= score + 0.8
  );
  const minNeededBudget =
    scoreEligibleUnfiltered.length > 0
      ? Math.max(
          5000,
          Math.ceil(
            Math.min(...scoreEligibleUnfiltered.map((f) => f.y1_base_fee)) /
              5000
          ) * 5000
        )
      : 30000;

  const matched = sectorFiltered.filter((f) => {
    const shiftedCutoff = +(f.cutoff_2026 + tansikShift).toFixed(1);
    const scoreReachable = shiftedCutoff <= score + 0.8;
    const budgetReachable = budget === 0 ? f.y1_base_fee <= 3000 : f.y1_base_fee <= budget;
    return scoreReachable && budgetReachable;
  });

  const allRanked: RankedFaculty[] = matched
    .map((f) => {
      const shiftedCutoff = +(f.cutoff_2026 + tansikShift).toFixed(1);
      const margin = +(score - shiftedCutoff).toFixed(1);
      const scoreGap = Math.abs(score - shiftedCutoff);

      // 1. ScoreProximity (Weight: 0.40) -> 100% when student qualifies (score >= cutoff); penalizes only if score < cutoff
      const scoreProximity =
        score >= shiftedCutoff
          ? 100
          : Math.max(10, Math.round(100 - (shiftedCutoff - score) * 12.0));

      // 2. QuizAffinity (Weight: 0.35) -> Matches student's psychometric track counts
      let rawAffinity = 0;
      f.tracks.forEach((tr, idx) => {
        const weight = idx === 0 ? 22 : idx === 1 ? 14 : 8;
        rawAffinity += (trackCounts[tr] || 0) * weight;
      });
      const quizAffinity = Math.min(100, Math.max(25, Math.round((rawAffinity / 80) * 100)));

      // 3. BudgetFit (Weight: 0.15) -> Rewards financial comfort within max budget
      const effectiveBudget = budget === 0 ? 3000 : budget;
      const feeRatio = f.y1_base_fee / Math.max(1, effectiveBudget);
      const budgetFit = Math.max(30, Math.round((1 - feeRatio * 0.45) * 100));

      // 4. Enforce Geographic Distribution (نطاق أ، نطاق ب، نطاق ج)
      const isLocal = f.gov === gov;
      const isNeighbor = !isLocal && isRegionalNeighbor(gov, f.gov);
      const geoProximity = isLocal ? 100 : isNeighbor ? 65 : 30;
      const geoZone = isLocal ? "نطاق أ" : isNeighbor ? "نطاق ب" : "نطاق ج";

      // Honest mathematical calculation (0-100%) without artificial lower clamp
      const matchScore = Math.min(
        100,
        Math.max(
          0,
          Math.round(
            0.4 * scoreProximity +
              0.35 * quizAffinity +
              0.15 * budgetFit +
              0.1 * geoProximity
          )
        )
      );

      const stemNote =
        stream === "stem"
          ? "يخضع قبول مدارس STEM لقاعدة النسبة المرنة (المقاعد المخصصة مقارنة بعدد المتقدمين)، ولا يقاس بالحد الأدنى للثانوية العامة."
          : undefined;

      let groupKey: "target" | "safe" | "fallback";
      let safetyBadge: { label: string; style: string };

      const formattedMargin =
        margin >= 0 ? `+${margin.toFixed(1)}%` : `${margin.toFixed(1)}%`;

      if (margin >= -0.8 && margin < 2.0) {
        groupKey = "target";
        safetyBadge = {
          label: `نطاق مستهدف (${formattedMargin})`,
          style: "bg-amber-50 text-blue-800 border-amber-200",
        };
      } else if (margin >= 2.0 && scoreGap <= 11.0) {
        groupKey = "safe";
        safetyBadge = {
          label: `نطاق آمن (${formattedMargin})`,
          style: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      } else {
        groupKey = "fallback";
        safetyBadge = {
          label: `بديل استراتيجي (${formattedMargin})`,
          style: "bg-slate-100 text-slate-700 border-slate-300",
        };
      }

      const primaryTrackTitle =
        TRACK_DETAILS[f.tracks[0]]?.title || "المسار الأكاديمي المختار";
      const geoNote = isLocal
        ? `داخل نطاق محافظتك (${gov}) مما يوفر تكلفة السكن المغترب`
        : `في محافظة ${f.gov} ضمن سقف ميزانيتك السنوية`;

      const whyMatch = `توافق قوي مع ميولك في «${primaryTrackTitle}»، وحد القبول (${shiftedCutoff.toFixed(
        1
      )}%) مناسب لمجموعك الفعلي (${score.toFixed(1)}%) ${geoNote}.`;

      return {
        ...f,
        shiftedCutoff,
        margin,
        matchScore,
        geoZone,
        stemNote,
        groupKey,
        safetyBadge,
        whyMatch,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return {
    allRanked,
    targetGroup: allRanked.filter((f) => f.groupKey === "target"),
    safeGroup: allRanked.filter((f) => f.groupKey === "safe"),
    fallbackGroup: allRanked.filter((f) => f.groupKey === "fallback"),
    minNeededBudget,
  };
}

// ============================================================================
// 5. DETERMINISTIC ACADEMIC SUMMARY HELPER
// ============================================================================

export function generateAcademicSummary(
  top1: Faculty | undefined,
  score: number,
  stream: StreamType,
  gov: string
): string {
  if (!top1) return "لا توجد كليات مطابقة حالياً للمعايير المحددة.";
  const streamName =
    stream === "Math"
      ? "علمي رياضة"
      : stream === "Science"
      ? "علمي علوم"
      : stream === "stem"
      ? "STEM"
      : "أدبي";
  return `الترشيح الأبرز لملفك الأكاديمي (${score.toFixed(
    1
  )}% — ${streamName} — ${gov}): ${top1.name} — ${top1.university} (${
    top1.type
  }) بمصروفات أساسية ${top1.y1_base_fee.toLocaleString()} ج.م.`;
}

export function computeFacultyTcoWithScholarship(
  faculty: Faculty,
  studentGov: string,
  livingMode: "commute" | "dorm",
  inflationPct: number,
  studentScore: number
): TcoMetrics {
  const base = computeFacultyTcoMetrics(faculty, studentGov, livingMode, inflationPct);
  const pct =
    studentScore > 0
      ? estimateFacultyScholarshipPct(faculty.type, studentScore, base.y1Base)
      : 0;
  const discount4Yr = Math.round(base.tuition4Yr * (pct / 100));
  return {
    ...base,
    scholarshipCoveragePct: pct,
    scholarshipDiscount4Yr: discount4Yr,
    remainingFamily4Yr: Math.max(0, base.total4Yr - discount4Yr),
  };
}
