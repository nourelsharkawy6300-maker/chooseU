"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useStudent } from "../context/StudentContext";
import { motion } from "framer-motion";
import {
  ConsultationOrderRow,
  EvaluationResult,
  Faculty,
  LivingMode,
  PlatformView,
  StreamType,
  TrackKey,
  WorkspaceSubTab,
  formatStream,
} from "../types/chooseu";
import {
  EGYPT_GOVERNORATES,
  FACULTIES_DATABASE,
  TRACK_DETAILS,
  DATA_LAST_UPDATED,
  INDICATIVE_DISCLAIMER,
} from "../data/faculties-db";
import {
  computeFacultyTcoMetrics,
  formatFacultyCount,
} from "../lib/engine";
import { UIMavenCard } from "./MotionPrimitives";
import { DataService, SecurityValidator } from "../lib/security-db";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Loader2,
  MapPin,
  Printer,
  Scale,
  Search,
  Send,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

function getCategoryBadgeStyle(type: string): string {
  if (type === "حكومي انتظام") {
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  }
  if (type === "برامج خاصة وساعات معتمدة") {
    return "bg-blue-50 text-blue-800 border-blue-200";
  }
  if (type === "جامعات أهلية") {
    return "bg-slate-100 text-slate-800 border-slate-300";
  }
  return "bg-amber-50 text-amber-800 border-amber-200";
}

function getDemandBadgeStyle(demand: string): string {
  if (demand === "مرتفع جداً") {
    return "bg-emerald-50 text-emerald-800 border-emerald-200";
  }
  if (demand === "مرتفع") {
    return "bg-blue-50 text-blue-800 border-blue-200";
  }
  return "bg-slate-100 text-slate-700 border-slate-300";
}

// ============================================================================
// 1. LANDING VIEW (`الرئيسية`)
// ============================================================================

interface LandingViewProps {
  stream: StreamType;
  setStream: (v: StreamType) => void;
  score: number;
  setScore: (v: number) => void;
  gov: string;
  setGov: (v: string) => void;
  setActiveView: (v: PlatformView) => void;
  setWorkspaceTab?: (v: WorkspaceSubTab) => void;
  onOpenCheckout: () => void;
}

