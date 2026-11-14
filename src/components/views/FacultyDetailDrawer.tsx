"use client";

import React, { useState } from "react";
import {
  X,
  GraduationCap,
  Scale,
  ShieldCheck,
  AlertCircle,
  Briefcase,
  TrendingUp,
  Award,
  Layers,
} from "lucide-react";
import { Faculty } from "@/types/chooseu";
import { TRACK_DETAILS } from "@/data/faculties-db";

interface FacultyDetailDrawerProps {
  faculty: Faculty | null;
  onClose: () => void;
  onToggleCompare: (id: string) => void;
  isCompared: boolean;
}

export function FacultyDetailDrawer({
  faculty,
  onClose,
  onToggleCompare,
  isCompared,
}: FacultyDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<"bylaws" | "roadmap" | "career" | "admission">("bylaws");

  if (!faculty) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 -xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Surface */}
      <div className="relative w-full bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto border-r border-slate-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-[#FAF8F5] sticky top-0 z-10 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                {faculty.type}
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                {faculty.gov}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900">{faculty.name}</h2>
            <p className="text-[13px] text-slate-600 mt-0.5">
              {faculty.university}
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 bg-white rounded-lg p-3 border border-slate-200 text-center text-[11px]">
            <div>
              <div className="text-slate-400">الحد الأدنى المتوقع</div>
              <div className="font-mono font-bold text-slate-900 text-sm tabular-nums mt-0.5">
                {faculty.cutoff_2026}%
              </div>
            </div>
            <div className="border-r border-slate-100">
              <div className="text-slate-400">المصروفات السنوية</div>
              <div className="font-mono font-bold text-slate-900 text-sm tabular-nums mt-0.5">
                {faculty.y1_base_fee === 0
                  ? "مجاني"
                  : `${faculty.y1_base_fee.toLocaleString("en-US")} ج.م`}
              </div>
            </div>
            <div className="border-r border-slate-100">
              <div className="text-slate-400">اختبار القدرات</div>
              <div className="font-bold text-slate-900 text-xs mt-0.5">
                {faculty.aptitude_test ? "مطلوب إلزامي" : "غير مطلوب"}
              </div>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex bg-slate-200/70 p-1 rounded-lg text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab("bylaws")}
              className={`flex-1 py-1.5 rounded-md font-bold transition-colors cursor-pointer text-center ${
                activeTab === "bylaws"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              اللائحة ونظام الساعات
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("roadmap")}
              className={`flex-1 py-1.5 rounded-md font-bold transition-colors cursor-pointer text-center ${
                activeTab === "roadmap"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              خارطة الـ 4 سنوات
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("career")}
              className={`flex-1 py-1.5 rounded-md font-bold transition-colors cursor-pointer text-center ${
                activeTab === "career"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              الوظائف والمرتبات
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("admission")}
              className={`flex-1 py-1.5 rounded-md font-bold transition-colors cursor-pointer text-center ${
                activeTab === "admission"
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              القدرات والمنح
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 flex-1 space-y-6">
          {/* TAB 1: BYLAWS */}
          {activeTab === "bylaws" && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 stroke-[1.5]" />
                  <span>نظام الدراسة واللائحة الأكاديمية:</span>
                </h3>
                <p className="text-[12px] text-slate-700 leading-relaxed">
                  {faculty.bylaw_notes}
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-600 stroke-[1.5]" />
                  <span>شروط المعدل التراكمي (GPA) والتشعيب الداخلي:</span>
                </h3>
                <p className="text-[12px] text-slate-700 leading-relaxed">
                  {faculty.gpa_requirement}
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-purple-600 stroke-[1.5]" />
                  <span>المسارات التخصصية المعتمدة بالكلية:</span>
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {faculty.tracks.map((tr) => {
                    const meta = TRACK_DETAILS[tr];
                    return (
                      <span
                        key={tr}
                        className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-medium text-slate-800"
                      >
                        {meta ? meta.title : tr}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ROADMAP */}
          {activeTab === "roadmap" && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                خطة المواد والمهارات عبر السنوات الدراسية
              </h3>

              <div className="relative border-r-2 border-slate-200 pr-5 space-y-6 mr-2">
                {faculty.future_career.roadmap_years.map((step, idx) => (
                  <div key={idx} className="relative space-y-1.5">
                    <div className="absolute -right-[27px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white" />
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-slate-900">
                        {step.year}
                      </span>
                      <span className="text-[11px] text-blue-600 font-medium">
                        • {step.focus}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {step.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CAREER & MARKET OUTLOOK */}
          {activeTab === "career" && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-blue-600 stroke-[1.5]" />
                    <span>المسميات الوظيفية المستهدفة للخريجين:</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    الطلب: {faculty.future_career.market_demand}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {faculty.future_career.roles.map((role, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-900 text-[11px] font-bold"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600 stroke-[1.5]" />
                  <span>متوسط الرواتب في السوق المصري والإقليمي:</span>
                </h3>
                <div className="text-xl font-mono font-bold text-slate-900 tabular-nums">
                  {faculty.future_career.salary_range_egp}
                </div>
                <p className="text-[11px] text-slate-500">
                  التدرج الوظيفي المتوقع: {faculty.future_career.progression}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: ADMISSION & APTITUDE */}
          {activeTab === "admission" && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 stroke-[1.5]" />
                  <span>اختبارات القدرات للكليات المعنية:</span>
                </h3>
                <p className="text-[12px] text-slate-700 leading-relaxed">
                  {faculty.aptitude_test
                    ? "الكلية تتطلب أداء اختبار القدرات والنجاح فيه خلال فترة التنسيق المقررة من المجلس الأعلى للجامعات قبل إعلان الترشيح."
                    : "الكلية لا تتطلب أي اختبارات قدرات مسبقة؛ الترشيح يعتمد بالكامل على المجموع والتوزيع الجغرافي."}
                </p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-2">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-blue-600 stroke-[1.5]" />
                  <span>قواعد المنح والتفوق الأكاديمي:</span>
                </h3>
                <p className="text-[12px] text-slate-700 leading-relaxed">
                  {faculty.scholarship_rule}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-white sticky bottom-0 z-10 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggleCompare(faculty.id)}
            className={`flex-1 py-2.5 px-4 rounded-xl text-[12px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-2 ${
              isCompared
                ? "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            <Scale className="w-4 h-4 stroke-[1.5]" />
            <span>{isCompared ? "إزالة من المقارنة (VS)" : "إضافة إلى منصة المقارنة (VS)"}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[12px] font-bold transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
