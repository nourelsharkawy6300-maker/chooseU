"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Printer,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Building2,
  Scale,
  DollarSign,
  FileText,
  Compass,
  PieChart,
  Award,
} from "lucide-react";
import {
  StreamType,
  TrackKey,
  InterestCluster,
  EvaluationResult,
  Faculty,
  RankedFaculty,
} from "@/types/chooseu";
import {
  STREAM_QUIZ_BANKS,
  TRACK_DETAILS,
  FACULTIES_DATABASE,
} from "@/data/faculties-db";
import { PersonaRadarHexagon } from "@/app/page";

interface AssessmentLabViewProps {
  studentName: string;
  stream: StreamType;
  score: number;
  budget: number;
  governorate: string;
  quizAnswers: Record<number, TrackKey>;
  onAnswerQuestion: (qId: number, track: TrackKey) => void;
  onResetQuiz: () => void;
  evaluation: EvaluationResult;
  clusterAffinities: Record<InterestCluster, number>;
  onOpenFacultyDrawer: (faculty: Faculty) => void;
}

export function AssessmentLabView({
  studentName,
  stream,
  score,
  budget,
  governorate,
  quizAnswers,
  onAnswerQuestion,
  onResetQuiz,
  evaluation,
  clusterAffinities,
  onOpenFacultyDrawer,
}: AssessmentLabViewProps) {
  const questions = STREAM_QUIZ_BANKS[stream] || [];
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const answeredCount = Object.keys(quizAnswers).length;
  const totalQuestions = questions.length;
  const isCompleted = answeredCount >= totalQuestions && totalQuestions > 0;
  const progressPercent = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const [activeTab, setActiveTab] = useState<"quiz" | "report">(
    isCompleted ? "report" : "quiz"
  );

  const currentQ = questions[currentQuestionIdx];
  const selectedTrack = currentQ ? quizAnswers[currentQ.id] : undefined;

  const handleSelectOption = (track: TrackKey) => {
    if (!currentQ) return;
    onAnswerQuestion(currentQ.id, track);
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-bold mb-1.5">
            <Sparkles className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>مختبر التقييم السلوكي والتقرير الأكاديمي</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            التقييم التوافقي وتفسير قرار الخوارزمية
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            10 مواقف قياسية مبنية على نماذج Holland و RIASEC لشعبة {stream === "Science" ? "علمي علوم" : stream === "Math" ? "علمي رياضة" : "أدبي"}
          </p>
        </div>

        {/* Tab & Action Controls */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                activeTab === "quiz"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              الأسئلة السلوكية ({answeredCount}/{totalQuestions})
            </button>
            <button
              onClick={() => setActiveTab("report")}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-md transition-colors cursor-pointer ${
                activeTab === "report"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              التقرير والتفسير الكامل
            </button>
          </div>

          <button
            onClick={onResetQuiz}
            className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg transition-colors cursor-pointer"
            title="إعادة ضبط إجابات الاختبار"
          >
            <RotateCcw className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>
      </div>

      {/* QUIZ TAB */}
      {activeTab === "quiz" && (
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Progress Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-[12px]">
              <span className="font-bold text-slate-900">
                السؤال رقم <span className="tabular-nums font-mono">{currentQuestionIdx + 1}</span> من{" "}
                <span className="tabular-nums font-mono">{totalQuestions}</span>
              </span>
              <span className="text-slate-500 font-mono tabular-nums">
                {progressPercent.toFixed(0)}% مكتمل
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Current Question Card */}
          {currentQ && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-blue-600 font-bold">
                  موقف واقعي #{currentQ.id}
                </span>
                <h2 className="text-lg font-bold text-slate-900 leading-relaxed">
                  {currentQ.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ.options.map((option, idx) => {
                  const isChosen = selectedTrack === option.track;
                  const trackMeta = TRACK_DETAILS[option.track];

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(option.track)}
                      className={`w-full text-right p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isChosen
                          ? "border-blue-600 bg-blue-50/50 shadow-xs"
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                          isChosen
                            ? "bg-blue-600 border-blue-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isChosen ? (
                          <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" />
                        ) : (
                          <span className="text-[10px] font-mono text-slate-400">
                            {idx + 1}
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p
                          className={`text-[13px] leading-relaxed ${
                            isChosen
                              ? "font-bold text-blue-950"
                              : "text-slate-800 font-medium"
                          }`}
                        >
                          {option.label}
                        </p>
                        {trackMeta && (
                          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                            <span className="font-semibold text-slate-700">
                              المسار المرتبط: {trackMeta.title}
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx(currentQuestionIdx - 1)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-[12px] font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
                >
                  <ArrowRight className="w-4 h-4 stroke-[1.5]" />
                  <span>السابق</span>
                </button>

                {currentQuestionIdx < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                    className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg text-[12px] font-bold cursor-pointer flex items-center gap-1"
                  >
                    <span>التالي</span>
                    <ArrowLeft className="w-4 h-4 stroke-[1.5]" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setActiveTab("report")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[12px] font-bold cursor-pointer flex items-center gap-1"
                  >
                    <span>عرض التقرير النهائي ←</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* REPORT TAB: WHY THIS MATCH? (ALGORITHM EXPLAINER) */}
      {activeTab === "report" && (
        <div className="space-y-6">
          {/* Printable Report Header */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-600 stroke-[1.5]" />
                <h2 className="text-lg font-bold text-slate-900">
                  تقرير التوجيه الأكاديمي الشامل وخوارزمية المطابقة
                </h2>
              </div>
              <p className="text-[12px] text-slate-600">
                الطالب: <span className="font-bold text-slate-900">{studentName}</span> • الشعبة:{" "}
                <span className="font-bold text-blue-600">
                  {stream === "Science" ? "علمي علوم" : stream === "Math" ? "علمي رياضة" : "أدبي"}
                </span>{" "}
                • النسبة: <span className="font-mono font-bold tabular-nums">{score}%</span> • المحافظة:{" "}
                <span className="font-bold text-slate-900">{governorate}</span>
              </p>
            </div>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-[12px] font-bold rounded-lg transition-colors cursor-pointer shrink-0"
            >
              <Printer className="w-4 h-4 stroke-[1.5]" />
              <span>طباعة / حفظ PDF</span>
            </button>
          </div>

          {/* Algorithm Breakdown Methodology (40 / 30 / 20 / 10) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  تفسير قرار الخوارزمية (Why This Match? Weights)
                </h3>
                <p className="text-[11px] text-slate-500">
                  معايير الترتيب الرياضي لترشيح الكليات بدون أي تحيز بشري
                </p>
              </div>
              <span className="text-[11px] font-mono text-slate-500">SCU-RULE-2026</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="border border-slate-200 rounded-xl p-3.5 bg-blue-50/40">
                <div className="flex items-center justify-between text-blue-900 font-bold text-[12px] mb-1">
                  <span>التوافق الأكاديمي والسلوكي</span>
                  <span className="font-mono text-base text-blue-600 tabular-nums">40%</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  مطابقة إجاباتك في المواقف السلوكية مع المسارات التخصصية للكليات (RIASEC Alignment).
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 bg-emerald-50/40">
                <div className="flex items-center justify-between text-emerald-900 font-bold text-[12px] mb-1">
                  <span>هامش الأمان بالدرجات</span>
                  <span className="font-mono text-base text-emerald-600 tabular-nums">30%</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  فارق مجموعك عن الحد الأدنى المتوقع لـ 2026 وفق مؤشرات التنسيق الرسمية.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 bg-amber-50/40">
                <div className="flex items-center justify-between text-amber-900 font-bold text-[12px] mb-1">
                  <span>الملاءمة المالية (TCO)</span>
                  <span className="font-mono text-base text-amber-600 tabular-nums">20%</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  توافق المصروفات السنوية ومصاريف المعامل والإقامة مع الميزانية المحددة للأسرة.
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-3.5 bg-purple-50/40">
                <div className="flex items-center justify-between text-purple-900 font-bold text-[12px] mb-1">
                  <span>التوزيع الجغرافي والإقامة</span>
                  <span className="font-mono text-base text-purple-600 tabular-nums">10%</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  قرب الجامعة من نطاق محافظتك لتقليل تكاليف الاغتراب والسفر اليومي.
                </p>
              </div>
            </div>
          </div>

          {/* Matched Faculties with "Why This Match?" Explanation Cards */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                قائمة الكليات المرشحة وتفسير المطابقة التفصيلي
              </h3>
              <span className="text-[11px] text-slate-500">
                إجمالي النتائج: {evaluation.allRanked.length} كلية
              </span>
            </div>

            <div className="space-y-3">
              {evaluation.allRanked.slice(0, 5).map((faculty: RankedFaculty, idx: number) => {
                return (
                  <div
                    key={faculty.id}
                    className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors bg-white space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-blue-600 text-[12px]">
                            #{idx + 1}
                          </span>
                          <h4 className="text-[14px] font-bold text-slate-900">
                            {faculty.name} - {faculty.university}
                          </h4>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {faculty.type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">
                          {faculty.gov} • الحد الأدنى المقدر:{" "}
                          <span className="font-mono font-bold text-slate-800 tabular-nums">
                            {faculty.cutoff_2026}%
                          </span>{" "}
                          • المصروفات السنوية:{" "}
                          <span className="font-mono font-bold text-slate-800 tabular-nums">
                            {faculty.y1_base_fee === 0
                              ? "مجاني"
                              : `${faculty.y1_base_fee.toLocaleString("en-US")} ج.م`}
                          </span>
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-[10px] text-slate-500 font-medium">درجة التطابق</div>
                          <div className="text-base font-mono font-bold text-emerald-600 tabular-nums">
                            {faculty.matchScore}%
                          </div>
                        </div>
                        <button
                          onClick={() => onOpenFacultyDrawer(faculty)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                        >
                          التفاصيل الكاملة
                        </button>
                      </div>
                    </div>

                    {/* Explainer Box: Why This Match? */}
                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-[12px] space-y-1.5">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 stroke-[1.5]" />
                        <span>تفسير الخوارزمية لترشيح هذه الكلية لك:</span>
                      </div>
                      <p className="text-slate-700 text-[11px] leading-relaxed">
                        {faculty.whyMatch ||
                          `مجموعك (${score}%) يوفر هامشاً آمناً مع توافق عالي لمسارات الكلية ومطابقة كاملة للميزانية المحددة.`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
