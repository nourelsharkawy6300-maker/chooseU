"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  EvaluationResult,
  Faculty,
  StreamType,
  TrackKey,
  WorkspaceSubTab,
} from "../types/chooseu";
import {
  EGYPT_GOVERNORATES,
  FACULTIES_DATABASE,
  STREAM_QUIZ_BANKS,
  TRACK_DETAILS,
} from "../data/faculties-db";
import {
  computeFacultyTcoMetrics,
  formatFacultyCount,
} from "../lib/engine";
import { AnimatedCounter, UIMavenCard } from "./MotionPrimitives";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Briefcase,
  FileText,
  Info,
  Lock,
  RotateCcw,
  Scale,
  Sliders,
  SlidersHorizontal,
  X,
} from "lucide-react";

interface WorkspaceTabsProps {
  studentName: string;
  setStudentName: (v: string) => void;
  stream: StreamType;
  setStream: (v: StreamType) => void;
  score: number;
  setScore: (v: number) => void;
  budget: number;
  setBudget: (v: number) => void;
  gov: string;
  setGov: (v: string) => void;
  livingMode: "commute" | "dorm";
  setLivingMode: (v: "commute" | "dorm") => void;
  workspaceTab: WorkspaceSubTab;
  setWorkspaceTab: (v: WorkspaceSubTab) => void;
  answersByStream: Record<StreamType, Record<number, TrackKey>>;
  setAnswersByStream: React.Dispatch<
    React.SetStateAction<Record<StreamType, Record<number, TrackKey>>>
  >;
  tansikShift: number;
  setTansikShift: (v: number) => void;
  sectorFilter: string;
  setSectorFilter: (v: string) => void;
  inflationScenario: number;
  setInflationScenario: (v: number) => void;
  comparedIds: string[];
  onToggleCompare: (id: string) => void;
  evaluation: EvaluationResult;
  sortedAffinities: {
    key: TrackKey;
    count: number;
    percentage: number;
    title: string;
    subtitle: string;
    sector: string;
    coreSkills: string[];
  }[];
  topTrack: TrackKey;
  isReportUnlocked: boolean;
  onOpenCheckout: () => void;
  onSelectFutureCareer?: (f: Faculty) => void;
  onResetParameters?: () => void;
}

function getCategoryBadgeStyle(type: string): string {
  if (type === "حكومي انتظام") {
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  }
  if (type === "برامج خاصة وساعات معتمدة") {
    return "bg-blue-50 text-blue-800 border-blue-200";
  }
  if (type === "جامعات أهلية") {
    return "bg-purple-50 text-purple-800 border-purple-200";
  }
  return "bg-amber-50 text-amber-800 border-amber-200";
}

