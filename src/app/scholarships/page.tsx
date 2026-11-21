"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useStudent } from "@/context/StudentContext";
import { computeDominantTrackFromAnswers, computeFacultyTcoWithScholarship } from "@/lib/engine";
import { matchScholarships } from "@/data/scholarships-db";
import { FACULTIES_DATABASE, TRACK_DETAILS } from "@/data/faculties-db";
import { formatScore, formatStream, ScholarshipScope } from "@/types/chooseu";
import {
  Award,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Globe2,
  GraduationCap,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const SCOPE_LABELS: Record<ScholarshipScope | "all", string> = {
  all: "الكل",
  local: "منح محلية في مصر",
  university: "منح جامعية داخلية",
  international: "منح دولية للمصريين",
};

export default function ScholarshipsPage() {
  const {
    studentName,
    stream,
    scorePercentage,
    annualBudgetEgp,
    governorate,
    livingMode,
    inflationScenario,
    assessmentAnswers,
  } = useStudent();

  const [scopeFilter, setScopeFilter] = useState<ScholarshipScope | "all">("all");
  const [eligibleOnly, setEligibleOnly] = useState<boolean>(false);

  const { topTrack } = useMemo(
    () => computeDominantTrackFromAnswers(assessmentAnswers),
    [assessmentAnswers]
  );

  const matched = useMemo(() => {
    const all = matchScholarships({
      stream,
      score: scorePercentage,
      budget: annualBudgetEgp,
      topTrack,
    });
    return all.filter((s) => {
      if (scopeFilter !== "all" && s.scope !== scopeFilter) return false;
      if (eligibleOnly && !s.isEligibleByScore) return false;
      return true;
    });
  }, [stream, scorePercentage, annualBudgetEgp, topTrack, scopeFilter, eligibleOnly]);

  // Quick financial preview: sample top private/ahli/international program after scholarship coverage
  const financialPreview = useMemo(() => {
    const sampleFacs = FACULTIES_DATABASE.filter(
      (f) => f.y1_base_fee >= 30000 && (f.stream === "Both" || f.stream === stream)
    ).slice(0, 3);

    return sampleFacs.map((fac) => ({
      fac,
      tco: computeFacultyTcoWithScholarship(
        fac,
        governorate || "القاهرة",
        livingMode,
        inflationScenario,
        scorePercentage || 85
      ),
    }));
  }, [stream, governorate, livingMode, inflationScenario, scorePercentage]);

  return (
    <div className="px-4 lg:px-8 py-8 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <Award className="w-3.5 h-3.5" />
              <span>محرك مطابقة المنح الدراسية 2026</span>
            </div>
            <h1 className="text-[22px] font-extrabold text-slate-900">
              المنح المحلية والجامعية والدولية المطابقة لملفك
            </h1>
            <p className="text-[13px] text-slate-600 max-w-2xl">
              ترشيح مخصّص مبني على مجموعك وشعبتك ومسارك المقترح وميزانية الأسرة، مع شروط الأهلية ونسبة التغطية والموعد النهائي والرابط الرسمي للتقديم.
            </p>
          </div>
          <Link
            href="/tco-matrix"
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-[12px] font-semibold inline-flex items-center gap-2 transition"
          >
            <Wallet className="w-4 h-4" />
            <span>حساب صافي مساهمة الأسرة</span>
          </Link>
        </div>

        {/* Active Student Profile Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-[12px]">
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
            <span className="text-slate-500 block text-[11px]">الطالب / الشعبة</span>
            <strong className="text-slate-900">
              {studentName || "طالب ChooseU"} • {formatStream(stream)}
            </strong>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
            <span className="text-slate-500 block text-[11px]">المجموع الحالي</span>
            <strong className="text-slate-900 tabular-nums">
              {scorePercentage > 0 ? formatScore(scorePercentage) : "غير محدد (أدخله من ملفك)"}
            </strong>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
            <span className="text-slate-500 block text-[11px]">الميزانية السنوية</span>
            <strong className="text-slate-900 tabular-nums">
              {annualBudgetEgp > 0 ? `${annualBudgetEgp.toLocaleString()} ج.م` : "غير محددة"}
            </strong>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/70">
            <span className="text-slate-500 block text-[11px]">المسار المقترح</span>
            <strong className="text-slate-900">
              {topTrack ? TRACK_DETAILS[topTrack]?.title : "أكمل اختبار الميول"}
            </strong>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          {(["all", "local", "university", "international"] as const).map((sc) => (
            <button
              key={sc}
              type="button"
              onClick={() => setScopeFilter(sc)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition cursor-pointer ${
                scopeFilter === sc
                  ? "bg-[#FACC15] text-slate-950 shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {SCOPE_LABELS[sc]}
            </button>
          ))}
        </div>

        <label className="inline-flex items-center gap-2 text-[12px] font-semibold text-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={eligibleOnly}
            onChange={(e) => setEligibleOnly(e.target.checked)}
            className="rounded border-slate-300 text-amber-600"
          />
          <span>عرض المنح المؤهّل لها بمجموعي فقط</span>
        </label>
      </div>

      {/* Scholarships Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {matched.map((s) => (
          <div
            key={s.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between gap-4 hover:border-amber-300 transition"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      {SCOPE_LABELS[s.scope]}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 inline-flex items-center gap-1">
                      <Globe2 className="w-3 h-3" />
                      {s.country}
                    </span>
                  </div>
                  <h2 className="text-[15px] font-bold text-slate-900 leading-snug">
                    {s.name}
                  </h2>
                  <p className="text-[12px] text-slate-500">{s.provider}</p>
                </div>

                <div className="text-center shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5">
                  <div className="text-[10px] text-slate-500">نسبة التوافق</div>
                  <div className="text-[16px] font-extrabold text-amber-600 tabular-nums">
                    {s.matchScore}%
                  </div>
                </div>
              </div>

              {/* Coverage & Eligibility */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 text-[12px] space-y-1">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{s.fundingCoverageLabel}</span>
                </div>
                <div className="text-emerald-800 text-[11px]">{s.eligibilityReason}</div>
              </div>

              {/* Conditions */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-700">أهم شروط الأهلية:</div>
                <ul className="space-y-1">
                  {s.eligibilityConditions.map((cond, idx) => (
                    <li
                      key={idx}
                      className="text-[12px] text-slate-600 flex items-start gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-700 mt-0.5 shrink-0" />
                      <span>{cond}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[12px]">
              <div className="flex items-center gap-3 text-slate-600">
                <span className="inline-flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  الموعد: {s.deadline}
                </span>
                <span className="inline-flex items-center gap-1 font-medium tabular-nums">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                  حد أدنى: {s.minScore}%
                </span>
              </div>
              <a
                href={s.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-700 font-bold"
              >
                <span>المصدر الرسمي للتقديم</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Remaining Family Contribution Preview */}
      {financialPreview.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
          <div>
            <h2 className="text-[16px] font-bold text-slate-900">
              أثر المنحة على صافي مساهمة الأسرة (4 سنوات)
            </h2>
            <p className="text-[12px] text-slate-500 mt-0.5">
              تقدير عملي لصافي التكلفة المتبقية على الأسرة بعد خصم تغطية المنحة التقديرية بناءً على مجموعك الحالي.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {financialPreview.map(({ fac, tco }) => (
              <div
                key={fac.id}
                className="border border-slate-200 rounded-xl p-4 space-y-2 text-[12px] bg-slate-50/50"
              >
                <div className="font-bold text-slate-900 leading-snug">{fac.name}</div>
                <div className="text-[11px] text-slate-500">{fac.university}</div>
                <div className="pt-2 border-t border-slate-200/70 space-y-1 tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-slate-600">إجمالي 4 سنوات (شامل المعيشة):</span>
                    <span className="font-semibold text-slate-800">
                      {tco.total4Yr.toLocaleString()} ج.م
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-700">
                    <span>تغطية منحة تقديرية ({tco.scholarshipCoveragePct || 0}%):</span>
                    <span className="font-bold">
                      -{(tco.scholarshipDiscount4Yr || 0).toLocaleString()} ج.م
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 font-extrabold text-slate-900">
                    <span>صافي مساهمة الأسرة:</span>
                    <span className="text-amber-600">
                      {(tco.remainingFamily4Yr ?? tco.total4Yr).toLocaleString()} ج.م
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}