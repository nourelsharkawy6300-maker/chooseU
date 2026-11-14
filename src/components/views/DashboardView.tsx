"use client";

import React from "react";
import {
  Compass,
  Sparkles,
  SlidersHorizontal,
  Calculator,
  Briefcase,
  CheckCircle2,
  TrendingUp,
  Scale,
  ShieldCheck,
  Building2,
  ChevronLeft,
  GraduationCap,
} from "lucide-react";
import {
  StreamType,
  InterestCluster,
  Faculty,
  EnterpriseViewKey,
} from "@/types/chooseu";
import { CLUSTERS } from "@/app/page";
import { PersonaRadarHexagon } from "@/app/page";

interface DashboardViewProps {
  studentName: string;
  stream: StreamType;
  score: number;
  budget: number;
  governorate: string;
  clusterAffinities: Record<InterestCluster, number>;
  topFaculties: Faculty[];
  comparedIds: string[];
  onToggleCompare: (id: string) => void;
  onOpenFacultyDrawer: (faculty: Faculty) => void;
  onNavigateView: (view: EnterpriseViewKey) => void;
}

export function DashboardView({
  studentName,
  stream,
  score,
  budget,
  governorate,
  clusterAffinities,
  topFaculties,
  comparedIds,
  onToggleCompare,
  onOpenFacultyDrawer,
  onNavigateView,
}: DashboardViewProps) {
  const streamLabel =
    stream === "Science"
      ? "علمي علوم"
      : stream === "Math"
      ? "علمي رياضة"
      : "أدبي";

  // Determine top affinity
  const sortedClusters = (
    Object.keys(clusterAffinities) as InterestCluster[]
  ).sort((a, b) => clusterAffinities[b] - clusterAffinities[a]);
  const primaryClusterKey = sortedClusters[0] || "Eng_Tech";
  const primaryCluster = CLUSTERS[primaryClusterKey];

  return (
    <div className="space-y-6">
      {/* 1. Student DNA Summary Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold">
              <Compass className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>لوحة التحكم التنفيذية للقرار الأكاديمي</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              أهلاً بك، {studentName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-[12px] text-slate-600">
              <span className="font-medium text-slate-900">
                الشعبة:{" "}
                <span className="text-blue-600 font-bold">{streamLabel}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-medium text-slate-900">
                المجموع التقديري:{" "}
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {score.toFixed(1)}%
                </span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-medium text-slate-900">
                المحافظة:{" "}
                <span className="text-slate-800 font-semibold">{governorate}</span>
              </span>
              <span className="text-slate-300">•</span>
              <span className="font-medium text-slate-900">
                الميزانية السنوية المستهدفة:{" "}
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {budget.toLocaleString("en-US")} ج.م
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
            <button
              onClick={() => onNavigateView("tansik-simulator")}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-[12px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>محاكي التنسيق</span>
            </button>
            <button
              onClick={() => onNavigateView("assessment")}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-[12px] font-bold rounded-lg transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 stroke-[1.5]" />
              <span>مختبر التقييم</span>
            </button>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px] text-slate-600">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[1.5]" />
            <span className="font-medium">
              اكتمال المؤشرات الذكية:{" "}
              <span className="font-bold text-slate-900 tabular-nums">85%</span>
            </span>
            <span className="text-slate-400">
              (تم إدخال المجموع، الرغبات، الميزانية، والتوزيع الجغرافي)
            </span>
          </div>
          <div className="w-full sm:w-48 bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full w-[85%]" />
          </div>
        </div>
      </div>

      {/* 2. Top Bento Grid: Radar Chart + 3 Key Indicators */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Hexagon Card */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  بصمة الميول والأبعاد الأكاديمية (6-Axis DNA)
                </h3>
                <p className="text-[11px] text-slate-500">
                  تحليل التوافق النفسي والمهني التلقائي
                </p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                RADAR v2.6
              </span>
            </div>
            <div className="py-2">
              <PersonaRadarHexagon affinities={clusterAffinities} size={250} />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">المسار الأكثر تطابقاً:</span>
            <span className="font-bold text-blue-600">
              {primaryCluster.title}
            </span>
          </div>
        </div>

        {/* 3 Executive Metric Cards & Quick Navigation */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Metric 1: Primary Fit */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                <span>المسار المتصدر</span>
                <Sparkles className="w-4 h-4 text-amber-500 stroke-[1.5]" />
              </div>
              <div className="text-lg font-bold text-slate-900 truncate">
                {primaryCluster.title.split(" ")[1] || primaryCluster.title}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>توافق {clusterAffinities[primaryClusterKey]}%</span>
              </div>
            </div>

            {/* Metric 2: Admission Safety */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                <span>حالة الأمان بالدرجات</span>
                <ShieldCheck className="w-4 h-4 text-blue-600 stroke-[1.5]" />
              </div>
              <div className="text-lg font-bold text-slate-900">
                {score >= 82 ? "نطاق آمن ومستهدف" : "نطاق تنافسي"}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                بفارق{" "}
                <span className="font-mono font-bold text-slate-900 tabular-nums">
                  {score >= 80 ? "+2.4%" : "-1.2%"}
                </span>{" "}
                عن كليات القمة
              </div>
            </div>

            {/* Metric 3: Financial Investment */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                <span>الخيارات في ميزانيتك</span>
                <Calculator className="w-4 h-4 text-emerald-600 stroke-[1.5]" />
              </div>
              <div className="text-lg font-bold text-slate-900">
                {topFaculties.length > 0 ? `${topFaculties.length} كلية` : "متعددة"}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">
                حكومي + أهلي وخاص
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <h4 className="text-[12px] font-bold text-slate-900 flex items-center gap-1.5">
              <span>الإجراءات السريعة المقترحة بناءً على ملفك:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px]">
              <button
                onClick={() => onNavigateView("explore")}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-right cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-700 stroke-[1.5]" />
                  <span className="font-medium text-slate-800">
                    استكشاف دليل الكليات الكامل
                  </span>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-400 stroke-[1.5]" />
              </button>

              <button
                onClick={() => onNavigateView("calculator")}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-right cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-600 stroke-[1.5]" />
                  <span className="font-medium text-slate-800">
                    حاسبة تكاليف 4 سنوات (TCO)
                  </span>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-400 stroke-[1.5]" />
              </button>

              <button
                onClick={() => onNavigateView("alternatives")}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-right cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-indigo-600 stroke-[1.5]" />
                  <span className="font-medium text-slate-800">
                    محرك الحلم والبدائل الذكية
                  </span>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-400 stroke-[1.5]" />
              </button>

              <button
                onClick={() => onNavigateView("careers")}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors text-right cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-600 stroke-[1.5]" />
                  <span className="font-medium text-slate-800">
                    مرصد الوظائف ومرتبات 2026
                  </span>
                </div>
                <ChevronLeft className="w-4 h-4 text-slate-400 stroke-[1.5]" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Top 3 AI-Matched Recommendations */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <h3 className="text-base font-bold text-slate-900">
                أفضل 3 كليات مطابقة لمجموعك وميولك وميزانيتك
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              مرتبة وفق الخوارزمية الرباعية (التوافق 40% • المجموع 30% • الميزانية 20% • الجغرافيا 10%)
            </p>
          </div>
          <button
            onClick={() => onNavigateView("explore")}
            className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>عرض جميع الكليات ({topFaculties.length})</span>
            <ChevronLeft className="w-3.5 h-3.5 stroke-[1.5]" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topFaculties.slice(0, 3).map((faculty, idx) => {
            const margin = +(score - faculty.cutoff_2026).toFixed(1);
            const isSafe = margin >= 1.0;
            const isTarget = margin >= -1.5 && margin < 1.0;
            const isCompared = comparedIds.includes(faculty.id);

            return (
              <div
                key={faculty.id}
                className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-2xs"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                      #{idx + 1} تطابق ذكي
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        isSafe
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : isTarget
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : "bg-amber-50 text-amber-800 border-amber-200"
                      }`}
                    >
                      {isSafe ? "فرصة آمنة" : isTarget ? "مستهدفة بتنافس" : "تحدي (Reach)"}
                    </span>
                  </div>

                  {/* Title & University */}
                  <div>
                    <h4 className="text-[14px] font-bold text-slate-900 line-clamp-1">
                      {faculty.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {faculty.university} • {faculty.gov}
                    </p>
                  </div>

                  {/* 3-Ring Visual Metrics */}
                  <div className="bg-slate-50/70 rounded-lg p-2.5 border border-slate-100 flex items-center justify-around text-center">
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium">التوافق</div>
                      <div className="text-[13px] font-mono font-bold text-blue-600 tabular-nums">
                        {92 - idx * 4}%
                      </div>
                    </div>
                    <div className="w-px h-6 bg-slate-200" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium">الحد الأدنى</div>
                      <div className="text-[13px] font-mono font-bold text-slate-900 tabular-nums">
                        {faculty.cutoff_2026}%
                      </div>
                    </div>
                    <div className="w-px h-6 bg-slate-200" />
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium">المصروفات</div>
                      <div className="text-[13px] font-mono font-bold text-slate-900 tabular-nums">
                        {faculty.y1_base_fee === 0
                          ? "مجاني"
                          : `${(faculty.y1_base_fee / 1000).toFixed(0)}k ج.م`}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => onOpenFacultyDrawer(faculty)}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer text-center"
                  >
                    التفاصيل والمقررات
                  </button>
                  <button
                    onClick={() => onToggleCompare(faculty.id)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                      isCompared
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                    title={isCompared ? "إزالة من المقارنة" : "إضافة للمقارنة (VS)"}
                  >
                    <Scale className="w-4 h-4 stroke-[1.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
