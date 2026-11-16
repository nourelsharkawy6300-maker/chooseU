"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useStudent } from "@/context/StudentContext";
import { StreamType } from "@/types/chooseu";
import { EGYPT_GOVERNORATES } from "@/data/faculties-db";
import {
  Compass,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Building2,
  Check,
} from "lucide-react";

interface OnboardingGateProps {
  children: React.ReactNode;
}

const STREAM_OPTIONS: { id: StreamType; label: string; desc: string }[] = [
  { id: "Science", label: "علمي علوم", desc: "الطب، الصيدلة، العلوم الحيوية" },
  { id: "Math", label: "علمي رياضة", desc: "الهندسة، الحاسبات، الذكاء الاصطناعي" },
  { id: "Arts", label: "أدبي", desc: "الإعلام، الألسن، إدارة الأعمال، الفنون" },
  { id: "stem", label: "STEM متفوقين", desc: "النسبة المرنة لكليات العلوم والهندسة" },
];

const BUDGET_PRESETS = [
  { label: "حكومي مجاني", amount: 0 },
  { label: "أهلي (~40 ألف)", amount: 40000 },
  { label: "ساعات معتمدة (~80 ألف)", amount: 80000 },
  { label: "خاص (~120 ألف)", amount: 120000 },
];

export function OnboardingGate({ children }: OnboardingGateProps) {
  const {
    hydrated,
    hasCompletedOnboarding,
    studentName: initialName,
    stream: initialStream,
    scorePercentage: initialScore,
    annualBudgetEgp: initialBudget,
    governorate: initialGov,
    updateStudent,
  } = useStudent();

  const [name, setName] = useState(initialName || "");
  const [stream, setStream] = useState<StreamType>(initialStream || "Science");
  const [score, setScore] = useState<number>(initialScore > 0 ? initialScore : 85.0);
  const [budget, setBudget] = useState<number>(initialBudget >= 0 ? initialBudget : 0);
  const [gov, setGov] = useState(initialGov || "القاهرة");
  const [errorMsg, setErrorMsg] = useState("");

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-[#fbfaf6] flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-3 border-[#377ef0] border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-slate-500">INITIALIZING CHOOSEU ENGINE...</span>
        </div>
      </div>
    );
  }

  if (hasCompletedOnboarding) {
    return <>{children}</>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName || cleanName.length < 3) {
      setErrorMsg("يرجى إدخال اسمك الكريم (3 أحرف على الأقل).");
      return;
    }
    if (isNaN(score) || score < 50 || score > 100) {
      setErrorMsg("يرجى إدخال مجموع مئوي صالح بين 50% و 100%.");
      return;
    }
    if (isNaN(budget) || budget < 0) {
      setErrorMsg("يرجى تحديد ميزانية سنوية صالحة (0 فأكثر).");
      return;
    }

    setErrorMsg("");
    updateStudent({
      studentName: cleanName,
      stream,
      scorePercentage: score,
      annualBudgetEgp: budget,
      governorate: gov,
      hasCompletedOnboarding: true,
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#fbfaf6] text-slate-900" dir="rtl">
      {/* ================================================================== */}
      {/* 1. LEFT BRANDING STAGE (Desktop Only - 50% width, #0F172A Dark)    */}
      {/* ================================================================== */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
        {/* Subtle radial blueprint glow */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(#377ef0 1px, transparent 1px), radial-gradient(#377ef0 1px, #0F172A 1px)",
            backgroundSize: "40px 40px",
            backgroundPosition: "0 0, 20px 20px",
          }}
        />
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#377ef0]/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono tracking-wider text-blue-400">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span>ARCHITECTURAL ONBOARDING GATE // 2026</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight font-mono text-white">
              CHOOSE<span className="text-[#377ef0]">U</span>
            </h1>
            <p className="text-sm font-medium text-slate-400 max-w-md leading-relaxed">
              المنظومة المعمارية لقرارات التنسيق المصري، حساب التكلفة الشاملة (TCO)، واختبار الميول التخصصية.
            </p>
          </div>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 space-y-5 my-8 max-w-md">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[#377ef0] flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">مطابقة دقيقة حسب شعبتك ومجموعك</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                اختبار ميول مصمم خصيصاً لكل شعبة (علوم، رياضة، أدبي، STEM) لمنع أي تشويش في الرغبات.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">حساب التكلفة الفعلية الشاملة (TCO)</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                كشف الرسوم السنوية، نفقات السكن الطلابي، التوزيع الجغرافي (أ، ب، ج)، وتضخم السنوات بالكامل.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">دليل استرشادي لتوزيع الـ 75 رغبة</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                تقسيم استراتيجي بين الرغبات الطموحة والواقعية والمضمونة لحمايتك من استنفاد الرغبات.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
          <span>DATA LAYER: VERIFIED 2026 BYLAWS</span>
          <span>100% PRIVATE & CLIENT-FIRST</span>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 2. RIGHT FORM STAGE (Mobile & Desktop - Centered, max-w-md)         */}
      {/* ================================================================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md space-y-6"
        >
          {/* Mobile Header Branding */}
          <div className="space-y-2 lg:pt-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-[#377ef0]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>خطوتك الأولى لتنسيق 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
              أهلاً بك في Choose<span className="text-[#377ef0]">U</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              بوابتك الهندسية لاختيار مستقبلك الجامعي. لنبدأ بإدخال معاييرك الحقيقية لضبط التوصيات وحسابات التكلفة بدقة.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* 1. Student Name */}
            <div className="space-y-1.5">
              <label htmlFor="student-name-input" className="font-semibold text-slate-800 block">
                اسم الطالب / الطالبة:
              </label>
              <input
                id="student-name-input"
                type="text"
                required
                placeholder="مثال: يوسف أحمد محمود"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#377ef0] bg-white text-slate-900 font-medium placeholder:text-slate-400 focus:outline-none shadow-2xs text-[13px] min-h-[44px]"
              />
            </div>

            {/* 2. Academic Stream */}
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-800 block">
                الشعبة الأكاديمية بالثانوية:
              </label>
              <div className="grid grid-cols-2 gap-2">
                {STREAM_OPTIONS.map((opt) => {
                  const isSelected = stream === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setStream(opt.id)}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between min-h-[60px] ${
                        isSelected
                          ? "bg-blue-50/80 border-[#377ef0] text-[#1c1736] shadow-2xs ring-1 ring-[#377ef0]"
                          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-[12px]">{opt.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#377ef0]" />}
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 line-clamp-1">{opt.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. High School Score */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="score-number-input" className="font-semibold text-slate-800">
                  المجموع بالنسبة المئوية:
                </label>
                <div className="flex items-center gap-1">
                  <input
                    id="score-number-input"
                    type="number"
                    min={50}
                    max={100}
                    step={0.1}
                    value={score}
                    onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
                    className="w-20 px-2 py-1 text-center font-mono font-bold text-[#377ef0] bg-white border border-slate-200 rounded-lg text-sm tabular-nums focus:outline-none focus:border-[#377ef0]"
                  />
                  <span className="text-xs font-bold text-slate-500">%</span>
                </div>
              </div>
              <input
                type="range"
                min={50}
                max={100}
                step={0.5}
                value={score}
                onChange={(e) => setScore(parseFloat(e.target.value))}
                className="w-full accent-[#377ef0] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500 tabular-nums">
                <span>50.0%</span>
                <span>75.0%</span>
                <span>100.0%</span>
              </div>
            </div>

            {/* 4. Annual Budget & Presets */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="budget-number-input" className="font-semibold text-slate-800">
                  الميزانية السنوية المستهدفة (ج.م):
                </label>
                <div className="flex items-center gap-1">
                  <input
                    id="budget-number-input"
                    type="number"
                    min={0}
                    step={5000}
                    value={budget}
                    onChange={(e) => setBudget(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-28 px-2 py-1 text-center font-mono font-bold text-emerald-700 bg-white border border-slate-200 rounded-lg text-sm tabular-nums focus:outline-none focus:border-[#377ef0]"
                  />
                  <span className="text-xs font-bold text-slate-500">ج.م</span>
                </div>
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {BUDGET_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setBudget(p.amount)}
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                      budget === p.amount
                        ? "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold"
                        : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Home Governorate */}
            <div className="space-y-1.5">
              <label htmlFor="gov-select-input" className="font-semibold text-slate-800 block">
                محافظة السكن (لحساب النطاق الجغرافي أ، ب، ج):
              </label>
              <select
                id="gov-select-input"
                value={gov}
                onChange={(e) => setGov(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#377ef0] bg-white text-slate-900 font-medium focus:outline-none shadow-2xs text-[13px] min-h-[44px] cursor-pointer"
              >
                {EGYPT_GOVERNORATES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl bg-[#377ef0] hover:bg-[#2962be] text-white font-bold text-sm shadow-md transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 min-h-[48px]"
            >
              <span>دخول مساحة العمل وبدء التنسيق</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-slate-500 leading-relaxed">
              يمكنك تعديل أي من هذه المعايير لاحقاً من شريط التحكم العلوي في أي وقت.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
