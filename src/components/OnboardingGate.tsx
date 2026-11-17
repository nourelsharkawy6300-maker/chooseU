"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { useStudent } from "@/context/StudentContext";
import { StreamType } from "@/types/chooseu";
import { EGYPT_GOVERNORATES } from "@/data/faculties-db";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  Building2,
  Check,
} from "lucide-react";

interface OnboardingGateProps {
  children: React.ReactNode;
}

const STREAM_OPTIONS: { id: StreamType; label: string; desc: string; enTag: string }[] = [
  {
    id: "Science",
    label: "علمي علوم",
    desc: "الطب البشري، طب الأسنان، الصيدلة، العلوم والتمريض",
    enTag: "NATURAL SCIENCES",
  },
  {
    id: "Math",
    label: "علمي رياضة",
    desc: "الهندسة، الحاسبات، الذكاء الاصطناعي، التكنولوجيا والتصميم",
    enTag: "MATHEMATICS & TECH",
  },
  {
    id: "Arts",
    label: "أدبي",
    desc: "الإعلام، الألسن، السياسة والاقتصاد، إدارة الأعمال والفنون",
    enTag: "HUMANITIES & SOCIAL",
  },
  {
    id: "stem",
    label: "STEM متفوقين",
    desc: "مدارس المتفوقين في العلوم والتكنولوجيا (حساب النسبة المرنة)",
    enTag: "STEM ELITE NETWORK",
  },
];

const BUDGET_PRESETS = [
  { label: "حكومي مجاني", amount: 0 },
  { label: "أهلي (~40 ألف)", amount: 40000 },
  { label: "ساعات معتمدة (~80 ألف)", amount: 80000 },
  { label: "خاص (~120 ألف)", amount: 120000 },
];

const slideVariants: Variants = {
  enter: { x: 50, opacity: 0, filter: "blur(4px)" },
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: { type: "spring" as const, bounce: 0.2, duration: 0.6 },
  },
  exit: {
    x: -50,
    opacity: 0,
    filter: "blur(4px)",
    transition: { duration: 0.3 },
  },
};

