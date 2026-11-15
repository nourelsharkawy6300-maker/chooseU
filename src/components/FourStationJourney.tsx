"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  SlidersHorizontal,
  Compass,
  MessageSquare,
  FileText,
  Printer,
  Share2,
  HelpCircle,
  TrendingUp,
  Award,
  Layers,
  Send,
  X,
  ExternalLink,
} from "lucide-react";
import {
  StreamType,
  TrackKey,
  LivingMode,
  Faculty,
  RankedFaculty,
} from "@/types/chooseu";
import { FACULTIES_DATABASE, EGYPT_GOVERNORATES, TRACK_DETAILS } from "@/data/faculties-db";

// ============================================================================
// TYPES & PROPS
// ============================================================================

export interface FourStationJourneyProps {
  initialStudentName?: string;
  initialStream?: StreamType;
  initialScore?: number;
  initialBudget?: number;
  initialGov?: string;
  initialLivingMode?: LivingMode;
  onOpenFacultyDrawer?: (faculty: Faculty) => void;
  onSelectView?: (view: string) => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

// 4 Focused Psychometric Questions for Station 1
const ASSESSMENT_QUESTIONS = [
  {
    id: 1,
    question: "نوع المشكلات والتحديات التي تستمتع بقضاء وقت طويل في تحليلها وحلها:",
    options: [
      {
        label: "تطوير البرمجيات والأنظمة الذكية، تحليل الخوارزميات والأمن السيبراني",
        track: "AI" as TrackKey,
        badge: "تقني وبرمجي",
      },
      {
        label: "التشخيص الطبي، فهم فسيولوجيا الجسم البشري ورعاية الحالات الصحية",
        track: "Med_Clinical" as TrackKey,
        badge: "طبي وإكلينيكي",
      },
      {
        label: "التصميم المعماري، الحسابات الهندسية، الميكانيكا وتفكيك الأجهزة",
        track: "Arch_Civil" as TrackKey,
        badge: "هندسي وتطبيقي",
      },
      {
        label: "التحليل المالي، إدارة واستثمار الشركات، التفاوض وريادة الأعمال",
        track: "Biz_Fin" as TrackKey,
        badge: "أعمال واقتصاد",
      },
    ],
  },
  {
    id: 2,
    question: "البيئة المهنية التي تتخيل نفسك تعمل وتبدع فيها بعد التخرج:",
    options: [
      {
        label: "شركات التكنولوجيا العالمية أو العمل الحر دولياً عن بُعد (Remote)",
        track: "SE" as TrackKey,
        badge: "شركات دولية",
      },
      {
        label: "المستشفيات الجامعية الكبرى، العيادات والمراكز البحثية والدوائية",
        track: "Pharma_Chem" as TrackKey,
        badge: "مراكز صحية",
      },
      {
        label: "المكاتب الهندسية الاستشارية، المصانع الذكية ومواقع المشاريع الكبرى",
        track: "Hardware" as TrackKey,
        badge: "مواقع واستشارات",
      },
      {
        label: "البنوك الاستثمارية، المؤسسات الدولية، أو إطلاق شركتك الخاصة",
        track: "Econ_Pol" as TrackKey,
        badge: "استثمار وريادة",
      },
    ],
  },
  {
    id: 3,
    question: "أسلوبك المفضل في اكتساب المهارات والتفوق الدراسي:",
    options: [
      {
        label: "التجربة العملية المباشرة، بناء المشاريع وحل المشكلات التجريدية",
        track: "Cyber" as TrackKey,
        badge: "تطبيقي وتجريبي",
      },
      {
        label: "الدراسة السريرية المنضبطة، مراجعة الحالات وحفظ البروتوكولات الطبية",
        track: "Rehab_PT" as TrackKey,
        badge: "سريري ومنهجي",
      },
      {
        label: "الحسابات الفيزيائية، النمذجة الرياضية واختبار المتانة الإنشائية",
        track: "Data" as TrackKey,
        badge: "رياضي وحسابي",
      },
      {
        label: "النقاش الفكري، صياغة الاستراتيجيات، والبحث الاقتصادي المقارن",
        track: "Media_Law" as TrackKey,
        badge: "استراتيجي وإنساني",
      },
    ],
  },
  {
    id: 4,
    question: "المسار التكنولوجي المستقبلي الذي يثير شغفك في عصر 2030+:",
    options: [
      {
        label: "نماذج الذكاء الاصطناعي، الحوسبة السحابية وحماية البيانات السيبرانية",
        track: "AI" as TrackKey,
        badge: "AI & Cloud",
      },
      {
        label: "الهندسة الوراثية والبيوتكنولوجي والأجهزة التعويضية الدقيقة",
        track: "Bio_Tech" as TrackKey,
        badge: "Biotech & Genomics",
      },
      {
        label: "المدن الذكية المستدامة، إنترنت الأشياء والروبوتات الصناعية",
        track: "Hardware" as TrackKey,
        badge: "Robotics & Smart Cities",
      },
      {
        label: "التكنولوجيا المالية (FinTech) والتجارة الرقمية وسلاسل الإمداد",
        track: "Biz_Fin" as TrackKey,
        badge: "FinTech & Digital Commerce",
      },
    ],
  },
];

export function FourStationJourney({
  initialStudentName = "عمر خالد محمود",
  initialStream = "Math",
  initialScore = 83.5,
  initialBudget = 65000,
  initialGov = "المنوفية",
  initialLivingMode = "commute",
  onOpenFacultyDrawer,
}: FourStationJourneyProps) {
  // Current Station: 1 (Discover), 2 (Match), 3 (Simulate), 4 (Decide)
  const [station, setStation] = useState<1 | 2 | 3 | 4>(1);

  // Station 1 Internal View: "assessment" | "profile"
  const [station1SubView, setStation1SubView] = useState<"assessment" | "profile">("assessment");
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<number, TrackKey>>({
    1: "AI",
    2: "SE",
    3: "Cyber",
    4: "AI",
  });
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState(false);

  // Student Profile State
  const [studentName, setStudentName] = useState(initialStudentName);
  const [stream, setStream] = useState<StreamType>(initialStream);
  const [score, setScore] = useState<number>(initialScore);
  const [budget, setBudget] = useState<number>(initialBudget);
  const [governorate, setGovernorate] = useState(initialGov);
  const [livingMode, setLivingMode] = useState<LivingMode>(initialLivingMode);

  // Station 2 State (Match)
  const [explainFaculty, setExplainFaculty] = useState<RankedFaculty | null>(null);
  const [comparedFacultyIds, setComparedFacultyIds] = useState<string[]>([
    "menofia-ai-public",
    "menofia-cs-public",
  ]);
  const [selectedClusterFilter, setSelectedClusterFilter] = useState<string>("all");

  // Station 3 State (Simulate)
  const [tansikShift, setTansikShift] = useState<number>(0.0);
  const [scoreTweak, setScoreTweak] = useState<number>(0.0);
  const [activeRoadmapYear, setActiveRoadmapYear] = useState<number>(1);

  // Station 4 State (Decide - Chat & Report)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: `أهلاً بك يا ${studentName}! أنا رفيقك الأكاديمي المباشر في منصة ChooseU. راجعت بياناتك (شعبة ${
        stream === "Science" ? "علمي علوم" : stream === "Math" ? "علمي رياضة" : "أدبي"
      } بمجموع ${score}% من محافظة ${governorate}). كيف أساعدك في اتخاذ قرارك النهائي اليوم؟`,
      timestamp: "12:00 م",
    },
  ]);
  const [inputQuestion, setInputQuestion] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  // ============================================================================
  // DERIVED DATA & COMPUTATIONS
  // ============================================================================

  // Dominant track calculated from assessment answers
  const dominantTrack = useMemo<TrackKey>(() => {
    const counts: Record<string, number> = {};
    Object.values(assessmentAnswers).forEach((t) => {
      counts[t] = (counts[t] || 0) + 1;
    });
    let top = "AI";
    let max = 0;
    Object.entries(counts).forEach(([t, c]) => {
      if (c > max) {
        max = c;
        top = t;
      }
    });
    return top as TrackKey;
  }, [assessmentAnswers]);

  const budgetTiers = useMemo(() => {
    let maxGov = 0;
    let maxAhli = 0;
    let maxPrivate = 0;

    for (const f of FACULTIES_DATABASE) {
      const fee = f.y1_base_fee ?? 0;
      if (f.type.includes("حكومي")) {
        if (fee > maxGov) maxGov = fee;
      }
      if (f.type.includes("أهلي")) {
        if (fee > maxAhli) maxAhli = fee;
      }
      if (f.type.includes("خاص") || f.type.includes("دولي")) {
        if (fee > maxPrivate) maxPrivate = fee;
      }
    }

    return [
      { label: "حكومي", amount: maxGov },
      { label: "أهلي", amount: maxAhli },
      { label: "خاص ودولي", amount: maxPrivate },
    ];
  }, []);

  // Ranked Faculties Engine
  const rankedFaculties = useMemo<RankedFaculty[]>(() => {
    const effectiveScore = +(score + scoreTweak).toFixed(2);

    return FACULTIES_DATABASE.filter((f) => {
      if (f.stream !== "Both" && f.stream !== stream) return false;
      return true;
    }).map((f) => {
      const shiftedCutoff = +(f.cutoff_2026 + tansikShift).toFixed(2);
      const margin = +(effectiveScore - shiftedCutoff).toFixed(2);

      let groupKey: "target" | "safe" | "fallback" = "target";
      let safetyBadge = {
        label: "واقعية متوازنة",
        style: "bg-blue-50 text-blue-800 border-blue-200",
      };

      if (margin >= 1.5) {
        groupKey = "safe";
        safetyBadge = {
          label: "فرصة مضمونة (آمنة)",
          style: "bg-emerald-50 text-emerald-800 border-emerald-200",
        };
      } else if (margin < -1.0) {
        groupKey = "fallback";
        safetyBadge = {
          label: "طموحة / مسار بديل",
          style: "bg-purple-50 text-purple-800 border-purple-200",
        };
      }

      // Calculate Algorithmic Match Score (0 - 100)
      let matchScore = 70;
      if (margin >= 0) matchScore += Math.min(15, margin * 4);
      if (f.gov === governorate) matchScore += 10;
      if (f.tracks.includes(dominantTrack)) matchScore += 15;
      if (f.y1_base_fee <= budget) matchScore += 5;
      matchScore = Math.min(99, Math.max(50, Math.round(matchScore)));

      const whyMatch = `توافق بنسبة ${matchScore}% بناءً على مجموعك (${effectiveScore}%) مقارنة بتنسيقها (${shiftedCutoff}%)، ومطابقتها لميولك في مسار ${
        TRACK_DETAILS[dominantTrack]?.title || "الذكاء الاصطناعي"
      }، ونطاقك الجغرافي (${f.gov}).`;

      return {
        ...f,
        shiftedCutoff,
        margin,
        matchScore,
        groupKey,
        safetyBadge,
        whyMatch,
      };
    }).sort((a, b) => b.matchScore - a.matchScore);
  }, [score, scoreTweak, stream, tansikShift, governorate, dominantTrack, budget]);

  // Safe, Target, and Fallback Groups
  const safeFaculties = useMemo(
    () => rankedFaculties.filter((f) => f.groupKey === "safe"),
    [rankedFaculties]
  );
  const targetFaculties = useMemo(
    () => rankedFaculties.filter((f) => f.groupKey === "target"),
    [rankedFaculties]
  );
  const fallbackFaculties = useMemo(
    () => rankedFaculties.filter((f) => f.groupKey === "fallback"),
    [rankedFaculties]
  );

  // Compared Faculties List
  const comparedFaculties = useMemo(
    () => rankedFaculties.filter((f) => comparedFacultyIds.includes(f.id)),
    [rankedFaculties, comparedFacultyIds]
  );

  // Handlers
  const handleAnswerQuestion = (qId: number, track: TrackKey) => {
    setAssessmentAnswers((prev) => {
      const next = { ...prev, [qId]: track };
      // Check if all 4 questions are answered
      const answeredCount = Object.keys(next).length;
      if (answeredCount >= 4) {
        setHasCompletedAssessment(true);
        // Immediate deterministic view transition
        setStation1SubView("profile");
      }
      return next;
    });
  };

  const handleToggleCompare = (fId: string) => {
    setComparedFacultyIds((prev) => {
      if (prev.includes(fId)) {
        return prev.filter((id) => id !== fId);
      }
      if (prev.length >= 3) {
        return [prev[1], prev[2], fId];
      }
      return [...prev, fId];
    });
  };

  const handleSendMessage = () => {
    if (!inputQuestion.trim()) return;

    const userText = inputQuestion.trim();
    const newMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: userText,
      timestamp: "الآن",
    };

    const streamTitle =
      stream === "Math"
        ? "علمي رياضة"
        : stream === "Science"
        ? "علمي علوم"
        : stream === "stem"
        ? "STEM"
        : "أدبي";

    let reply = `بناءً على ملفك الأكاديمي (مجموع ${score}% بشعبة ${streamTitle}) وميولك في ${TRACK_DETAILS[dominantTrack]?.title}: `;

    if (userText.includes("ساعات معتمدة") || userText.includes("أهلي")) {
      reply += `البرامج الأهلية والساعات المعتمدة توفر لك نفس الاعتماد الأكاديمي بحدود قبول أقل، مع ميزة الأعداد الأقل وتحديث اللوائح (مثل إمكانية التخرج في 4 سنوات لبعض كليات الهندسة)، وتكلفتها السنوية ضمن حدود ميزانيتك المقدرة بـ ${budget.toLocaleString()} ج.م.`;
    } else if (userText.includes("ترتيب") || userText.includes("رغبات")) {
      reply += `ننصحك ببدء بطاقة الرغبات بـ 15 رغبة طموحة تليها 35 رغبة واقعية متوازنة تناسب مجموعك، ثم 25 رغبة كشبكة أمان في نطاقك الجغرافي (${governorate}).`;
    } else if (userText.includes("سفر") || userText.includes("دول") || userText.includes("مرتب")) {
      reply += `المسارات التقنية والهندسية توفر فرص عمل واعدة في السوق المحلي والإقليمي، بمتوسط رواتب أولية تتراوح بين 15,000 و 30,000 ج.م شهرياً مع إمكانية التدرج للعمل مع شركات إقليمية ودولية.`;
    } else {
      reply += `اختيارك لكلية تقع في نطاقك الجغرافي (نطاق أ) يوفر عليك ما يقارب 30,000 إلى 40,000 ج.م سنوياً من تكلفة السكن الجامعي والاغتراب، مما يتيح لك استثمار هذا الفائض في التدريب والشهادات المهنية المعتمدة.`;
    }

    setChatMessages((prev) => [
      ...prev,
      newMsg,
      {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: reply,
        timestamp: "الآن",
      },
    ]);
    setInputQuestion("");
  };

  return (
    <div className="w-full bg-slate-50 text-slate-900 pb-24">
      {/* ==================================================================== */}
      {/* 1. STICKY OBSIDIAN 4-STATION STEPPER BAR                             */}
      {/* ==================================================================== */}
      <div className="sticky top-0 z-30 bg-white/95 border-b border-slate-200 px-4 py-3.5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Brand & Active Station Indicator */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center p-1.5 shrink-0">
              <Compass className="w-4 h-4 text-blue-600 stroke-[1.5]" />
            </div>
            <div>
              <div className="text-[13px] font-bold text-slate-900">
                المحطة {station} من 4:{" "}
                <span className="text-blue-600">
                  {station === 1 && "اكتشف"}
                  {station === 2 && "طابق"}
                  {station === 3 && "حاكِ"}
                  {station === 4 && "قرّر"}
                </span>
              </div>
            </div>
          </div>

          {/* Stepper Buttons (1, 2, 3, 4) */}
          <div className="w-full sm:w-auto grid grid-cols-4 sm:flex sm:items-center gap-1 sm:gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-[11px] sm:text-[12px]">
            {[
              { id: 1 as const, title: "01 الاكتشاف", short: "اكتشف", icon: Compass },
              { id: 2 as const, title: "02 المطابقة", short: "طابق", icon: Layers },
              { id: 3 as const, title: "03 المحاكاة", short: "حاكِ", icon: SlidersHorizontal },
              { id: 4 as const, title: "04 القرار", short: "قرّر", icon: MessageSquare },
            ].map((st) => {
              const isActive = station === st.id;
              const isPassed = station > st.id;
              const IconComp = st.icon;

              return (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStation(st.id)}
                  className={`flex items-center justify-center gap-1 sm:gap-1.5 px-1.5 sm:px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-center ${
                    isActive
                      ? "bg-blue-600 text-white font-bold shadow-xs"
                      : isPassed
                      ? "text-emerald-700 bg-white/70 hover:bg-white"
                      : "text-slate-400 hover:text-slate-600 hover:bg-white/40"
                  }`}
                >
                  {isPassed ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 stroke-[2] shrink-0" />
                  ) : (
                    <IconComp
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isActive ? "text-white stroke-[2]" : "text-slate-400 stroke-[1.5]"
                      }`}
                    />
                  )}
                  <span className="hidden sm:inline">{st.title}</span>
                  <span className="sm:hidden">{st.short}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 2. MAIN WORKSPACE VIEWPORT                                           */}
      {/* ==================================================================== */}
      <main className="px-4 sm:px-6 py-8 space-y-8">
        <AnimatePresence mode="wait">
          {/* ================================================================== */}
          {/* STATION 1: DISCOVER (اكتشف)                                        */}
          {/* ================================================================== */}
          {station === 1 && (
            <motion.div
              key="station-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
            {/* Header Description */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                  <span>المحطة الأولى • تقييم الميول</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 leading-[1.45]">
                  المحطة الأولى: تقييم الميول وتوثيق الملف الأكاديمي
                </h2>
                <p className="text-[12px] text-slate-600">
                  حل الأسئلة الأربعة لتحديد سماتك الأكاديمية بدقة، وتنتقل تلقائياً لملفك الشخصي وبيانات التنسيق.
                </p>
              </div>

              {/* Toggle Sub-View within Station 1 */}
              <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px] font-medium shrink-0">
                <button
                  type="button"
                  onClick={() => setStation1SubView("assessment")}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    station1SubView === "assessment"
                      ? "bg-blue-600 text-white font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  1. اختبار الميول (4 أسئلة)
                </button>
                <button
                  type="button"
                  onClick={() => setStation1SubView("profile")}
                  className={`px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
                    station1SubView === "profile"
                      ? "bg-blue-600 text-white font-bold"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  2. ملف الطالب والتنسيق
                </button>
              </div>
            </div>

            {/* Sub-View A: AI Assessment Questions */}
            {station1SubView === "assessment" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {ASSESSMENT_QUESTIONS.map((q, idx) => (
                    <div
                      key={q.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>السؤال <span dir="ltr" className="font-mono tabular-nums">0{idx + 1} / 04</span></span>
                        {assessmentAnswers[q.id] && (
                          <span className="text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 stroke-[2]" />
                            <span>مكتمل</span>
                          </span>
                        )}
                      </div>
                      <h3 className="text-[13px] font-semibold text-slate-900 leading-relaxed">
                        {q.question}
                      </h3>

                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isSelected = assessmentAnswers[q.id] === opt.track;
                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleAnswerQuestion(q.id, opt.track)}
                              className={`w-full text-right p-3 rounded-lg border text-[12px] transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer flex items-center justify-between gap-3 ${
                                isSelected
                                  ? "bg-blue-50 border-blue-400 text-blue-900 font-medium"
                                  : "bg-white hover:bg-slate-50 border-slate-200 text-slate-700"
                              }`}
                            >
                              <span className="leading-snug">{opt.label}</span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded border shrink-0 ${
                                  isSelected
                                    ? "bg-blue-600 border-blue-600 text-white"
                                    : "bg-slate-100 border-slate-200 text-slate-600"
                                }`}
                              >
                                {opt.badge}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Auto-transition status banner */}
                {hasCompletedAssessment && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-[12px] text-emerald-900">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[2]" />
                      <span>
                        اكتمل التقييم بنجاح! المسار الأنسب لشغفك:{" "}
                        <strong className="text-emerald-950 font-bold">
                          {TRACK_DETAILS[dominantTrack]?.title || "علوم البيانات والذكاء الاصطناعي"}
                        </strong>
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStation1SubView("profile")}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      استكمال ملف الطالب ←
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Sub-View B: Student Profile */}
            {station1SubView === "profile" && (
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-xs">
                <div className="border-b border-slate-200 pb-4">
                  <h3 className="text-base font-bold text-slate-900">
                    بيانات الطالب الأكاديمية والمالية
                  </h3>
                  <p className="text-[12px] text-slate-600 mt-0.5">
                    هذه البيانات تضبط التوصيات المخصصة لك في المحطة 2 وحسابات التكلفة التقديرية.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-[12px]">
                  {/* Name */}
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-medium">اسم الطالب:</label>
                    <input
                      type="text"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Academic Stream */}
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-medium">الشعبة الأكاديمية:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px] font-medium">
                      {(
                        [
                          { id: "Math", label: "علمي رياضة" },
                          { id: "Science", label: "علمي علوم" },
                          { id: "stem", label: "مدارس STEM" },
                          { id: "Arts", label: "أدبي" },
                        ] as const
                      ).map((st) => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setStream(st.id as StreamType)}
                          className={`py-1.5 rounded-md text-center cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] ${
                            stream === st.id
                              ? "bg-blue-600 text-white font-bold"
                              : "text-slate-600 hover:text-slate-900"
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Score Percentage */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-slate-700">
                      <label htmlFor="station1-score-input" className="font-medium">المجموع بالنسبة المئوية:</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          id="station1-score-input"
                          type="number"
                          min={50}
                          max={100}
                          step={0.1}
                          value={score}
                          onChange={(e) => setScore(parseFloat(e.target.value) || 50)}
                          className="w-16 rounded border border-slate-300 bg-white px-2 py-0.5 text-right font-mono text-xs font-bold text-slate-900 focus:border-blue-500 focus:outline-none"
                        />
                        <span className="font-mono text-slate-500 text-xs">%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={50}
                      max={100}
                      step={0.1}
                      value={score}
                      onChange={(e) => setScore(parseFloat(e.target.value))}
                      className="w-full cursor-pointer"
                    />
                  </div>

                  {/* Governorate */}
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-medium">المحافظة (النطاق الجغرافي):</label>
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-medium focus:border-blue-500 focus:outline-none cursor-pointer"
                    >
                      {EGYPT_GOVERNORATES.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Annual Budget */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-slate-700">
                      <label htmlFor="station1-budget-input" className="font-medium">سقف الميزانية السنوية:</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          id="station1-budget-input"
                          type="number"
                          min={0}
                          max={300000}
                          step={5000}
                          value={budget}
                          onChange={(e) => setBudget(parseInt(e.target.value, 10) || 0)}
                          className="w-24 rounded border border-slate-300 bg-white px-2 py-0.5 text-right font-mono text-xs font-bold text-emerald-700 focus:border-emerald-500 focus:outline-none"
                        />
                        <span className="text-slate-500 text-xs">ج.م</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={300000}
                      step={5000}
                      value={budget}
                      onChange={(e) => setBudget(parseInt(e.target.value, 10))}
                      className="w-full cursor-pointer"
                    />
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-[10px] text-slate-500">سقف تقريبي:</span>
                      {[50000, 100000, 150000, 200000].map((preset) => (
                        <button
                          key={preset}
                          type="button"
                          onClick={() => setBudget(preset)}
                          className={`px-1.5 py-0.5 rounded text-[10px] border transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer ${
                            budget === preset
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <span dir="ltr" className="font-mono tabular-nums">{(preset / 1000).toFixed(0)}k</span> ج.م
                        </button>
                      ))}
                      <span className="text-slate-300">|</span>
                      {budgetTiers.map((tier) => (
                        <button
                          key={tier.label}
                          type="button"
                          onClick={() => setBudget(tier.amount)}
                          className={`px-1.5 py-0.5 rounded text-[10px] border transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer ${
                            budget === tier.amount
                              ? "bg-blue-50 text-blue-700 border-blue-300 font-bold"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {tier.label} (<span dir="ltr" className="font-mono tabular-nums">{tier.amount.toLocaleString()}</span>)
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Living Mode */}
                  <div className="space-y-1.5">
                    <label className="text-slate-700 font-medium">طبيعة المعيشة والانتقال:</label>
                    <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px] font-medium">
                      <button
                        type="button"
                        onClick={() => setLivingMode("commute")}
                        className={`py-1.5 rounded-md cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] ${
                          livingMode === "commute"
                            ? "bg-blue-600 text-white font-bold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        انتقال يومي (محل سكنك)
                      </button>
                      <button
                        type="button"
                        onClick={() => setLivingMode("dorm")}
                        className={`py-1.5 rounded-md cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] ${
                          livingMode === "dorm"
                            ? "bg-blue-600 text-white font-bold"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        سكن طلابي / اغتراب
                      </button>
                    </div>
                  </div>
                </div>

                {/* Transition to Station 2 CTA */}
                <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-[12px] text-slate-600">
                    ملفك جاهز: تم رصد{" "}
                    <span className="text-slate-900 font-bold tabular-nums">
                      {rankedFaculties.length}
                    </span>{" "}
                    برنامج وكلية متوافقة مع شعبتك ومجموعك.
                  </div>

                  <button
                    type="button"
                    onClick={() => setStation(2)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[13px] transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span>الانتقال للمحطة 2: المطابقة والتوصيات</span>
                    <ArrowLeft className="w-4 h-4 stroke-[2]" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ================================================================== */}
        {/* STATION 2: MATCH (طابق)                                            */}
        {/* ================================================================== */}
        {station === 2 && (
          <motion.div
            key="station-2"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                  <span>المحطة الثانية • التوصيات والمقارنة</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 leading-[1.45]">
                  المحطة الثانية: ترشيحات الكليات والمقارنة
                </h2>
                <p className="text-[12px] text-slate-600">
                  كليات مصنفة حسب أمان قبولك، مع زر أسباب الترشيح لمطالعة تفاصيل كل خيار.
                </p>
              </div>

              {/* Navigation Back / Forward */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStation(1)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>المحطة 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStation(3)}
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[11px] font-bold transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <span>المحطة 3 (المحاكاة)</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Quick Sector Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-[11px]">
              <span className="text-slate-500 text-[11px] shrink-0 font-medium">تصنيف الكليات:</span>
              {[
                { id: "all", label: "الكل" },
                { id: "safe", label: `فرص مضمونة (${safeFaculties.length})` },
                { id: "target", label: `خيارات واقعية (${targetFaculties.length})` },
                { id: "fallback", label: `خيارات طموحة / بدائل (${fallbackFaculties.length})` },
              ].map((pill) => (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => setSelectedClusterFilter(pill.id)}
                  className={`px-3 py-1 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                    selectedClusterFilter === pill.id
                      ? "bg-blue-600 border-blue-600 text-white font-bold"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* Major Recommendations Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(selectedClusterFilter === "all"
                ? rankedFaculties.slice(0, 9)
                : selectedClusterFilter === "safe"
                ? safeFaculties
                : selectedClusterFilter === "target"
                ? targetFaculties
                : fallbackFaculties
              ).map((fac) => {
                const isCompared = comparedFacultyIds.includes(fac.id);
                return (
                  <div
                    key={fac.id}
                    className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 flex flex-col justify-between space-y-4 shadow-xs transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded border font-medium ${fac.safetyBadge.style}`}
                        >
                          {fac.safetyBadge.label}
                        </span>
                        <span className="text-[11px] font-bold text-blue-700">
                          توافق <span dir="ltr" className="font-mono tabular-nums">{fac.matchScore}%</span>
                        </span>
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug">
                          {fac.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {fac.university} • {fac.gov}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px]">
                        <div>
                          <span className="text-slate-500 text-[10px] block">الحد الأدنى للتنسيق:</span>
                          <span dir="ltr" className="font-mono font-bold text-slate-900 tabular-nums">
                            {fac.shiftedCutoff}%
                          </span>
                          <span
                            className={`text-[10px] mr-1.5 font-bold ${
                              fac.margin >= 0 ? "text-emerald-700" : "text-amber-700"
                            }`}
                          >
                            (<span dir="ltr" className="font-mono tabular-nums">{fac.margin >= 0 ? `+${fac.margin}%` : `${fac.margin}%`}</span>)
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 text-[10px] block">المصروفات السنوية:</span>
                          <span className="font-bold text-slate-900">
                            {fac.y1_base_fee === 0 ? (
                              "مجاني حكومي"
                            ) : (
                              <>
                                <span dir="ltr" className="font-mono tabular-nums">{fac.y1_base_fee.toLocaleString()}</span> ج.م
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      {/* Explainable AI Button */}
                      <button
                        type="button"
                        onClick={() => setExplainFaculty(fac)}
                        className="w-full py-1.5 px-3 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <HelpCircle className="w-3.5 h-3.5 stroke-[1.5]" />
                        <span>لماذا هذا التخصص؟</span>
                      </button>

                      {/* Quick Compare & Drawer Triggers */}
                      <div className="flex items-center gap-2 text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleToggleCompare(fac.id)}
                          className={`flex-1 py-1.5 rounded-lg border transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer text-center font-medium ${
                            isCompared
                              ? "bg-blue-50 border-blue-300 text-blue-700"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          {isCompared ? "✓ محفوظة في مسودة الرغبات" : "+ حفظ في مسودة الرغبات"}
                        </button>

                        {onOpenFacultyDrawer && (
                          <button
                            type="button"
                            onClick={() => onOpenFacultyDrawer(fac)}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors cursor-pointer"
                            title="تفاصيل اللائحة والمستقبل"
                          >
                            <ExternalLink className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* University Comparison Table (If 2+ faculties added to compare) */}
            {comparedFaculties.length >= 2 && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      مقارنة الكليات والبرامج المختارة ({comparedFaculties.length} كليات)
                    </h3>
                    <p className="text-[11px] text-slate-600">
                      مقارنة جنباً إلى جنب في التنسيق، المصروفات، واعتمادات الجودة.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setComparedFacultyIds([])}
                    className="text-[11px] text-slate-500 hover:text-red-600 cursor-pointer"
                  >
                    تفريغ المقارنة
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-[12px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                        <th className="py-2.5 px-3">المعيار</th>
                        {comparedFaculties.map((f) => (
                          <th key={f.id} className="py-2.5 px-3 font-bold text-slate-900">
                            {f.name}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-2.5 px-3 text-slate-500">الجامعة والجهة</td>
                        {comparedFaculties.map((f) => (
                          <td key={f.id} className="py-2.5 px-3 font-medium text-slate-800">
                            {f.university} ({f.type})
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-slate-500">مؤشر القبول الاسترشادي</td>
                        {comparedFaculties.map((f) => (
                          <td key={f.id} className="py-2.5 px-3 font-mono font-bold text-blue-700 tabular-nums">
                            {f.cutoff_2026}%
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-slate-500">المصروفات السنوية</td>
                        {comparedFaculties.map((f) => (
                          <td key={f.id} className="py-2.5 px-3 font-bold text-emerald-800">
                            {f.y1_base_fee === 0 ? (
                              "مجاني"
                            ) : (
                              <>
                                <span dir="ltr" className="font-mono tabular-nums">{f.y1_base_fee.toLocaleString()}</span> ج.م
                              </>
                            )}
                          </td>
                        ))}
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-slate-500">تقدير تكلفة الـ 4 سنوات (TCO)</td>
                        {comparedFaculties.map((f) => {
                          const tcoEst = f.y1_base_fee * 4 + 20000;
                          return (
                            <td key={f.id} className="py-2.5 px-3 text-slate-700">
                              <span dir="ltr" className="font-mono tabular-nums">{tcoEst.toLocaleString()}</span> ج.م
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 text-slate-500">الطلب في سوق العمل</td>
                        {comparedFaculties.map((f) => (
                          <td key={f.id} className="py-2.5 px-3 text-emerald-700 font-semibold">
                            {f.future_career?.market_demand || "مرتفع جداً"}
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ================================================================== */}
        {/* STATION 3: SIMULATE (حاكِ)                                          */}
        {/* ================================================================== */}
        {station === 3 && (
          <motion.div
            key="station-3"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                  <span>المحطة الثالثة • المحاكاة وخارطة الطريق</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 leading-[1.45]">
                  المحطة الثالثة: لوحة المحاكاة الموحدة، مستقبلي، وخارطة الطريق
                </h2>
                <p className="text-[12px] text-slate-600">
                  اختبر سيناريوهات التنسيق (What-If)، استشرف رواتب ووظائف 2030 (Future Me)، واستكشف خارطة السنوات الـ 4.
                </p>
              </div>

              {/* Navigation Back / Forward */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStation(2)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>المحطة 2</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStation(4)}
                  className="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-[11px] font-semibold transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer flex items-center gap-1 shadow-xs"
                >
                  <span>المحطة 4 (القرار النهائي)</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Module 1: What-If Simulator Bar */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-600 stroke-[1.5]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    محاكي سيناريوهات التنسيق والحد الأدنى (What-If Simulator)
                  </h3>
                </div>
                <div className="text-[11px] text-slate-500">
                  تأثير التغير على خياراتك اللحظية
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tansik Shift Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-slate-700 font-medium">افتراض تغير درجات التنسيق العام:</span>
                    <span
                      className={`font-bold ${
                        tansikShift > 0
                          ? "text-amber-700"
                          : tansikShift < 0
                          ? "text-emerald-700"
                          : "text-slate-700"
                      }`}
                    >
                      <span dir="ltr" className="font-mono tabular-nums">{tansikShift > 0 ? `+${tansikShift}%` : `${tansikShift}%`}</span> {tansikShift > 0 ? "(ارتفاع)" : "(انخفاض)"}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-2.0}
                    max={2.0}
                    step={0.25}
                    value={tansikShift}
                    onChange={(e) => setTansikShift(parseFloat(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>انخفاض التنسيق (<span dir="ltr" className="font-mono tabular-nums">-2%</span>)</span>
                    <span>تنسيق <span dir="ltr" className="font-mono tabular-nums">2025</span> (ثابت)</span>
                    <span>ارتفاع التنسيق (<span dir="ltr" className="font-mono tabular-nums">+2%</span>)</span>
                  </div>
                </div>

                {/* Score Tweak Slider (Tazallom / Abilities) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[12px]">
                    <span className="text-slate-700 font-medium">إضافة درجات تظلم أو اختبار قدرات:</span>
                    <span className="font-bold text-blue-700">
                      <span dir="ltr" className="font-mono tabular-nums">{scoreTweak > 0 ? `+${scoreTweak}%` : "0.0%"}</span> (المجموع الفعلي: <span dir="ltr" className="font-mono tabular-nums">{(score + scoreTweak).toFixed(1)}%</span>)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0.0}
                    max={2.5}
                    step={0.25}
                    value={scoreTweak}
                    onChange={(e) => setScoreTweak(parseFloat(e.target.value))}
                    className="w-full cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>بدون تعديل</span>
                    <span><span dir="ltr" className="font-mono tabular-nums">+1.0%</span></span>
                    <span><span dir="ltr" className="font-mono tabular-nums">+2.5%</span> درجات تظلم</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Impact Summary */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
                <div className="text-slate-700">
                  النتيجة في هذا السيناريو: أصبح لديك{" "}
                  <strong className="text-emerald-700 font-bold tabular-nums">
                    {safeFaculties.length} كليات مضمونة
                  </strong>{" "}
                  و{" "}
                  <strong className="text-blue-700 font-bold tabular-nums">
                    {targetFaculties.length} خيارات واقعية
                  </strong>
                  .
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setTansikShift(0);
                    setScoreTweak(0);
                  }}
                  className="text-slate-500 hover:text-slate-900 underline cursor-pointer"
                >
                  إعادة الضبط
                </button>
              </div>
            </div>

            {/* Module 2 & 3: Future Me & Career Roadmap */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Future Me: Roles & Salaries (7 Cols) */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <TrendingUp className="w-4 h-4 text-emerald-600 stroke-[1.5]" />
                  <h3 className="text-sm font-bold text-slate-900">
                    مستقبلي والمسار الوظيفي 2030 (Future Me)
                  </h3>
                </div>

                <div className="space-y-4 text-[12px]">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                    <div className="text-[11px] text-slate-600">الوظائف الأكثر طلباً لتخصصك الموصى به:</div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {[
                        "مهندس ذكاء اصطناعي (AI Engineer)",
                        "مطور أنظمة سحابية (Cloud Architect)",
                        "مهندس أمن سيبراني (Cyber Analyst)",
                        "عالم بيانات ونمذجة (Data Scientist)",
                      ].map((role, rIdx) => (
                        <span
                          key={rIdx}
                          className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-800 text-[11px]"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Projected Salary Ranges */}
                  <div className="space-y-2">
                    <span className="text-slate-600 font-medium block">
                      متوسط الرواتب المتوقعة في السوق المصري والدولي:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <div className="text-[10px] text-slate-500">حديث تخرج (0-2 سنة)</div>
                        <div className="text-sm font-bold text-slate-900 mt-1">
                          <span dir="ltr" className="font-mono tabular-nums">20k - 35k</span> ج.م
                        </div>
                        <div className="text-[10px] text-slate-500">شهرياً</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <div className="text-[10px] text-slate-500">متوسط خبرة (3-5 سنوات)</div>
                        <div className="text-sm font-bold text-blue-700 mt-1">
                          <span dir="ltr" className="font-mono tabular-nums">50k - 90k</span> ج.م
                        </div>
                        <div className="text-[10px] text-slate-500">شهرياً</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-200">
                        <div className="text-[10px] text-slate-500">مسار إقليمي / شركات دولية</div>
                        <div className="text-sm font-bold text-emerald-700 mt-1">
                          <span dir="ltr" className="font-mono tabular-nums">25,000 - 45,000</span> ج.م
                        </div>
                        <div className="text-[10px] text-slate-500">شهرياً (متوسط تقديري)</div>
                      </div>
                    </div>
                  </div>

                  {/* Top 4 Skills in Demand */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-slate-600 font-medium block text-[11px]">
                      أهم المهارات المطلوبة للتوظيف الفوري:
                    </span>
                    <div className="flex flex-wrap gap-1 text-[11px]">
                      {["Python & PyTorch", "Cloud Architecture (AWS)", "Docker & Kubernetes", "Clean Code & Algorithms"].map((sk, sIdx) => (
                        <span key={sIdx} className="px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700">
                          {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Career Roadmap: 4 Academic Years (5 Cols) */}
              <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-blue-600 stroke-[1.5]" />
                    <h3 className="text-sm font-bold text-slate-900">خارطة السنوات الأكاديمية</h3>
                  </div>
                  <div className="flex gap-1 text-[10px] font-mono">
                    {[1, 2, 3, 4].map((yr) => (
                      <button
                        key={yr}
                        type="button"
                        onClick={() => setActiveRoadmapYear(yr)}
                        className={`w-6 h-6 rounded flex items-center justify-center cursor-pointer transition-colors ${
                          activeRoadmapYear === yr
                            ? "bg-blue-600 text-white font-bold"
                            : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                        }`}
                      >
                        Y{yr}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Connected nodes along a line */}
                <div className="relative border-s border-slate-300 ms-3 ps-6 space-y-3 py-1">
                  {[
                    {
                      year: 1,
                      title: "التأسيس الأكاديمي وبناء المعدل",
                      desc: "التركيز الكامل على مقررات الرياضيات والبرمجة التأسيسية لتحقيق GPA لا يقل عن 3.4 لحجز التخصص المرغوب في السنة الثانية.",
                    },
                    {
                      year: 2,
                      title: "التخصص الدقيق والمشاريع",
                      desc: "المشاركة في أول هاكاثون وبناء 3 مشاريع عملية حقيقية على GitHub، مع الانضمام للأنشطة الطلابية التقنية.",
                    },
                    {
                      year: 3,
                      title: "التدريب الصيفي والشهادات الدولية",
                      desc: "قضاء تدريب صيفي مدفوع (Internship) في إحدى الشركات التقنية المعتمدة، واجتياز شهادة دولية مثل AWS Solutions Architect.",
                    },
                    {
                      year: 4,
                      title: "مشروع التخرج والتوظيف المباشر",
                      desc: "تنفيذ مشروع تخرج له جدوى تجارية تطبيقية، حضور معارض التوظيف، وتوقيع أول عقد عمل قبل استلام شهادة التخرج.",
                    },
                  ].map((node, idx) => {
                    const isActive = activeRoadmapYear === node.year;
                    return (
                      <div
                        key={node.year}
                        onClick={() => setActiveRoadmapYear(node.year)}
                        style={{
                          animation: `fade-up 250ms var(--ease-out-expo) ${idx * 60}ms both`,
                        }}
                        className={`relative p-3 rounded-xl border transition-all duration-150 cursor-pointer hover:-translate-y-0.5 active:scale-[0.98] ${
                          isActive
                            ? "bg-blue-50/70 border-blue-300 shadow-2xs"
                            : "bg-white border-slate-200/80 hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`absolute -start-[31px] top-3.5 w-3.5 h-3.5 rounded-full border-2 transition-colors ${
                            isActive
                              ? "bg-blue-600 border-white ring-2 ring-blue-200"
                              : "bg-white border-slate-400"
                          }`}
                        />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[12px] font-bold ${
                                isActive ? "text-blue-700" : "text-slate-800"
                              }`}
                            >
                              السنة {node.year}: {node.title}
                            </span>
                            <span
                              dir="ltr"
                              className="font-mono text-[10px] text-slate-400 tabular-nums"
                            >
                              Y0{node.year}
                            </span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            {node.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-200 pt-2 text-[10px] text-slate-500">
                  مؤشر الطلب بسوق العمل:{" "}
                  <span className="text-emerald-700 font-bold">
                    مرتفع (متوسط طلب متزايد على الكوادر المؤهلة)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setStation(4)}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[12px] transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>الانتقال للمحطة 4: الاستشارة الأكاديمية والتقرير النهائي</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ================================================================== */}
        {/* STATION 4: DECIDE (المحطة الرابعة: الاستشارة والقرار النهائي)           */}
        {/* ================================================================== */}
        {station === 4 && (
          <motion.div
            key="station-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6"
          >
            {/* Header */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-slate-900 leading-[1.45]">
                  المحطة الرابعة: الاستشارة الأكاديمية وتقرير القرار النهائي المعتمد
                </h2>
                <p className="text-[12px] text-slate-600">
                  استعرض التوجيهات الأكاديمية لترتيب رغباتك، ثم أصدر وثيقة القرار النهائي الرسمية لبطاقة رغباتك.
                </p>
              </div>

              {/* Generate Final Report Button */}
              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-[13px] transition-colors cursor-pointer flex items-center gap-2 shadow-md shrink-0"
              >
                <FileText className="w-4 h-4 stroke-[2]" />
                <span>إصدار تقرير القرار النهائي</span>
              </button>
            </div>

            {/* Academic Advisor Interactive Q&A Interface */}
            <div className="bg-white border border-slate-200 rounded-xl flex flex-col h-[520px] shadow-xs">
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                    <Compass className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-[13px] font-bold text-slate-900">
                      المستشار الأكاديمي التوجيهي
                    </h3>
                    <div className="text-[10px] text-slate-500">
                      إرشادات وترتيبات مبنية على مجموعك وشعبتك
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 hidden sm:block">
                  بياناتك: <span dir="ltr" className="font-mono tabular-nums">{score}%</span> • <span dir="ltr" className="font-mono">{stream}</span> • {governorate}
                </div>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-[12px]">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] p-3.5 rounded-xl leading-relaxed ${
                        msg.sender === "user"
                          ? "bg-blue-600 text-white font-medium"
                          : "bg-slate-50 border border-slate-200 text-slate-800"
                      }`}
                    >
                      <div className="whitespace-pre-line">{msg.text}</div>
                      <div
                        className={`text-[9px] mt-1 font-mono text-right ${
                          msg.sender === "user" ? "text-blue-200" : "text-slate-500"
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Prompt Suggestions */}
              <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-slate-500 text-[10px] shrink-0 font-medium">مقترحات:</span>
                {[
                  "ما هو الترتيب الاستراتيجي للـ 75 رغبة؟",
                  "هل أختار برنامج ساعات معتمدة أم كليات عامة؟",
                  "ما هي فرص العمل الدولي والسفر بعد التخرج؟",
                  "احسب لي تكلفة المعيشة في الاغتراب",
                ].map((prompt, pIdx) => (
                  <button
                    key={pIdx}
                    type="button"
                    onClick={() => {
                      setInputQuestion(prompt);
                    }}
                    className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 whitespace-nowrap cursor-pointer transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <div className="p-3 border-t border-slate-200 flex items-center gap-2 bg-white">
                <input
                  type="text"
                  value={inputQuestion}
                  onChange={(e) => setInputQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  placeholder="اكتب سؤالك واستشارتك هنا (مثلاً: ما هي أفضل كلية لمجموعي لو حابب مجال السوفت وير؟)..."
                  className="flex-1 bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-slate-900 text-[12px] focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleSendMessage}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[12px] font-bold transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>إرسال</span>
                  <Send className="w-3.5 h-3.5 stroke-[2]" />
                </button>
              </div>
            </div>

            {/* Bottom Final Decision Callout Banner */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900">
                  أكملت المحطات الأربع بنجاح! جاهز لطباعة بطاقة الرغبات والتقرير المعتمد
                </h3>
                <p className="text-[12px] text-slate-600">
                  تحتوي وثيقة القرار على الترتيب الرسمي المعتمد لـ 75 رغبة، تحليل التكلفة الإجمالية TCO، وخطة العمل.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowReportModal(true)}
                className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[13px] transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-sm shrink-0"
              >
                <FileText className="w-4 h-4 stroke-[2]" />
                <span>إصدار وثيقة القرار النهائي الرسمية ←</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>

      {/* ==================================================================== */}
      {/* 3. EXPLAINABLE AI - WHY? MODAL                                       */}
      {/* ==================================================================== */}
      {explainFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-medium text-blue-700">
                  مصفوفة التحليل والتفسير الأكاديمي
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  لماذا رشحنا لك {explainFaculty.name}؟
                </h3>
                <p className="text-[12px] text-slate-500">
                  {explainFaculty.university} • مؤشر القبول الاسترشادي: {explainFaculty.cutoff_2026}%
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExplainFaculty(null)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-[12px]">
              {/* Factor 1: Score & Margin */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>1. معيار المجموع والقبول الاسترشادي (Score Margin)</span>
                  <span dir="ltr" className="font-mono text-emerald-700 tabular-nums">
                    {explainFaculty.margin >= 0 ? `+${explainFaculty.margin}%` : `${explainFaculty.margin}%`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  مجموعك الحالي ({score}%) مقارنة بمؤشر القبول الاسترشادي ({explainFaculty.cutoff_2026}%):{" "}
                  {explainFaculty.margin >= 1.5
                    ? "فرصة قبول قوية تتجاوز المعدل المعتاد."
                    : "فرصة واقعية متوازنة ضمن النطاق الجغرافي الأول."}
                </p>
              </div>

              {/* Factor 2: Trait & Aptitude Affinity */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>2. تطابق الميول والسمات</span>
                  <span className="text-blue-700">تطابق <span dir="ltr" className="font-mono tabular-nums">{explainFaculty.matchScore}%</span></span>
                </div>
                <p className="text-[11px] text-slate-600">
                  إجاباتك في اختبار الميول أظهرت تفضيلاً استثنائياً لحل المشكلات البرمجية ومسار{" "}
                  {TRACK_DETAILS[dominantTrack]?.title}.
                </p>
              </div>

              {/* Factor 3: Financial Feasibility */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>3. الجدوى المالية وسقف الميزانية</span>
                  <span className="text-slate-900 font-bold">
                    {explainFaculty.y1_base_fee === 0 ? (
                      "حكومي مجاني"
                    ) : (
                      <>
                        <span dir="ltr" className="font-mono tabular-nums">{explainFaculty.y1_base_fee.toLocaleString()}</span> ج.م
                      </>
                    )}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600">
                  المصروفات السنوية تقع تحت سقف ميزانيتك المقدرة بـ {budget.toLocaleString()} ج.م، مما يحميك من أي تعثر مالي مستقبلي.
                </p>
              </div>

              {/* Factor 4: Location & Commute */}
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span>4. التوزيع الجغرافي والاغتراب</span>
                  <span className="text-slate-900">{explainFaculty.gov}</span>
                </div>
                <p className="text-[11px] text-slate-600">
                  {explainFaculty.gov === governorate
                    ? "تقع في نطاقك الجغرافي الأول (أ) مما يوفر عليك نفقات السكن الطلابي والمواصلات الشاقة."
                    : "تقع في النطاق المجاور وتتطلب ترتيباً مناسباً للسكن الطلابي أو الانتقال المنظم."}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setExplainFaculty(null)}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[12px] font-bold transition-colors cursor-pointer"
            >
              فهمت سبب الترشيح، إغلاق
            </button>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* 4. FINAL DECISION REPORT MODAL                                       */}
      {/* ==================================================================== */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            {/* Report Header Bar */}
            <div className="flex items-start justify-between border-b border-slate-200 pb-4">
              <div>
                <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-medium">
                  <span>وثيقة القرار النهائي المعتمدة • تنسيق 2026</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1 leading-[1.45]">
                  وثيقة القرار النهائي لبطاقة الرغبات والمسار الجامعي
                </h2>
                <p className="text-[11px] text-slate-500">
                  الرقم المرجعي المعتمد: CU-2026-{Math.floor(score * 100)}-{stream.toUpperCase()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Student Verified Profile Block */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-[12px]">
              <div>
                <span className="text-slate-500 text-[10px] block">اسم الطالب:</span>
                <span className="font-bold text-slate-900">{studentName}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">الشعبة والمجموع:</span>
                <span className="font-bold text-blue-700">
                  <span dir="ltr" className="font-mono tabular-nums">{score}%</span> ({stream === "Math" ? "علمي رياضة" : stream === "Science" ? "علمي علوم" : "أدبي"})
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">المحافظة:</span>
                <span className="text-slate-800">{governorate}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">المسار الأكاديمي الموصى به:</span>
                <span className="font-bold text-emerald-700">
                  {TRACK_DETAILS[dominantTrack]?.title || "علوم البيانات والذكاء الاصطناعي"}
                </span>
              </div>
            </div>

            {/* Strategic 75-Desire Distribution Breakdown */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                خطة التوزيع الاستراتيجي للـ 75 رغبة في التنسيق الرسمي:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[12px]">
                <div className="bg-purple-50/70 border border-purple-200 p-3.5 rounded-xl space-y-1">
                  <div className="text-[10px] font-semibold text-purple-700">
                    <span dir="ltr" className="font-mono tabular-nums">01 - 15</span> (<span dir="ltr" className="font-mono tabular-nums">15</span> رغبة)
                  </div>
                  <div className="font-bold text-purple-900">خيارات طموحة ومسارات مميزة</div>
                  <p className="text-[11px] text-slate-600">
                    كليات وبرامج ساعات معتمدة متقدمة تتطلب مجموعاً مساوياً أو أعلى بقليل لتأمين فرصة في حال انخفاض الحد الأدنى.
                  </p>
                </div>

                <div className="bg-blue-50/70 border border-blue-200 p-3.5 rounded-xl space-y-1">
                  <div className="text-[10px] font-semibold text-blue-700">
                    <span dir="ltr" className="font-mono tabular-nums">16 - 50</span> (<span dir="ltr" className="font-mono tabular-nums">35</span> رغبة)
                  </div>
                  <div className="font-bold text-blue-900">خيارات واقعية متوازنة</div>
                  <p className="text-[11px] text-slate-600">
                    الكليات التي تطابق مجموعك تماماً بنطاقك الجغرافي والنطاق الإقليمي المجاور، وهي الخيارات المرجحة بنسبة 85%+.
                  </p>
                </div>

                <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl space-y-1">
                  <div className="text-[10px] font-semibold text-emerald-700">
                    <span dir="ltr" className="font-mono tabular-nums">51 - 75</span> (<span dir="ltr" className="font-mono tabular-nums">25</span> رغبة)
                  </div>
                  <div className="font-bold text-emerald-900">شبكة الأمان والضمان الأكيد</div>
                  <p className="text-[11px] text-slate-600">
                    كليات مضمونة 100% يقل تنسيقها عن مجموعك بـ 2% فأكثر لضمان عدم استنفاد الرغبات تحت أي ظرف.
                  </p>
                </div>
              </div>
            </div>

            {/* Top 3 Prioritized Faculties for the Student */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900">
                الترشيحات الثلاثة الأولى الموصى بها في بطاقتك:
              </h3>
              <div className="space-y-1.5 text-[12px]">
                {rankedFaculties.slice(0, 3).map((f, idx) => (
                  <div
                    key={f.id}
                    className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-mono font-bold text-[11px] flex items-center justify-center">
                        0{idx + 1}
                      </span>
                      <div>
                        <span className="font-bold text-slate-900">{f.name}</span>
                        <span className="text-slate-500 text-[11px] mr-2">
                          ({f.university} - {f.type})
                        </span>
                      </div>
                    </div>
                    <div className="text-left">
                      <span dir="ltr" className="font-mono text-blue-700 font-bold tabular-nums">{f.cutoff_2026}%</span>
                      <span className="text-[10px] text-slate-500 block">
                        {f.y1_base_fee === 0 ? (
                          "مجاني"
                        ) : (
                          <>
                            <span dir="ltr" className="font-mono tabular-nums">{f.y1_base_fee.toLocaleString()}</span> ج.م
                          </>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Print & Action Controls */}
            <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px]">
              <div className="text-slate-500 text-[11px]">
                وثيقة استرشادية معتمدة تم إنشاؤها وفقاً لخوارزميات التنسيق التنبؤية لعام 2026.
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== "undefined") window.print();
                  }}
                  className="flex-1 sm:flex-none px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg font-medium transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4 stroke-[1.5]" />
                  <span>طباعة (PDF)</span>
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `تقرير قراري الجامعي المعتمد من منصة ChooseU 2026 - الطالب: ${studentName} - المجموع: ${score}%`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-4 h-4 stroke-[1.5]" />
                  <span>مشاركة عبر واتساب</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
