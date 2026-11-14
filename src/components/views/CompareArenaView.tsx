"use client";

import React, { useMemo } from "react";
import {
  Scale,
  Plus,
  Trash2,
  Building2,
  Trophy,
  CheckCircle2,
  XCircle,
  TrendingUp,
  GraduationCap,
  Briefcase,
  Share2,
} from "lucide-react";
import { Faculty, StreamType } from "@/types/chooseu";
import { FACULTIES_DATABASE } from "@/data/faculties-db";
import { computeFacultyTcoMetrics } from "@/lib/engine";

interface CompareArenaViewProps {
  stream: StreamType;
  comparedIds: string[];
  onToggleCompare: (id: string) => void;
  onOpenFacultyDrawer: (faculty: Faculty) => void;
  governorate: string;
}

export function CompareArenaView({
  stream,
  comparedIds,
  onToggleCompare,
  onOpenFacultyDrawer,
  governorate,
}: CompareArenaViewProps) {
  const eligibleFaculties = useMemo(() => {
    return FACULTIES_DATABASE.filter(
      (f) => f.stream === stream || f.stream === "Both"
    );
  }, [stream]);

  // Selected faculties
  const comparedFaculties = useMemo(() => {
    return comparedIds
      .map((id) => FACULTIES_DATABASE.find((f) => f.id === id))
      .filter((f): f is Faculty => f !== undefined);
  }, [comparedIds]);

  // Quick suggestions if empty or less than 2
  const quickSuggestions = useMemo(() => {
    return eligibleFaculties.slice(0, 4);
  }, [eligibleFaculties]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("تم نسخ رابط المقارنة بنجاح إلى الحافظة!");
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold mb-1">
            <Scale className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>منصة المقارنة المباشرة (Head-to-Head VS Arena)</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            مقارنة الكليات وجهاً لوجه
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            قارن بين 2 إلى 4 كليات عبر 6 أبعاد حاسمة: الحد الأدنى، التكلفة، اللائحة، القدرات، والمسار المهني
          </p>
        </div>

        {comparedFaculties.length >= 2 && (
          <button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 text-[12px] font-bold rounded-lg transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4 stroke-[1.5]" />
            <span>مشاركة جدول المقارنة</span>
          </button>
        )}
      </div>

      {/* 2. Empty or Insufficient State */}
      {comparedFaculties.length < 2 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 text-center space-y-4 shadow-xs">
          <Scale className="w-10 h-10 text-slate-400 stroke-[1.5]" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              اختر كليتين على الأقل لبدء المقارنة المباشرة
            </h3>
            <p className="text-[12px] text-slate-500">
              اضغط على أيقونة الميزان في بطاقة أي كلية في دليل الكليات أو لوحة التحكم لإضافتها هنا.
            </p>
          </div>

          {/* Quick Suggestions to add */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="text-[11px] font-bold text-slate-600">
              اقتراحات سريعة للمقارنة في شعبتك:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-right">
              {quickSuggestions.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => onToggleCompare(f.id)}
                  className="p-2.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-colors flex items-center justify-between text-[11px] font-medium text-slate-800 cursor-pointer"
                >
                  <span className="truncate">{f.name} — {f.university}</span>
                  <Plus className="w-4 h-4 text-blue-600 shrink-0 mr-1" />
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* 3. Comparison Matrix Table */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-[12px] border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="p-4 w-48 font-bold border-l border-slate-200">
                    معيار المقارنة
                  </th>
                  {comparedFaculties.map((f) => (
                    <th key={f.id} className="p-4 font-bold border-l border-slate-200 last:border-l-0 min-w-[220px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                            {f.type}
                          </span>
                          <button
                            type="button"
                            onClick={() => onToggleCompare(f.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="حذف من المقارنة"
                          >
                            <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                          </button>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 mt-1">
                          {f.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-normal">
                          {f.university} • {f.gov}
                        </p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-200">
                {/* 1. Cutoff */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-900 border-l border-slate-200 bg-slate-50/40">
                    الحد الأدنى المتوقع 2026
                  </td>
                  {comparedFaculties.map((f) => {
                    const lowestCutoff = Math.min(
                      ...comparedFaculties.map((item) => item.cutoff_2026)
                    );
                    const isLowest = f.cutoff_2026 === lowestCutoff;

                    return (
                      <td key={f.id} className="p-4 border-l border-slate-200 last:border-l-0">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-mono font-bold text-slate-900 tabular-nums">
                            {f.cutoff_2026}%
                          </span>
                          {isLowest && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                              الأسهل قبولاً
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 2. 4-Year TCO Investment */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-900 border-l border-slate-200 bg-slate-50/40">
                    التكلفة التقديرية (4 سنوات TCO)
                  </td>
                  {comparedFaculties.map((f) => {
                    const metrics = computeFacultyTcoMetrics(f, governorate, "commute", 10);
                    const minTco = Math.min(
                      ...comparedFaculties.map(
                        (item) => computeFacultyTcoMetrics(item, governorate, "commute", 10).total4Yr
                      )
                    );
                    const isMin = metrics.total4Yr === minTco;

                    return (
                      <td key={f.id} className="p-4 border-l border-slate-200 last:border-l-0">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-mono font-bold text-slate-900 tabular-nums">
                              {metrics.total4Yr.toLocaleString("en-US")} ج.م
                            </span>
                            {isMin && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                                الأوفر مالياً
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            مصروفات سنة أولى: {f.y1_base_fee === 0 ? "مجاني" : `${f.y1_base_fee.toLocaleString("en-US")} ج.م`}
                          </div>
                        </div>
                      </td>
                    );
                  })}
                </tr>

                {/* 3. Bylaws & Credit Hours */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-900 border-l border-slate-200 bg-slate-50/40">
                    اللائحة ونظام الساعات
                  </td>
                  {comparedFaculties.map((f) => (
                    <td key={f.id} className="p-4 border-l border-slate-200 last:border-l-0 text-slate-700 leading-relaxed text-[11px]">
                      {f.bylaw_notes}
                    </td>
                  ))}
                </tr>

                {/* 4. Specialization & GPA */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-900 border-l border-slate-200 bg-slate-50/40">
                    شرط التشعيب الداخلي والمعدل
                  </td>
                  {comparedFaculties.map((f) => (
                    <td key={f.id} className="p-4 border-l border-slate-200 last:border-l-0 text-slate-700 text-[11px]">
                      {f.gpa_requirement}
                    </td>
                  ))}
                </tr>

                {/* 5. Aptitude Test */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-900 border-l border-slate-200 bg-slate-50/40">
                    اختبار القدرات المسبق
                  </td>
                  {comparedFaculties.map((f) => (
                    <td key={f.id} className="p-4 border-l border-slate-200 last:border-l-0">
                      {f.aptitude_test ? (
                        <div className="flex items-center gap-1.5 text-amber-700 font-bold text-[11px]">
                          <CheckCircle2 className="w-4 h-4 text-amber-600 stroke-[1.5]" />
                          <span>إلزامي قبل التنسيق</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-[11px]">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 stroke-[1.5]" />
                          <span>غير مطلوب (ترشيح مباشر)</span>
                        </div>
                      )}
                    </td>
                  ))}
                </tr>

                {/* 6. Career Demand & Salary */}
                <tr className="hover:bg-slate-50/50">
                  <td className="p-4 font-bold text-slate-900 border-l border-slate-200 bg-slate-50/40">
                    الطلب في سوق العمل والرواتب
                  </td>
                  {comparedFaculties.map((f) => (
                    <td key={f.id} className="p-4 border-l border-slate-200 last:border-l-0 space-y-1">
                      <div className="font-mono font-bold text-slate-900 tabular-nums">
                        {f.future_career.salary_range_egp}
                      </div>
                      <div className="text-[10px] text-slate-500 font-medium">
                        الطلب: {f.future_career.market_demand}
                      </div>
                    </td>
                  ))}
                </tr>

                {/* Action Row */}
                <tr>
                  <td className="p-4 border-l border-slate-200 bg-slate-50/40">
                    التفاصيل والمقررات
                  </td>
                  {comparedFaculties.map((f) => (
                    <td key={f.id} className="p-4 border-l border-slate-200 last:border-l-0">
                      <button
                        type="button"
                        onClick={() => onOpenFacultyDrawer(f)}
                        className="w-full py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        فتح الملف الكامل ←
                      </button>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