export function OnboardingGate({ children }: OnboardingGateProps) {
  const { hydrated, hasCompletedOnboarding, updateStudent } = useStudent();

  // Strict Blank-Slate Local State (ZERO pre-filled dummy data)
  const [step, setStep] = useState<number>(1);
  const [name, setName] = useState<string>("");
  const [stream, setStream] = useState<StreamType | null>(null);
  const [score, setScore] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [gov, setGov] = useState<string>("القاهرة");
  const [consentAgreed, setConsentAgreed] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>("");

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

  const handleStep1Submit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setErrorMsg("يرجى إدخال اسمك الكريم (حرفين على الأقل).");
      return;
    }
    setErrorMsg("");
    setStep(2);
  };

  const handleStep2Select = (chosenStream: StreamType) => {
    setStream(chosenStream);
    setErrorMsg("");
    // Tactile kinetic auto-advance to step 3
    setTimeout(() => {
      setStep(3);
    }, 180);
  };

  const handleStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (cleanName.length < 2) {
      setErrorMsg("يرجى إدخال الاسم بشكل صحيح.");
      setStep(1);
      return;
    }
    if (!stream) {
      setErrorMsg("يرجى تحديد شعبتك الأكاديمية.");
      setStep(2);
      return;
    }

    const parsedScore = parseFloat(score);
    if (!score || isNaN(parsedScore) || parsedScore < 50 || parsedScore > 100) {
      setErrorMsg("يرجى إدخال مجموع مئوي بين 50% و 100%");
      return;
    }

    const parsedBudget = budget.trim() === "" ? 0 : parseInt(budget, 10);
    if (isNaN(parsedBudget) || parsedBudget < 0) {
      setErrorMsg("يرجى إدخال ميزانية سنوية صالحة (0 فأكثر للكليات الحكومية).");
      return;
    }

    if (!consentAgreed) {
      setErrorMsg("يجب الموافقة على سياسة الخصوصية والشروط للمتابعة.");
      return;
    }

    setErrorMsg("");
    updateStudent({
      studentName: cleanName,
      stream,
      scorePercentage: parsedScore,
      annualBudgetEgp: parsedBudget,
      governorate: gov || "القاهرة",
      hasCompletedOnboarding: true,
      privacyConsent: true,
      privacyConsentTimestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#fbfaf6] text-slate-900" dir="rtl">
      {/* ================================================================== */}
      {/* 1. LEFT BRANDING STAGE (Desktop Only - 50% width, #0F172A Dark)    */}
      {/* ================================================================== */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F172A] text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden select-none">
        {/* Subtle radial blueprint background */}
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
            <span>PROGRESSIVE ONBOARDING WIZARD // 2026</span>
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

        {/* Dynamic Telemetry Console Preview */}
        <div className="relative z-10 my-6 max-w-md p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 backdrop-blur-sm space-y-2.5 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-2 text-[11px] text-slate-400">
            <span>LIVE SESSION TELEMETRY</span>
            <span className="text-emerald-400 font-bold">READY</span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">01 // STUDENT:</span>
            <span className="font-bold text-white">
              {name.trim() ? name.trim() : "AWAITING_INPUT..."}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">02 // STREAM:</span>
            <span className="font-bold text-[#377ef0]">
              {stream
                ? STREAM_OPTIONS.find((s) => s.id === stream)?.label
                : "PENDING_SELECTION..."}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-300">
            <span className="text-slate-400">03 // GATE_STAGE:</span>
            <span className="font-bold text-amber-400">STEP 0{step} OF 03</span>
          </div>
        </div>

        {/* Middle Feature Highlights */}
        <div className="relative z-10 space-y-4 max-w-md">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-[#377ef0] flex items-center justify-center shrink-0 mt-0.5">
              <Compass className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">مطابقة دقيقة حسب شعبتك ومجموعك</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                اختبار ميول مصمم خصيصاً لشعبتك لمنع أي تشويش أو توجيه لكليات غير متوافقة.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">حساب التكلفة التقديرية الشاملة (TCO)</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                كشف الرسوم السنوية، نفقات السكن، النطاق الجغرافي (أ، ب، ج)، وتضخم السنوات بالكامل.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-xs">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Building2 className="w-4 h-4" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-white">دليل استرشادي لتوزيع الـ 75 رغبة</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                تقسيم استراتيجي بين الرغبات الطموحة والواقعية والآمنة لحمايتك من استنفاد الرغبات.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="relative z-10 pt-4 border-t border-slate-800 text-[11px] font-mono text-slate-500 flex items-center justify-between">
          <span>DATA LAYER: INDICATIVE BYLAWS</span>
          <span>100% PRIVATE & CLIENT-FIRST</span>
        </div>
      </div>

      {/* ================================================================== */}
      {/* 2. RIGHT WIZARD STAGE (Mobile & Desktop - Progressive 3-Step)      */}
      {/* ================================================================== */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 min-h-screen">
        {/* Top Header Rail: Stepper Breadcrumbs & Progress Hairline */}
        <div className="w-full max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#377ef0]" />
              <span className="text-slate-500 font-bold">
                {step === 1 && "STEP 01 // THE IDENTITY"}
                {step === 2 && "STEP 02 // ACADEMIC FORK"}
                {step === 3 && "STEP 03 // METRICS & LOCATION"}
              </span>
            </div>
            <span className="font-bold text-slate-900 tabular-nums">0{step} / 03</span>
          </div>

          {/* Progress Hairline */}
          <div className="w-full h-1 bg-slate-200/80 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#377ef0]"
              initial={false}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            />
          </div>
        </div>

        {/* Center Dynamic Stage: Animated Wizard Steps */}
        <div className="w-full max-w-xl mx-auto my-auto py-8">
          {errorMsg && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium"
            >
              {errorMsg}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {/* ------------------------------------------------------------ */}
            {/* ► STEP 1: THE IDENTITY (Name)                                */}
            {/* ------------------------------------------------------------ */}
            {step === 1 && (
              <motion.div
                key="step-1-identity"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-8"
              >
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-[#377ef0]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>الخطوة الأولى // هويتك</span>
                  </div>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 leading-tight">
                    أهلاً بك.. نتعرف بيك الأول؟
                  </h2>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-md">
                    اكتب اسمك للبدء في تشخيص ميولك وبناء استراتيجية التنسيق المخصصة لك.
                  </p>
                </div>

                <form onSubmit={handleStep1Submit} className="space-y-8 pt-4">
                  <div className="relative">
                    <input
                      autoFocus
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errorMsg) setErrorMsg("");
                      }}
                      placeholder="اكتب اسمك الثلاثي..."
                      className="w-full text-2xl sm:text-4xl font-extrabold text-slate-900 placeholder:text-slate-300 bg-transparent border-b-2 border-slate-300 focus:border-[#377ef0] pb-3 focus:outline-none transition-colors"
                      dir="rtl"
                    />
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span>اضغط Enter أو زر التالي للمتابعة</span>
                      <span className="font-mono tabular-nums">{name.trim().length} أحرف</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <Link
                      href="/login"
                      className="text-xs text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1 font-medium"
                    >
                      <span>لديك طلب سابق أو حساب مسجل؟</span>
                      <span className="font-bold underline underline-offset-2">تسجيل الدخول</span>
                    </Link>

                    <button
                      type="submit"
                      disabled={name.trim().length < 2}
                      className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-[#377ef0] hover:bg-[#2563eb] disabled:bg-slate-200 text-white disabled:text-slate-400 font-bold text-base shadow-lg shadow-blue-500/20 disabled:shadow-none disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] cursor-pointer overflow-hidden min-h-[48px]"
                    >
                      <span>التالي</span>
                      <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* ► STEP 2: THE ACADEMIC FORK (Stream)                         */}
            {/* ------------------------------------------------------------ */}
            {step === 2 && (
              <motion.div
                key="step-2-stream"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-[#377ef0]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>الخطوة الثانية // مسارك</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg("");
                      setStep(1);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>تعديل الاسم</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
                    أهلاً يا {name.trim()}، أنت في أي شعبة؟
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    اضغط على شعبتك لتفعيل بنك أسئلة الميول المخصص وقواعد التنسيق الاسترشادية فوراً:
                  </p>
                </div>

                {/* 4 Massive Tactile Cards (Anima style hover & kinetic glow) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                  {STREAM_OPTIONS.map((opt) => {
                    const isSelected = stream === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleStep2Select(opt.id)}
                        className={`p-5 rounded-2xl border text-right transition-all duration-300 cursor-pointer flex flex-col justify-between min-h-[130px] hover:scale-105 active:scale-95 group relative overflow-hidden ${
                          isSelected
                            ? "bg-white border-[#377ef0] shadow-md ring-2 ring-[#377ef0]/30"
                            : "bg-white border-slate-200 hover:border-[#377ef0]/50 hover:shadow-xl hover:shadow-blue-500/5"
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-extrabold text-base sm:text-lg text-slate-900 group-hover:text-[#377ef0] transition-colors">
                            {opt.label}
                          </span>
                          <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80">
                            {opt.enTag}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                          {opt.desc}
                        </p>
                        {isSelected && (
                          <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-[#377ef0]">
                            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>تم الاختيار.. جاري الانتقال</span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ------------------------------------------------------------ */}
            {/* ► STEP 3: THE METRICS (Score & Budget & Location)            */}
            {/* ------------------------------------------------------------ */}
            {step === 3 && (
              <motion.div
                key="step-3-metrics"
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs font-semibold text-[#377ef0]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>الخطوة الأخيرة // المعايير</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMsg("");
                      setStep(2);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>تعديل الشعبة</span>
                  </button>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 leading-tight">
                    آخر خطوة لنبدأ التخطيط
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    أدخل درجاتك التقديرية وميزانيتك السنوية ومحافظتك لضبط حسابات التكلفة وقواعد التوزيع الجغرافي.
                  </p>
                </div>

                <form onSubmit={handleStep3Submit} className="space-y-6 pt-2">
                  {/* Metric 1: High School Score (%) */}
                  <div className="space-y-2">
                    <label
                      htmlFor="step3-score-input"
                      className="block text-xs font-bold text-slate-700"
                    >
                      المجموع بالنسبة المئوية (%):
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id="step3-score-input"
                        type="number"
                        min={50}
                        max={100}
                        step={0.1}
                        value={score}
                        onChange={(e) => {
                          setScore(e.target.value);
                          if (errorMsg) setErrorMsg("");
                        }}
                        placeholder="مثال: 88.5"
                        className="w-full text-2xl sm:text-3xl font-mono font-extrabold text-slate-900 placeholder:text-slate-300 bg-transparent border-b-2 border-slate-300 focus:border-[#377ef0] pb-2 focus:outline-none transition-colors tabular-nums"
                        dir="ltr"
                      />
                      <span className="absolute left-0 text-lg font-mono font-bold text-[#377ef0]">
                        %
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block">
                      اكتب درجتك المتوقعة بالثانوية (بين 50.0% و 100.0%)
                    </span>
                  </div>

                  {/* Metric 2: Target Annual Budget (EGP) */}
                  <div className="space-y-2">
                    <label
                      htmlFor="step3-budget-input"
                      className="block text-xs font-bold text-slate-700"
                    >
                      الميزانية السنوية المستهدفة (ج.م / سنوياً):
                    </label>
                    <div className="relative flex items-center">
                      <input
                        id="step3-budget-input"
                        type="number"
                        min={0}
                        step={5000}
                        value={budget}
                        onChange={(e) => {
                          setBudget(e.target.value);
                          if (errorMsg) setErrorMsg("");
                        }}
                        placeholder="0 للكليات الحكومية، أو اكتب الميزانية..."
                        className="w-full text-2xl sm:text-3xl font-mono font-extrabold text-slate-900 placeholder:text-slate-300 bg-transparent border-b-2 border-slate-300 focus:border-[#377ef0] pb-2 focus:outline-none transition-colors tabular-nums"
                        dir="ltr"
                      />
                      <span className="absolute left-0 text-sm font-mono font-bold text-emerald-600">
                        ج.م
                      </span>
                    </div>

                    {/* Quick Budget Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {BUDGET_PRESETS.map((p) => {
                        const isMatch = budget === p.amount.toString();
                        return (
                          <button
                            key={p.label}
                            type="button"
                            onClick={() => {
                              setBudget(p.amount.toString());
                              if (errorMsg) setErrorMsg("");
                            }}
                            className={`px-3 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                              isMatch
                                ? "bg-emerald-50 border-emerald-400 text-emerald-800 font-bold shadow-2xs"
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Metric 3: Home Governorate */}
                  <div className="space-y-2">
                    <label
                      htmlFor="step3-gov-input"
                      className="block text-xs font-bold text-slate-700"
                    >
                      محافظة السكن (لحساب النطاق الجغرافي أ، ب، ج):
                    </label>
                    <select
                      id="step3-gov-input"
                      value={gov}
                      onChange={(e) => setGov(e.target.value)}
                      className="w-full text-sm font-bold text-slate-800 bg-white border border-slate-300 focus:border-[#377ef0] rounded-xl px-4 py-3 focus:outline-none cursor-pointer transition-colors"
                    >
                      {EGYPT_GOVERNORATES.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Consent Checkbox */}
                  <div className="pt-2">
                    <label className="flex items-start gap-3 cursor-pointer group select-none">
                      <input
                        type="checkbox"
                        checked={consentAgreed}
                        onChange={(e) => {
                          setConsentAgreed(e.target.checked);
                          if (e.target.checked && errorMsg.includes("الخصوصية")) {
                            setErrorMsg("");
                          }
                        }}
                        className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#377ef0] focus:ring-[#377ef0] cursor-pointer shrink-0"
                      />
                      <span className="text-xs text-slate-600 leading-relaxed">
                        أوافق على{" "}
                        <Link
                          href="/privacy"
                          target="_blank"
                          className="text-[#377ef0] font-bold hover:underline"
                        >
                          سياسة الخصوصية
                        </Link>{" "}
                        و{" "}
                        <Link
                          href="/terms"
                          target="_blank"
                          className="text-[#377ef0] font-bold hover:underline"
                        >
                          الشروط
                        </Link>
                      </span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 space-y-3">
                    {errorMsg && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                        <span>⚠️</span>
                        <span>{errorMsg}</span>
                      </div>
                    )}
                    <button
                      type="submit"
                      className="group relative w-full py-4 px-8 rounded-xl bg-[#377ef0] hover:bg-[#2563eb] text-white font-extrabold text-base shadow-xl shadow-blue-500/20 transition-all duration-200 active:scale-[0.98] cursor-pointer flex items-center justify-center gap-3 overflow-hidden min-h-[52px]"
                    >
                      <span>ابدأ الآن واستكشف كلياتك</span>
                      <Sparkles className="w-5 h-5 text-amber-300 transition-transform group-hover:scale-110" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Security Guarantee */}
        <div className="w-full max-w-xl mx-auto pt-6 border-t border-slate-200/80 text-[11px] text-center text-slate-400">
          <span>تشفير محلي 100% • بياناتك محفوظة على جهازك فقط ولا تتم مشاركتها مع أي طرف ثالث.</span>
        </div>
      </div>
    </div>
  );
}
