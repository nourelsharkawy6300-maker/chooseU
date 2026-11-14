"use client";

import React, { useState, useMemo } from "react";
import {
  SlidersHorizontal,
  Plus,
  Minus,
  ShieldCheck,
  Target,
  AlertTriangle,
  Scale,
} from "lucide-react";
import { StreamType, Faculty } from "@/types/chooseu";
import { FACULTIES_DATABASE } from "@/data/faculties-db";

interface TansikSimulatorViewProps {
  stream: StreamType;
  score: number;
  onUpdateScore: (score: number) => void;
  tansikShift: number;
  onUpdateTansikShift: (shift: number) => void;
  onOpenFacultyDrawer: (faculty: Faculty) => void;
  onToggleCompare: (id: string) => void;
  comparedIds: string[];
}

export function TansikSimulatorView({
  stream,
  score,
  onUpdateScore,
  tansikShift,
  onUpdateTansikShift,
  onOpenFacultyDrawer,
  onToggleCompare,
  comparedIds,
}: TansikSimulatorViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("الكل");
  const [activeBucket, setActiveBucket] = useState<"all" | "safe" | "target" | "reach">("all");

  // Step adjustment helpers
  const handleTweak = (delta: number) => {
    const next = +(score + delta).toFixed(1);
    if (next >= 50 && next <= 100) {
      onUpdateScore(next);
    }
  };

  // Filter faculties by stream & category
  const filteredFaculties = useMemo(() => {
    return FACULTIES_DATABASE.filter((f) => {
      const matchStream = f.stream === stream || f.stream === "Both";
      const matchCategory =
        selectedCategory === "الكل" || f.type === selectedCategory;
      return matchStream && matchCategory;
    });
  }, [stream, selectedCategory]);

  // Group into the 3 colored buckets based on score and shifted cutoff
  const categorizedBuckets = useMemo(() => {
    const safe: { faculty: Faculty; margin: number; shiftedCutoff: number }[] = [];
    const target: { faculty: Faculty; margin: number; shiftedCutoff: number }[] = [];
    const reach: { faculty: Faculty; margin: number; shiftedCutoff: number }[] = [];

    filteredFaculties.forEach((f) => {
      const shiftedCutoff = +(f.cutoff_2026 + tansikShift).toFixed(1);
      const margin = +(score - shiftedCutoff).toFixed(1);

      if (margin >= 1.5) {
        safe.push({ faculty: f, margin, shiftedCutoff });
      } else if (margin >= -1.0) {
        target.push({ faculty: f, margin, shiftedCutoff });
      } else {
        reach.push({ faculty: f, margin, shiftedCutoff });
      }
    });

    return { safe, target, reach };
  }, [filteredFaculties, score, tansikShift]);

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Simulator Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold mb-1">
              <SlidersHorizontal className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>محاكي درجات التنسيق الديناميكي</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              محاكاة مؤشرات التنسيق الرسمية (2024 - 2026)
            </h1>
            <p className="text-[12px] text-slate-500 mt-0.5">
              حرك مؤشر النسبة المئوية ولاحظ انتقال الكليات فوراً بين نطاقات الأمان والمنافسة والتحدي
            </p>
          </div>

          {/* Tansik Shift Scenario Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 font-medium">سيناريو التنسيق:</span>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px]">
              <button
                type="button"
                onClick={() => onUpdateTansikShift(-1.0)}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                  tansikShift === -1.0
                    ? "bg-white text-emerald-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                انخفاض -1%
              </button>
              <button
                type="button"
                onClick={() => onUpdateTansikShift(0)}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                  tansikShift === 0
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                المتوقع (0%)
              </button>
              <button
                type="button"
                onClick={() => onUpdateTansikShift(1.0)}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                  tansikShift === 1.0
                    ? "bg-white text-rose-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ارتفاع +1%
              </button>
            </div>
          </div>
        </div>

        {/* Live Score Slider with ±0.5% tweak buttons */}
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-slate-500">
                مجموع الثانوية العامة المحاكى:
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-slate-900 tabular-nums">
                  {score.toFixed(1)}%
                </span>
                <span className="text-[12px] text-slate-500">
                  (~{((score / 100) * 410).toFixed(1)} من 410 درجة)
                </span>
              </div>
            </div>

            {/* Stepper buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleTweak(-0.5)}
                className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                title="تقليل 0.5%"
              >
                <Minus className="w-4 h-4 stroke-[2]" />
              </button>
              <button
                type="button"
                onClick={() => handleTweak(0.5)}
                className="w-9 h-9 flex items-center justify-center bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                title="زيادة 0.5%"
              >
                <Plus className="w-4 h-4 stroke-[2]" />
              </button>
            </div>
          </div>

          {/* Slider input */}
          <div className="space-y-1">
            <input
              type="range"
              min="50"
              max="100"
              step="0.1"
              value={score}
              onChange={(e) => onUpdateScore(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 tabular-nums">
              <span>50.0%</span>
              <span>65.0%</span>
              <span>80.0%</span>
              <span>90.0%</span>
              <span>100.0%</span>
            </div>
          </div>
        </div>

        {/* 3 Summary Buckets Counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Safe Green Bucket */}
          <button
            type="button"
            onClick={() => setActiveBucket(activeBucket === "safe" ? "all" : "safe")}
            className={`text-right p-4 rounded-xl border transition-all cursor-pointer ${
              activeBucket === "safe"
                ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300"
                : "bg-white border-slate-200 hover:border-emerald-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-bold text-emerald-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 stroke-[1.5]" />
                <span>النطاق الآمن (Safe)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                +{categorizedBuckets.safe.length}
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-emerald-950 tabular-nums">
              {categorizedBuckets.safe.length}{" "}
              <span className="text-[12px] font-sans font-normal text-emerald-700">كلية متاحة</span>
            </div>
            <p className="text-[11px] text-emerald-700 mt-1">
              مجموعك أعلى من الحد الأدنى بهامش أمان (+1.5% فأكثر)
            </p>
          </button>

          {/* Target Blue Bucket */}
          <button
            type="button"
            onClick={() => setActiveBucket(activeBucket === "target" ? "all" : "target")}
            className={`text-right p-4 rounded-xl border transition-all cursor-pointer ${
              activeBucket === "target"
                ? "bg-blue-50 border-blue-300 ring-1 ring-blue-300"
                : "bg-white border-slate-200 hover:border-blue-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-bold text-blue-800 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-600 stroke-[1.5]" />
                <span>النطاق المستهدف (Target)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold">
                +{categorizedBuckets.target.length}
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-blue-950 tabular-nums">
              {categorizedBuckets.target.length}{" "}
              <span className="text-[12px] font-sans font-normal text-blue-700">كلية متاحة</span>
            </div>
            <p className="text-[11px] text-blue-700 mt-1">
              في نطاق المجموع المباشر (فارق من -1% إلى +1.4%)
            </p>
          </button>

          {/* Reach Amber Bucket */}
          <button
            type="button"
            onClick={() => setActiveBucket(activeBucket === "reach" ? "all" : "reach")}
            className={`text-right p-4 rounded-xl border transition-all cursor-pointer ${
              activeBucket === "reach"
                ? "bg-amber-50 border-amber-300 ring-1 ring-amber-300"
                : "bg-white border-slate-200 hover:border-amber-200"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-bold text-amber-800 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 stroke-[1.5]" />
                <span>نطاق التحدي (Reach)</span>
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold">
                +{categorizedBuckets.reach.length}
              </span>
            </div>
            <div className="text-2xl font-mono font-bold text-amber-950 tabular-nums">
              {categorizedBuckets.reach.length}{" "}
              <span className="text-[12px] font-sans font-normal text-amber-700">كلية متاحة</span>
            </div>
            <p className="text-[11px] text-amber-700 mt-1">
              تتطلب انخفاضاً غير معتاد في التنسيق أو الانتقال للجامعات الأهلية
            </p>
          </button>
        </div>
      </div>

      {/* 2. Category Filter & Results List */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px]">
            {["الكل", "حكومي انتظام", "برامج خاصة وساعات معتمدة", "جامعات أهلية", "جامعات خاصة وتكنولوجية"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            عرض النتائج حسب الفلتر الحالي
          </div>
        </div>

        {/* Faculties Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredFaculties
            .filter((f) => {
              const shifted = +(f.cutoff_2026 + tansikShift).toFixed(1);
              const m = +(score - shifted).toFixed(1);
              if (activeBucket === "safe") return m >= 1.5;
              if (activeBucket === "target") return m >= -1.0 && m < 1.5;
              if (activeBucket === "reach") return m < -1.0;
              return true;
            })
            .map((faculty) => {
              const shiftedCutoff = +(faculty.cutoff_2026 + tansikShift).toFixed(1);
              const margin = +(score - shiftedCutoff).toFixed(1);
              const isSafe = margin >= 1.5;
              const isTarget = margin >= -1.0 && margin < 1.5;
              const isCompared = comparedIds.includes(faculty.id);

              return (
                <div
                  key={faculty.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-2xs space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          isSafe
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : isTarget
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : "bg-amber-50 text-amber-800 border-amber-200"
                        }`}
                      >
                        {isSafe ? "آمنة جداً" : isTarget ? "مستهدفة وممكنة" : "تحدي عالي"}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {faculty.gov}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-[13px] font-bold text-slate-900 line-clamp-1">
                        {faculty.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        {faculty.university} • {faculty.type}
                      </p>
                    </div>

                    {/* Historical Cutoff Comparison Strip */}
                    <div className="bg-slate-50 rounded-lg p-2 border border-slate-100 grid grid-cols-3 gap-1 text-center text-[10px]">
                      <div>
                        <div className="text-slate-400">2024 فعلـي</div>
                        <div className="font-mono font-bold text-slate-700 tabular-nums">
                          {(faculty.cutoff_2026 - 0.4).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400">2025 فعلـي</div>
                        <div className="font-mono font-bold text-slate-700 tabular-nums">
                          {(faculty.cutoff_2026 - 0.2).toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-blue-600 font-bold">2026 محاكى</div>
                        <div className="font-mono font-bold text-blue-700 tabular-nums">
                          {shiftedCutoff}%
                        </div>
                      </div>
                    </div>

                    {/* Margin difference */}
                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500">الفارق عن مجموعك:</span>
                      <span
                        className={`font-mono font-bold tabular-nums ${
                          margin >= 0 ? "text-emerald-600" : "text-amber-600"
                        }`}
                      >
                        {margin >= 0 ? `+${margin}%` : `${margin}%`}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenFacultyDrawer(faculty)}
                      className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer text-center"
                    >
                      التفاصيل واللائحة
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleCompare(faculty.id)}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                        isCompared
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                      title={isCompared ? "إزالة من المقارنة" : "إضافة للمقارنة"}
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
