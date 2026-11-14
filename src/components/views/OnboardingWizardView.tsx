"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  ArrowLeft,
  Award,
  Home,
  Building2,
} from "lucide-react";
import { StreamType } from "@/types/chooseu";
import { EGYPT_GOVERNORATES } from "@/data/faculties-db";

interface OnboardingWizardViewProps {
  initialStream: StreamType;
  initialScore: number;
  initialGov: string;
  initialBudget: number;
  onComplete: (data: {
    stream: StreamType;
    score: number;
    gov: string;
    budget: number;
    dormPreference: "commute" | "dorm";
  }) => void;
}

export function OnboardingWizardView({
  initialStream,
  initialScore,
  initialGov,
  initialBudget,
  onComplete,
}: OnboardingWizardViewProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [stream, setStream] = useState<StreamType>(initialStream);
  const [score, setScore] = useState<number>(initialScore);
  const [gov, setGov] = useState<string>(initialGov);
  const [dormPreference, setDormPreference] = useState<"commute" | "dorm">("commute");
  const [budget, setBudget] = useState<number>(initialBudget);
  const [hasScholarshipTarget, setHasScholarshipTarget] = useState<boolean>(true);

  const handleFinish = () => {
    onComplete({
      stream,
      score,
      gov,
      budget,
      dormPreference,
    });
  };

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        {/* Step Indicator */}
        <div className="space-y-3 border-b border-slate-100 pb-5">
          <div className="flex items-center justify-between text-[11px] font-bold">
            <span className="text-slate-900">
              معالج التهيئة الأكاديمية الذكي • الخطوة {step} من 3
            </span>
            <span className="text-slate-500 tabular-nums">
              {step === 1 ? "33%" : step === 2 ? "66%" : "100%"}
            </span>
          </div>

          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#0F172A] h-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>

          <div className="grid grid-cols-3 text-center text-[11px] text-slate-500 pt-1">
            <span className={step >= 1 ? "font-bold text-slate-900" : ""}>
              1. الشعبة والمجموع
            </span>
            <span className={step >= 2 ? "font-bold text-slate-900" : ""}>
              2. النطاق الجغرافي
            </span>
            <span className={step >= 3 ? "font-bold text-slate-900" : ""}>
              3. الميزانية والمنح
            </span>
          </div>
        </div>

        {/* STEP 1: STREAM & SCORE */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-[17px] font-bold text-slate-900">
                حدد شعبتك الدراسية والمجموع المئوي
              </h3>
              <p className="text-[12px] text-slate-500 mt-0.5">
                تساعدنا هذه البيانات في فرز الكليات المتاحة لك حكومياً وأهلياً وخاصاً
              </p>
            </div>

            {/* Stream Buttons */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-2">
                الشعبة بالثانوية
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "Science" as const, title: "علمي علوم", desc: "الطب والعلوم الحيوية" },
                  { id: "Math" as const, title: "علمي رياضة", desc: "الهندسة والحاسبات والذكاء" },
                  { id: "Arts" as const, title: "أدبي", desc: "الألسن، الإعلام، والبيزنس" },
                ].map((st) => (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => setStream(st.id)}
                    className={`p-3 rounded-lg border text-right transition-colors cursor-pointer space-y-1 ${
                      stream === st.id
                        ? "bg-[#0F172A] text-white border-[#0F172A]"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span className="font-bold text-[13px] block">{st.title}</span>
                    <span className="text-[10px] text-slate-400 block">{st.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Score Slider & Input */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-slate-800">
                  النسبة المئوية المقدرة (%)
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="50"
                    max="100"
                    step="0.1"
                    value={score}
                    onChange={(e) => setScore(parseFloat(e.target.value) || 50)}
                    className="w-20 border border-slate-200 bg-white rounded-md px-2 py-1 text-[13px] font-bold text-center tabular-nums focus:outline-none"
                  />
                  <span className="font-bold text-slate-600">%</span>
                </div>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="0.5"
                value={score}
                onChange={(e) => setScore(parseFloat(e.target.value))}
                className="enterprise-slider"
              />
              <div className="flex justify-between text-[10px] text-slate-500 tabular-nums">
                <span>حد أدنى 50%</span>
                <span>تنسيق متوسط 75%</span>
                <span>قمة التنسيق 100%</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: GEOGRAPHY & HOUSING PREFERENCE */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-[17px] font-bold text-slate-900">
                النطاق الجغرافي وتفضيل السكن الطلابي
              </h3>
              <p className="text-[12px] text-slate-500 mt-0.5">
                توفير نفقات الاغتراب يشكل فارقاً قد يصل إلى 96,000 ج.م على مدار 4 سنوات
              </p>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                محافظة الإقامة الحالية
              </label>
              <select
                value={gov}
                onChange={(e) => setGov(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[12px] bg-slate-50 focus:outline-none focus:border-slate-800"
              >
                {EGYPT_GOVERNORATES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-2">
                تفضيل الإقامة والسفر
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDormPreference("commute")}
                  className={`p-3.5 rounded-lg border text-right transition-colors cursor-pointer space-y-1.5 ${
                    dormPreference === "commute"
                      ? "bg-slate-50 border-slate-900 shadow-2xs"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-emerald-600 stroke-[1.5]" />
                    <span className="font-bold text-[13px] text-slate-900">
                      أفضل الكليات القريبة (انتقال يومي)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    الأولوية للكليات داخل محافظتك لتوفير نفقات السكن والاستقرار الأسري.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setDormPreference("dorm")}
                  className={`p-3.5 rounded-lg border text-right transition-colors cursor-pointer space-y-1.5 ${
                    dormPreference === "dorm"
                      ? "bg-slate-50 border-slate-900 shadow-2xs"
                      : "bg-white border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600 stroke-[1.5]" />
                    <span className="font-bold text-[13px] text-slate-900">
                      مستعد للاغتراب الجامعي الكامل
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    إدراج كافة الجامعات الإقليمية والأهلية مع احتساب تكلفة السكن الجامعي.
                  </p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: BUDGET & SCHOLARSHIP CEILING */}
        {step === 3 && (
          <div className="space-y-5">
            <div>
              <h3 className="text-[17px] font-bold text-slate-900">
                القدرة المالية السنوية وتخفيض المنح
              </h3>
              <p className="text-[12px] text-slate-500 mt-0.5">
                تحديد السقف المالي يضمن ترشيح برامج وجامعات لا تثقل كاهل الأسرة
              </p>
            </div>

            {/* Budget Slider */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between text-[12px]">
                <span className="font-semibold text-slate-800">
                  الحد الأقصى للمصروفات السنوية (ج.م)
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="5000"
                    max="250000"
                    step="5000"
                    value={budget}
                    onChange={(e) => setBudget(parseInt(e.target.value, 10) || 5000)}
                    className="w-28 border border-slate-200 bg-white rounded-md px-2 py-1 text-[13px] font-bold text-center tabular-nums focus:outline-none"
                  />
                  <span className="font-bold text-slate-600">ج.م</span>
                </div>
              </div>
              <input
                type="range"
                min="5000"
                max="250000"
                step="5000"
                value={budget}
                onChange={(e) => setBudget(parseInt(e.target.value, 10))}
                className="enterprise-slider"
              />
              <div className="flex justify-between text-[10px] text-slate-500 tabular-nums">
                <span>حكومي انتظام (5,000 ج.م)</span>
                <span>أهلي وخاص (65,000 ج.م)</span>
                <span>سقف مفتوح (250,000 ج.م)</span>
              </div>
            </div>

            {/* Scholarship Target Toggle */}
            <div className="p-3.5 bg-blue-50/50 border border-blue-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-blue-600 stroke-[1.5]" />
                <div>
                  <span className="font-bold text-[12px] text-blue-950 block">
                    تفعيل فحص منح التفوق الأكاديمي
                  </span>
                  <span className="text-[10px] text-blue-700">
                    خصم يصل إلى 50% في الجامعات الأهلية للطلاب الحاصلين على مجموع متفوق.
                  </span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={hasScholarshipTarget}
                onChange={(e) => setHasScholarshipTarget(e.target.checked)}
                className="w-4 h-4 accent-[#0F172A] cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Buttons Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as 1 | 2)}
              className="px-4 py-2 border border-slate-200 rounded-lg text-[12px] font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              السابق
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s + 1) as 2 | 3)}
              className="px-5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg text-[12px] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>التالي</span>
              <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-[12px] font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[1.5]" />
              <span>إتمام التهيئة وحفظ الملف الأكاديمي</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
