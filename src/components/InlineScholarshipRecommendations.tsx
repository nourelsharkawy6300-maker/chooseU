"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { matchScholarships } from "@/data/scholarships-db";
import { FACULTIES_DATABASE, TRACK_DETAILS } from "@/data/faculties-db";
import { StreamType, TrackKey, formatScore } from "@/types/chooseu";
import {
  Award,
  Clock,
  ExternalLink,
  Globe2,
  GraduationCap,
  PlaneTakeoff,
  ArrowLeft,
} from "lucide-react";

interface InlineScholarshipRecommendationsProps {
  stream: StreamType;
  score: number;
  budget: number;
  topTrack: TrackKey | null;
}

export function InlineScholarshipRecommendations({
  stream,
  score,
  budget,
  topTrack,
}: InlineScholarshipRecommendationsProps) {
  const analysis = useMemo(() => {
    const safeScore = score > 0 ? score : 80;
    const allMatched = matchScholarships({
      stream,
      score: safeScore,
      budget,
      topTrack,
    });

    // Check if the student's recommended track has a local Egyptian cutoff higher than their score
    let missedLocalDreamTrack = false;
    let lowestEgyptCutoffForTrack: number | null = null;

    if (topTrack && score > 0) {
      const localTrackFacs = FACULTIES_DATABASE.filter(
        (f) =>
          f.type !== "جامعات دولية مختارة" &&
          f.tracks.includes(topTrack) &&
          (f.stream === "Both" || f.stream === stream || stream === "stem")
      );
      if (localTrackFacs.length > 0) {
        const publicOrBestLocal = localTrackFacs.filter(
          (f) => f.type === "حكومي انتظام"
        );
        const refPool =
          publicOrBestLocal.length > 0 ? publicOrBestLocal : localTrackFacs;
        lowestEgyptCutoffForTrack = Math.min(
          ...refPool.map((f) => f.cutoff_2026)
        );
        if (score < lowestEgyptCutoffForTrack) {
          missedLocalDreamTrack = true;
        }
      }
    }

    // Separate international scholarships that fit the track & score vs local/uni scholarships
    const abroadForTrack = allMatched.filter(
      (s) =>
        s.scope === "international" &&
        (!topTrack || s.supportedTracks.includes(topTrack)) &&
        s.isEligibleByScore
    );
    const abroadFallback =
      abroadForTrack.length > 0
        ? abroadForTrack
        : allMatched.filter((s) => s.scope === "international");

    const localAndUni = allMatched.filter((s) => s.scope !== "international");

    // Pick top 4 contextual cards: prioritize abroad scholarships first if local cutoff was missed
    const featured = missedLocalDreamTrack
      ? [...abroadFallback.slice(0, 3), ...localAndUni.slice(0, 1)]
      : [...localAndUni.slice(0, 2), ...abroadFallback.slice(0, 2)];

    return {
      missedLocalDreamTrack,
      lowestEgyptCutoffForTrack,
      featured,
      abroadCount: abroadForTrack.length,
    };
  }, [stream, score, budget, topTrack]);

  const trackTitle = topTrack ? TRACK_DETAILS[topTrack]?.title : null;

  return (
    <section className="bg-white border border-amber-200 rounded-2xl p-5 lg:p-6 shadow-2xs space-y-4 mt-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
            <Award className="w-3.5 h-3.5" />
            <span>منح مطابقة لمجموعك ومسارك (محلي + دولي)</span>
          </div>
          <h3 className="text-[17px] font-extrabold text-slate-900">
            المنح الدراسية المناسبة لك بناءً على مجموعك ({formatScore(score)})
            {trackTitle ? ` ومسار «${trackTitle}»` : ""}
          </h3>
        </div>
        <Link
          href="/scholarships"
          className="inline-flex items-center gap-1.5 bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 px-3.5 py-2 rounded-xl text-[12px] font-bold transition shadow-2xs"
        >
          <span>كل المنح المتاحة</span>
          <ArrowLeft className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Special Banner: Student's dream track missed local Egyptian cutoff -> Abroad pathway */}
      {analysis.missedLocalDreamTrack && trackTitle && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FACC15] text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
            <PlaneTakeoff className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-[12px]">
            <div className="font-extrabold text-slate-900 text-[13px]">
              مجموعك ({formatScore(score)}) أقل من تنسيق «{trackTitle}» الحكومي في مصر
              {analysis.lowestEgyptCutoffForTrack
                ? ` (${formatScore(analysis.lowestEgyptCutoffForTrack)})`
                : ""}
              — بس حلمك لسه متاح بره مصر!
            </div>
            <p className="text-slate-700 leading-relaxed">
              تقييمك أثبت إنك مناسب لمسار <strong>{trackTitle}</strong>؛ المنح الدولية بالأسفل تقبل مجموعك وتتيح لك دراسة نفس التخصص بالخارج بتمويل كامل أو جزئي.
            </p>
          </div>
        </div>
      )}

      {/* Contextual Scholarship Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {analysis.featured.map((s) => {
          const isIntl = s.scope === "international";
          return (
            <div
              key={s.id}
              className={`rounded-xl border p-4 flex flex-col justify-between gap-3 transition ${
                isIntl && analysis.missedLocalDreamTrack
                  ? "border-amber-300 bg-amber-50/30"
                  : "border-slate-200 bg-slate-50/40 hover:border-amber-300"
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isIntl
                            ? "bg-[#FACC15]/30 text-slate-900 border-amber-400"
                            : "bg-white text-slate-700 border-slate-200"
                        }`}
                      >
                        {isIntl
                          ? "منحة دولية بره مصر"
                          : s.scope === "local"
                          ? "منحة محلية في مصر"
                          : "منحة جامعية"}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white border border-slate-200 text-slate-600 inline-flex items-center gap-1">
                        <Globe2 className="w-3 h-3" />
                        {s.country}
                      </span>
                    </div>
                    <h4 className="text-[13px] font-bold text-slate-900 leading-snug">
                      {s.name}
                    </h4>
                  </div>

                  <div className="shrink-0 text-center bg-white border border-amber-200 rounded-lg px-2.5 py-1">
                    <div className="text-[9px] text-slate-500">التوافق</div>
                    <div className="text-[13px] font-extrabold text-amber-700 tabular-nums">
                      {s.matchScore}%
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-2 text-[11px] font-semibold text-emerald-900 flex items-start gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-emerald-700 mt-0.5 shrink-0" />
                  <span>{s.fundingCoverageLabel}</span>
                </div>

                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {s.eligibilityReason}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-200/70 flex items-center justify-between gap-2 text-[11px]">
                <span className="text-slate-600 inline-flex items-center gap-1 tabular-nums">
                  <Clock className="w-3 h-3 text-amber-600" />
                  حد أدنى {s.minScore}% • {s.deadline}
                </span>
                <a
                  href={s.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
                >
                  <span>الموقع الرسمي</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}