"use client";

import React, { useState, useMemo } from "react";
import {
  Calculator,
  CheckCircle2,
} from "lucide-react";
import { Faculty, StreamType, LivingMode } from "@/types/chooseu";
import { FACULTIES_DATABASE, EGYPT_GOVERNORATES } from "@/data/faculties-db";
import { computeFacultyTcoMetrics } from "@/lib/engine";

interface TcoCalculatorViewProps {
  stream: StreamType;
  governorate: string;
  onUpdateGovernorate: (gov: string) => void;
  livingMode: LivingMode;
  onUpdateLivingMode: (mode: LivingMode) => void;
  onOpenFacultyDrawer: (faculty: Faculty) => void;
}

export function TcoCalculatorView({
  stream,
  governorate,
  onUpdateGovernorate,
  livingMode,
  onUpdateLivingMode,
  onOpenFacultyDrawer,
}: TcoCalculatorViewProps) {
  const eligibleFaculties = useMemo(() => {
    return FACULTIES_DATABASE.filter(
      (f) => f.stream === stream || f.stream === "Both"
    );
  }, [stream]);

  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(
    eligibleFaculties[0]?.id || "f_alex_cs"
  );
  const [inflationRate, setInflationRate] = useState<number>(10);
  const [scholarshipDiscountPct, setScholarshipDiscountPct] = useState<number>(0);

  const activeFaculty = useMemo(() => {
    return (
      eligibleFaculties.find((f) => f.id === selectedFacultyId) ||
      eligibleFaculties[0]
    );
  }, [eligibleFaculties, selectedFacultyId]);

  const rawMetrics = useMemo(() => {
    if (!activeFaculty) return null;
    return computeFacultyTcoMetrics(
      activeFaculty,
      governorate,
      livingMode,
      inflationRate
    );
  }, [activeFaculty, governorate, livingMode, inflationRate]);

  // Apply scholarship discount if any
  const discountedTuition4Yr = rawMetrics
    ? Math.round(rawMetrics.tuition4Yr * (1 - scholarshipDiscountPct / 100))
    : 0;

  const finalTotal4Yr = rawMetrics
    ? discountedTuition4Yr + rawMetrics.admin4Yr + rawMetrics.living4Yr
    : 0;

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold mb-1">
            <Calculator className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>حاسبة التكلفة الإجمالية للتعليم الجامعي (TCO)</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            المحاكاة المالية الشاملة لـ 4 سنوات دراسية
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            حساب تكاليف المصروفات الدراسية + السكن والانتقال + مصاريف المعامل + التضخم التراكمي
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px]">
          <span className="text-slate-500 font-medium">المحافظة الأم:</span>
          <select
            value={governorate}
            onChange={(e) => onUpdateGovernorate(e.target.value)}
            className="bg-white border border-slate-200 text-slate-900 rounded px-2 py-1 font-bold cursor-pointer"
          >
            {EGYPT_GOVERNORATES.map((gov) => (
              <option key={gov} value={gov}>
                {gov}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. Faculty Selector & Simulation Controls Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
            إعدادات المحاكاة المالية
          </h2>

          {/* Faculty Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700">
              اختر الكلية لحساب التكلفة:
            </label>
            <select
              value={selectedFacultyId}
              onChange={(e) => setSelectedFacultyId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg p-2.5 text-[12px] font-medium cursor-pointer"
            >
              {eligibleFaculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} — {f.university} ({f.type})
                </option>
              ))}
            </select>
          </div>

          {/* Living Mode Toggle */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700">
              نمط الإقامة والانتقال:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateLivingMode("commute")}
                className={`p-2.5 rounded-lg border text-right transition-colors cursor-pointer ${
                  livingMode === "commute"
                    ? "border-blue-600 bg-blue-50/50 text-blue-900"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="text-[11px] font-bold">سكن عائلي وانتقال يومي</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  انتقال محلي أو بين المحافظات
                </div>
              </button>

              <button
                type="button"
                onClick={() => onUpdateLivingMode("dorm")}
                className={`p-2.5 rounded-lg border text-right transition-colors cursor-pointer ${
                  livingMode === "dorm"
                    ? "border-blue-600 bg-blue-50/50 text-blue-900"
                    : "border-slate-200 hover:bg-slate-50 text-slate-700"
                }`}
              >
                <div className="text-[11px] font-bold">اغتراب (مدينة / سكن خارجي)</div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  إيجار شهري ومصاريف معيشة
                </div>
              </button>
            </div>
          </div>

          {/* Inflation Compound Scenario */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slate-700">
              معدل التضخم السنوي المتوقع:
            </label>
            <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
              {[0, 10, 15].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setInflationRate(rate)}
                  className={`py-2 rounded-lg border font-bold transition-colors cursor-pointer ${
                    inflationRate === rate
                      ? "bg-[#0F172A] text-white border-[#0F172A]"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {rate === 0 ? "بدون تضخم (0%)" : `+${rate}% سنوياً`}
                </button>
              ))}
            </div>
          </div>

          {/* Excellence Scholarship Discount */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px]">
              <label className="font-bold text-slate-700">
                خصم منحة التفوق الأكاديمي:
              </label>
              <span className="font-mono font-bold text-blue-600 tabular-nums">
                {scholarshipDiscountPct}% خصم
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 text-center text-[10px]">
              {[0, 15, 25, 50].map((disc) => (
                <button
                  key={disc}
                  type="button"
                  onClick={() => setScholarshipDiscountPct(disc)}
                  className={`py-1.5 rounded-md border font-bold transition-colors cursor-pointer ${
                    scholarshipDiscountPct === disc
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {disc === 0 ? "بدون منحة" : `${disc}%`}
                </button>
              ))}
            </div>
            {activeFaculty?.scholarship_rule && (
              <p className="text-[10px] text-slate-500 pt-1">
                شرط منحة الكلية: {activeFaculty.scholarship_rule}
              </p>
            )}
          </div>
        </div>

        {/* 3. Financial Breakdown Card Column */}
        {rawMetrics && activeFaculty && (
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between space-y-6">
            <div>
              {/* Top Summary Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeFaculty.name} — {activeFaculty.university}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {rawMetrics.geoTierLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenFacultyDrawer(activeFaculty)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                >
                  عرض اللائحة والمقررات
                </button>
              </div>

              {/* Big 4-Year Total */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-5 my-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-[11px] font-bold text-slate-500">
                    إجمالي الاستثمار التقديري لـ 4 سنوات كاملة (4-Year Total TCO):
                  </div>
                  <div className="text-3xl font-mono font-bold text-slate-900 tabular-nums">
                    {finalTotal4Yr.toLocaleString("en-US")}{" "}
                    <span className="text-base font-sans font-normal text-slate-600">
                      جنيه مصري
                    </span>
                  </div>
                  {scholarshipDiscountPct > 0 && (
                    <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-[1.5]" />
                      <span>
                        تم تطبيق خصم التفوق الأكاديمي بنسبة {scholarshipDiscountPct}% على المصروفات
                      </span>
                    </div>
                  )}
                </div>

                <div className="text-right sm:text-left text-[11px] text-slate-500 font-mono tabular-nums">
                  متوسط سنوي: ~{Math.round(finalTotal4Yr / 4).toLocaleString("en-US")} ج.م/سنة
                </div>
              </div>

              {/* 3 Categories Breakdown Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-right">
                {/* Tuition */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="text-[11px] text-slate-500 font-medium">المصروفات الدراسية (4 سنوات)</div>
                  <div className="text-lg font-mono font-bold text-slate-900 tabular-nums mt-0.5">
                    {discountedTuition4Yr.toLocaleString("en-US")} ج.م
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    السنة الأولى: {activeFaculty.y1_base_fee.toLocaleString("en-US")} ج.م
                  </div>
                </div>

                {/* Admin & Lab fees */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="text-[11px] text-slate-500 font-medium">معامل وخدمات تعليمية</div>
                  <div className="text-lg font-mono font-bold text-slate-900 tabular-nums mt-0.5">
                    {rawMetrics.admin4Yr.toLocaleString("en-US")} ج.م
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    سنوياً: ~{rawMetrics.adminFee.toLocaleString("en-US")} ج.م
                  </div>
                </div>

                {/* Living / Commute */}
                <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                  <div className="text-[11px] text-slate-500 font-medium">إقامة وانتقال ومصروف جيب</div>
                  <div className="text-lg font-mono font-bold text-slate-900 tabular-nums mt-0.5">
                    {rawMetrics.living4Yr.toLocaleString("en-US")} ج.م
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">
                    سنوياً: ~{rawMetrics.annualLiving.toLocaleString("en-US")} ج.م
                  </div>
                </div>
              </div>

              {/* Visual Proportion Bar */}
              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-600">
                  <span>توزيع الميزانية بالنسبة المئوية:</span>
                  <span className="font-mono text-slate-400">100%</span>
                </div>
                <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100">
                  <div
                    className="bg-blue-600 h-full"
                    style={{ width: `${rawMetrics.basePct}%` }}
                    title={`المصروفات: ${rawMetrics.basePct}%`}
                  />
                  <div
                    className="bg-emerald-600 h-full"
                    style={{ width: `${rawMetrics.adminPct}%` }}
                    title={`المعامل والخدمات: ${rawMetrics.adminPct}%`}
                  />
                  <div
                    className="bg-amber-500 h-full"
                    style={{ width: `${rawMetrics.livingPct}%` }}
                    title={`السكن والانتقال: ${rawMetrics.livingPct}%`}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    المصروفات ({rawMetrics.basePct}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-600" />
                    المعامل والرسوم ({rawMetrics.adminPct}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    الإقامة والانتقال ({rawMetrics.livingPct}%)
                  </span>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              <strong>ملاحظة استرشادية:</strong> الحسابات تشمل التضخم السنوي المركب بنسبة {inflationRate}% وتكاليف الساعات المعتمدة طبقاً للوائح 2025/2026.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