export function LandingView({
  stream,
  setStream,
  score,
  setScore,
  gov,
  setGov,
  setActiveView,
  setWorkspaceTab,
  onOpenCheckout,
}: LandingViewProps) {
  return (
    <div className="px-4 lg:px-8 py-10 space-y-14">
      {/* Hero Section + Quick-Start Interactive Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-10 lg:p-12 shadow-2xs space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[12px] font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>
              مدقق وفق الحدود الدنيا لتنسيق القبول ولوائح الجامعات المصرية 2026
            </span>
          </div>
          <h1 className="text-[26px] sm:text-[34px] font-bold text-slate-900 leading-[1.45]">
            قرارك الجامعي مبني على حساب مالي وأكاديمي لسنوات دراستك بالكامل، وليس مجرد توقعات تنسيق.
          </h1>
          <p className="text-[14px] sm:text-[15px] text-slate-600 leading-relaxed">
            منصة هندسية متكاملة لطلاب الثانوية العامة وما يعادلها وأولياء الأمور في مصر؛ تحسب التوافق التخصصي، تحاكي تغيرات التنسيق، وتكشف التكلفة التراكمية الحقيقية (شاملة التضخم السنوي، السكن، وشروط الـ GPA الداخلي).
          </p>
        </div>

        {/* Interactive Quick-Start Bar */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
              الشعبة الدراسية
            </label>
            <div className="bg-white border border-slate-200 p-1 rounded-xl grid grid-cols-3 gap-1">
              {[
                { id: "Science" as StreamType, label: "علمي علوم" },
                { id: "Math" as StreamType, label: "علمي رياضة" },
                { id: "Arts" as StreamType, label: "أدبي" },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStream(st.id)}
                  className={`py-1.5 px-2 rounded-lg text-[12px] whitespace-nowrap transition cursor-pointer ${
                    stream === st.id
                      ? "bg-[#377ef0] text-white font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[12px] font-medium text-slate-700">
                المجموع المئوي (%)
              </label>
              <span className="text-[12px] font-bold text-blue-600 tabular-nums">
                {score.toFixed(1)}%
              </span>
            </div>
            <input
              type="number"
              min={50}
              max={100}
              step={0.5}
              value={score}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) setScore(Math.min(100, Math.max(50, val)));
              }}
              className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded-xl px-3.5 py-2 text-[13px] font-semibold text-slate-900 tabular-nums focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[12px] font-medium text-slate-700 mb-1.5">
              محافظة الإقامة الحالية
            </label>
            <select
              value={gov}
              onChange={(e) => setGov(e.target.value)}
              className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded-xl px-3.5 py-2 text-[13px] font-medium text-slate-900 focus:outline-none"
            >
              {EGYPT_GOVERNORATES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => {
              if (setWorkspaceTab) setWorkspaceTab("scenarios");
              setActiveView("workspace");
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition cursor-pointer h-[42px] shadow-sm"
          >
            <span>ابدأ التحليل المالي والأكاديمي فوراً</span>
            <ArrowLeft className="w-4 h-4 shrink-0" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* 4-Card Architecture Grid */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-[18px] font-semibold text-slate-900 leading-[1.45]">
            منظومة التوجيه الأكاديمي والمالي في ChooseU
          </h2>
          <span className="text-[12px] text-slate-500">
            4 ركائز عملية لحماية مستقبل الطالب وميزانية الأسرة
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: Building2,
              title: "1. كليات وبرامج دراسية استرشادية",
              desc: "قاعدة بيانات استرشادية تضم الكليات الحكومية (انتظام)، برامج الساعات المعتمدة، الجامعات الأهلية، والجامعات الخاصة والتكنولوجية.",
              metric: "تغطية كافة الشعب والقطاعات",
            },
            {
              icon: Wallet,
              title: "2. محاكي التضخم وتكلفة سنوات الدراسة (TCO)",
              desc: "حساب التدفق المالي التراكمي لسنوات الدراسة بالكامل تحت سيناريوهات تضخم (10% و15% و22%) شاملة الرسوم المعملية والإدارية.",
              metric: "رؤية مالية واضحة حتى التخرج",
            },
            {
              icon: Scale,
              title: "3. مراجعة شروط الـ GPA الداخلي والمنح",
              desc: "كشف اشتراطات المعدل التراكمي في السنة التأسيسية الأولى (مثل GPA >= 2.7) المطلوبة للتخصص في الذكاء الاصطناعي أو الأمن السيبراني.",
              metric: "حماية من مخاطر التشعيب الداخلي",
            },
            {
              icon: MapPin,
              title: "4. التوزيع الجغرافي وتكلفة السكن/المواصلات",
              desc: "مقارنة دقيقة بين الدراسة داخل نطاق محافظتك (نطاق أ) مقابل تكلفة السكن الطلابي أو خطوط النقل الإقليمية للمحافظات المجاورة.",
              metric: "توفير حتى 85,000 ج.م طوال سنوات الدراسة",
            },
          ].map((card) => {
            const IconComponent = card.icon;
            return (
              <div
                key={card.title}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between space-y-4 shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-900">
                    <IconComponent className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-[15px] font-semibold text-slate-900">
                    {card.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    {card.desc}
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 text-xs font-semibold text-blue-700 tabular-nums">
                  {card.metric}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Free vs. Certified Report (150 EGP) Comparison Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
              الباقة الأساسية للطلاب
            </span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-[20px] font-bold text-slate-900">
                الاستكشاف المجاني المباشر
              </h3>
              <span className="text-[18px] font-bold text-slate-900 tabular-nums">
                0 ج.م
              </span>
            </div>
            <p className="text-[13px] text-slate-600 font-medium">
              أدوات تفاعلية مجانية لاختبار الميول المهنية واستكشاف أعلى كليتين توافقاً مع مجموعك وميزانيتك.
            </p>
            <ul className="space-y-2.5 pt-2 text-[13px] text-slate-700">
              {[
                "اختبار تقييم الميول المهنية المخصص لشعبتك (6 مواقف عملية)",
                "محاكي حساسية التنسيق اللحظي (-1.5% / المتوقع / +1.5%)",
                "فتح كامل تفاصيل ولوائح أول ترشيحين في مصفوفة التكلفة الكاملة",
                "استكشاف المسار الوظيفي والرواتب المتوقعة",
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-2.5">
                  <Check
                    className="w-4 h-4 text-emerald-600 shrink-0"
                    strokeWidth={1.5}
                  />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => {
              if (setWorkspaceTab) setWorkspaceTab("quiz");
              setActiveView("workspace");
            }}
            className="w-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 py-3 px-5 rounded-xl text-[13px] font-semibold transition cursor-pointer"
          >
            بدء التقييم المجاني الآن
          </button>
        </div>

        <div className="bg-white border-2 border-blue-600 rounded-xl p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-sm">
          <div className="space-y-3">
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded">
              الخدمة الاستشارية الكاملة للأسر
            </span>
            <div className="flex items-baseline justify-between">
              <h3 className="text-[20px] font-bold text-slate-900">
                التقرير الاستشاري المخصص + المذكرة الصوتية
              </h3>
              <span className="text-[20px] font-bold text-blue-600 tabular-nums">
                150 ج.م
              </span>
            </div>
            <p className="text-[13px] text-slate-600">
              وثيقة استشارية استرشادية تفتح كافة البدائل وتوفر مراجعة بشرية ومذكرة صوتية تلخيصية لولي الأمر.
            </p>
            <ul className="space-y-2.5 pt-2 text-[13px] text-slate-700">
              {[
                "فتح جميع الكليات والبدائل الاستراتيجية في جدول التكلفة بالكامل بدون تمويه",
                "جدول التدفقات المالية التفصيلي تحت 3 سيناريوهات تضخم + تكلفة السكن",
                "تحليل مخاطر الـ GPA في السنة التأسيسية الأولى وخارطة طريق التفوق",
                "مراجعة بشرية من مستشار مختص + مذكرة صوتية مخصصة للأسرة عبر واتساب",
                "نسخة A4 استرشادية قابلة للطباعة والتحميل المباشر كملف PDF",
              ].map((feat) => (
                <li key={feat} className="flex items-center gap-2.5">
                  <Check
                    className="w-4 h-4 text-blue-600 shrink-0"
                    strokeWidth={1.5}
                  />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onOpenCheckout}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl text-[13px] font-semibold transition cursor-pointer tabular-nums shadow-sm"
            >
              إصدار التقرير المعتمد — 150 ج.م
            </button>
            <button
              type="button"
              onClick={() => setActiveView("sample_report")}
              className="w-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 py-3 px-4 rounded-xl text-[13px] font-medium transition cursor-pointer"
            >
              معاينة عينة التقرير أولاً
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. FUTURE ME VIEW (`المسار الوظيفي ومستقبلي — Future Me & Career Roadmap`)
// ============================================================================

interface FutureMeViewProps {
  selectedFaculty: Faculty | null;
  setSelectedFaculty: (f: Faculty) => void;
  evaluation: EvaluationResult;
  setActiveView: (v: PlatformView) => void;
  onOpenCheckout: () => void;
}

export function FutureMeView({
  selectedFaculty,
  setSelectedFaculty,
  evaluation,
  setActiveView,
  onOpenCheckout,
}: FutureMeViewProps) {
  const activeFaculty = useMemo(() => {
    if (selectedFaculty) return selectedFaculty;
    if (evaluation.allRanked.length > 0) return evaluation.allRanked[0];
    return FACULTIES_DATABASE[0] || null;
  }, [selectedFaculty, evaluation.allRanked]);

  if (!activeFaculty) {
    return (
      <div className="max-w-4xl mx-auto px-4 lg:px-8 py-12 text-center text-slate-500 font-medium">
        لا توجد كلية محددة حالياً لاستعراض المسار الوظيفي.
      </div>
    );
  }

  const career = activeFaculty.future_career || {
    roles: ["أخصائي في المجال", "مستشار تخصصي"],
    market_demand: "مرتفع" as const,
    salary_range_egp: "15,000 - 30,000 ج.م",
    progression: "تدرج وظيفي تصاعدي مع اكتساب الخبرة العملية",
    roadmap_year1: "التأسيس الأكاديمي والمفاهيم الأساسية",
    roadmap_year2: "التطبيقات العملية والمشاريع الميدانية",
    roadmap_year3: "التدريب المتقدم والشهادات المهنية",
    roadmap_year4: "مشروع التخرج والجاهزية لسوق العمل",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Header & Faculty Selector Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
            <h1 className="text-[20px] font-bold text-slate-900 leading-[1.45]">
              المسار الوظيفي ومستقبلي
            </h1>
          </div>
          <p className="text-[13px] text-slate-500">
            استكشف المسميات الوظيفية، متوسط الرواتب في مصر، وخارطة المهارات العملية لسنوات الدراسة لكل كلية.
          </p>
        </div>

        <div className="w-full md:w-96">
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            اختر الكلية لاستعراض مسارها الوظيفي:
          </label>
          <select
            value={activeFaculty.id}
            onChange={(e) => {
              const found = FACULTIES_DATABASE.find(
                (f) => f.id === e.target.value
              );
              if (found) setSelectedFaculty(found);
            }}
            className="w-full border border-slate-200 focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold bg-slate-50 text-slate-900 focus:outline-none"
          >
            {FACULTIES_DATABASE.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} — {f.university}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Career Overview Cards: Roles, Demand, Salary & Progression */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span
                className={`inline-flex px-2.5 py-0.5 rounded text-xs font-medium border ${getCategoryBadgeStyle(
                  activeFaculty.type
                )}`}
              >
                {activeFaculty.type} • محافظة {activeFaculty.gov}
              </span>
              <h2 className="text-[18px] font-bold text-slate-900 mt-1.5">
                {activeFaculty.name} — {activeFaculty.university}
              </h2>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-[12px] font-semibold border ${getDemandBadgeStyle(
                career.market_demand
              )}`}
            >
              الطلب في السوق: {career.market_demand}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-[13px] font-semibold text-slate-700">
              أبرز المسميات الوظيفية للخريج:
            </h3>
            <div className="flex flex-wrap gap-2">
              {career.roles.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-[12px] font-semibold text-slate-900"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
            <div className="text-[12px] font-semibold text-slate-800 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-blue-600" strokeWidth={1.5} />
              <span>مسار التدرج الوظيفي:</span>
            </div>
            <p className="text-[13px] text-slate-700 font-medium leading-relaxed">
              {career.progression}
            </p>
          </div>
        </div>

        {/* Salary & Academic Entry Requirements Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded inline-block">
              العائد الوظيفي المتوقع في مصر
            </span>
            <div>
              <div className="text-xs text-slate-600 font-medium">
                متوسط نطاق الرواتب الشهرية
              </div>
              <div className="text-[18px] font-bold text-slate-900 mt-1 tabular-nums">
                {career.salary_range_egp}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 space-y-2 text-[12px] text-slate-700 tabular-nums">
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">مؤشر القبول الاسترشادي:</span>
                <strong className="text-slate-900">
                  {activeFaculty.cutoff_2026.toFixed(1)}%
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-medium">مصروفات السنة الأولى:</span>
                <strong className="text-blue-700">
                  {activeFaculty.y1_base_fee.toLocaleString()} ج.م
                </strong>
              </div>
              <div className="pt-2 text-xs text-slate-700 leading-relaxed font-medium">
                <strong className="text-slate-900 block mb-0.5">
                  شرط التخصص الداخلي:
                </strong>
                {activeFaculty.gpa_requirement}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setActiveView("workspace")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-4 rounded-xl text-[12px] font-semibold transition cursor-pointer shadow-sm"
            >
              مقارنة هذه الكلية في محرك التوجيه
            </button>
            <button
              type="button"
              onClick={onOpenCheckout}
              className="w-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 py-2 px-4 rounded-xl text-[12px] font-medium transition cursor-pointer tabular-nums"
            >
              إصدار التقرير الكامل — 150 ج.م
            </button>
          </div>
        </div>
      </div>

      {/* 4-Year Practical Learning Roadmap (`roadmap_years`) */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-[16px] font-bold text-slate-900">
              خارطة المهارات والتأهيل العملي خلال سنوات الدراسة (4-Year Practical Roadmap)
            </h3>
            <p className="text-[12px] text-slate-500 mt-0.5">
              المهارات التقنية والعملية المطلوب إتقانها في كل عام جامعي لضمان الجاهزية الفورية لسوق العمل.
            </p>
          </div>
          <span className="text-[12px] font-medium text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
            خطة تنفيذية من السنة الأولى حتى التخرج
          </span>
        </div>

        <div className="relative border-s border-slate-300 ms-3 ps-6 space-y-6 py-2">
          {[
            { title: "السنة التأسيسية", idx: 0 },
            { title: "التخصص", idx: 1 },
            { title: "التخرج", idx: 2 },
            { title: "دخول سوق العمل", idx: 3 },
          ].map(({ title, idx }) => {
            const step =
              career.roadmap_years[idx] ||
              career.roadmap_years[career.roadmap_years.length - 1];
            return (
              <div key={title} className="relative">
                {/* Timeline node */}
                <span className="absolute -start-[31px] top-1.5 w-3 h-3 rounded-full bg-white border-2 border-blue-600 ring-2 ring-blue-100 shrink-0" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-[14px] font-bold text-slate-900 leading-snug">
                      {title}
                    </h4>
                    {step?.year && (
                      <span className="text-xs text-slate-600 font-medium">
                        ({step.year})
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-slate-600 leading-relaxed">
                    {step?.focus}
                  </p>
                  {step?.skills && step.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {step.skills.map((sk) => (
                        <span
                          key={sk}
                          className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium"
                        >
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. DIRECTORY VIEW (`دليل الجامعات والمنح 2026`)
// ============================================================================

interface DirectoryViewProps {
  comparedIds: string[];
  onToggleCompare: (id: string) => void;
  onSelectFutureCareer: (f: Faculty) => void;
  onOpenCompareTab?: () => void;
}

export function DirectoryView({
  comparedIds,
  onToggleCompare,
  onOpenCompareTab,
}: DirectoryViewProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [streamFilter, setStreamFilter] = useState<"ALL" | StreamType>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("الكل");

  const filteredFaculties = useMemo(() => {
    return FACULTIES_DATABASE.filter((f) => {
      const streamMatch =
        streamFilter === "ALL" ||
        f.stream === streamFilter ||
        f.stream === "Both";
      const catMatch =
        categoryFilter === "الكل" || f.type === categoryFilter;
      const q = searchQuery.trim().toLowerCase();
      const searchMatch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        f.university.toLowerCase().includes(q) ||
        f.gov.toLowerCase().includes(q);
      return streamMatch && catMatch && searchMatch;
    });
  }, [searchQuery, streamFilter, categoryFilter]);

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Search & Filters Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-[20px] font-bold text-slate-900 leading-[1.45]">
              دليل الجامعات والمنح والمصروفات 2026
            </h1>
            <p className="text-[13px] text-slate-500 mt-1">
              استعرض وقارن شروط القبول، الرسوم السنوية، منح التفوق، وشروط المعدل التراكمي في الجامعات المصرية.
            </p>
          </div>
          <span className="text-[12px] font-semibold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl tabular-nums">
            {formatFacultyCount(filteredFaculties.length)}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
          <div className="md:col-span-5 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث باسم الكلية، الجامعة، أو المحافظة..."
              className="w-full border border-slate-200 focus:border-blue-600 rounded-xl pr-10 pl-4 py-2.5 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            <Search
              className="w-4 h-4 text-slate-400 absolute right-3.5 top-3"
              strokeWidth={1.5}
            />
          </div>

          <div className="md:col-span-4 bg-slate-100 p-1 rounded-xl grid grid-cols-4 gap-1 text-[12px]">
            {[
              { id: "ALL" as const, label: "الكل" },
              { id: "Science" as const, label: "علمي علوم" },
              { id: "Math" as const, label: "علمي رياضة" },
              { id: "Arts" as const, label: "أدبي" },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStreamFilter(st.id)}
                className={`relative py-1.5 px-2 rounded-lg whitespace-nowrap transition cursor-pointer text-center ${
                  streamFilter === st.id
                    ? "text-[#377ef0] font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {streamFilter === st.id && (
                  <motion.div
                    layoutId="directory-stream-pill"
                    className="absolute inset-0 rounded-lg bg-white shadow-2xs border border-slate-200"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{st.label}</span>
              </button>
            ))}
          </div>

          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full border border-slate-200 focus:border-blue-600 rounded-xl px-3.5 py-2.5 text-[12px] font-medium bg-white text-slate-900 focus:outline-none"
            >
              <option value="الكل">الكل (جميع القطاعات)</option>
              <option value="حكومي انتظام">حكومي انتظام</option>
              <option value="برامج خاصة وساعات معتمدة">
                برامج خاصة وساعات معتمدة
              </option>
              <option value="جامعات أهلية">جامعات أهلية</option>
              <option value="جامعات خاصة وتكنولوجية">
                جامعات خاصة وتكنولوجية
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Shortlist Counter Above the List */}
      <div className="flex items-center justify-between px-1">
        <div className="text-[13px] font-semibold text-slate-800 flex items-center gap-1">
          <span>قائمة الرغبات المختارة (</span>
          <span dir="ltr" className="font-mono tabular-nums font-bold text-blue-700">
            {comparedIds.length}
          </span>
          <span>)</span>
        </div>
        {comparedIds.length >= 2 && onOpenCompareTab && (
          <button
            type="button"
            onClick={onOpenCompareTab}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-[12px] font-semibold cursor-pointer transition shadow-sm"
          >
            فتح المقارنة
          </button>
        )}
      </div>

      {/* Numbered University Index List */}
      {filteredFaculties.length === 0 ? (
        <div
          key="empty"
          style={{ animation: "fade-up 220ms var(--ease-out-expo) both" }}
          className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-[13px]"
        >
          لا توجد كليات تطابق معايير البحث الحالية.
        </div>
      ) : (
        <div
          key={`${streamFilter}-${categoryFilter}-${searchQuery}`}
          className="space-y-3.5"
        >
          {filteredFaculties.map((fac, idx) => {
            const isCompared = comparedIds.includes(fac.id);
            const numStr = String(idx + 1).padStart(3, "0");
            return (
              <UIMavenCard
                key={fac.id}
                indexCode={`${numStr} // DIR`}
                badgeText={fac.type}
                statusDotColor={fac.type.includes("حكومي") ? "bg-emerald-500" : "bg-[#377ef0]"}
                className="shadow-2xs text-right"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${getCategoryBadgeStyle(
                          fac.type
                        )}`}
                      >
                        {fac.type}
                      </span>
                      {fac.cutoff_2026 > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold tabular-nums">
                          تنسيق {fac.cutoff_2026.toFixed(1)}%
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 text-[15px] leading-snug">
                      {fac.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium">
                      {fac.university} • محافظة {fac.gov}
                    </p>
                    {fac.scholarship_rule && (
                      <p className="text-xs text-blue-700 font-medium">
                        {fac.scholarship_rule}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <div className="text-left shrink-0 min-w-[100px]">
                      <div className="text-[10px] text-slate-400 font-mono">المصروفات السنوية</div>
                      <span className="font-bold text-[14px] text-slate-900 font-mono tabular-nums">
                        {fac.y1_base_fee === 0 ? "مجاني حكومي" : `${fac.y1_base_fee.toLocaleString()} ج.م`}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={!isCompared && comparedIds.length >= 4}
                      title={!isCompared && comparedIds.length >= 4 ? "الحد الأقصى للمقارنة هو 4 كليات" : undefined}
                      onClick={() => onToggleCompare(fac.id)}
                      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all duration-150 shrink-0 ${
                        isCompared
                          ? "bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100 font-semibold hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
                          : comparedIds.length >= 4
                          ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-75"
                          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer"
                      }`}
                    >
                      {isCompared
                        ? "إزالة من مسودة الرغبات"
                        : comparedIds.length >= 4
                        ? "الحد الأقصى 4 كليات"
                        : "+ حفظ في مسودة الرغبات"}
                    </button>
                  </div>
                </div>
              </UIMavenCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 4. SAMPLE REPORT VIEW (`عينة التقرير المعتمد والمذكرة الصوتية`)
// ============================================================================

interface SampleReportViewProps {
  studentName: string;
  stream: StreamType;
  score: number;
  budget: number;
  gov: string;
  livingMode: "commute" | "dorm";
  inflationScenario: number;
  topTrack?: TrackKey | null;
  evaluation: EvaluationResult;
  onOpenCheckout: () => void;
}

export function SampleReportView({
  studentName,
  stream,
  score,
  budget,
  gov,
  livingMode,
  inflationScenario,
  topTrack,
  evaluation,
  onOpenCheckout,
}: SampleReportViewProps) {
  const sampleFaculties =
    evaluation.allRanked.length >= 4
      ? evaluation.allRanked.slice(0, 6)
      : FACULTIES_DATABASE.slice(0, 6);

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Top Preview Action Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4 shadow-2xs no-print">
        <div>
          <h1 className="text-[18px] font-bold text-slate-900 leading-[1.45]">
            نموذج تجريبي — تقرير استشاري (A4)
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            نموذج استرشادي تجريبي يوضح هيكل الوثيقة الاستشارية وقائمة الرغبات كعينة افتراضية.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-[12px] font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" strokeWidth={1.5} />
            <span>طباعة نموذج المعاينة (PDF)</span>
          </button>

          <button
            type="button"
            onClick={onOpenCheckout}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-[12px] font-semibold cursor-pointer tabular-nums shadow-sm"
          >
            اطلب تقريرك المخصص الآن (150 ج.م)
          </button>
        </div>
      </div>

      {/* A4 Print-Ready Sample Document Container */}
      <div className="relative max-w-[210mm] mx-auto bg-white text-slate-950 shadow-2xl rounded-sm p-8 sm:p-12 space-y-8 print-only-sheet">
        {/* Diagonal Watermark */}
        <div className="pointer-events-none select-none absolute inset-0 flex items-center justify-center z-0 overflow-hidden no-print">
          <span className="text-[28px] sm:text-[36px] font-bold text-slate-900/[0.04] -rotate-12 whitespace-nowrap">
            نسخة معاينة استرشادية — ChooseU Advisory
          </span>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="border-b-2 border-slate-900 pb-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-blue-600">
                وثيقة التقييم الأكاديمي والمالي الشامل — ChooseU Advisory
              </div>
              <h2 className="text-[20px] font-bold text-slate-900 mt-1 leading-[1.45]">
                نموذج تجريبي استرشادي لتنسيق الجامعات والتدفق المالي لسنوات الدراسة
              </h2>
              <p className="text-xs text-slate-600 font-medium mt-1 tabular-nums">
                عينة استرشادية توضيحية وفق الحدود الدنيا ولوائح المصروفات المعلنة
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-left text-[12px] tabular-nums space-y-0.5">
              <div className="font-mono font-semibold text-slate-900">
                REF: ORD-2026-SAMPLE
              </div>
              <div className="text-amber-700 font-medium">
                مراجعة المستشار: نموذج تجريبي
              </div>
            </div>
          </div>

          {/* Student Metadata Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 text-[12px] tabular-nums">
            <div>
              <span className="text-slate-500 block">اسم الطالب</span>
              <strong className="text-slate-900 font-semibold">
                {studentName.trim() || "طالب تجريبي (عينة افتراضية)"}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">الشعبة والمجموع</span>
              <strong className="text-slate-900 font-semibold">
                {formatStream(stream)}{" "}
                ({score.toFixed(1)}%)
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">
                الميزانية السنوية والمحافظة
              </span>
              <strong className="text-slate-900 font-semibold">
                {budget.toLocaleString()} ج.م • {gov}
              </strong>
            </div>
            <div>
              <span className="text-slate-500 block">المسار المتصدر</span>
              <strong className="text-blue-700 font-semibold">
                {topTrack && TRACK_DETAILS[topTrack]
                  ? TRACK_DETAILS[topTrack].title
                  : "قيد التحديد عبر التقييم"}
              </strong>
            </div>
          </div>

          {/* Recommended Tansik Ordering */}
          <div className="space-y-3">
            <h3 className="text-[15px] font-semibold text-slate-900">
              أولاً: الترتيب الاستراتيجي الموصى به لرغبات التنسيق والبدائل الآمنة
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2.5">
                <div className="text-[12px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded inline-block">
                  الرغبات الأساسية المستهدفة (الأقرب للمجموع والميول)
                </div>
                <ul className="space-y-2 text-[12px] text-slate-700 tabular-nums">
                  {sampleFaculties.slice(0, 3).map((f, i) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between border-b border-slate-100 pb-1.5 last:border-none"
                    >
                      <span className="font-medium text-slate-900">
                        0{i + 1}. {f.name} ({f.university})
                      </span>
                      <span className="text-slate-500 font-semibold">
                        مؤشر القبول الاسترشادي: {f.cutoff_2026.toFixed(1)}%
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2.5">
                <div className="text-[12px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded inline-block">
                  البدائل الاستراتيجية الآمنة (تأمين التخصص استرشادياً)
                </div>
                <ul className="space-y-2 text-[12px] text-slate-700 tabular-nums">
                  {sampleFaculties.slice(3, 6).map((f, i) => (
                    <li
                      key={f.id}
                      className="flex items-center justify-between border-b border-slate-100 pb-1.5 last:border-none"
                    >
                      <span className="font-medium text-slate-900">
                        0{i + 4}. {f.name} ({f.university})
                      </span>
                      <span className="text-slate-500 font-semibold">
                        {f.y1_base_fee.toLocaleString()} ج.م/سنة
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* 4-Year TCO Cashflow Table */}
          <div className="space-y-3">
            <h3 className="text-[15px] font-semibold text-slate-900">
              ثانياً: جدول التدفقات المالية لسنوات الدراسة بالكامل (TCO) ولوائح الـ GPA الداخلي
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-right border-collapse text-[12px] tabular-nums">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-3 px-3.5 min-w-[230px]">الكلية والجامعة</th>
                    <th className="py-3 px-3.5">حد 2026</th>
                    <th className="py-3 px-3.5">مصروفات سنة 1</th>
                    <th className="py-3 px-3.5">
                      إجمالي سنوات الدراسة بالكامل (تضخم {inflationScenario}%)
                    </th>
                    <th className="py-3 px-3.5">الاستقرار الجغرافي ({gov})</th>
                    <th className="py-3 px-3.5">شرط الـ GPA الداخلي</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {sampleFaculties.map((f, i) => {
                    const m = computeFacultyTcoMetrics(
                      f,
                      gov,
                      livingMode,
                      inflationScenario
                    );
                    return (
                      <tr key={f.id} className="bg-white">
                        <td className="py-3 px-3.5 align-top">
                          <div className="font-semibold text-slate-900">
                            0{i + 1}. {f.name}
                          </div>
                          <div className="text-xs text-slate-600 font-medium">
                            {f.university} • {f.type}
                          </div>
                        </td>
                        <td className="py-3 px-3.5 font-semibold align-top">
                          {f.cutoff_2026.toFixed(1)}%
                        </td>
                        <td className="py-3 px-3.5 align-top">
                          {f.y1_base_fee.toLocaleString()} ج.م
                        </td>
                        <td className="py-3 px-3.5 font-bold text-slate-900 whitespace-nowrap align-top">
                          {m.total4Yr.toLocaleString()} ج.م
                        </td>
                        <td className="py-3 px-3.5 text-xs align-top">
                          {m.livingDesc}
                        </td>
                        <td className="py-3 px-3.5 text-xs leading-relaxed align-top">
                          {f.gpa_requirement}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Internal Bylaw & Risk Analysis */}
          <div className="space-y-2">
            <h3 className="text-[15px] font-semibold text-slate-900">
              ثالثاً: تحليل مخاطر السنة التأسيسية الأولى وتوصية المستشار
            </h3>
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 text-[12px] text-slate-700 leading-relaxed space-y-2">
              <p>
                • <strong>تنبيه التشعيب الداخلي:</strong> تشترط كليات الذكاء الاصطناعي والجامعات الأهلية تحقيق معدل تراكمي (GPA &gt;= 2.7) في نهاية السنة التأسيسية الأولى للالتحاق بالأقسام التنافسية (الذكاء الاصطناعي والأمن السيبراني).
              </p>
              <p>
                • <strong>التوصية المالية والجغرافية:</strong> أولوية القبول داخل محافظة {gov} توفر على الأسرة ما يقارب 24,000 إلى 32,000 ج.م سنوياً من نفقات السكن الطلابي المغترب والإعاشة.
              </p>
            </div>
          </div>

          {/* Indicative Disclaimer Bar */}
          <div className="border-t border-slate-200 pt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
            <span>{INDICATIVE_DISCLAIMER}</span>
            <span className="font-mono text-[11px] tabular-nums">آخر تحديث للبيانات: {DATA_LAST_UPDATED}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. TRACK ORDER VIEW (`متابعة حالة الطلب واستلام التقرير`)
// ============================================================================

interface TrackOrderViewProps {
  initialOrder?: ConsultationOrderRow | null;
  onOrderLoaded?: (ord: ConsultationOrderRow) => void;
}

export function TrackOrderView({
  initialOrder,
  onOrderLoaded,
}: TrackOrderViewProps) {
  const [queryInput, setQueryInput] = useState<string>(
    initialOrder?.order_code || ""
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [orderResult, setOrderResult] = useState<ConsultationOrderRow | null>(
    initialOrder || null
  );
  const [prevOrderCode, setPrevOrderCode] = useState<string | undefined>(
    initialOrder?.order_code
  );
  const [notFound, setNotFound] = useState<boolean>(false);

  // Sync state during render when initialOrder prop changes
  if (initialOrder && initialOrder.order_code !== prevOrderCode) {
    setPrevOrderCode(initialOrder.order_code);
    setOrderResult(initialOrder);
    setQueryInput(initialOrder.order_code);
  }

  const orderStatus = orderResult?.order_status;
  const orderCode = orderResult?.order_code;

  // Phase 4: Auto-poll every 15 s while order is pending
  useEffect(() => {
    if (!orderCode || orderStatus !== "pending") return;
    const interval = setInterval(async () => {
      const refreshed = await DataService.getOrderByCodeOrPhone(orderCode);
      if (refreshed) {
        setOrderResult(refreshed);
        onOrderLoaded?.(refreshed);
        if (refreshed.order_status !== "pending") clearInterval(interval);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [orderStatus, orderCode, onOrderLoaded]);

  const handleSearchOrder = async () => {
    const clean = queryInput.trim();
    if (!clean) return;
    setIsLoading(true);
    setNotFound(false);
    const found = await DataService.getOrderByCodeOrPhone(clean);
    setIsLoading(false);

    if (found) {
      setOrderResult(found);
      if (onOrderLoaded) onOrderLoaded(found);
    } else {
      setOrderResult(null);
      setNotFound(true);
    }
  };

  const student = useStudent();
  const effectiveLivingMode: LivingMode =
    (orderResult?.quiz_results?.livingMode as LivingMode) ||
    student?.livingMode ||
    "commute";
  const effectiveInflation: number =
    Number(orderResult?.quiz_results?.inflationScenario) ||
    student?.inflationScenario ||
    15;

  const matchedOrderFaculties = useMemo(() => {
    const ids: string[] = orderResult?.quiz_results?.eligibleIds || [];
    if (ids.length > 0) {
      const mapped = ids
        .map((id) => FACULTIES_DATABASE.find((f) => f.id === id))
        .filter(Boolean) as Faculty[];
      if (mapped.length > 0) return mapped;
    }
    return FACULTIES_DATABASE.slice(0, 8);
  }, [orderResult]);

  return (
    <div className="px-4 lg:px-8 py-8 space-y-6">
      {/* Search Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5 no-print">
        <div>
          <h1 className="text-[20px] font-bold text-slate-900 leading-[1.45]">
            متابعة حالة الطلب واستلام التقرير المعتمد
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            أدخل رقم الطلب أو رقم الواتساب المسجل للاستعلام المباشر من قاعدة البيانات.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="أدخل رقم الطلب أو رقم الواتساب..."
            className="flex-1 border border-slate-200 focus:border-slate-900 rounded-xl px-4 py-2.5 text-[13px] font-mono dir-ltr text-left tabular-nums focus:outline-none"
          />
          <button
            type="button"
            disabled={isLoading}
            onClick={handleSearchOrder}
            className="bg-[#377ef0] hover:bg-[#2962be] text-white px-6 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition cursor-pointer shrink-0 shadow-sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
            ) : (
              <Search className="w-4 h-4" strokeWidth={1.5} />
            )}
            <span>استعلام عن حالة التقرير</span>
          </button>
        </div>

        {notFound && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-[12px]">
            مفيش طلب بالكود ده. اتأكد من الكود وجرّب تاني.
          </div>
        )}
      </div>

      {orderResult && (
        <div className="space-y-6">
          {/* 4-Stage Visual Status Pipeline */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6 no-print">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[12px] text-slate-500">
                  سجل الطلب المسترجع
                </span>
                <h2 className="text-[16px] font-bold text-slate-900 mt-0.5 tabular-nums">
                  {orderResult.order_code}
                  {orderResult.student_name ? ` — الطالب: ${orderResult.student_name}` : ""}
                </h2>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[12px] font-semibold border ${
                  orderResult.order_status === "approved"
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                {orderResult.order_status === "approved"
                  ? "تم الاعتماد والفتح"
                  : "قيد المراجعة وتأكيد التحويل"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {[
                {
                  num: 1,
                  title: "1. استلام المعطيات",
                  desc: "تم توثيق المجموع والميزانية وإجابات الميول",
                  done: true,
                },
                {
                  num: 2,
                  title: "2. المراجعة المالية والجغرافية",
                  desc: "حساب مصفوفة السكن وسيناريوهات التضخم",
                  done: true,
                },
                {
                  num: 3,
                  title: "3. مراجعة المستشار المختص",
                  desc:
                    orderResult.order_status === "approved"
                      ? "تمت المراجعة البشرية وإعداد التوصية"
                      : "جاري التحقق من مرجع التحويل (15–60 دقيقة)",
                  done: orderResult.order_status === "approved",
                },
                {
                  num: 4,
                  title: "4. التقرير المعتمد جاهز",
                  desc:
                    orderResult.order_status === "approved"
                      ? "متاح للطباعة والاستماع للمذكرة الصوتية"
                      : "يُفتح فور اعتماد المستشار",
                  done: orderResult.order_status === "approved",
                },
              ].map((st) => (
                <div
                  key={st.num}
                  className={`border rounded-xl p-4 space-y-1.5 ${
                    st.done
                      ? "bg-emerald-50/40 border-emerald-200"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-semibold text-slate-900">
                      {st.title}
                    </span>
                    {st.done ? (
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-600 shrink-0"
                        strokeWidth={1.5}
                      />
                    ) : (
                      <Clock
                        className="w-4 h-4 text-amber-600 shrink-0"
                        strokeWidth={1.5}
                      />
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium leading-relaxed">
                    {st.desc}
                  </p>
                </div>
              ))}
            </div>

            {orderResult.order_status === "pending" ? (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1 text-[12px] text-amber-900">
                  <div className="font-semibold">
                    طلبك قيد المراجعة وتأكيد التحويل من المستشار (يستغرق 15–60 دقيقة)
                  </div>
                  <p className="text-amber-800 tabular-nums">
                    مرجع تحويل InstaPay المسجل:{" "}
                    <strong className="font-mono">
                      {orderResult.instapay_ref}
                    </strong>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleSearchOrder}
                    className="border border-amber-300 bg-amber-100 hover:bg-amber-200 text-amber-900 px-4 py-2 rounded-xl text-[12px] font-medium flex items-center gap-1.5 transition cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" strokeWidth={1.5} />
                    ) : (
                      <Search className="w-3.5 h-3.5" strokeWidth={1.5} />
                    )}
                    <span>تحديث الحالة الآن</span>
                  </button>
                  <a
                    href={`https://wa.me/201066594552?text=${encodeURIComponent(
                      `مرحباً ChooseU، قمت بتحويل رسوم التقرير المعتمد (150 ج.م). رقم الطلب: ${orderResult.order_code} - اسم الطالب: ${orderResult.student_name} - رقم العملية في إنستاباي: ${orderResult.instapay_ref}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[12px] font-medium flex items-center gap-2 transition shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" strokeWidth={1.5} />
                    <span>متابعة التفعيل المباشر عبر واتساب</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1 text-[12px] text-emerald-950">
                  <div className="font-semibold">
                    تم اعتماد تقريرك بالكامل وفتح جميع الجداول والمذكرة الصوتية
                  </div>
                  <p className="text-emerald-800">
                    يمكنك الآن الاستماع للمذكرة الصوتية وقراءة توجيه المستشار أو طباعة التقرير النهائي كملف PDF.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="bg-[#377ef0] hover:bg-[#2962be] text-white px-5 py-2.5 rounded-xl text-[12px] font-semibold flex items-center gap-2 transition cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" strokeWidth={1.5} />
                  <span>طباعة وتحميل التقرير المعتمد النهائي (PDF)</span>
                </button>
              </div>
            )}
          </div>

          {/* Unlocked Report Content when Approved */}
          {orderResult.order_status === "approved" && (
            <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-2xs space-y-6 print-only-sheet">
              <div className="border-b-2 border-slate-900 pb-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900">
                    التقرير الاستشاري المالي والأكاديمي المعتمد
                    {orderResult.student_name ? ` — ${orderResult.student_name}` : ""}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5 tabular-nums">
                    كود الطلب: {orderResult.order_code} • المجموع:{" "}
                    {Number(orderResult.score_percentage).toFixed(1)}% •
                    الميزانية: {Number(orderResult.max_budget).toLocaleString()}{" "}
                    ج.م • المحافظة: {orderResult.governorate}
                  </p>
                </div>
                <span className="px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  طلب مراجع ومؤكد (Approved)
                </span>
              </div>

              {/* Advisor Custom Written Notes */}
              <div className="space-y-2">
                <h4 className="text-[14px] font-semibold text-slate-900">
                  توصيات وملاحظات المستشار الأكاديمي المختص:
                </h4>
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 text-[13px] text-slate-800 whitespace-pre-line leading-relaxed">
                  {orderResult.advisor_notes ||
                    "1. الأولوية الأولى للكليات الحكومية وبرامج الساعات المعتمدة داخل نطاق محافظتك لتقليل تكلفة الإقامة.\n2. الالتزام بتحقيق معدل تراكمي GPA >= 2.7 في السنة التأسيسية الأولى لضمان التخصص المطلوب."}
                </div>
              </div>

              {/* Full Unblurred Table */}
              <div className="space-y-2">
                <h4 className="text-[14px] font-semibold text-slate-900">
                  جدول المقارنة المالية والأكاديمية الكامل لسنوات الدراسة (مفتوح بالكامل):
                </h4>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-right border-collapse text-xs tabular-nums">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                        <th className="py-3 px-4 min-w-[230px]">
                          الكلية والجامعة
                        </th>
                        <th className="py-3 px-4">حد 2026</th>
                        <th className="py-3 px-4">مصروفات سنة 1</th>
                        <th className="py-3 px-4">إجمالي تكلفة الدراسة بالكامل بالتضخم</th>
                        <th className="py-3 px-4">
                          الانتقال / السكن ({orderResult.governorate})
                        </th>
                        <th className="py-3 px-4">شروط الـ GPA والمنح</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {matchedOrderFaculties.map((f, i) => {
                        const m = computeFacultyTcoMetrics(
                          f,
                          orderResult.governorate,
                          effectiveLivingMode,
                          effectiveInflation
                        );
                        return (
                          <tr key={f.id}>
                            <td className="py-3 px-4 align-top">
                              <div className="font-semibold text-slate-900">
                                0{i + 1}. {f.name}
                              </div>
                              <div className="text-xs text-slate-600 font-medium">
                                {f.university} • {f.type}
                              </div>
                            </td>
                            <td className="py-3 px-4 font-semibold align-top">
                              {f.cutoff_2026.toFixed(1)}%
                            </td>
                            <td className="py-3 px-4 align-top">
                              {f.y1_base_fee.toLocaleString()} ج.م
                            </td>
                            <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap align-top">
                              {m.total4Yr.toLocaleString()} ج.م
                            </td>
                            <td className="py-3 px-4 text-xs align-top">
                              {m.livingDesc}
                            </td>
                            <td className="py-3 px-4 text-xs leading-relaxed align-top">
                              <div>{f.gpa_requirement}</div>
                              <div className="text-blue-700 font-medium mt-0.5">
                                {f.scholarship_rule}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  * التقديرات المالية أعلاه محسوبة بافتراض نمط إقامة:{" "}
                  <span className="font-semibold text-slate-700">
                    {effectiveLivingMode === "dorm"
                      ? "سكن طلابي واغتراب"
                      : "ذهاب وعودة (Commute)"}
                  </span>{" "}
                  ومعدل تضخم سنوي{" "}
                  <span dir="ltr" className="font-mono tabular-nums font-semibold text-slate-700">
                    {effectiveInflation}%
                  </span>
                  . قد تختلف التكلفة الفعلية حسب أسعار السكن ومصروفات الانتقال الشخصية.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 6. CHECKOUT MODAL (`نافذة إصدار التقرير المعتمد — 150 ج.م`)
// ============================================================================

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentName: string;
  setStudentName: (v: string) => void;
  whatsappPhone: string;
  setWhatsappPhone: (v: string) => void;
  stream: StreamType;
  score: number;
  budget: number;
  gov: string;
  topTrack?: TrackKey | null;
  evaluation: EvaluationResult;
  onOrderCreated: (order: ConsultationOrderRow) => void;
  onNavigateToTrackOrder: (order: ConsultationOrderRow) => void;
}

export function CheckoutModal({
  isOpen,
  onClose,
  studentName,
  setStudentName,
  whatsappPhone,
  setWhatsappPhone,
  stream,
  score,
  budget,
  gov,
  topTrack,
  evaluation,
  onOrderCreated,
  onNavigateToTrackOrder,
}: CheckoutModalProps) {
  const [instapayRef, setInstapayRef] = useState<string>("");
  const [validationError, setValidationError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdOrder, setCreatedOrder] = useState<ConsultationOrderRow | null>(
    null
  );
  const [copiedAddress, setCopiedAddress] = useState<boolean>(false);
  const [copiedPhone, setCopiedPhone] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError("");

    const cleanName = SecurityValidator.sanitizeText(studentName);
    const cleanPhone = SecurityValidator.normalizeEgyptianPhone(whatsappPhone);
    const cleanRef = SecurityValidator.sanitizeText(instapayRef);

    if (cleanName.split(" ").filter(Boolean).length < 3) {
      setValidationError("يرجى إدخال اسم الطالب ثلاثياً بشكل صحيح لتوثيق التقرير.");
      return;
    }
    if (!SecurityValidator.validateEgyptianPhone(cleanPhone)) {
      setValidationError(
        "يرجى إدخال رقم واتساب مصري صحيح مكون من 11 رقماً (يبدأ بـ 010 أو 011 أو 012 أو 015)."
      );
      return;
    }
    if (!SecurityValidator.validateInstaPayRef(cleanRef)) {
      setValidationError(
        "يرجى إدخال رقم مرجع عملية تحويل InstaPay أو المحفظة (6 أحرف أو أرقام على الأقل)."
      );
      return;
    }

    setIsSubmitting(true);
    const order = await DataService.createOrder({
      student_name: cleanName,
      whatsapp_phone: cleanPhone,
      academic_stream: stream,
      score_percentage: score,
      max_budget: budget,
      governorate: gov,
      quiz_results: {
        topTrack,
        eligibleIds: evaluation.allRanked.slice(0, 10).map((f) => f.id),
      },
      instapay_ref: cleanRef,
    });
    setIsSubmitting(false);
    setCreatedOrder(order);
    onOrderCreated(order);
  };

  const streamLabel = formatStream(stream);

  const whatsappMsgBody = createdOrder
    ? [
        "مرحباً ChooseU، قمت بتحويل رسوم التقرير المعتمد (150 ج.م).",
        "• رقم الطلب: " + createdOrder.order_code,
        "• اسم الطالب: " + createdOrder.student_name,
        "• الشعبة والمجموع: " + streamLabel + " (" + score.toFixed(1) + "%)",
        "• الميزانية والمحافظة: " + budget.toLocaleString() + " ج.م — " + gov,
        "• رقم العملية في إنستاباي: " + createdOrder.instapay_ref,
      ].join("\n")
    : "";
  const whatsappSummaryUrl = createdOrder
    ? "https://wa.me/201066594552?text=" + encodeURIComponent(whatsappMsgBody)
    : "https://wa.me/201066594552";

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full mx-auto p-6 shadow-2xl space-y-5 my-auto">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-[17px] font-bold text-slate-900">
              نافذة إصدار التقرير المعتمد — 150 ج.م
            </h3>
            <p className="text-[12px] text-slate-500 mt-0.5">
              فتح جميع البدائل + جدول التدفق المالي الكامل + المذكرة الصوتية للمستشار
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {!createdOrder ? (
          <form onSubmit={handleConfirmOrder} className="space-y-4">
            {validationError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-2.5 rounded-xl text-[12px]">
                {validationError}
              </div>
            )}

            {/* Payment Instructions */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 text-[12px]">
              <div className="font-semibold text-slate-900">
                1. حوّل رسوم التقرير (150 ج.م) عبر InstaPay أو المحفظة الإلكترونية:
              </div>

              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2">
                <div>
                  <span className="text-xs text-slate-600 font-medium block">
                    عنوان الدفع عبر InstaPay
                  </span>
                  <code className="font-mono font-semibold text-slate-900 dir-ltr">
                    nourelsharkawy6300@instapay
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("nourelsharkawy6300@instapay");
                    setCopiedAddress(true);
                    setTimeout(() => setCopiedAddress(false), 2000);
                  }}
                  className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedAddress ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                      <span>نسخ العنوان</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2 tabular-nums">
                <div>
                  <span className="text-xs text-slate-600 font-medium block">
                    رقم المحفظة / InstaPay Phone
                  </span>
                  <code className="font-mono font-semibold text-slate-900 dir-ltr">
                    01066594552
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText("01066594552");
                    setCopiedPhone(true);
                    setTimeout(() => setCopiedPhone(false), 2000);
                  }}
                  className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  {copiedPhone ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" strokeWidth={1.5} />
                      <span>تم النسخ</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" strokeWidth={1.5} />
                      <span>نسخ الرقم</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Validated Customer Inputs */}
            <div className="space-y-3">
              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1">
                  اسم الطالب ثلاثي
                </label>
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  placeholder="أدخل الاسم الثلاثي للطالب..."
                  className="w-full border border-slate-200 focus:border-slate-900 rounded-xl px-3.5 py-2 text-[13px] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1">
                  رقم واتساب للتواصل واستلام التقرير الاستشاري
                </label>
                <input
                  type="tel"
                  required
                  value={whatsappPhone}
                  onChange={(e) => setWhatsappPhone(e.target.value)}
                  placeholder="010XXXXXXXX"
                  className="w-full border border-slate-200 focus:border-slate-900 rounded-xl px-3.5 py-2 text-[13px] dir-ltr text-left tabular-nums focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[12px] font-medium text-slate-700 mb-1">
                  رقم العملية في إنستاباي (InstaPay Reference ID)
                </label>
                <input
                  type="text"
                  required
                  value={instapayRef}
                  onChange={(e) => setInstapayRef(e.target.value)}
                  placeholder="مثال: IPN-20261114-8842"
                  className="w-full border border-slate-200 focus:border-slate-900 rounded-xl px-3.5 py-2 text-[13px] font-mono dir-ltr text-left tabular-nums focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={1.5} />
              ) : (
                <CreditCard className="w-4 h-4" strokeWidth={1.5} />
              )}
              <span>تأكيد بيانات التحويل وإصدار كود الطلب</span>
            </button>
          </form>
        ) : (
          /* Confirmation State */
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 tabular-nums">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-mono font-bold text-slate-900">
                  {createdOrder.order_code}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                  قيد المراجعة وتأكيد التحويل (15–60 دقيقة)
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                تم حفظ طلبك بنجاح في قاعدة البيانات. احتفظ برقم طلبك (
                <strong className="font-mono">{createdOrder.order_code}</strong>
                ) لمتابعة حالته واستلام التقرير، واضغط بالأسفل لإرسال إشعار التحويل عبر واتساب.
              </p>
            </div>

            <a
              href={whatsappSummaryUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-4 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition shadow-sm"
            >
              <Send className="w-4 h-4" strokeWidth={1.5} />
              <span>إرسال ملخص الطلب عبر WhatsApp لتسريع الاعتماد</span>
            </a>

            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigateToTrackOrder(createdOrder);
              }}
              className="w-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 py-2.5 px-4 rounded-xl text-[12px] font-semibold cursor-pointer"
            >
              الانتقال لبوابة متابعة حالة الطلب
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
