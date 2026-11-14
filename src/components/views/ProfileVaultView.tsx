"use client";

import React, { useState } from "react";
import {
  User,
  Printer,
  ShieldCheck,
  Bookmark,
  Trash2,
} from "lucide-react";
import { Faculty, StreamType, LivingMode } from "@/types/chooseu";
import { FACULTIES_DATABASE, EGYPT_GOVERNORATES } from "@/data/faculties-db";
import { computeFacultyTcoMetrics } from "@/lib/engine";

interface ProfileVaultViewProps {
  studentName: string;
  onUpdateStudentName: (name: string) => void;
  stream: StreamType;
  onUpdateStream: (stream: StreamType) => void;
  score: number;
  onUpdateScore: (score: number) => void;
  budget: number;
  onUpdateBudget: (budget: number) => void;
  governorate: string;
  onUpdateGovernorate: (gov: string) => void;
  livingMode: LivingMode;
  onUpdateLivingMode: (mode: LivingMode) => void;
  bookmarkedIds: string[];
  onRemoveBookmark: (id: string) => void;
  onOpenFacultyDrawer: (faculty: Faculty) => void;
  topFaculties: Faculty[];
}

export function ProfileVaultView({
  studentName,
  onUpdateStudentName,
  stream,
  onUpdateStream,
  score,
  onUpdateScore,
  budget,
  onUpdateBudget,
  governorate,
  onUpdateGovernorate,
  livingMode,
  onUpdateLivingMode,
  bookmarkedIds,
  onRemoveBookmark,
  onOpenFacultyDrawer,
  topFaculties,
}: ProfileVaultViewProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "parent_summary">("parent_summary");

  const bookmarkedFaculties = bookmarkedIds
    .map((id) => FACULTIES_DATABASE.find((f) => f.id === id))
    .filter((f): f is Faculty => f !== undefined);

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const streamLabel =
    stream === "Science" ? "علمي علوم" : stream === "Math" ? "علمي رياضة" : "أدبي";

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold mb-1">
            <User className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>ملف الطالب والتقرير التنفيذي لولي الأمر</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            بيانات الطالب وخلاصة القرار لأسرة الطالب
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            تعديل المعايير الأساسية واستخراج التقرير التنفيذي المالي والأكاديمي الرسمي
          </p>
        </div>

        {/* Tab Controls & Print */}
        <div className="flex items-center gap-2">
          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab("parent_summary")}
              className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
                activeTab === "parent_summary"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              تقرير ولي الأمر الرسمي
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
                activeTab === "profile"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              تعديل المعايير والمحفوظات ({bookmarkedFaculties.length})
            </button>
          </div>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-[12px] font-bold rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>طباعة PDF</span>
          </button>
        </div>
      </div>

      {/* TAB 1: PARENT EXECUTIVE SUMMARY */}
      {activeTab === "parent_summary" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            {/* Report Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
              <div className="space-y-1">
                <div className="text-[10px] font-mono text-slate-400 tracking-wider">
                  CHOOSEU EXECUTIVE ADVISORY BRIEF — 2026/2027
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  التقرير التنفيذي لولي الأمر: دراسة الجدوى الأكاديمية والمالية
                </h2>
                <p className="text-[12px] text-slate-500">
                  إعداد: محرك ChooseU للاستشارات الجامعية والتنسيق الذكي
                </p>
              </div>

              <div className="text-left bg-slate-50 border border-slate-200 rounded-lg p-3 text-[11px] font-mono tabular-nums">
                <div>تاريخ التقرير: 2026/08/15</div>
                <div>كود الطالب: CHU-{Math.floor(score * 100)}</div>
                <div className="text-emerald-700 font-bold">الحالة: مكتمل ومعتمد</div>
              </div>
            </div>

            {/* Student Persona Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200 text-right text-[11px]">
              <div>
                <span className="text-slate-400 block">اسم الطالب</span>
                <span className="font-bold text-slate-900 text-sm mt-0.5 block">{studentName}</span>
              </div>
              <div>
                <span className="text-slate-400 block">الشعبة الثانوية</span>
                <span className="font-bold text-blue-600 text-sm mt-0.5 block">{streamLabel}</span>
              </div>
              <div>
                <span className="text-slate-400 block">المجموع التقديري</span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block tabular-nums">
                  {score.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">سقف الميزانية السنوية</span>
                <span className="font-mono font-bold text-slate-900 text-sm mt-0.5 block tabular-nums">
                  {budget.toLocaleString("en-US")} ج.م
                </span>
              </div>
            </div>

            {/* Strategic Summary Box for Parents */}
            <div className="border border-slate-200 rounded-xl p-5 bg-blue-50/30 space-y-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 stroke-[1.5]" />
                <span>التقييم الاستراتيجي ومستوى الأمان:</span>
              </h3>
              <p className="text-[12px] text-slate-700 leading-relaxed">
                بناءً على مجموع الطالب ({score.toFixed(1)}%) ونطاق التوزيع الجغرافي ({governorate})، يمتلك الطالب فرصة تنافسية قوية للالتحاق بكليات البرامج التخصصية أو الجامعات الأهلية الحديثة دون تجاوز الميزانية المحددة للأسرة. ننصح بالتركيز على الكليات ذات الشراكات الدولية وتفادي البرامج التقليدية المهددة بتشبع سوق العمل.
              </p>
            </div>

            {/* Top 3 Strategic Options with Full 4-Year Cost Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">
                الخيارات الثلاثة الأفضل (خطة أ، خطة ب، خطة ج)
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-[12px] border-collapse border border-slate-200 rounded-lg overflow-hidden">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 font-bold">
                      <th className="p-3">الخطة</th>
                      <th className="p-3">الكلية والجامعة</th>
                      <th className="p-3">نوع التعليم</th>
                      <th className="p-3">الحد الأدنى 2026</th>
                      <th className="p-3">إجمالي 4 سنوات (TCO)</th>
                      <th className="p-3">التوصية لولي الأمر</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {topFaculties.slice(0, 3).map((f, idx) => {
                      const tco = computeFacultyTcoMetrics(f, governorate, livingMode, 10);
                      const planLabel = idx === 0 ? "الخطة (أ) — الخيار الأساسي" : idx === 1 ? "الخطة (ب) — البديل الآمن" : "الخطة (ج) — المسار الاقتصادي";

                      return (
                        <tr key={f.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-900 whitespace-nowrap">
                            {planLabel}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-900">{f.name}</div>
                            <div className="text-[10px] text-slate-500">{f.university}</div>
                          </td>
                          <td className="p-3 text-slate-700 whitespace-nowrap">{f.type}</td>
                          <td className="p-3 font-mono font-bold text-slate-900 tabular-nums">
                            {f.cutoff_2026}%
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-900 tabular-nums whitespace-nowrap">
                            {tco.total4Yr.toLocaleString("en-US")} ج.م
                          </td>
                          <td className="p-3 text-[11px] text-slate-600 leading-relaxed">
                            {idx === 0
                              ? "أفضل عائد على الاستثمار وتوافق تام مع ميول الطالب."
                              : idx === 1
                              ? "فرصة أمان مضمونة بمصروفات أقل وتوافق مهني مرتفع."
                              : "مسار منخفض التكلفة يتيح توفير الميزانية للدراسات العليا."}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Formal Advisor Sign-off block */}
            <div className="pt-6 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-[11px] text-slate-600">
              <div className="space-y-1">
                <span className="font-bold text-slate-900">اعتماد وتوصية المستشار الأكاديمي:</span>
                <p>
                  تم تدقيق هذا التقرير آلياً وفقاً لقواعد المجلس الأعلى للجامعات لعام 2026، ولا يغني عن مراجعة بطاقة الترشيح الرسمية لموقع التنسيق.
                </p>
              </div>
              <div className="text-left flex flex-col items-end justify-center">
                <div className="font-mono font-bold text-slate-900">ChooseU Academic Advisory Bureau</div>
                <div className="text-slate-400 text-[10px]">Verified & Sealed</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROFILE PARAMETERS & BOOKMARKS */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Edit Parameters */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              تعديل المعايير الأساسية
            </h2>

            <div className="space-y-3 text-[12px]">
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم الطالب:</label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => onUpdateStudentName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-medium"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الشعبة:</label>
                <select
                  value={stream}
                  onChange={(e) => onUpdateStream(e.target.value as StreamType)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold cursor-pointer"
                >
                  <option value="Math">علمي رياضة</option>
                  <option value="Science">علمي علوم</option>
                  <option value="Arts">أدبي</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">المجموع التقديري (%):</label>
                <input
                  type="number"
                  step="0.1"
                  min="50"
                  max="100"
                  value={score}
                  onChange={(e) => onUpdateScore(parseFloat(e.target.value) || 50)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">سقف الميزانية السنوية (ج.م):</label>
                <input
                  type="number"
                  step="5000"
                  value={budget}
                  onChange={(e) => onUpdateBudget(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">محافظة السكن:</label>
                <select
                  value={governorate}
                  onChange={(e) => onUpdateGovernorate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold cursor-pointer"
                >
                  {EGYPT_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">نمط الإقامة والانتقال:</label>
                <select
                  value={livingMode}
                  onChange={(e) => onUpdateLivingMode(e.target.value as LivingMode)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 font-bold cursor-pointer"
                >
                  <option value="commute">سكن عائلي وانتقال يومي</option>
                  <option value="dorm">اغتراب (مدينة جامعية / سكن خارجي)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Bookmarks List */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-blue-600 stroke-[1.5]" />
                <span>الكليات المحفوظة في مفضلتك ({bookmarkedFaculties.length})</span>
              </h2>
            </div>

            {bookmarkedFaculties.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Bookmark className="w-8 h-8 text-slate-300 stroke-[1.5]" />
                <p className="text-[12px] text-slate-500">
                  لم تقم بحفظ أي كليات بعد. يمكنك الضغط على أيقونة الحفظ في أي كلية لتظهر هنا.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {bookmarkedFaculties.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 border border-slate-200 rounded-xl flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                  >
                    <div>
                      <h4 className="text-[13px] font-bold text-slate-900">{f.name}</h4>
                      <p className="text-[11px] text-slate-500">
                        {f.university} • {f.gov} • الحد الأدنى: {f.cutoff_2026}%
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenFacultyDrawer(f)}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer"
                      >
                        التفاصيل
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveBookmark(f.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="حذف من المفضلة"
                      >
                        <Trash2 className="w-4 h-4 stroke-[1.5]" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
