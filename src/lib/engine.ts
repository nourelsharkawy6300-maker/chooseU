import {
  EvaluationResult,
  Faculty,
  RankedFaculty,
  StreamType,
  TcoMetrics,
  TrackKey,
} from "../types/chooseu";
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

const ADJACENT_DELTA_CAIRO_GOVS = new Set([
  "المنوفية",
  "القليوبية",
  "الغربية",
  "القاهرة",
  "الجيزة",
  "الدقهلية",
  "الشرقية",
  "كفر الشيخ",
]);

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
  const isRegionalNeighbor =
    !isSameGov &&
    ADJACENT_DELTA_CAIRO_GOVS.has(studentGov) &&
    ADJACENT_DELTA_CAIRO_GOVS.has(f.gov);

  let annualLiving: number;
  let geoTierLabel: string;
  let livingDesc: string;

  if (isSameGov) {
    annualLiving = 6000;
    geoTierLabel = "نطاق جغرافي (أ) — داخل المحافظة";
    livingDesc = "انتقال يومي محلي (~6,000 ج.م/سنة — بدون سكن)";
  } else if (livingMode === "commute" && isRegionalNeighbor) {
    annualLiving = 14500;
    geoTierLabel = "نطاق جغرافي (ب) — محافظات مجاورة";
    livingDesc = "خطوط نقل إقليمية يومية (~14,500 ج.م/سنة)";
  } else {
    annualLiving = 32000;
    geoTierLabel = isRegionalNeighbor
      ? "نطاق جغرافي (ب) — إقامة طلابية"
      : "نطاق جغرافي (ج) — اغتراب كامل";
    livingDesc = "سكن طلابي وإعاشة وانتقالات (~32,000 ج.م/سنة)";
  }

  const rate = Math.max(0, inflationRatePct) / 100;
  // Regular public university tuition has minimal administrative adjustment (~3% yr); private/national/credit compounds by inflationRatePct
  const compoundFactor = isRegularPublic
    ? 4.12
    : 1 + (1 + rate) + Math.pow(1 + rate, 2) + Math.pow(1 + rate, 3);

  const tuition4Yr = Math.round(y1Base * compoundFactor);
  const admin4Yr = Math.round(adminFee * 4.15);
  const living4Yr = Math.round(annualLiving * (1 + rate * 0.6) * 4);
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
  "Data",
]);

