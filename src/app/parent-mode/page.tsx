"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useStudent } from "@/context/StudentContext";
import {
  computeFacultyTcoWithScholarship,
  computePsychometricAffinities,
  evaluateAndRankFaculties,
} from "@/lib/engine";
import {
  FACULTIES_DATABASE,
  TRACK_DETAILS,
  getFacultyAccreditation,
} from "@/data/faculties-db";
import { matchScholarships } from "@/data/scholarships-db";
import {
  DEFAULT_MVP_STATE,
  MvpUserState,
  ParentFeedbackEntry,
  loadMvpState,
  saveMvpState,
} from "@/lib/mvp-storage";
import { formatScore, formatStream, StreamType, TrackKey } from "@/types/chooseu";
import {
  AlertCircle,
  Award,
  Building2,
  CalendarCheck,
  CheckCircle2,
  FileText,
  HeartHandshake,
  Lock,
  MessageSquareHeart,
  Save,
  Scale,
  ShieldCheck,
  Sparkles,
  Unlock,
  Users,
  Wallet,
} from "lucide-react";

const STANCE_MAP = {
  supportive: {
    label: "موافق وداعم لاختيارات الطالب",
    cls: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  needs_discussion: {
    label: "نحتاج جلسة نقاش عائلية إضافية",
    cls: "bg-amber-50 text-amber-800 border-amber-200",
  },
  concerned: {
    label: "لدي تحفظات مالية أو جغرافية تحتاج مراجعة",
    cls: "bg-rose-50 text-rose-800 border-rose-200",
  },
} as const;

const NEXT_STEPS = [
  {
    title: "1. مراجعة المستندات الرسمية مبكراً",
    desc: "استمارة النجاح، شهادة الميلاد المميكنة، صور شخصية، وإثبات دخل الأسرة للتقديم في المنح.",
  },
  {
    title: "2. التحقق من اختبارات القدرات واللغة",
    desc: "بعض الكليات (الفنون، الإعلام، الجامعات الأهلية/الدولية) تشترط اختبار قدرات أو لغة قبل غلق باب التنسيق.",
  },
  {
    title: "3. الاتفاق الأسري على سقف الميزانية السنوية",
    desc: "مراعاة زيادة المصروفات التراكمية (التضخم) وتكلفة السكن أو المواصلات طوال 4 سنوات الدراسة.",
  },
  {
    title: "4. تأكيد القائمة المختصرة ومتابعة المواعيد",
    desc: "حفظ أفضل 3–5 بدائل في خطة التنفيذ والتقديم قبل إغلاق مواعيد الجامعات والمنح.",
  },
];

export default function ParentModePage() {
  const {
    authUser,
    studentName,
    stream,
    scorePercentage,
    annualBudgetEgp,
    governorate,
    livingMode,
    inflationScenario,
    comparedIds,
    assessmentAnswers,
  } = useStudent();

  const [mvpState, setMvpState] = useState<MvpUserState>(DEFAULT_MVP_STATE);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedNotice, setSavedNotice] = useState("");

  // Parent feedback form state
  const [parentName, setParentName] = useState("");
  const [stance, setStance] = useState<ParentFeedbackEntry["stance"]>("supportive");
  const [preferredOption, setPreferredOption] = useState("");
  const [opinion, setOpinion] = useState("");
  const [concerns, setConcerns] = useState("");
  const [suggestions, setSuggestions] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const state = await loadMvpState(authUser?.id ?? null);
      if (cancelled) return;
      setMvpState(state);
      if (state.parentFeedback) {
        setParentName(state.parentFeedback.parentName);
        setStance(state.parentFeedback.stance);
        setPreferredOption(state.parentFeedback.preferredOption);
        setOpinion(state.parentFeedback.opinion);
        setConcerns(state.parentFeedback.concerns);
        setSuggestions(state.parentFeedback.suggestions);
      }
      setLoaded(true);
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, [authUser?.id]);

  const answersByStream = useMemo<Record<StreamType, Record<number, TrackKey>>>(
    () => ({
      Science: stream === "Science" ? assessmentAnswers || {} : {},
      Math: stream === "Math" ? assessmentAnswers || {} : {},
      Arts: stream === "Arts" ? assessmentAnswers || {} : {},
      stem: stream === "stem" ? assessmentAnswers || {} : {},
    }),
    [stream, assessmentAnswers]
  );

  const psych = useMemo(
    () => computePsychometricAffinities(stream, answersByStream),
    [stream, answersByStream]
  );

  const evaluation = useMemo(
    () =>
      evaluateAndRankFaculties({
        stream,
        score: scorePercentage || 80,
        budget: annualBudgetEgp || 50000,
        gov: governorate || "القاهرة",
        tansikShift: 0,
        sectorFilter: "الكل",
        trackCounts: psych.trackCounts,
      }),
    [stream, scorePercentage, annualBudgetEgp, governorate, psych.trackCounts]
  );

  const topOptions = useMemo(() => evaluation.allRanked.slice(0, 6), [evaluation]);

  const comparedFaculties = useMemo(() => {
    const picked = comparedIds
      .map((id) => FACULTIES_DATABASE.find((f) => f.id === id))
      .filter((f): f is NonNullable<typeof f> => Boolean(f));
    return picked.length >= 2 ? picked.slice(0, 3) : topOptions.slice(0, 3);
  }, [comparedIds, topOptions]);

  const topScholarships = useMemo(
    () =>
      matchScholarships({
        stream,
        score: scorePercentage || 80,
        budget: annualBudgetEgp || 50000,
        topTrack: psych.topTrack,
      }).slice(0, 3),
    [stream, scorePercentage, annualBudgetEgp, psych.topTrack]
  );

  const handleToggleParentMode = async () => {
    const next: MvpUserState = {
      ...mvpState,
      parentModeEnabled: !mvpState.parentModeEnabled,
    };
    setMvpState(next);
    setSaving(true);
    await saveMvpState(authUser?.id ?? null, next);
    setSaving(false);
    setSavedNotice(
      next.parentModeEnabled
        ? "تم تفعيل وضع ولي الأمر بنجاح. يمكنك الآن استعراض الرحلة مع الأسرة."
        : "تم إيقاف وضع ولي الأمر. بياناتك خاصة بك وحدك."
    );
    setTimeout(() => setSavedNotice(""), 4000);
  };

  const handleSaveFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const entry: ParentFeedbackEntry = {
      id: `pf-${Date.now()}`,
      parentName: parentName.trim() || "ولي الأمر",
      stance,
      preferredOption: preferredOption.trim(),
      opinion: opinion.trim(),
      concerns: concerns.trim(),
      suggestions: suggestions.trim(),
      updatedAt: new Date().toISOString(),
    };
    const next: MvpUserState = {
      ...mvpState,
      parentModeEnabled: true,
      parentFeedback: entry,
    };
    setMvpState(next);
    const ok = await saveMvpState(authUser?.id ?? null, next);
    setSaving(false);
    setSavedNotice(
      ok
        ? "تم حفظ ملاحظات ولي الأمر وربطها بتقرير القرار الجامعي بنجاح."
        : "تم حفظ الملاحظات محلياً على الجهاز."
    );
    setTimeout(() => setSavedNotice(""), 4500);
  };

  return (
    <div className="px-4 lg:px-8 py-8 space-y-6 max-w-6xl mx-auto">
      {/* Top Control Header — Student-Controlled */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Parent Mode — دعم القرار الأسري المشترك</span>
            </div>
            <h1 className="text-[22px] font-extrabold text-slate-900">
              وضع ولي الأمر (اختياري وبتحكم كامل من الطالب)
            </h1>
            <p className="text-[13px] text-slate-600 max-w-2xl">
              مساحة شفافة ومبسطة تتيح لولي الأمر فهم ميول الطالب ونتائج تقييمه، والبدائل الجامعية المناسبة، والتكلفة الفعلية بعد المنح، وإضافة رأيه وملاحظاته لدعم قرار جامعي واعٍ ومشترك.
            </p>
          </div>

          <button
            type="button"
            disabled={saving || !loaded}
            onClick={handleToggleParentMode}
            className={`px-4 py-2.5 rounded-xl text-[13px] font-bold inline-flex items-center gap-2 transition cursor-pointer shadow-xs ${
              mvpState.parentModeEnabled
                ? "bg-emerald-600 hover:bg-emerald-700 text-slate-950"
                : "bg-[#FACC15] hover:bg-[#EAB308] text-slate-950"
            }`}
          >
            {mvpState.parentModeEnabled ? (
              <>
                <Unlock className="w-4 h-4" />
                <span>وضع ولي الأمر مُفعّل (إيقاف)</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>تفعيل وضع ولي الأمر</span>
              </>
            )}
          </button>
        </div>

        {savedNotice && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-xl text-[12px] font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{savedNotice}</span>
          </div>
        )}

        <div className="bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-[12px] text-slate-600 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
          <span>
            <strong>مبدأ ChooseU:</strong> وضع ولي الأمر اختياري تماماً ويُفعَّل بإرادة الطالب فقط. دور الأسرة هو الدعم والمشاورة الواعية بينما يظل الطالب في قلب اختيار مستقبله الأكاديمي.
          </span>
        </div>
      </div>

      {!mvpState.parentModeEnabled ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-lg mx-auto">
            <h2 className="text-[17px] font-bold text-slate-900">
              وضع ولي الأمر مغلق حالياً
            </h2>
            <p className="text-[13px] text-slate-600">
              عند تفعيلك لوضع ولي الأمر، ستظهر لوحة عائلية واضحة تشمل: ملخص الطالب، التخصصات المقترحة، مقارنة الجامعات والتكاليف والمنح، ونموذج لمشاركة رأي وملاحظات ولي الأمر.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleParentMode}
            className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 px-6 py-2.5 rounded-xl text-[13px] font-bold inline-flex items-center gap-2 transition cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            <span>تفعيل وضع ولي الأمر الآن</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 1. Student Profile Overview & Recommended Majors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-[15px]">
                <Users className="w-4 h-4 text-amber-600" />
                <span>1. ملخص ملف الطالب ونتائج التقييم</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
                  <span className="text-slate-500 block text-[11px]">اسم الطالب</span>
                  <strong className="text-slate-900">{studentName || "طالب ChooseU"}</strong>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
                  <span className="text-slate-500 block text-[11px]">الشعبة والمجموع</span>
                  <strong className="text-slate-900 tabular-nums">
                    {formatStream(stream)} • {formatScore(scorePercentage)}
                  </strong>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
                  <span className="text-slate-500 block text-[11px]">الميزانية السنوية المتاحة</span>
                  <strong className="text-slate-900 tabular-nums">
                    {annualBudgetEgp > 0 ? `${annualBudgetEgp.toLocaleString()} ج.م / سنة` : "غير محددة"}
                  </strong>
                </div>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
                  <span className="text-slate-500 block text-[11px]">المحافظة ونمط المعيشة</span>
                  <strong className="text-slate-900">
                    {governorate || "القاهرة"} • {livingMode === "dorm" ? "إقامة / سكن" : "مواصلات يومية"}
                  </strong>
                </div>
              </div>
              {mvpState.extendedProfile.goalsText && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[12px] text-slate-700">
                  <strong className="text-slate-900 block mb-0.5">أهداف الطالب المكتوبة:</strong>
                  {mvpState.extendedProfile.goalsText}
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-[15px]">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>2. التخصصات المقترحة ولماذا تناسب الطالب</span>
              </div>
              <div className="space-y-2.5">
                {psych.sortedAffinities.slice(0, 3).map((track, idx) => (
                  <div
                    key={track.key}
                    className="border border-slate-200 rounded-xl p-3 bg-slate-50/60 space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[13px] text-slate-900">
                        {idx + 1}. {track.title}
                      </span>
                      <span className="text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full tabular-nums">
                        توافق {track.percentage > 0 ? `${track.percentage}%` : "مقترح للشعبة"}
                      </span>
                    </div>
                    <p className="text-[12px] text-slate-600 leading-relaxed">
                      {TRACK_DETAILS[track.key]?.subtitle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3. University Options + Financial Overview + Scholarships */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-[15px]">
                <Wallet className="w-4 h-4 text-amber-600" />
                <span>3. النظرة المالية ومقارنة المسارات الجامعية (بعد المنح)</span>
              </div>
              <Link
                href="/tco-matrix"
                className="text-[12px] font-semibold text-amber-600 hover:underline"
              >
                فتح الحاسبة التفصيلية الكاملة ←
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-[12px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                    <th className="py-2.5 px-3">الكلية والجامعة</th>
                    <th className="py-2.5 px-3">القطاع والاعتماد</th>
                    <th className="py-2.5 px-3">التنسيق الاسترشادي</th>
                    <th className="py-2.5 px-3">إجمالي 4 سنوات</th>
                    <th className="py-2.5 px-3">تغطية المنحة المتوقعة</th>
                    <th className="py-2.5 px-3">صافي مساهمة الأسرة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {comparedFaculties.map((fac) => {
                    const tco = computeFacultyTcoWithScholarship(
                      fac,
                      governorate || "القاهرة",
                      livingMode,
                      inflationScenario,
                      scorePercentage || 80
                    );
                    return (
                      <tr key={fac.id} className="hover:bg-slate-50/70">
                        <td className="py-3 px-3">
                          <div className="font-bold text-slate-900">{fac.name}</div>
                          <div className="text-[11px] text-slate-500">{fac.university}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-700">{fac.type}</div>
                          <div className="text-[11px] text-slate-500 max-w-[220px]">
                            {getFacultyAccreditation(fac)}
                          </div>
                        </td>
                        <td className="py-3 px-3 font-bold tabular-nums text-slate-800">
                          {formatScore(fac.cutoff_2026)}
                        </td>
                        <td className="py-3 px-3 tabular-nums text-slate-700">
                          {tco.total4Yr.toLocaleString()} ج.م
                        </td>
                        <td className="py-3 px-3 tabular-nums text-emerald-700 font-semibold">
                          {tco.scholarshipCoveragePct ? `${tco.scholarshipCoveragePct}% (-${(tco.scholarshipDiscount4Yr || 0).toLocaleString()} ج.م)` : "لا يوجد خصم تلقائي"}
                        </td>
                        <td className="py-3 px-3 tabular-nums font-extrabold text-amber-600">
                          {(tco.remainingFamily4Yr ?? tco.total4Yr).toLocaleString()} ج.م
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Matched Scholarships Highlight */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[12px] font-bold text-slate-800 inline-flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span>أبرز المنح المتاحة لتقليل العبء المالي على الأسرة:</span>
                </span>
                <Link href="/scholarships" className="text-[11px] font-bold text-amber-600 hover:underline">
                  عرض كل المنح ←
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {topScholarships.map((s) => (
                  <div key={s.id} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50 text-[12px] space-y-1">
                    <div className="font-bold text-slate-900 leading-snug">{s.name}</div>
                    <div className="text-[11px] text-emerald-700 font-semibold">{s.fundingCoverageLabel}</div>
                    <div className="text-[11px] text-slate-500">الموعد: {s.deadline}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Parent Feedback Form & Next Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <form
              onSubmit={handleSaveFeedback}
              className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-[15px]">
                  <MessageSquareHeart className="w-4 h-4 text-indigo-600" />
                  <span>4. رأي وملاحظات ولي الأمر (Parent Feedback)</span>
                </div>
                {mvpState.parentFeedback && (
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      STANCE_MAP[mvpState.parentFeedback.stance].cls
                    }`}
                  >
                    {STANCE_MAP[mvpState.parentFeedback.stance].label}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">اسم ولي الأمر / الصفة</label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="مثال: والد الطالب / والدة الطالب"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">الموقف العام من الخيارات</label>
                  <select
                    value={stance}
                    onChange={(e) => setStance(e.target.value as ParentFeedbackEntry["stance"])}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 bg-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="supportive">موافق وداعم لاختيارات الطالب</option>
                    <option value="needs_discussion">نحتاج جلسة نقاش عائلية إضافية</option>
                    <option value="concerned">لدي تحفظات مالية أو جغرافية تحتاج مراجعة</option>
                  </select>
                </div>
              </div>

              <div className="text-[12px]">
                <label className="block font-semibold text-slate-700 mb-1">الخيار الجامعي المفضّل من وجهة نظر الأسرة</label>
                <input
                  type="text"
                  value={preferredOption}
                  onChange={(e) => setPreferredOption(e.target.value)}
                  placeholder="مثال: حاسبات ومعلومات جامعة المنوفية أو الأهلية القريبة"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="text-[12px]">
                <label className="block font-semibold text-slate-700 mb-1">رأي ولي الأمر العام</label>
                <textarea
                  rows={2}
                  value={opinion}
                  onChange={(e) => setOpinion(e.target.value)}
                  placeholder="ما أكثر ما أعجبك في التخصصات والجامعات المقترحة؟"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[12px]">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">المخاوف أو التحفظات (إن وجدت)</label>
                  <textarea
                    rows={2}
                    value={concerns}
                    onChange={(e) => setConcerns(e.target.value)}
                    placeholder="مثل: السفر، السكن الجامعي، أو زيادة المصروفات..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">مقترحات للخطوة القادمة</label>
                  <textarea
                    rows={2}
                    value={suggestions}
                    onChange={(e) => setSuggestions(e.target.value)}
                    placeholder="مثل: حجز جلسة مع مستشار بشري أو التقديم على منحة..."
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-4 rounded-xl text-[13px] font-bold inline-flex items-center justify-center gap-2 transition cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "جاري الحفظ..." : "حفظ ملاحظات ولي الأمر ودمجها في التقرير"}</span>
              </button>
            </form>

            {/* Important Next Steps */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-[15px]">
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  <span>5. الخطوات المهمة القادمة للأسرة</span>
                </div>
                <div className="space-y-2.5">
                  {NEXT_STEPS.map((st, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1"
                    >
                      <div className="text-[12px] font-bold text-slate-900">{st.title}</div>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{st.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                <Link
                  href="/sample-report"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 px-4 rounded-xl text-[12px] font-semibold inline-flex items-center justify-center gap-2 transition"
                >
                  <FileText className="w-4 h-4" />
                  <span>عرض تقرير القرار الجامعي الشامل</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}