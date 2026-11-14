"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  Plus,
  Minus,
} from "lucide-react";
import { StreamType, EnterpriseViewKey, InterestCluster } from "@/types/chooseu";
import { CLUSTERS } from "@/app/page";
import { FACULTIES_DATABASE } from "@/data/faculties-db";

interface EditorialLandingFlowProps {
  stream: StreamType;
  score: number;
  onUpdateScore: (score: number) => void;
  onUpdateStream: (stream: StreamType) => void;
  onNavigateView: (view: EnterpriseViewKey) => void;
  onEnterDemoMode: () => void;
}

export function EditorialLandingFlow({
  stream,
  score,
  onUpdateScore,
  onUpdateStream,
  onNavigateView,
  onEnterDemoMode,
}: EditorialLandingFlowProps) {
  // Active step in Chapter 03 Sticky Scrollytelling
  const [activeStep, setActiveStep] = useState<number>(1);

  // Scroll listener for sticky step counter in Chapter 03
  useEffect(() => {
    const handleScroll = () => {
      const step2 = document.getElementById("journey-step-2");
      const step3 = document.getElementById("journey-step-3");
      const step4 = document.getElementById("journey-step-4");

      const mid = window.innerHeight / 2;

      if (step4 && step4.getBoundingClientRect().top <= mid) {
        setActiveStep(4);
      } else if (step3 && step3.getBoundingClientRect().top <= mid) {
        setActiveStep(3);
      } else if (step2 && step2.getBoundingClientRect().top <= mid) {
        setActiveStep(2);
      } else {
        setActiveStep(1);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleTweakScore = (delta: number) => {
    const next = +(score + delta).toFixed(1);
    if (next >= 50 && next <= 100) {
      onUpdateScore(next);
    }
  };

  // Matched count based on score & stream
  const eligibleCount = FACULTIES_DATABASE.filter(
    (f) => (f.stream === stream || f.stream === "Both") && f.cutoff_2026 <= score + 0.8
  ).length;

  return (
    <div className="bg-[#FAF8F5] text-slate-900 overflow-hidden space-y-24 py-16">
      {/* ==================================================================== */}
      {/* CHAPTER 01: THE POSSIBILITY (الإمكانية)                              */}
      {/* ==================================================================== */}
      <section id="chapter-possibility" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-mono tracking-wider">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>CHAPTER 01 / الإمكانية — THE POSSIBILITY</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-3xl">
            منصة واحدة. كل طالب. كل مجموع. كل مستقبل.
          </h2>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
            وداعاً لعشوائية التنسيق والحيرة بين الكليات. خوارزمية ذكية تحلل درجاتك وميزانيتك وطموحك الأكاديمي لمطابقتها مع أكثر من 120 مساراً جامعياً معتمداً.
          </p>
        </div>

        {/* Live Counters Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="text-[11px] text-slate-500 font-medium font-mono">01 // DATA COVERAGE</div>
            <div className="text-3xl font-mono font-bold text-slate-900 tabular-nums mt-1">
              +120
            </div>
            <div className="text-[12px] text-slate-700 font-semibold mt-0.5">
              كلية وبرنامج تخصصي معتمد
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="text-[11px] text-slate-500 font-medium font-mono">02 // ALGORITHM ACCURACY</div>
            <div className="text-3xl font-mono font-bold text-blue-600 tabular-nums mt-1">
              99.2%
            </div>
            <div className="text-[12px] text-slate-700 font-semibold mt-0.5">
              دقة مطابقة التنسيق 2026
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="text-[11px] text-slate-500 font-medium font-mono">03 // SIMULATED PATHWAYS</div>
            <div className="text-3xl font-mono font-bold text-slate-900 tabular-nums mt-1">
              +45,000
            </div>
            <div className="text-[12px] text-slate-700 font-semibold mt-0.5">
              مسار تحليلي وخطة دراسية
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="text-[11px] text-slate-500 font-medium font-mono">04 // FREE ACCESS</div>
            <div className="text-3xl font-mono font-bold text-emerald-600 tabular-nums mt-1">
              0 ج.م
            </div>
            <div className="text-[12px] text-slate-700 font-semibold mt-0.5">
              تكلفة الاستكشاف لجميع الطلاب
            </div>
          </div>
        </div>

        {/* Interactive Quick-Match Simulator Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                محاكي المطابقة اللحظي التفاعلي (Live Quick Match)
              </h3>
              <p className="text-[12px] text-slate-500">
                غيّر الشعبة والنسبة المئوية وشاهد انتقال الكليات فورياً
              </p>
            </div>

            {/* Stream Selector */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px]">
              {(["Science", "Math", "Arts"] as StreamType[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => onUpdateStream(st)}
                  className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
                    stream === st
                      ? "bg-white text-slate-900 shadow-2xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {st === "Science" ? "علمي علوم" : st === "Math" ? "علمي رياضة" : "أدبي"}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Slider & Stepper */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">مجموع الثانوية العامة:</span>
                  <div className="text-3xl font-mono font-bold text-slate-900 tabular-nums mt-0.5">
                    {score.toFixed(1)}%
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleTweakScore(-0.5)}
                    className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 cursor-pointer shadow-2xs"
                    title="-0.5%"
                  >
                    <Minus className="w-4 h-4 stroke-[2]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTweakScore(0.5)}
                    className="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg text-slate-700 cursor-pointer shadow-2xs"
                    title="+0.5%"
                  >
                    <Plus className="w-4 h-4 stroke-[2]" />
                  </button>
                </div>
              </div>

              <input
                type="range"
                min="50"
                max="100"
                step="0.1"
                value={score}
                onChange={(e) => onUpdateScore(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>

            {/* Instant Output Feedback */}
            <div className="lg:col-span-5 bg-blue-50/50 border border-blue-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-900">النتيجة اللحظية لمجموعك:</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-600 text-white font-bold">
                  {eligibleCount} كلية متاحة
                </span>
              </div>

              <p className="text-[12px] text-blue-950 leading-relaxed font-medium">
                بمجموعك الحالي ({score}%) في شعبة {stream === "Science" ? "علمي علوم" : stream === "Math" ? "علمي رياضة" : "أدبي"}، يتيح لك النظام استكشاف {eligibleCount} كلية في النطاقين الآمن والمستهدف الحكومي والأهلي.
              </p>

              <button
                type="button"
                onClick={() => onNavigateView("dashboard")}
                className="w-full py-2.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg text-[12px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>دخول لوحة التحكم والتحليل الكامل ←</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* INFINITE KINETIC MARQUEE BANNER                                      */}
      {/* ==================================================================== */}
      <div className="w-full bg-[#0F172A] text-white py-4 overflow-hidden border-y border-slate-800 shadow-md select-none">
        <div className="animate-marquee items-center gap-8 text-[13px] font-mono tracking-wider uppercase font-semibold">
          <span className="text-blue-400">CHOOSEU®</span>
          <span>•</span>
          <span>اختار مستقبلك بدقة</span>
          <span>•</span>
          <span className="text-emerald-400">تحليل خوارزمي للتنسيق 2026</span>
          <span>•</span>
          <span>محاكي التكلفة الشاملة (4-YEAR TCO)</span>
          <span>•</span>
          <span className="text-amber-400">حلبة مقارنة الكليات وجهاً لوجه (VS ARENA)</span>
          <span>•</span>
          <span>مرصد الوظائف ومرتبات مصر والإقليم</span>
          <span>•</span>
          <span className="text-purple-400">بدائل الكليات الذكية</span>
          <span>•</span>
          <span>المجلس الأعلى للجامعات</span>
          <span>•</span>
          <span className="text-blue-400">CHOOSEU®</span>
          <span>•</span>
          <span>اختار مستقبلك بدقة</span>
          <span>•</span>
          <span className="text-emerald-400">تحليل خوارزمي للتنسيق 2026</span>
          <span>•</span>
          <span>محاكي التكلفة الشاملة (4-YEAR TCO)</span>
          <span>•</span>
          <span className="text-amber-400">حلبة مقارنة الكليات وجهاً لوجه (VS ARENA)</span>
          <span>•</span>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* CHAPTER 02: CHOOSE YOUR ROUTE (اختر مسارك — The 6 Sectors)           */}
      {/* ==================================================================== */}
      <section id="chapter-sectors" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-mono tracking-wider">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span>CHAPTER 02 / القطاعات — CHOOSE YOUR ROUTE</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-3xl">
            6 أبعاد أكاديمية تغطي كافة تخصصات الجامعات المصرية
          </h2>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
            استكشف القطاعات التخصصية وتعرف على مجالات الدراسة والحدود الدنيا ومسارات العمل المستقبلية لكل قطاع.
          </p>
        </div>

        {/* 6 Color-Coded Academic Cluster Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(Object.keys(CLUSTERS) as InterestCluster[]).map((key) => {
            const cluster = CLUSTERS[key];
            const IconComp = cluster.icon;

            return (
              <div
                key={key}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-colors flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center p-2"
                      style={{ backgroundColor: `${cluster.color}15`, color: cluster.color }}
                    >
                      <IconComp className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded border"
                      style={{
                        backgroundColor: `${cluster.color}10`,
                        color: cluster.color,
                        borderColor: `${cluster.color}30`,
                      }}
                    >
                      قطاع تخصصي
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {cluster.title}
                    </h3>
                    <p className="text-[12px] text-slate-500 mt-1 leading-relaxed">
                      {cluster.subtitle}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => onNavigateView("explore")}
                    className="text-[12px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                  >
                    <span>استكشف كليات القطاع</span>
                    <ArrowLeft className="w-3.5 h-3.5 stroke-[1.5]" />
                  </button>
                  <span className="text-[10px] font-mono text-slate-400">
                    2026 BENCHMARK
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* CHAPTER 03: STICKY SCROLL-SPY JOURNEY (رحلتك خطوة بخطوة 01 / 04)      */}
      {/* ==================================================================== */}
      <section id="chapter-methodology" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>CHAPTER 03 / المنهجية — YOUR 4-STEP JOURNEY</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight max-w-3xl">
            خارطة الطريق: كيف تصنع قرارك الجامعي بأعلى دقة رياضية
          </h2>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
            عملية علمية متكاملة من 4 خطوات تختصر عليك شهوراً من التخبط بين المجموع والميزانية وسوق العمل.
          </p>
        </div>

        {/* 2-Column Sticky Scrollytelling Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Sticky Side Tracker (Right in RTL) */}
          <div className="lg:col-span-4 sticky top-24 self-start bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 tracking-wider">
                STEP-BY-STEP PROGRESS
              </span>
              <div className="text-3xl font-mono font-bold text-slate-900 tabular-nums">
                0{activeStep} <span className="text-base font-normal text-slate-400">/ 04</span>
              </div>
            </div>

            {/* Vertical Step Indicators */}
            <div className="space-y-3 text-[12px]">
              {[
                { step: 1, title: "01 اكتشف ميولك وبصمتك (RIASEC DNA)", anchor: "journey-step-1" },
                { step: 2, title: "02 حاكي التنسيق والتكلفة (4-Yr TCO)", anchor: "journey-step-2" },
                { step: 3, title: "03 قارن الكليات واستكشف البدائل الذكية", anchor: "journey-step-3" },
                { step: 4, title: "04 احسم قرارك وتقرير ولي الأمر", anchor: "journey-step-4" },
              ].map((item) => {
                const isCurrent = activeStep === item.step;
                return (
                  <a
                    key={item.step}
                    href={`#${item.anchor}`}
                    className={`block p-2.5 rounded-lg border transition-all ${
                      isCurrent
                        ? "bg-[#0F172A] text-white border-[#0F172A] font-bold shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {item.title}
                  </a>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onNavigateView("dashboard")}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[12px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>فتح مساحة العمل الكاملة ←</span>
            </button>
          </div>

          {/* Scrolling Side: 4 Detailed Preview Cards */}
          <div className="lg:col-span-8 space-y-6">
            {/* Card 1 */}
            <div
              id="journey-step-1"
              className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-mono font-bold">
                STEP 01
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                مختبر التقييم السلوكي وبصمة الميول (RIASEC DNA)
              </h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                10 مواقف قياسية تحلل ميولك العملية والنظرية وتولد رادار سداسي الأبعاد يكشف الكليات المتوافقة معك نفسياً بنسبة تصل إلى 95%.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onNavigateView("assessment")}
                  className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg text-[12px] font-bold transition-colors cursor-pointer"
                >
                  بدء التقييم الأكاديمي ←
                </button>
              </div>
            </div>

            {/* Card 2 */}
            <div
              id="journey-step-2"
              className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[11px] font-mono font-bold">
                STEP 02
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                محاكاة درجات التنسيق وحاسبة الـ 4 سنوات (TCO)
              </h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                اختبر مجموعك مع توقعات التنسيق الرسمية (نطاق آمن، مستهدف، وتحدي) واحسب التكلفة الحقيقية للدراسة (مصروفات + ساعات + سكن واغتراب + تضخم).
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateView("tansik-simulator")}
                  className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg text-[12px] font-bold transition-colors cursor-pointer"
                >
                  محاكي التنسيق ←
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateView("calculator")}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[12px] font-bold transition-colors cursor-pointer"
                >
                  حاسبة الـ 4 سنوات (TCO)
                </button>
              </div>
            </div>

            {/* Card 3 */}
            <div
              id="journey-step-3"
              className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[11px] font-mono font-bold">
                STEP 03
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                مقارنة الكليات وجهاً لوجه ومحرك البدائل الذكية
              </h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                قارن بين الكليات جنباً إلى جنب في حلبة المقارنة المباشرة (VS Arena)، وإذا كان مجموعك أقل من الكلية الحلم، استكشف بدائلها التي تشترك في 90% من المنهج.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateView("compare")}
                  className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg text-[12px] font-bold transition-colors cursor-pointer"
                >
                  حلبة المقارنة (VS) ←
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateView("alternatives")}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[12px] font-bold transition-colors cursor-pointer"
                >
                  محرك البدائل الذكية
                </button>
              </div>
            </div>

            {/* Card 4 */}
            <div
              id="journey-step-4"
              className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-xs space-y-4"
            >
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-amber-50 text-amber-700 text-[11px] font-mono font-bold">
                STEP 04
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                التقرير التنفيذي لولي الأمر وملف التقديم الورقي
              </h3>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                استخرج تقريراً رسمياً مخصصاً للأسرة يوضح العائد على الاستثمار وخطة الأمان (أ، ب، ج)، وتأكد من اكتمال أوراق ملف التقديم عبر قائمة الفحص التفاعلية.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onNavigateView("profile")}
                  className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg text-[12px] font-bold transition-colors cursor-pointer"
                >
                  تقرير ولي الأمر الرسمي ←
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateView("timeline")}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[12px] font-bold transition-colors cursor-pointer"
                >
                  قائمة فحص المستندات
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* FINAL CALL TO ACTION (START THE PLATFORM)                            */}
      {/* ==================================================================== */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0F172A] text-white rounded-2xl p-8 sm:p-12 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/10 rounded-2xl blur-3xl pointer-events-none" />

          <div className="relative z-10 space-y-3 max-w-2xl mx-auto">
            <span className="text-[11px] font-mono text-blue-400 tracking-wider">
              LAUNCH YOUR FUTURE TODAY
            </span>
            <h2 className="text-2xl sm:text-4xl font-bold tracking-tight">
              جاهز لحسم قرارك الأكاديمي بأعلى دقة واطمئنان؟
            </h2>
            <p className="text-[13px] sm:text-[15px] text-slate-300">
              ادخل مباشرة إلى مساحة العمل المتكاملة أو جرب المنصة الفورية بحساب تجريبي كامل.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigateView("dashboard")}
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition-all duration-200 shadow-lg cursor-pointer"
            >
              فتح مساحة العمل الذكية ←
            </button>
            <button
              type="button"
              onClick={onEnterDemoMode}
              className="w-full sm:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 font-bold rounded-xl text-sm transition-all duration-200 cursor-pointer"
            >
              تجربة المنصة كزائر (Demo Mode)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
