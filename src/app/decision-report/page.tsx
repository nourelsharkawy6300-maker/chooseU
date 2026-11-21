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
  DATA_LAST_UPDATED,
  TRACK_DETAILS,
  getFacultyAccreditation,
} from "@/data/faculties-db";
import { matchScholarships } from "@/data/scholarships-db";
import { DataService } from "@/lib/security-db";
import {
  DEFAULT_MVP_STATE,
  MvpUserState,
  loadMvpState,
  saveMvpState,
} from "@/lib/mvp-storage";
import {
  ConsultationOrderRow,
  StreamType,
  TrackKey,
  formatScore,
  formatStream,
} from "@/types/chooseu";
import {
  Award,
  Bot,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  HeartHandshake,
  Plus,
  Printer,
  Sparkles,
  UserCheck,
  Wallet,
} from "lucide-react";

export default function DecisionReportPage() {
  const {
    authUser,
    studentName,
    stream,
    scorePercentage,
    annualBudgetEgp,
    governorate,
    livingMode,
    inflationScenario,
    assessmentAnswers,
  } = useStudent();

  const [mvpState, setMvpState] = useState<MvpUserState>(DEFAULT_MVP_STATE);
  const [orders, setOrders] = useState<ConsultationOrderRow[]>([]);
  const [newAiNote, setNewAiNote] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const [state, ownedOrders] = await Promise.all([
        loadMvpState(authUser?.id ?? null),
        DataService.getMyOrders(),
      ]);
      if (cancelled) return;
      setMvpState(state);
      setOrders(ownedOrders);
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

  const topFaculties = useMemo(() => evaluation.allRanked.slice(0, 6), [evaluation]);
  const topScholarships = useMemo(
    () =>
      matchScholarships({
        stream,
        score: scorePercentage || 80,
        budget: annualBudgetEgp || 50000,
        topTrack: psych.topTrack,
      }).slice(0, 4),
    [stream, scorePercentage, annualBudgetEgp, psych.topTrack]
  );

  const approvedOrder = useMemo(
    () => orders.find((o) => o.order_status === "approved") || null,
    [orders]
  );

  const handleAddAiInsight = async () => {
    const clean = newAiNote.trim();
    if (!clean) return;
    const next: MvpUserState = {
      ...mvpState,
      savedAiInsights: [clean, ...mvpState.savedAiInsights],
    };
    setMvpState(next);
    setNewAiNote("");
    await saveMvpState(authUser?.id ?? null, next);
  };

  return (
    <div className="px-4 lg:px-8 py-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Action Bar */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4 no-print">
        <div>
          <div className="text-[11px] font-bold text-amber-300">
            Personalized Decision Report — ChooseU
          </div>
          <h1 className="text-[20px] font-extrabold mt-0.5">
            تقرير القرار الجامعي الشامل الخاص بك
          </h1>
          <p className="text-[12px] text-slate-300 mt-0.5">
            يجمع كل نتائج التقييم، التخصصات، الجامعات، المنح، الخطة المالية، رأي ولي الأمر، والاستشارات في ملف واحد قابل للطباعة أو الحفظ كـ PDF.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 px-5 py-2.5 rounded-xl text-[13px] font-bold inline-flex items-center gap-2 transition cursor-pointer shadow-sm"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة / حفظ كـ PDF</span>
        </button>
      </div>

      {/* Printable A4 Report Sheet */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 lg:p-8 shadow-2xs space-y-7">
        {/* Report Title & Meta */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <div className="text-[12px] font-bold text-amber-600">CHOOSEU DECISION REPORT</div>
            <h2 className="text-[22px] font-extrabold text-slate-900 mt-1">
              ملف القرار الجامعي — {studentName || "طالب ChooseU"}
            </h2>
            <p className="text-[12px] text-slate-500 mt-1">
              النظام التعليمي: {mvpState.extendedProfile.educationalSystem} •{" "}
              {mvpState.extendedProfile.currentGrade} • مدرسة:{" "}
              {mvpState.extendedProfile.schoolType} • تحديث البيانات: {DATA_LAST_UPDATED}
            </p>
          </div>
          <div className="text-left text-[12px] bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 tabular-nums">
            <div className="text-slate-500">الشعبة والمجموع</div>
            <div className="font-extrabold text-slate-900">
              {formatStream(stream)} • {formatScore(scorePercentage)}
            </div>
            <div className="text-slate-600 mt-0.5">
              الميزانية: {annualBudgetEgp > 0 ? `${annualBudgetEgp.toLocaleString()} ج.م/سنة` : "غير محددة"}
            </div>
          </div>
        </div>

        {/* 1. Student Profile & Assessment */}
        <section className="space-y-3">
          <h3 className="text-[15px] font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>1. ملف الطالب ونتائج التقييم الذكي</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[12px]">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="text-slate-500 text-[11px]">أسلوب التعلم والعمل المفضّل</div>
              <div className="font-bold text-slate-900 mt-0.5">
                {mvpState.extendedProfile.learningStyle}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="text-slate-500 text-[11px]">الاهتمامات المسجّلة</div>
              <div className="font-bold text-slate-900 mt-0.5">
                {mvpState.extendedProfile.interestsText || "لم تُكتب بعد (أضفها من خطة التنفيذ)"}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
              <div className="text-slate-500 text-[11px]">المسار الأقرب من التقييم</div>
              <div className="font-bold text-amber-600 mt-0.5">
                {TRACK_DETAILS[psych.topTrack]?.title}
              </div>
            </div>
          </div>
        </section>

        {/* 2. Recommended Majors */}
        <section className="space-y-3">
          <h3 className="text-[15px] font-extrabold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-600" />
            <span>2. التخصصات الجامعية المقترحة والمهارات المطلوبة</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {psych.sortedAffinities.slice(0, 3).map((tr, i) => (
              <div
                key={tr.key}
                className="border border-slate-200 rounded-xl p-4 space-y-2 text-[12px]"
              >
                <div className="font-bold text-slate-900">
                  {i + 1}. {tr.title}
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{tr.subtitle}</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  {tr.coreSkills.slice(0, 4).map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[10px] font-semibold"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Matching Universities & Financial Comparison */}
        <section className="space-y-3">
          <h3 className="text-[15px] font-extrabold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>3. الجامعات المطابقة والمقارنة المالية (4 سنوات بعد المنح)</span>
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="py-2 px-2.5">الكلية والجامعة</th>
                  <th className="py-2 px-2.5">التوافق / الأهلية</th>
                  <th className="py-2 px-2.5">الاعتماد</th>
                  <th className="py-2 px-2.5">إجمالي 4 سنوات</th>
                  <th className="py-2 px-2.5">خصم المنحة</th>
                  <th className="py-2 px-2.5">صافي مساهمة الأسرة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topFaculties.map((fac) => {
                  const tco = computeFacultyTcoWithScholarship(
                    fac,
                    governorate || "القاهرة",
                    livingMode,
                    inflationScenario,
                    scorePercentage || 80
                  );
                  return (
                    <tr key={fac.id}>
                      <td className="py-2.5 px-2.5">
                        <div className="font-bold text-slate-900">{fac.name}</div>
                        <div className="text-slate-500">{fac.university}</div>
                      </td>
                      <td className="py-2.5 px-2.5 tabular-nums">
                        <div className="font-bold text-amber-600">توافق {fac.matchScore}%</div>
                        <div className="text-slate-600">{fac.safetyBadge.label}</div>
                      </td>
                      <td className="py-2.5 px-2.5 text-slate-600 max-w-[180px]">
                        {getFacultyAccreditation(fac)}
                      </td>
                      <td className="py-2.5 px-2.5 tabular-nums font-semibold">
                        {tco.total4Yr.toLocaleString()} ج.م
                      </td>
                      <td className="py-2.5 px-2.5 tabular-nums text-emerald-700 font-semibold">
                        {tco.scholarshipCoveragePct
                          ? `${tco.scholarshipCoveragePct}%`
                          : "—"}
                      </td>
                      <td className="py-2.5 px-2.5 tabular-nums font-extrabold text-slate-900">
                        {(tco.remainingFamily4Yr ?? tco.total4Yr).toLocaleString()} ج.م
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 4. Matched Scholarships */}
        <section className="space-y-3">
          <h3 className="text-[15px] font-extrabold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-600" />
            <span>4. فرص المنح الدراسية المطابقة</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[12px]">
            {topScholarships.map((s) => (
              <div
                key={s.id}
                className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/40 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <strong className="text-slate-900">{s.name}</strong>
                  <span className="text-[11px] font-bold text-amber-600 tabular-nums">
                    {s.matchScore}%
                  </span>
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold">
                  {s.fundingCoverageLabel}
                </div>
                <div className="text-[11px] text-slate-500">
                  الموعد: {s.deadline} • المصدر: {s.officialUrl}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Parent Feedback + AI Insights + Human Consultation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[12px]">
          {/* Parent Feedback */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-indigo-600" />
              <span>5. ملاحظات ولي الأمر</span>
            </div>
            {mvpState.parentFeedback ? (
              <div className="space-y-1 text-[11px] text-slate-700">
                <div>
                  <strong>{mvpState.parentFeedback.parentName}:</strong>{" "}
                  {mvpState.parentFeedback.opinion || "داعم لقرار الطالب."}
                </div>
                {mvpState.parentFeedback.preferredOption && (
                  <div>
                    <strong>الخيار المفضّل:</strong> {mvpState.parentFeedback.preferredOption}
                  </div>
                )}
                {mvpState.parentFeedback.concerns && (
                  <div className="text-rose-700">
                    <strong>تحفظات:</strong> {mvpState.parentFeedback.concerns}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                لم تُسجّل ملاحظات أسريّة بعد.{" "}
                <Link href="/parent-mode" className="text-amber-600 font-semibold no-print">
                  فتح وضع ولي الأمر
                </Link>
              </p>
            )}
          </div>

          {/* AI Advisor Insights */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-amber-600" />
              <span>6. أبرز توصيات المستشار الذكي</span>
            </div>
            {mvpState.savedAiInsights.length > 0 ? (
              <ul className="space-y-1 text-[11px] text-slate-700">
                {mvpState.savedAiInsights.slice(0, 4).map((note, idx) => (
                  <li key={idx} className="flex items-start gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] text-slate-500">
                أضف أهم الخلاصات من محادثتك مع{" "}
                <Link href="/advisor" className="text-amber-600 font-semibold no-print">
                  المستشار الذكي
                </Link>
                .
              </p>
            )}
            <div className="flex gap-1.5 pt-1 no-print">
              <input
                type="text"
                value={newAiNote}
                onChange={(e) => setNewAiNote(e.target.value)}
                placeholder="أضف خلاصة من المستشار..."
                className="flex-1 border border-slate-200 rounded-lg px-2 py-1 text-[11px]"
              />
              <button
                type="button"
                onClick={handleAddAiInsight}
                className="bg-[#FACC15] text-slate-950 px-2 py-1 rounded-lg cursor-pointer"
                title="حفظ"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Human Consultation */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>7. خلاصة الاستشارة البشرية</span>
            </div>
            {approvedOrder?.advisor_notes ? (
              <div className="space-y-1.5 text-[11px] text-slate-700">
                <p>{approvedOrder.advisor_notes}</p>
                {approvedOrder.voice_note_url && (
                  <a
                    href={approvedOrder.voice_note_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-700 font-bold underline block"
                  >
                    استمع للمذكرة الصوتية المعتمدة
                  </a>
                )}
              </div>
            ) : mvpState.consultationBookings.length > 0 ? (
              <div className="text-[11px] text-slate-700 space-y-1">
                <div>
                  جلسة محجوزة مع{" "}
                  <strong>{mvpState.consultationBookings[0].consultantName}</strong>
                </div>
                <div className="text-slate-500">
                  {mvpState.consultationBookings[0].meetingFormat} •{" "}
                  {mvpState.consultationBookings[0].preferredSlot}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                لم تُحجز جلسة بشرية بعد.{" "}
                <Link href="/consultations" className="text-amber-600 font-semibold no-print">
                  تصفح الخبراء
                </Link>
              </p>
            )}
          </div>
        </div>

        {/* 6. Shortlisted Options & Next Steps */}
        <section className="space-y-2.5 border-t border-slate-200 pt-5">
          <h3 className="text-[15px] font-extrabold text-slate-900 flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-emerald-600" />
            <span>8. القائمة المختصرة والخطوات العملية القادمة</span>
          </h3>
          {mvpState.shortlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[12px]">
              {mvpState.shortlist.map((it) => (
                <div
                  key={it.id}
                  className="border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="font-bold text-slate-900">{it.title}</div>
                    <div className="text-[11px] text-slate-500">الموعد: {it.deadline}</div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                    {it.status === "accepted"
                      ? "مقبول"
                      : it.status === "applied"
                      ? "تم التقديم"
                      : it.status === "preparing_docs"
                      ? "تجهيز أوراق"
                      : "مخطط"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[12px] text-slate-600">
              ابدأ بإضافة أفضل 3 جامعات ومنحتين في{" "}
              <Link href="/action-plan" className="text-amber-600 font-bold no-print">
                صفحة خطة التنفيذ
              </Link>{" "}
              لتظهر هنا تلقائياً مع حالة تجهيز مستنداتك ({mvpState.completedDocIds.length}/8 مستندات جاهزة).
            </p>
          )}
        </section>
      </div>
    </div>
  );
}