export function WorkspaceTabs({
  studentName,
  setStudentName,
  stream,
  setStream,
  score,
  setScore,
  budget,
  setBudget,
  gov,
  setGov,
  livingMode,
  setLivingMode,
  workspaceTab,
  setWorkspaceTab,
  answersByStream,
  setAnswersByStream,
  tansikShift,
  setTansikShift,
  sectorFilter,
  setSectorFilter,
  inflationScenario,
  setInflationScenario,
  comparedIds,
  onToggleCompare,
  evaluation,
  sortedAffinities,
  topTrack,
  isReportUnlocked,
  onOpenCheckout,
  onSelectFutureCareer,
  onResetParameters,
}: WorkspaceTabsProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [auditedFaculty, setAuditedFaculty] = useState<Faculty | null>(null);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);

  // Local string states for non-hostile input typing (FIX 2: Form Clamping onBlur only)
  const [scoreInputStr, setScoreInputStr] = useState<string>(score.toString());
  const [budgetInputStr, setBudgetInputStr] = useState<string>(budget.toString());
  const [prevScore, setPrevScore] = useState(score);
  const [prevBudget, setPrevBudget] = useState(budget);

  if (score !== prevScore) {
    setPrevScore(score);
    setScoreInputStr(score.toString());
  }

  if (budget !== prevBudget) {
    setPrevBudget(budget);
    setBudgetInputStr(budget.toString());
  }

  const activeQuestions = STREAM_QUIZ_BANKS[stream] || [];
  const currentStreamAnswers = answersByStream[stream] || {};

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

  const unlockedFreeFaculties = useMemo(
    () => evaluation.allRanked.slice(0, 2),
    [evaluation.allRanked]
  );

  const lockedComparisonFaculties = useMemo(() => {
    const fromRanked = evaluation.allRanked.slice(2, 7);
    if (fromRanked.length >= 4) return fromRanked;
    const usedIds = new Set(unlockedFreeFaculties.map((f) => f.id));
    const extras = FACULTIES_DATABASE.filter((f) => !usedIds.has(f.id));
    return [...fromRanked, ...extras].slice(0, 4);
  }, [evaluation.allRanked, unlockedFreeFaculties]);

  // Faculties for Sub-Tab 4 (Side-by-Side Comparison): user's checked items or top 3 ranked
  const comparedFacultiesList = useMemo(() => {
    if (comparedIds.length >= 2) {
      return comparedIds
        .map(
          (id) =>
            evaluation.allRanked.find((f) => f.id === id) ||
            FACULTIES_DATABASE.find((f) => f.id === id)
        )
        .filter(Boolean) as Faculty[];
    }
    if (evaluation.allRanked.length >= 2) {
      return evaluation.allRanked.slice(0, 3);
    }
    return FACULTIES_DATABASE.slice(0, 3);
  }, [comparedIds, evaluation.allRanked]);

  const bestFitComparedFaculty = comparedFacultiesList[0] || null;

  return (
    <div className="px-4 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* =====================================================================
          1. RIGHT STICKY CONTROL SIDEBAR (lg:col-span-4)
         ===================================================================== */}
      <aside className="lg:col-span-4 lg:sticky lg:top-20">
        <div className="anima-playground-dock">
          <div className="anima-playground-surface p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-900" strokeWidth={1.5} />
            <h2 className="text-[15px] font-semibold text-slate-900">
              معطيات الطالب والفلترة
            </h2>
          </div>
          {onResetParameters && (
            <button
              type="button"
              onClick={onResetParameters}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" strokeWidth={1.5} />
              <span>إعادة ضبط المعايير</span>
            </button>
          )}
        </div>

        {/* Student Name */}
        <div>
          <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
            اسم الطالب
          </label>
          <input
            type="text"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="أدخل اسم الطالب لتخصيص التقرير..."
            className="w-full border border-slate-300 focus:border-blue-600 rounded-xl px-3.5 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none bg-white"
          />
        </div>

        {/* 3-Way Academic Stream Segmented Control */}
        <div>
          <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
            الشعبة الدراسية
          </label>
          <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-3 gap-1 border border-slate-200">
            {[
              { id: "Science" as StreamType, label: "علمي علوم" },
              { id: "Math" as StreamType, label: "علمي رياضة" },
              { id: "Arts" as StreamType, label: "أدبي" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => {
                  setStream(st.id);
                  setCurrentQuestionIndex(0);
                }}
                className={`relative py-1.5 px-2 rounded-lg text-[12px] whitespace-nowrap transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer text-center ${
                  stream === st.id
                    ? "text-[#377ef0] font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {stream === st.id && (
                  <motion.div
                    layoutId="workspace-stream-pill"
                    className="absolute inset-0 rounded-lg bg-white shadow-2xs border border-slate-200"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{st.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Score Slider (50 to 100, step 0.5) + Numeric Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800">
              المجموع المئوي (%)
            </label>
            <div className="flex items-center gap-1.5 tabular-nums">
              <input
                type="number"
                min={50}
                max={100}
                step={0.5}
                value={scoreInputStr}
                onChange={(e) => setScoreInputStr(e.target.value)}
                onBlur={() => {
                  const val = parseFloat(scoreInputStr);
                  if (isNaN(val)) {
                    setScoreInputStr(score.toString());
                  } else {
                    const clamped = Math.min(100, Math.max(50, val));
                    setScore(clamped);
                    setScoreInputStr(clamped.toString());
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
                className="w-18 border border-slate-300 focus:border-blue-600 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 text-left tabular-nums focus:outline-none bg-white"
              />
              <span className="text-xs font-semibold text-slate-600">%</span>
            </div>
          </div>
          <input
            type="range"
            min={50}
            max={100}
            step={0.5}
            value={score}
            onChange={(e) => setScore(parseFloat(e.target.value))}
            className="w-full cursor-pointer"
          />
          <div className="flex justify-between text-xs text-slate-600 font-medium tabular-nums">
            <span>50%</span>
            <span>75%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Max Annual Budget Slider (5000 to 250000, step 5000) + Numeric Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800">
              الحد الأقصى للميزانية السنوية
            </label>
            <div className="flex items-center gap-1.5 tabular-nums">
              <input
                type="number"
                min={5000}
                max={250000}
                step={5000}
                value={budgetInputStr}
                onChange={(e) => setBudgetInputStr(e.target.value)}
                onBlur={() => {
                  const val = parseInt(budgetInputStr, 10);
                  if (isNaN(val)) {
                    setBudgetInputStr(budget.toString());
                  } else {
                    const clamped = Math.min(250000, Math.max(5000, val));
                    setBudget(clamped);
                    setBudgetInputStr(clamped.toString());
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                }}
                className="w-24 border border-slate-300 focus:border-blue-600 rounded-lg px-2 py-1 text-xs font-bold text-slate-900 text-left tabular-nums focus:outline-none bg-white"
              />
              <span className="text-xs font-semibold text-slate-600">ج.م</span>
            </div>
          </div>
          <input
            type="range"
            min={5000}
            max={250000}
            step={5000}
            value={budget}
            onChange={(e) => setBudget(parseInt(e.target.value, 10))}
            className="w-full cursor-pointer"
          />
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-slate-600 font-medium">سقف تقريبي:</span>
            {[50000, 100000, 150000, 200000].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setBudget(preset)}
                className={`px-2 py-0.5 rounded text-xs border transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer ${
                  budget === preset
                    ? "bg-blue-50 text-blue-700 border-blue-300 font-bold"
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
                className={`px-2 py-0.5 rounded text-xs border transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer ${
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

        {/* Governorate Select Dropdown */}
        <div>
          <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
            محافظة الإقامة الحالية
          </label>
          <select
            value={gov}
            onChange={(e) => setGov(e.target.value)}
            className="w-full border border-slate-300 focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-[13px] font-medium bg-white text-slate-900 focus:outline-none"
          >
            {EGYPT_GOVERNORATES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Living Mode for Distant Faculties */}
        <div>
          <label className="block text-[13px] font-medium text-slate-700 mb-1.5">
            نمط الاستقرار للكليات البعيدة
          </label>
          <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-2 gap-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setLivingMode("commute")}
              className={`py-1.5 px-2 rounded-lg text-[12px] transition cursor-pointer ${
                livingMode === "commute"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              انتقال يومي
            </button>
            <button
              type="button"
              onClick={() => setLivingMode("dorm")}
              className={`py-1.5 px-2 rounded-lg text-[12px] transition cursor-pointer ${
                livingMode === "dorm"
                  ? "bg-white text-slate-900 shadow-2xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              سكن طلابي وإعاشة
            </button>
          </div>
        </div>

        {/* Live Status Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-slate-600">
              نتيجة المطابقة الفورية
            </span>
            <span className="w-2 h-2 rounded-full bg-blue-600" />
          </div>
          <div className="text-[16px] font-bold text-slate-900 tabular-nums">
            {formatFacultyCount(evaluation.allRanked.length)}
          </div>
          <p className="text-xs text-slate-600 font-medium">
            المسار المتصدر: {TRACK_DETAILS[topTrack]?.title}
          </p>
        </div>
        </div>
        </div>
      </aside>

      {/* =====================================================================
          2. LEFT MAIN ANALYTICAL CANVAS (lg:col-span-8)
         ===================================================================== */}
      <div className="lg:col-span-8 space-y-5">
        {/* Guided Step Heading */}
        <div className="space-y-1 py-1">
          <h2 className="text-lg font-bold text-slate-900">
            {workspaceTab === "quiz" && "اختبار الميول"}
            {workspaceTab === "scenarios" && "الكليات المرشحة والتنسيق"}
            {workspaceTab === "tco_table" && "حساب المصاريف والسكن"}
            {workspaceTab === "compare" && "المقارنة والقرار النهائي"}
          </h2>
          <p className="text-[13px] text-slate-600 leading-relaxed">
            {workspaceTab === "quiz" &&
              "أجب عن 6 أسئلة عملية سريعة لنكتشف ميولك ومجالات شغفك الأنسب بدون أي تعقيد."}
            {workspaceTab === "scenarios" &&
              "استعرض الكليات المناسبة لمجموعك وجرّب سيناريوهات تغير درجات التنسيق صعوداً أو هبوطاً بنقرة واحدة."}
            {workspaceTab === "tco_table" &&
              "احسب التكلفة الحقيقية الكاملة لسنوات الدراسة شاملة المصروفات، المعامل، والزيادة السنوية بالتضخم، وتكلفة الانتقال أو السكن."}
            {workspaceTab === "compare" &&
              "قارن بين كلياتك المفضلة وجهاً لوجه عبر 8 معايير دقيقة لتصل مع ولي أمرك للقرار الأنسب والأكثر أماناً."}
          </p>
        </div>

        {/* 4-Tab Workspace Switcher with Parent-Friendly Labels */}
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-1.5 flex flex-wrap gap-2 shadow-2xs">
          {[
            { id: "quiz" as WorkspaceSubTab, label: "1. اختبار الميول السريع" },
            {
              id: "scenarios" as WorkspaceSubTab,
              label: "2. الكليات المرشحة وسيناريوهات التنسيق",
            },
            {
              id: "tco_table" as WorkspaceSubTab,
              label: "3. حسبة مصاريف الـ 4 سنين والسكن",
            },
            {
              id: "compare" as WorkspaceSubTab,
              label: `4. مقارنة الكليات وجهاً لوجه (${comparedFacultiesList.length})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setWorkspaceTab(tab.id)}
              className={`relative flex-1 min-w-[140px] py-2 px-3 rounded-lg text-[12px] font-semibold transition cursor-pointer text-center ${
                workspaceTab === tab.id
                  ? "text-[#377ef0] font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {workspaceTab === tab.id && (
                <motion.div
                  layoutId="workspace-active-tab-pill"
                  className="absolute inset-0 rounded-lg bg-white shadow-xs border border-slate-200"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ===================================================================
            SUB-TAB 1: 1. تقييم الميول الذكي (QUIZ)
           =================================================================== */}
        {workspaceTab === "quiz" && (
          <div className="space-y-6">
            {/* Top Affinity Breakdown Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3
                    className="w-4 h-4 text-blue-600"
                    strokeWidth={1.5}
                  />
                  <h3 className="text-[14px] font-semibold text-slate-900">
                    خريطة التوافق التخصصي ({TRACK_DETAILS[topTrack]?.title})
                  </h3>
                </div>
                <span className="text-xs text-slate-600 font-medium">
                  تتحدث الأوزان النسبية تلقائياً مع كل إجابة
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                {sortedAffinities.slice(0, 4).map((item, idx) => (
                  <div key={item.key} className="space-y-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span
                        className={
                          idx === 0
                            ? "font-semibold text-slate-900"
                            : "text-slate-600"
                        }
                      >
                        {item.title}
                      </span>
                      <span className="font-semibold text-slate-900 tabular-nums">
                        {item.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          idx === 0 ? "bg-blue-600" : "bg-slate-300"
                        }`}
                        style={{ width: `${Math.max(8, item.percentage)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Single-Question Focus Card */}
            <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-medium text-slate-500">
                    مقياس الميول غير المنحاز • شعبة{" "}
                    {stream === "Science"
                      ? "علمي علوم"
                      : stream === "Math"
                      ? "علمي رياضة"
                      : "أدبي"}
                  </span>
                  <span className="text-[12px] font-semibold text-slate-900 tabular-nums">
                    السؤال {currentQuestionIndex + 1} من{" "}
                    {activeQuestions.length}
                  </span>
                </div>

                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-200 rounded-full"
                    style={{
                      width: `${
                        ((currentQuestionIndex + 1) /
                          Math.max(1, activeQuestions.length)) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>

              {activeQuestions[currentQuestionIndex] && (
                <div className="p-6 space-y-5">
                  <h2 className="text-[16px] font-semibold text-slate-900 leading-relaxed">
                    {activeQuestions[currentQuestionIndex].question}
                  </h2>

                  <div className="space-y-2.5">
                    {activeQuestions[currentQuestionIndex].options.map(
                      (opt, optIdx) => {
                        const qId = activeQuestions[currentQuestionIndex].id;
                        const selected =
                          currentStreamAnswers[qId] === opt.track;
                        const optionLetters = ["أ", "ب", "ج", "د"];
                        return (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() =>
                              setAnswersByStream((prev) => ({
                                ...prev,
                                [stream]: {
                                  ...prev[stream],
                                  [qId]: opt.track,
                                },
                              }))
                            }
                            className={`w-full text-right px-4 py-3.5 rounded-xl border text-[13px] transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-between gap-3 cursor-pointer ${
                              selected
                                ? "bg-blue-50 border-blue-600 text-blue-900 font-medium"
                                : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 font-normal"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs shrink-0 font-bold ${
                                  selected
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : "border-slate-300 bg-white text-slate-600"
                                }`}
                              >
                                {optionLetters[optIdx]}
                              </span>
                              <span className="leading-relaxed">
                                {opt.label}
                              </span>
                            </div>
                            <kbd className="text-xs font-mono text-slate-600 font-semibold border border-slate-200 bg-slate-50 px-2 py-0.5 rounded shrink-0 tabular-nums">
                              {optIdx + 1}
                            </kbd>
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() =>
                    setCurrentQuestionIndex((i) => Math.max(0, i - 1))
                  }
                  className="border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-700 px-4 py-2 rounded-xl text-[12px] font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  <span>السؤال السابق</span>
                </button>

                {currentQuestionIndex < activeQuestions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentQuestionIndex((i) =>
                        Math.min(activeQuestions.length - 1, i + 1)
                      )
                    }
                    className="bg-[#377ef0] hover:bg-[#2962be] text-white px-5 py-2 rounded-xl text-[12px] font-medium flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <span>السؤال التالي</span>
                    <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setWorkspaceTab("scenarios")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    <span>اعرض الكليات المناسبة لمجموعي وميولي</span>
                    <ArrowLeft className="w-4 h-4" strokeWidth={2} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ===================================================================
            SUB-TAB 2: 2. محاكي السيناريوهات What-If (SCENARIOS)
           =================================================================== */}
        {workspaceTab === "scenarios" && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            {/* Interactive What-If Bar */}
            <div className="p-6 border-b border-slate-200 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal
                      className="w-4 h-4 text-slate-900"
                      strokeWidth={1.5}
                    />
                    <h2 className="text-[17px] font-semibold text-slate-900">
                      محاكي السيناريوهات وتوقعات التنسيق
                    </h2>
                  </div>
                  <p className="text-[12px] text-slate-500 mt-0.5">
                    اضغط على أي زر محاكاة لترى فوراً كيف يتغير قبول الكليات لو تغيّر التنسيق أو الميزانية.
                  </p>
                </div>

                {/* Plain-Arabic What-If Scenario Action Buttons */}
                <div className="flex flex-wrap items-center gap-1.5 text-[12px] tabular-nums">
                  <button
                    type="button"
                    onClick={() => setTansikShift(-1.5)}
                    className={`py-2 px-3 rounded-xl transition cursor-pointer font-medium border ${
                      tansikShift === -1.5
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs font-semibold"
                        : "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                    }`}
                  >
                    ماذا لو التنسيق نزل 1.5%؟
                  </button>

                  <button
                    type="button"
                    onClick={() => setTansikShift(0)}
                    className={`py-2 px-3 rounded-xl transition cursor-pointer font-medium border ${
                      tansikShift === 0
                        ? "bg-[#377ef0] text-white border-[#377ef0] shadow-2xs font-semibold"
                        : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    التنسيق المتوقع (الافتراضي)
                  </button>

                  <button
                    type="button"
                    onClick={() => setTansikShift(1.5)}
                    className={`py-2 px-3 rounded-xl transition cursor-pointer font-medium border ${
                      tansikShift === 1.5
                        ? "bg-amber-600 text-white border-amber-600 shadow-2xs font-semibold"
                        : "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100"
                    }`}
                  >
                    ماذا لو التنسيق رفع 1.5%؟
                  </button>
                </div>
              </div>

              {/* Sector Filter Pills with layoutId spring pill */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200">
                <span className="text-xs font-semibold text-slate-700 ml-1">
                  تصفية حسب نوع الكلية:
                </span>
                {[
                  "الكل",
                  "حكومي انتظام",
                  "برامج خاصة وساعات معتمدة",
                  "جامعات أهلية",
                  "جامعات خاصة وتكنولوجية",
                ].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setSectorFilter(sec)}
                    className={`relative px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      sectorFilter === sec
                        ? "text-[#377ef0] font-bold"
                        : "text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {sectorFilter === sec && (
                      <motion.div
                        layoutId="workspace-sector-pill"
                        className="absolute inset-0 rounded-lg bg-blue-50 border border-blue-300 shadow-2xs"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{sec}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Smart Zero-Match Auto-Recovery Alert */}
            {evaluation.allRanked.length === 0 ? (
              <div className="p-10 text-center space-y-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center">
                  <Info className="w-5 h-5" strokeWidth={1.5} />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-[15px] font-semibold text-slate-900">
                    لا توجد كليات تطابق هذا السقف المالي أو القطاع حالياً
                  </h3>
                  <p className="text-[12px] text-slate-500 leading-relaxed tabular-nums">
                    مجموعك ({score.toFixed(1)}%) يؤهلك لكليات متاحة، ولكنها تتطلب ضبط الميزانية إلى{" "}
                    {evaluation.minNeededBudget.toLocaleString()} ج.م أو فتح كافة القطاعات الجامعية.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSectorFilter("الكل");
                    setTansikShift(0);
                  }}
                  className="bg-[#377ef0] hover:bg-[#2962be] text-white px-5 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer tabular-nums shadow-sm"
                >
                  إعادة ضبط المرشحات واستكشاف كافة القطاعات المتاحة
                </button>
              </div>
            ) : (
              <div className="p-6">
                <div className="border border-slate-200 rounded-xl bg-white divide-y divide-slate-200 overflow-hidden shadow-2xs">
                  {evaluation.allRanked.map((fac, idx) => {
                    const rowNum = String(idx + 1).padStart(3, "0");
                    const m = computeFacultyTcoMetrics(
                      fac,
                      gov,
                      livingMode,
                      inflationScenario
                    );
                    const isCompared = comparedIds.includes(fac.id);
                    return (
                      <div
                        key={fac.id}
                        className="p-4 hover:bg-slate-50/70 transition flex flex-col 2xl:flex-row 2xl:items-center justify-between gap-3.5"
                      >
                        {/* Number & Primary Info */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <span
                            dir="ltr"
                            className="uimaven-index pt-1 shrink-0 w-8 text-center"
                          >
                            [{rowNum}]
                          </span>
                          <div className="min-w-0 flex-1 space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium border ${getCategoryBadgeStyle(
                                  fac.type
                                )}`}
                              >
                                {fac.type}
                              </span>
                              <span
                                className={`px-2 py-0.5 rounded text-xs font-medium border tabular-nums ${fac.safetyBadge.style}`}
                              >
                                {fac.safetyBadge.label}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold tabular-nums">
                                توافق {fac.matchScore}%
                              </span>
                            </div>
                            <h4 className="text-[14px] font-semibold text-slate-900 leading-snug">
                              {fac.name}
                            </h4>
                            <p className="text-xs text-slate-600 font-medium">
                              {fac.university}
                            </p>
                            {fac.whyMatch && (
                              <p className="text-xs text-slate-700 line-clamp-1">
                                <strong className="text-slate-800">سبب الترشيح: </strong>
                                {fac.whyMatch}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Aligned Metadata Columns: governorate, cutoff, yearly fee, total cost */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-start shrink-0 text-xs pt-3 2xl:pt-1 border-t 2xl:border-t-0 border-slate-100">
                          <div className="space-y-0.5 min-w-[70px]">
                            <div className="text-xs text-slate-600 font-medium">المحافظة</div>
                            <div className="font-medium text-slate-700">{fac.gov}</div>
                          </div>
                          <div className="space-y-0.5 min-w-[70px]">
                            <div className="text-xs text-slate-600 font-medium">حد القبول</div>
                            <div className="font-semibold text-slate-900 tabular-nums">
                              {fac.shiftedCutoff.toFixed(1)}%
                            </div>
                          </div>
                          <div className="space-y-0.5 min-w-[90px]">
                            <div className="text-xs text-slate-600 font-medium">المصروفات السنوية</div>
                            <div className="font-bold text-slate-900">
                              <AnimatedCounter value={fac.y1_base_fee} suffix=" ج.م" />
                            </div>
                            {fac.y1_base_fee <= budget && m.y1Base + m.adminFee + m.annualLiving > budget && budget > 0 && (
                              <div className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 mt-1 font-medium leading-tight text-center sm:text-start">
                                الرسوم الأساسية ضمن ميزانيتك، لكن التكلفة الفعلية للسنة الأولى أعلى
                              </div>
                            )}
                          </div>
                          <div className="space-y-0.5 min-w-[95px]">
                            <div className="text-xs text-slate-600 font-medium">التكلفة الإجمالية</div>
                            <div className="font-bold text-[#377ef0]">
                              <AnimatedCounter value={m.total4Yr} suffix=" ج.م" />
                            </div>
                          </div>
                        </div>

                        {/* Actions & Compare Toggle */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                          <button
                            type="button"
                            onClick={() => setAuditedFaculty(fac)}
                            className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
                          >
                            <FileText
                              className="w-3.5 h-3.5 text-slate-500"
                              strokeWidth={1.5}
                            />
                            <span>تفاصيل اللائحة</span>
                          </button>

                          {onSelectFutureCareer && (
                            <button
                              type="button"
                              onClick={() => onSelectFutureCareer(fac)}
                              className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 cursor-pointer transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
                            >
                              <Briefcase
                                className="w-3.5 h-3.5 text-blue-600"
                                strokeWidth={1.5}
                              />
                              <span>استكشاف المسار</span>
                            </button>
                          )}

                          <label
                            title={!isCompared && comparedIds.length >= 4 ? "الحد الأقصى للمقارنة هو 4 كليات" : undefined}
                            className={`flex items-center gap-1.5 text-xs font-medium select-none border px-2.5 py-1.5 rounded-lg transition-all duration-150 ${
                              isCompared
                                ? "bg-rose-50 border-rose-300 text-rose-700 font-semibold cursor-pointer hover:-translate-y-0.5 active:scale-[0.98]"
                                : comparedIds.length >= 4
                                ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed opacity-75"
                                : "bg-white border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer hover:-translate-y-0.5 active:scale-[0.98]"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isCompared}
                              disabled={!isCompared && comparedIds.length >= 4}
                              onChange={() => onToggleCompare(fac.id)}
                              className="rounded border-slate-300 text-blue-600 disabled:opacity-50"
                            />
                            <span>
                              {isCompared
                                ? "إلغاء الحفظ من المسودة"
                                : comparedIds.length >= 4
                                ? "الحد الأقصى 4 كليات"
                                : "حفظ في مسودة الرغبات"}
                            </span>
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setWorkspaceTab("quiz")}
                className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-[12px] font-medium cursor-pointer"
              >
                العودة لتقييم الميول
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceTab("tco_table")}
                className="bg-[#377ef0] hover:bg-[#2962be] text-white px-5 py-2.5 rounded-xl text-[12px] font-semibold flex items-center gap-2 cursor-pointer shadow-sm transition"
              >
                <span>مصفوفة سنوات الدراسة والتضخم (TCO)</span>
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            SUB-TAB 3: 3. مصفوفة سنوات الدراسة والتضخم TCO (TCO_TABLE)
           =================================================================== */}
        {workspaceTab === "tco_table" && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
            {/* Top Bar: Inflation Scenario Switcher + Methodology Button */}
            <div className="p-6 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-[17px] font-semibold text-slate-900">
                  مصفوفة التدفق المالي لسنوات الدراسة والتضخم (TCO)
                </h2>
                <div className="flex items-center gap-3 text-[12px]">
                  <button
                    type="button"
                    onClick={() => setIsMethodologyOpen(true)}
                    className="text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    منهجية الحساب ومراجعة البيانات
                  </button>
                  <span className="text-slate-300">|</span>
                  <span className="text-slate-600 font-medium">
                    أول ترشيحين مفتوحان مجاناً بالكامل
                  </span>
                </div>
              </div>

              <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-3 gap-1 text-xs tabular-nums border border-slate-200">
                {[
                  { rate: 10, label: "10% مستقر" },
                  { rate: 15, label: "15% مرجعي" },
                  { rate: 22, label: "22% تحوط أقصى" },
                ].map((sc) => (
                  <button
                    key={sc.rate}
                    type="button"
                    onClick={() => setInflationScenario(sc.rate)}
                    className={`py-1.5 px-3 rounded-lg transition cursor-pointer whitespace-nowrap ${
                      inflationScenario === sc.rate
                        ? "bg-white text-slate-900 shadow-2xs font-semibold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {sc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Wide Enterprise Table or Empty Table State */}
            {unlockedFreeFaculties.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <p className="text-[14px] text-slate-700 leading-relaxed font-medium">
                  مفيش كليات مناسبة بالميزانية دي. جرّب ترفع الميزانية أو تعدّل المجموع.
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      const presets = [50000, 100000, 150000, 200000];
                      const next = presets.find((p) => p > budget) ?? Math.min(250000, budget + 50000);
                      setBudget(next);
                    }}
                    className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-[13px] font-medium transition cursor-pointer shadow-2xs"
                  >
                    رفع الميزانية إلى {([50000, 100000, 150000, 200000].find((p) => p > budget) ?? Math.min(250000, budget + 50000)).toLocaleString()} ج.م
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse table-fixed min-w-[840px]">
                  <colgroup>
                    <col className="w-[29%]" />
                    <col className="w-[19%]" />
                    <col className="w-[15%]" />
                    <col className="w-[17%]" />
                    <col className="w-[14%]" />
                    <col className="w-[6%]" />
                  </colgroup>
                  <thead>
                    <tr className="bg-slate-50 text-slate-700 text-xs font-semibold border-b border-slate-200">
                      <th className="py-3.5 px-4 min-w-[240px] sticky right-0 bg-slate-50 z-10">
                        الكلية والجامعة
                      </th>
                      <th className="py-3.5 px-4">
                        إجمالي 4 سنين شاملة الزيادة السنوية
                      </th>
                      <th className="py-3.5 px-4">مصاريف المعامل والكتب</th>
                      <th className="py-3.5 px-4">
                        المشوار أو السكن في محافظتك
                      </th>
                      <th className="py-3.5 px-4">
                        شرط التخصص في سنة أولى والمنح
                      </th>
                      <th className="py-3.5 px-3 text-center">قارن</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-xs tabular-nums">
                    {unlockedFreeFaculties.map((fac, idx) => {
                      const m = computeFacultyTcoMetrics(
                        fac,
                        gov,
                        livingMode,
                        inflationScenario
                      );
                      const isCompared = comparedIds.includes(fac.id);
                      return (
                        <tr key={fac.id} className="bg-white hover:bg-slate-50">
                          {/* Column 1: Badge ABOVE Faculty Name (min-w-[240px] flex flex-col items-start gap-1.5) */}
                          <td className="py-4 px-4 align-top sticky right-0 bg-white z-10">
                            <div className="min-w-[240px] flex flex-col items-start gap-1.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                                الترشيح 0{idx + 1} • مفتوح
                              </span>
                              <span className="font-semibold text-[13px] text-slate-900 leading-snug">
                                {fac.name}
                              </span>
                              <span className="text-xs text-slate-600 font-medium">
                                {fac.university} • {fac.type}
                              </span>
                              <button
                                type="button"
                                onClick={() => setAuditedFaculty(fac)}
                                className="text-xs font-semibold text-blue-600 hover:underline cursor-pointer"
                              >
                                تفاصيل اللائحة
                              </button>
                            </div>
                          </td>

                          <td className="py-4 px-4 align-top">
                            <div className="font-bold text-[13px] text-slate-900 whitespace-nowrap">
                              {m.total4Yr.toLocaleString()} ج.م
                            </div>
                            <div className="text-xs text-slate-600 font-medium mt-0.5">
                              سنة 1 أساسي: {m.y1Base.toLocaleString()} ج.م
                            </div>
                            {/* 4px Stacked Breakdown Bar */}
                            <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden flex mt-2">
                              <div
                                className="bg-blue-600 h-full"
                                style={{ width: `${m.basePct}%` }}
                              />
                              <div
                                className="bg-amber-500 h-full"
                                style={{ width: `${m.adminPct}%` }}
                              />
                              <div
                                className="bg-emerald-500 h-full"
                                style={{ width: `${m.livingPct}%` }}
                              />
                            </div>
                          </td>

                          <td className="py-4 px-4 text-slate-700 align-top">
                            +{m.adminFee.toLocaleString()} ج.م/سنة
                          </td>

                          <td className="py-4 px-4 text-slate-700 align-top leading-relaxed">
                            <div className="font-semibold text-slate-900 text-xs">
                              {m.geoTierLabel}
                            </div>
                            <div className="text-xs text-slate-600">
                              {m.livingDesc}
                            </div>
                          </td>

                          <td className="py-4 px-4 text-slate-700 align-top leading-relaxed text-xs">
                            <div>{fac.gpa_requirement}</div>
                            <div className="text-blue-700 font-medium mt-1">
                              {fac.scholarship_rule}
                            </div>
                          </td>

                          <td className="py-4 px-3 text-center align-top">
                            <input
                              type="checkbox"
                              checked={isCompared}
                              onChange={() => onToggleCompare(fac.id)}
                              className="rounded border-slate-300 text-blue-600 cursor-pointer"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {/* Blurred Rows 3+ with Centered Floating Paywall Callout Card */}
                <div className="relative border-t border-slate-200 min-w-[840px]">
                  <table className="w-full text-right border-collapse table-fixed">
                    <colgroup>
                      <col className="w-[29%]" />
                      <col className="w-[19%]" />
                      <col className="w-[15%]" />
                      <col className="w-[17%]" />
                      <col className="w-[14%]" />
                      <col className="w-[6%]" />
                    </colgroup>
                    <tbody className="divide-y divide-slate-200 text-[12px] tabular-nums">
                      {(isReportUnlocked
                        ? evaluation.allRanked.slice(2, 10)
                        : lockedComparisonFaculties
                      ).map((fac, idx) => {
                        const m = computeFacultyTcoMetrics(
                          fac,
                          gov,
                          livingMode,
                          inflationScenario
                        );
                        const blurClass = isReportUnlocked
                          ? ""
                          : "blur-[5px] select-none pointer-events-none opacity-60";
                        const isCompared = comparedIds.includes(fac.id);
                        return (
                          <tr
                            key={fac.id}
                            className={
                              isReportUnlocked ? "bg-white hover:bg-slate-50" : "bg-slate-50/50"
                            }
                          >
                            <td className={`py-4 px-4 align-top sticky right-0 z-10 ${isReportUnlocked ? "bg-white" : "bg-slate-50"}`}>
                              <div className="min-w-[240px] flex flex-col items-start gap-1.5">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                                  الترشيح 0{idx + 3}
                                </span>
                                <span className="font-semibold text-[13px] text-slate-900 leading-snug">
                                  {fac.name}
                                </span>
                                <span className="text-xs text-slate-600 font-medium">
                                  {fac.university} • {fac.type}
                                </span>
                              </div>
                            </td>
                            <td
                              className={`py-4 px-4 font-bold text-slate-900 align-top ${blurClass}`}
                            >
                              {m.total4Yr.toLocaleString()} ج.م
                            </td>
                            <td
                              className={`py-4 px-4 text-slate-700 align-top ${blurClass}`}
                            >
                              +{m.adminFee.toLocaleString()} ج.م/سنة
                            </td>
                            <td
                              className={`py-4 px-4 text-slate-700 align-top ${blurClass}`}
                            >
                              {m.livingDesc}
                            </td>
                            <td
                              className={`py-4 px-4 text-slate-700 text-xs align-top ${blurClass}`}
                            >
                              {fac.gpa_requirement}
                            </td>
                            <td className="py-4 px-3 text-center align-top">
                              <input
                                type="checkbox"
                                checked={isCompared}
                                onChange={() => onToggleCompare(fac.id)}
                                className="rounded border-slate-300 text-blue-600 cursor-pointer"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {!isReportUnlocked && (
                    <div className="absolute inset-x-0 top-10 z-20 bg-white/95 border border-slate-200 shadow-2xl rounded-xl p-6 text-center no-print">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center mb-3">
                        <Lock className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                      <h3 className="text-[15px] font-semibold text-slate-900">
                        افتح مصفوفة التكلفة الكاملة لباقي الكليات المطابقة
                      </h3>
                      <p className="text-[12px] text-slate-600 mt-1.5 mb-4 leading-relaxed tabular-nums">
                        يشمل حساب التدفق المالي الكامل بالتضخم، لوائح الـ GPA الداخلي، ومراجعة المستشار الأكاديمي مع المذكرة الصوتية.
                      </p>
                      <button
                        type="button"
                        onClick={onOpenCheckout}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl text-[13px] font-semibold transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer tabular-nums shadow-sm"
                      >
                        فتح التقرير المقارن الكامل واعتماد المستشار — 150 ج.م
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Bottom Tab Navigation */}
            <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setWorkspaceTab("scenarios")}
                className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-[12px] font-medium cursor-pointer"
              >
                العودة للترشيحات والتنسيق
              </button>
              <button
                type="button"
                onClick={() => setWorkspaceTab("compare")}
                className="bg-[#377ef0] hover:bg-[#2962be] text-white px-5 py-2.5 rounded-xl text-[12px] font-semibold flex items-center gap-2 cursor-pointer transition-colors"
              >
                <span>مقارنة الكليات وجهاً لوجه</span>
                <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        )}

        {/* ===================================================================
            SUB-TAB 4: 4. المقارنة وجهاً لوجه (COMPARE)
           =================================================================== */}
        {workspaceTab === "compare" && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden space-y-6 p-6">
            {/* Explainable AI Best-Fit Verdict Banner */}
            {bestFitComparedFaculty && (
              <UIMavenCard
                indexCode="001 // VERDICT"
                badgeText="الأعلى كفاءة لملفك"
                statusDotColor="bg-blue-600"
                className="shadow-2xs text-right"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-bold text-blue-900">
                      الخيار الأنسب لملفك الأكاديمي والمالي
                    </span>
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200 tabular-nums">
                      الأعلى كفاءة
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed tabular-nums">
                    بناءً على مقارنة البدائل المختارة مع مجموعك ({score.toFixed(1)}
                    %) وميزانيتك السنوية ({budget.toLocaleString()} ج.م) في محافظة{" "}
                    {gov}، يتصدر{" "}
                    <strong className="text-slate-900">
                      «{bestFitComparedFaculty.name} —{" "}
                      {bestFitComparedFaculty.university}»
                    </strong>{" "}
                    كأفضل خيار يوازن بين قوة العائد الوظيفي ({
                      bestFitComparedFaculty.future_career?.salary_range_egp || "متوسط رواتب تنافسي"
                    }) وتقليل أعباء الاغتراب والتضخم التراكمي طوال سنوات الدراسة.
                  </p>
                </div>
              </UIMavenCard>
            )}

            {/* 8-Row Side-by-Side Comparison Matrix */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-right border-collapse text-xs tabular-nums">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="py-3.5 px-4 font-semibold text-slate-700 w-44 sticky right-0 bg-slate-50 z-10">
                      معيار المقارنة (8 محاور)
                    </th>
                    {comparedFacultiesList.map((fac) => (
                      <th
                        key={fac.id}
                        className="py-3.5 px-4 font-bold text-slate-900 min-w-[210px]"
                      >
                        <div>{fac.name}</div>
                        <div className="text-xs font-medium text-slate-600 mt-0.5">
                          {fac.university}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 sticky right-0 z-10">
                      1. نوع الجامعة والتبعية
                    </td>
                    {comparedFacultiesList.map((fac) => (
                      <td key={fac.id} className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium border ${getCategoryBadgeStyle(
                            fac.type
                          )}`}
                        >
                          {fac.type}
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 sticky right-0 z-10">
                      2. حد القبول وهامش الأمان
                    </td>
                    {comparedFacultiesList.map((fac) => {
                      const diff = +(
                        score -
                        (fac.cutoff_2026 + tansikShift)
                      ).toFixed(1);
                      return (
                        <td key={fac.id} className="py-3 px-4 font-semibold text-slate-900">
                          {(fac.cutoff_2026 + tansikShift).toFixed(1)}% (
                          {diff >= 0 ? `+${diff}%` : `${diff}%`})
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 sticky right-0 z-10">
                      3. مصروفات السنة الأولى
                    </td>
                    {comparedFacultiesList.map((fac) => (
                      <td key={fac.id} className="py-3 px-4 font-semibold text-slate-900">
                        {fac.y1_base_fee.toLocaleString()} ج.م (+
                        {fac.admin_lab_fee.toLocaleString()} ج.م معامل)
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 sticky right-0 z-10">
                      4. إجمالي تكلفة الدراسة بالكامل بالتضخم
                    </td>
                    {comparedFacultiesList.map((fac) => {
                      const m = computeFacultyTcoMetrics(
                        fac,
                        gov,
                        livingMode,
                        inflationScenario
                      );
                      return (
                        <td
                          key={fac.id}
                          className="py-3 px-4 font-bold text-blue-700"
                        >
                          {m.total4Yr.toLocaleString()} ج.م
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 sticky right-0 z-10">
                      5. الاستقرار الجغرافي
                    </td>
                    {comparedFacultiesList.map((fac) => {
                      const m = computeFacultyTcoMetrics(
                        fac,
                        gov,
                        livingMode,
                        inflationScenario
                      );
                      return (
                        <td key={fac.id} className="py-3 px-4 text-xs">
                          <div className="font-semibold text-slate-900">
                            {m.geoTierLabel}
                          </div>
                          <div className="text-xs text-slate-600 font-medium">{m.livingDesc}</div>
                        </td>
                      );
                    })}
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 sticky right-0 z-10">
                      6. شروط الـ GPA الداخلي
                    </td>
                    {comparedFacultiesList.map((fac) => (
                      <td
                        key={fac.id}
                        className="py-3 px-4 text-xs leading-relaxed text-slate-700 font-medium"
                      >
                        {fac.gpa_requirement}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 sticky right-0 z-10">
                      7. منح التفوق
                    </td>
                    {comparedFacultiesList.map((fac) => (
                      <td
                        key={fac.id}
                        className="py-3 px-4 text-xs leading-relaxed text-slate-700 font-medium"
                      >
                        {fac.scholarship_rule}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td className="py-3 px-4 font-semibold text-slate-700 bg-slate-50 sticky right-0 z-10">
                      8. الآفاق الوظيفية والرواتب
                    </td>
                    {comparedFacultiesList.map((fac) => (
                      <td
                        key={fac.id}
                        className="py-3 px-4 text-xs space-y-1"
                      >
                        <div className="font-semibold text-emerald-800">
                          الطلب: {fac.future_career?.market_demand || "متوسط"}
                        </div>
                        <div className="font-medium text-slate-900">
                          {fac.future_career?.salary_range_egp || "15,000 - 30,000 ج.م"}
                        </div>
                        <div className="text-xs text-slate-600 font-medium">
                          {fac.future_career?.roles?.slice(0, 2)?.join(" • ") || "مسارات وظيفية متعددة"}
                        </div>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================================
          FLOATING COMPARE TRAY (Primer Blueprint / Sparkle Gold Accent)
         ===================================================================== */}
      <AnimatePresence>
        {comparedIds.length > 0 && workspaceTab !== "compare" && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 28 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl px-5 py-3 flex items-center gap-4 no-print"
          >
            <div className="flex items-center gap-2 text-[13px] text-slate-700">
              <span className="w-2.5 h-2.5 rounded-full bg-[#377ef0] animate-pulse" />
              <span>تم تحديد</span>
              <span className="font-bold text-[#377ef0]">
                <AnimatedCounter value={comparedIds.length} />
              </span>
              <span>كليات للمقارنة</span>
            </div>
            <button
              type="button"
              onClick={() => setWorkspaceTab("compare")}
              className="bg-[#377ef0] hover:bg-[#2962be] text-white px-4 py-2 rounded-xl text-[12px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>قارن الكليات المختارة</span>
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          FACULTY AUDIT & METHODOLOGY SLIDE-OVER DRAWERS
         ===================================================================== */}
      <AnimatePresence>
        {auditedFaculty && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end no-print">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="bg-white w-full h-full shadow-2xl border-r border-slate-200 p-6 overflow-y-auto flex flex-col justify-between max-w-md"
            >
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded text-xs font-medium border ${getCategoryBadgeStyle(
                      auditedFaculty.type
                    )}`}
                  >
                    {auditedFaculty.type} • {auditedFaculty.gov}
                  </span>
                  <h3 className="text-[18px] font-bold text-slate-900 mt-1.5">
                    {auditedFaculty.name}
                  </h3>
                  <p className="text-[13px] text-slate-600 font-medium">
                    {auditedFaculty.university}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAuditedFaculty(null)}
                  className="text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 tabular-nums text-[12px]">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <span className="text-slate-500 block">مؤشر القبول الاسترشادي</span>
                  <strong className="text-[16px] text-slate-900 font-bold">
                    {auditedFaculty.cutoff_2026.toFixed(1)}%
                  </strong>
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <span className="text-slate-500 block">
                    مصروفات السنة الأولى
                  </span>
                  <strong className="text-[16px] text-blue-700 font-bold">
                    {auditedFaculty.y1_base_fee.toLocaleString()} ج.م
                  </strong>
                </div>
                {(() => {
                  const am = computeFacultyTcoMetrics(auditedFaculty, gov, livingMode, inflationScenario);
                  if (auditedFaculty.y1_base_fee <= budget && am.y1Base + am.adminFee + am.annualLiving > budget && budget > 0) {
                    return (
                      <div className="col-span-2 text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2 font-medium">
                        الرسوم الأساسية ضمن ميزانيتك، لكن التكلفة الفعلية للسنة الأولى أعلى
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="space-y-2 text-[12px]">
                <h4 className="font-semibold text-slate-900">
                  تفاصيل اللائحة الأكاديمية وشروط الـ GPA الداخلي:
                </h4>
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2 leading-relaxed">
                  <div>
                    <strong className="text-slate-900">شرط التخصص: </strong>
                    <span className="text-slate-700">{auditedFaculty.gpa_requirement}</span>
                  </div>
                  <div>
                    <strong className="text-slate-900">ملاحظات اللائحة: </strong>
                    <span className="text-slate-700">{auditedFaculty.bylaw_notes}</span>
                  </div>
                  <div>
                    <strong className="text-slate-900">نظام المنح: </strong>
                    <span className="text-slate-700">{auditedFaculty.scholarship_rule}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-[12px]">
                <h4 className="font-semibold text-slate-900">
                  المسار الوظيفي والرواتب المتوقعة بعد التخرج:
                </h4>
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2 tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-slate-500">الطلب في سوق العمل:</span>
                    <strong className="text-emerald-700">
                      {auditedFaculty.future_career?.market_demand || "واعد"}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">متوسط الرواتب:</span>
                    <strong className="text-slate-900">
                      {auditedFaculty.future_career?.salary_range_egp || "15,000 - 30,000 ج.م"}
                    </strong>
                  </div>
                  <div className="pt-1 text-slate-600">
                    {auditedFaculty.future_career?.progression || "تدرج وظيفي تصاعدي مع اكتساب الخبرة العملية"}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setAuditedFaculty(null)}
                className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-[12px] font-medium cursor-pointer"
              >
                إغلاق
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuditedFaculty(null);
                  onOpenCheckout();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-[12px] font-medium cursor-pointer tabular-nums shadow-sm transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
              >
                إصدار التقرير المعتمد الكامل — 150 ج.م
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

      <AnimatePresence>
        {isMethodologyOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="bg-white border border-slate-200 rounded-xl w-full max-w-lg p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-blue-600" strokeWidth={1.5} />
                  <h3 className="text-[16px] font-semibold text-slate-900">
                    منهجية الحساب ومراجعة البيانات في ChooseU
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMethodologyOpen(false)}
                  className="text-slate-500 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              <div className="space-y-3 text-[12px] text-slate-600 leading-relaxed tabular-nums">
                <p>
                  <strong className="text-slate-900 block mb-0.5">
                    1. معادلة الترتيب الموزون (Weighted Relevance Score):
                  </strong>
                  تُرتب الكليات وفق معادلة هندسية تجمع بين تقارب حد القبول مع مجموع الطالب (40%)، التوافق مع تقييم الميول المهنية (35%)، ملاءمة الميزانية (15%)، والقرب الجغرافي (10%).
                </p>
                <p>
                  <strong className="text-slate-900 block mb-0.5">
                    2. حساب التكلفة التراكمية طوال سنوات الدراسة (Compound TCO):
                  </strong>
                  تُحسب التكلفة الكلية بإضافة الرسوم المعملية والإدارية السنوية ومعدل الزيادة المركبة للمصروفات (10% مستقر، 15% مرجعي، 22% تحوط أقصى) إلى جانب تكلفة الانتقال المحلي أو السكن الطلابي.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsMethodologyOpen(false)}
                  className="bg-[#377ef0] hover:bg-[#2962be] text-white px-5 py-2 rounded-xl text-[12px] font-medium cursor-pointer transition-colors"
                >
                  إغلاق النافذة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