function isFacultyEligibleForStream(f: Faculty, stream: StreamType): boolean {
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
    if (!sectorFilter || sectorFilter === "الكل") return true;
    return f.type === sectorFilter;
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
    const budgetReachable = f.y1_base_fee <= budget;
    return scoreReachable && budgetReachable;
  });

  const allRanked: RankedFaculty[] = matched
    .map((f) => {
      const shiftedCutoff = +(f.cutoff_2026 + tansikShift).toFixed(1);
      const margin = +(score - shiftedCutoff).toFixed(1);
      const scoreGap = Math.abs(score - shiftedCutoff);

      // 1. ScoreProximity (Weight: 0.40) -> Peaks when cutoff is close to student's score
      const scoreProximity = Math.max(10, 100 - scoreGap * 4.6);

      // 2. QuizAffinity (Weight: 0.35) -> Matches student's psychometric track counts
      let rawAffinity = 0;
      f.tracks.forEach((tr, idx) => {
        const weight = idx === 0 ? 22 : idx === 1 ? 14 : 8;
        rawAffinity += (trackCounts[tr] || 0) * weight;
      });
      const quizAffinity = Math.min(100, Math.max(25, Math.round((rawAffinity / 80) * 100)));

      // 3. BudgetFit (Weight: 0.15) -> Rewards financial comfort within max budget
      const feeRatio = f.y1_base_fee / Math.max(1, budget);
      const budgetFit = Math.max(30, Math.round((1 - feeRatio * 0.45) * 100));

      // 4. GeoProximity (Weight: 0.10) -> Local governorate bonus
      const isLocal = f.gov === gov;
      const geoProximity = isLocal ? 100 : 50;

      // Exact Weighted Formula: MatchScore = (0.40 * ScoreProximity) + (0.35 * QuizAffinity) + (0.15 * BudgetFit) + (0.10 * GeoProximity)
      const matchScore = Math.min(
        99,
        Math.max(
          71,
          Math.round(
            0.4 * scoreProximity +
              0.35 * quizAffinity +
              0.15 * budgetFit +
              0.1 * geoProximity
          )
        )
      );

      let groupKey: "target" | "safe" | "fallback";
      let safetyBadge: { label: string; style: string };

      if (margin >= -0.8 && margin < 2.0 && f.type === "حكومي انتظام") {
        groupKey = "target";
        safetyBadge = {
          label:
            margin >= 0
              ? `نطاق مستهدف (+${margin.toFixed(1)}%)`
              : `نطاق مستهدف (${margin.toFixed(1)}%)`,
          style: "bg-blue-50 text-blue-800 border-blue-200",
        };
      } else if (margin >= 2.0 && scoreGap <= 11.0 && f.type === "حكومي انتظام") {
        groupKey = "safe";
        safetyBadge = {
          label: `نطاق آمن (+${margin.toFixed(1)}%)`,
          style: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      } else {
        groupKey = "fallback";
        safetyBadge = {
          label: `بديل استراتيجي (+${margin.toFixed(1)}%)`,
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
// 5. CONTEXT-AWARE ARABIC ADVISOR COPILOT ENGINE
// ============================================================================

export function generateCopilotResponse(
  question: string,
  ctx: {
    studentName: string;
    stream: StreamType;
    score: number;
    budget: number;
    gov: string;
    evaluation: EvaluationResult;
    topTrackTitle: string;
    livingMode: "commute" | "dorm";
    inflationScenario: number;
  }
): string {
  const q = question.trim().toLowerCase();
  const namePrefix = ctx.studentName.trim()
    ? `يا ${ctx.studentName.trim().split(" ")[0]}، `
    : "";
  const top1 = ctx.evaluation.allRanked[0];
  const top2 = ctx.evaluation.allRanked[1];

  if (!top1) {
    return `${namePrefix}بناءً على مجموعك الحالي (${ctx.score.toFixed(
      1
    )}%) وسقف الميزانية (${ctx.budget.toLocaleString()} ج.م)، لا توجد كليات مطابقة حالياً. أنصحك برفع سقف الميزانية إلى ${ctx.evaluation.minNeededBudget.toLocaleString()} ج.م أو تفعيل كافة القطاعات الجامعية لفتح البدائل الاستراتيجية المناسبة لمجموعك.`;
  }

  const top1Tco = computeFacultyTcoMetrics(
    top1,
    ctx.gov,
    ctx.livingMode,
    ctx.inflationScenario
  );

  // 1. GPA & Internal Specialization Risk Questions
  if (
    q.includes("gpa") ||
    q.includes("معدل") ||
    q.includes("تخصص") ||
    q.includes("تشعيب") ||
    q.includes("شرط") ||
    q.includes("لائحة")
  ) {
    return `${namePrefix}بالنسبة لشروط التخصص الداخلي في أعلى ترشيحاتك (${top1.name} — ${top1.university}):\n• الشرط الأكاديمي: ${top1.gpa_requirement}.\n• ملاحظة اللائحة: ${top1.bylaw_notes}\n• نصيحة المستشار: ركز في الفصل الدراسي الأول على مواد التأسيس والرياضيات/العلوم الأساسية لتأمين معدل تراكمي فوق 3.0 والحصول على أولوية التشعيب والمنح.`;
  }

  // 2. What-If Budget / Tuition / Housing / TCO Questions
  if (
    q.includes("مصاريف") ||
    q.includes("تكلف") ||
    q.includes("ميزاني") ||
    q.includes("سكن") ||
    q.includes("تضخم") ||
    q.includes("فلوس") ||
    q.includes("لو")
  ) {
    const secondComparison = top2
      ? `\n• المقارنة مع الترشيح الثاني (${top2.name} — ${top2.university}): مصروفاته الأساسية ${top2.y1_base_fee.toLocaleString()} ج.م/سنة.`
      : "";
    return `${namePrefix}التدقيق المالي لترشيحك الأول (${top1.name} — ${top1.university}) تحت سيناريو تضخم ${ctx.inflationScenario}%:\n• مصروفات السنة الأولى الأساسية: ${top1.y1_base_fee.toLocaleString()} ج.م (+${top1.admin_lab_fee.toLocaleString()} ج.م رسوم معملية).\n• تكلفة الإقامة والانتقال (${ctx.gov}): ${top1Tco.livingDesc}.\n• إجمالي التكلفة التراكمية لـ 4 سنوات شاملة المعيشة: ${top1Tco.total4Yr.toLocaleString()} ج.م.${secondComparison}`;
  }

  // 3. Future Career, Salaries & Market Demand Questions
  if (
    q.includes("مستقبل") ||
    q.includes("وظيف") ||
    q.includes("شغل") ||
    q.includes("مرتب") ||
    q.includes("راتب") ||
    q.includes("سوق")
  ) {
    return `${namePrefix}تحليل المسار الوظيفي لـ «${top1.name}» (${ctx.topTrackTitle}):\n• الطلب في سوق العمل: ${top1.future_career.market_demand}.\n• متوسط الرواتب المتوقع في مصر: ${top1.future_career.salary_range_egp}.\n• أبرز المسميات الوظيفية: ${top1.future_career.roles.join("، ")}.\n• التدرج الوظيفي: ${top1.future_career.progression}.`;
  }

  // 4. Default Comprehensive Recommendation Summary
  return `${namePrefix}بناءً على مجموعك (${ctx.score.toFixed(
    1
  )}%) وميولك المتصدرة في «${ctx.topTrackTitle}»، إليك ملخص التوجيه الاستراتيجي (${formatFacultyCount(
    ctx.evaluation.allRanked.length
  )}):\n1. الترشيح الأول (${top1.matchScore}% توافق): ${top1.name} — ${top1.university} (${top1.type} • حد قبول ${top1.shiftedCutoff.toFixed(
    1
  )}% • مصروفات ${top1.y1_base_fee.toLocaleString()} ج.م/سنة).\n${
    top2
      ? `2. الترشيح الثاني (${top2.matchScore}% توافق): ${top2.name} — ${top2.university} (${top2.type} • حد قبول ${top2.shiftedCutoff.toFixed(
          1
        )}% • مصروفات ${top2.y1_base_fee.toLocaleString()} ج.م/سنة).\n`
      : ""
  }3. نصيحة التنسيق: ضع كليات النطاق المستهدف في صدارة رغباتك، وأمّن اختياراتك ببديل من النطاق الآمن أو البرامج الخاصة داخل محافظة ${ctx.gov} لتوفير تكلفة السكن والاغتراب.`;
}