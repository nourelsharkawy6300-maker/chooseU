"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  HeartPulse,
  Cpu,
  Languages,
  TrendingUp,
  Scale,
  Sparkles,
} from "lucide-react";
import {
  Faculty,
  StreamType,
  LivingMode,
  TrackKey,
  EnterpriseViewKey,
  EvaluationResult,
  InterestCluster,
} from "@/types/chooseu";
import { FACULTIES_DATABASE } from "@/data/faculties-db";
import { evaluateAndRankFaculties } from "@/lib/engine";

// Enterprise App Shell Components
import { ScrollPortalHero } from "@/components/ScrollPortalHero";
import { EditorialLandingFlow } from "@/components/EditorialLandingFlow";
import { IntroSplash } from "@/components/IntroSplash";
import { FourStationJourney } from "@/components/FourStationJourney";
import { EnterpriseSidebar } from "@/components/EnterpriseSidebar";
import { EnterpriseFooter } from "@/components/EnterpriseFooter";
import { CommandPalette } from "@/components/CommandPalette";

// Enterprise View Components
import { AuthPortalView } from "@/components/views/AuthPortalView";
import { OnboardingWizardView } from "@/components/views/OnboardingWizardView";
import { DashboardView } from "@/components/views/DashboardView";
import { AssessmentLabView } from "@/components/views/AssessmentLabView";
import { TansikSimulatorView } from "@/components/views/TansikSimulatorView";
import { TcoCalculatorView } from "@/components/views/TcoCalculatorView";
import { ExploreCatalogView } from "@/components/views/ExploreCatalogView";
import { FacultyDetailDrawer } from "@/components/views/FacultyDetailDrawer";
import { CompareArenaView } from "@/components/views/CompareArenaView";
import { AlternativesEngineView } from "@/components/views/AlternativesEngineView";
import { CareerObservatoryView } from "@/components/views/CareerObservatoryView";
import { TimelineChecklistView } from "@/components/views/TimelineChecklistView";
import { ProfileVaultView } from "@/components/views/ProfileVaultView";
import { AdminPortalView } from "@/components/views/AdminPortalView";

// ============================================================================
// 1. BESPOKE CLUSTER DEFINITIONS & HELPER METERS
// ============================================================================

export interface ClusterTheme {
  key: InterestCluster;
  title: string;
  subtitle: string;
  color: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  ringColor: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

export const CLUSTERS: Record<InterestCluster, ClusterTheme> = {
  Medical_Bio: {
    key: "Medical_Bio",
    title: "القطاع الطبي والصحي والحيوي",
    subtitle: "الطب، الصيدلة، الأسنان، العلاج الطبيعي، التمريض والتكنولوجيا الحيوية",
    color: "#059669",
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-200",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    ringColor: "#059669",
    icon: HeartPulse,
  },
  Eng_Tech: {
    key: "Eng_Tech",
    title: "الهندسة والحاسبات والذكاء الاصطناعي",
    subtitle: "علوم الحاسب، الأمن السيبراني، الذكاء الاصطناعي وهندسة البرمجيات",
    color: "#2563EB",
    textClass: "text-blue-700",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-200",
    badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
    ringColor: "#2563EB",
    icon: Cpu,
  },
  Media_Lang: {
    key: "Media_Lang",
    title: "الإعلام واللغات والترجمة الفورية",
    subtitle: "الألسن، اللغات والترجمة، الإعلام الرقمي وصناعة المحتوى",
    color: "#7C3AED",
    textClass: "text-purple-700",
    bgClass: "bg-purple-50",
    borderClass: "border-purple-200",
    badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
    ringColor: "#7C3AED",
    icon: Languages,
  },
  Biz_Econ: {
    key: "Biz_Econ",
    title: "إدارة الأعمال والتمويل والاقتصاد",
    subtitle: "التمويل والاستثمار، نظم معلومات الأعمال (BIS) والتسويق الدولي",
    color: "#D97706",
    textClass: "text-amber-700",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    ringColor: "#D97706",
    icon: TrendingUp,
  },
  Law_Edu_Social: {
    key: "Law_Edu_Social",
    title: "العلوم الإنسانية والقانون والتربية",
    subtitle: "الحقوق، الاقتصاد والعلوم السياسية، والتربية والآداب",
    color: "#475569",
    textClass: "text-slate-700",
    bgClass: "bg-slate-50",
    borderClass: "border-slate-300",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
    ringColor: "#475569",
    icon: Scale,
  },
  Applied_Agri_Arts: {
    key: "Applied_Agri_Arts",
    title: "الفنون التطبيقية والعلوم والزراعة",
    subtitle: "الفنون التطبيقية، العلوم التخصصية، والزراعة الحديثة والبيئة",
    color: "#0284C7",
    textClass: "text-sky-700",
    bgClass: "bg-sky-50",
    borderClass: "border-sky-200",
    badgeClass: "bg-sky-50 text-sky-800 border-sky-200",
    ringColor: "#0284C7",
    icon: Sparkles,
  },
};

export function getFacultyCluster(f: Faculty): InterestCluster {
  const tracks = f.tracks || [];
  if (tracks.some((t) => ["Med_Clinical", "Pharma_Chem", "Rehab_PT", "Bio_Tech"].includes(t))) {
    return "Medical_Bio";
  }
  if (tracks.some((t) => ["AI", "Cyber", "SE", "Hardware"].includes(t))) {
    return "Eng_Tech";
  }
  if (tracks.some((t) => ["Lang_Trans", "Media_Law"].includes(t))) {
    return "Media_Lang";
  }
  if (tracks.some((t) => ["Biz_Fin", "Econ_Pol"].includes(t))) {
    return "Biz_Econ";
  }
  if (tracks.some((t) => ["Edu_Human"].includes(t))) {
    return "Law_Edu_Social";
  }
  return "Applied_Agri_Arts";
}

// 6-Axis SVG Radar Hexagon
export function PersonaRadarHexagon({
  affinities,
  size = 260,
}: {
  affinities: Record<InterestCluster, number>;
  size?: number;
}) {
  const center = size / 2;
  const radius = size * 0.38;

  const clusterKeys: InterestCluster[] = [
    "Medical_Bio",
    "Eng_Tech",
    "Media_Lang",
    "Biz_Econ",
    "Law_Edu_Social",
    "Applied_Agri_Arts",
  ];

  const getCoordinates = (idx: number, scale: number) => {
    const angle = (idx * 2 * Math.PI) / 6 - Math.PI / 2;
    const x = center + radius * scale * Math.cos(angle);
    const y = center + radius * scale * Math.sin(angle);
    return { x, y };
  };

  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  const dataPoints = clusterKeys.map((k, idx) => {
    const val = affinities[k] || 15;
    const normalized = Math.max(0.15, Math.min(1.0, val / 100));
    return getCoordinates(idx, normalized);
  });

  const polygonPath =
    dataPoints.map((pt, i) => `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`).join(" ") +
    " Z";

  return (
    <div className="flex flex-col items-center justify-center select-none">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible"
      >
        {/* Concentric Guide Polygons */}
        {gridLevels.map((lvl) => {
          const pts = clusterKeys
            .map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${x},${y}`;
            })
            .join(" ");
          return (
            <polygon
              key={lvl}
              points={pts}
              fill="none"
              stroke="#E2E8F0"
              strokeWidth="1"
              strokeDasharray={lvl < 1.0 ? "2 2" : undefined}
            />
          );
        })}

        {/* 6 Spoke Axis Lines */}
        {clusterKeys.map((_, i) => {
          const outer = getCoordinates(i, 1.0);
          return (
            <line
              key={i}
              x1={center}
              y1={center}
              x2={outer.x}
              y2={outer.y}
              stroke="#CBD5E1"
              strokeWidth="1"
            />
          );
        })}

        {/* The Filled Data Polygon */}
        <path
          d={polygonPath}
          fill="rgba(37, 99, 235, 0.12)"
          stroke="#2563EB"
          strokeWidth="1.5"
        />

        {/* Data Vertices */}
        {dataPoints.map((pt, i) => {
          const clusterKey = clusterKeys[i];
          const cluster = CLUSTERS[clusterKey];
          return (
            <circle
              key={clusterKey}
              cx={pt.x}
              cy={pt.y}
              r={3.5}
              fill="#FFFFFF"
              stroke={cluster.color}
              strokeWidth="2"
            />
          );
        })}
      </svg>

      {/* Axis Breakdown Strip */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-3 pt-3 border-t border-slate-200 text-[11px]">
        {clusterKeys.map((k) => {
          const cluster = CLUSTERS[k];
          const val = affinities[k] || 0;
          return (
            <div
              key={k}
              className="flex items-center justify-between p-1.5 rounded-md bg-white border border-slate-200"
            >
              <div className="flex items-center gap-1.5 truncate">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: cluster.color }}
                />
                <span className="truncate text-slate-700 font-medium">
                  {cluster.title.split(" ")[1] || cluster.title}
                </span>
              </div>
              <span className="font-bold text-slate-900 tabular-nums">
                {val}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// 3-Ring SVG Circular Meters
export function ThreeRingMeters({
  personalMatch,
  admissionScore,
  financialFit,
}: {
  personalMatch: number;
  admissionScore: {
    status: "safe" | "target" | "stretch";
    margin: number;
    pct: number;
  };
  financialFit: {
    withinBudget: boolean;
    pct: number;
  };
}) {
  return (
    <div className="flex items-center justify-around text-center text-[10px]">
      <div>
        <div className="text-slate-400">التوافق</div>
        <div className="font-mono font-bold text-blue-600 tabular-nums text-xs">
          {personalMatch}%
        </div>
      </div>
      <div className="w-px h-4 bg-slate-200" />
      <div>
        <div className="text-slate-400">الدرجات</div>
        <div className="font-mono font-bold text-slate-900 tabular-nums text-xs">
          {admissionScore.margin >= 0
            ? `+${admissionScore.margin}%`
            : `${admissionScore.margin}%`}
        </div>
      </div>
      <div className="w-px h-4 bg-slate-200" />
      <div>
        <div className="text-slate-400">الميزانية</div>
        <div className="font-mono font-bold text-emerald-600 tabular-nums text-xs">
          {financialFit.pct}%
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. MASTER CHOOSEU ENTERPRISE PAGE COMPONENT
// ============================================================================

export default function ChooseUEgyptPlatform() {
  // Navigation & Shell State (Starts on the Consolidated 4-Station Stepper Journey)
  const [currentView, setCurrentView] = useState<EnterpriseViewKey>("journey");
  const [showIntro, setShowIntro] = useState<boolean>(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Student Profile State
  const [studentName, setStudentName] = useState<string>("عمر خالد محمود");
  const [stream, setStream] = useState<StreamType>("Math");
  const [score, setScore] = useState<number>(83.5);
  const [budget, setBudget] = useState<number>(65000);
  const [governorate, setGovernorate] = useState<string>("المنوفية");
  const [livingMode, setLivingMode] = useState<LivingMode>("commute");
  const [tansikShift, setTansikShift] = useState<number>(0);

  // Collections & Selections
  const [comparedIds, setComparedIds] = useState<string[]>([
    "f_alex_cs",
    "f_eelu_cs",
  ]);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([
    "f_alex_cs",
    "f_cairo_eng",
  ]);
  const [activeAuditedFaculty, setActiveAuditedFaculty] = useState<Faculty | null>(
    null
  );

  // Psychometric Quiz Answers State (persisted in localStorage)
  const [quizAnswers, setQuizAnswers] = useState<Record<number, TrackKey>>({
    1: "SE",
    2: "AI",
    3: "Cyber",
    4: "Hardware",
  });

  // Load from localStorage on client mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedQuiz = localStorage.getItem("chooseu_quiz_answers");
        if (savedQuiz) {
          setQuizAnswers(JSON.parse(savedQuiz));
        }
        const savedCompared = localStorage.getItem("chooseu_compared_ids");
        if (savedCompared) {
          setComparedIds(JSON.parse(savedCompared));
        }
        const savedBookmarks = localStorage.getItem("chooseu_bookmarks");
        if (savedBookmarks) {
          setBookmarkedIds(JSON.parse(savedBookmarks));
        }
      } catch {
        // fallback
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Answer Quiz question handler
  const handleAnswerQuizQuestion = (qId: number, track: TrackKey) => {
    setQuizAnswers((prev) => {
      const updated = { ...prev, [qId]: track };
      try {
        localStorage.setItem("chooseu_quiz_answers", JSON.stringify(updated));
      } catch {
        // fallback
      }
      return updated;
    });
  };

  const handleResetQuiz = () => {
    setQuizAnswers({});
    try {
      localStorage.removeItem("chooseu_quiz_answers");
    } catch {
      // fallback
    }
  };

  // Compare Toggle handler
  const handleToggleCompare = (id: string) => {
    setComparedIds((prev) => {
      const next = prev.includes(id)
        ? prev.filter((item) => item !== id)
        : prev.length >= 4
        ? [...prev.slice(1), id]
        : [...prev, id];
      try {
        localStorage.setItem("chooseu_compared_ids", JSON.stringify(next));
      } catch {
        // fallback
      }
      return next;
    });
  };

  // Bookmark Toggle handler
  const handleRemoveBookmark = (id: string) => {
    setBookmarkedIds((prev) => {
      const next = prev.filter((item) => item !== id);
      try {
        localStorage.setItem("chooseu_bookmarks", JSON.stringify(next));
      } catch {
        // fallback
      }
      return next;
    });
  };

  // 1-Click Demo Mode Activation
  const handleEnterDemoMode = () => {
    setStudentName("عمر خالد محمود");
    setStream("Math");
    setScore(83.5);
    setBudget(65000);
    setGovernorate("المنوفية");
    setLivingMode("commute");
    setTansikShift(0);
    setQuizAnswers({ 1: "SE", 2: "AI", 3: "Cyber", 4: "Hardware" });
    setCurrentView("dashboard");
  };

  // Keyboard shortcut listener for Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Compute Psychometric Affinities across 6 clusters
  const clusterAffinities: Record<InterestCluster, number> = useMemo(() => {
    const rawCounts: Record<string, number> = {};
    Object.values(quizAnswers).forEach((t) => {
      rawCounts[t] = (rawCounts[t] || 0) + 1;
    });

    const isEng = (rawCounts["SE"] || 0) + (rawCounts["AI"] || 0) + (rawCounts["Cyber"] || 0);
    const isMed = (rawCounts["Med_Clinical"] || 0) + (rawCounts["Pharma_Chem"] || 0) + (rawCounts["Bio_Tech"] || 0);
    const isBiz = (rawCounts["Biz_Fin"] || 0) + (rawCounts["Econ_Pol"] || 0);
    const isLang = (rawCounts["Lang_Trans"] || 0) + (rawCounts["Media_Law"] || 0);

    return {
      Eng_Tech: stream === "Math" ? Math.min(95, 45 + isEng * 15) : 35,
      Medical_Bio: stream === "Science" ? Math.min(96, 40 + isMed * 15) : 20,
      Biz_Econ: Math.min(88, 30 + isBiz * 14),
      Media_Lang: stream === "Arts" ? Math.min(92, 40 + isLang * 14) : 25,
      Law_Edu_Social: stream === "Arts" ? 75 : 20,
      Applied_Agri_Arts: 30,
    };
  }, [quizAnswers, stream]);

  // Compute Evaluation and Ranking via Engine
  const trackCounts: Partial<Record<TrackKey, number>> = useMemo(() => {
    const counts: Partial<Record<TrackKey, number>> = {};
    Object.values(quizAnswers).forEach((tr) => {
      counts[tr] = (counts[tr] || 0) + 1;
    });
    return counts;
  }, [quizAnswers]);

  const evaluation: EvaluationResult = useMemo(() => {
    return evaluateAndRankFaculties({
      stream,
      score,
      budget,
      gov: governorate,
      tansikShift,
      sectorFilter: "الكل",
      trackCounts,
    });
  }, [stream, score, budget, governorate, tansikShift, trackCounts]);

  // Top recommended faculties
  const topFaculties = useMemo(() => {
    if (evaluation.allRanked.length > 0) {
      return evaluation.allRanked;
    }
    return FACULTIES_DATABASE.filter(
      (f) => f.stream === stream || f.stream === "Both"
    );
  }, [evaluation, stream]);

  // Map view keys to titles for breadcrumbs
  const viewTitles: Record<EnterpriseViewKey, string> = {
    journey: "رحلة الـ 4 محطات (Journey Stepper)",
    landing: "بوابة البداية والأنيميشن (Hero)",
    auth: "بوابة الدخول والحساب",
    onboarding: "معالج الإعداد والتهيئة",
    dashboard: "لوحة التحكم التنفيذية",
    assessment: "مختبر التقييم والتقرير",
    "tansik-simulator": "محاكي درجات التنسيق",
    calculator: "حاسبة تكلفة 4 سنوات (TCO)",
    explore: "دليل استكشاف الكليات",
    compare: "منصة المقارنة المباشرة (VS)",
    alternatives: "محرك الحلم والبديل",
    careers: "مرصد الوظائف وسوق العمل",
    timeline: "مراحل التنسيق والمستندات",
    profile: "الملف وتقرير ولي الأمر",
    admin: "بوابة المستشارين (Staff)",
  };

  const streamLabel =
    stream === "Science" ? "علمي علوم" : stream === "Math" ? "علمي رياضة" : "أدبي";

  return (
    <div className="bg-[#0F172A] text-slate-100 font-sans antialiased selection:bg-blue-600 selection:text-white" dir="rtl">
      {/* Fast, Elegant Intro Curtain (Under 500ms, auto-unmounts completely) */}
      {showIntro && <IntroSplash onComplete={() => setShowIntro(false)} />}

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectView={(v) => {
          setCurrentView(v);
          setIsCommandPaletteOpen(false);
          if (v === "landing") {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        onSelectFaculty={(f) => {
          setActiveAuditedFaculty(f);
          setIsCommandPaletteOpen(false);
        }}
      />

      {/* Global Faculty Detail Drawer */}
      <FacultyDetailDrawer
        faculty={activeAuditedFaculty}
        onClose={() => setActiveAuditedFaculty(null)}
        onToggleCompare={handleToggleCompare}
        isCompared={
          activeAuditedFaculty
            ? comparedIds.includes(activeAuditedFaculty.id)
            : false
        }
      />

      {/* ================================================================== */}
      {/* CASE A: LANDING FLOW WITH EXACT ROUTE EXPLOSIVE LETTER ZOOM PORTAL */}
      {/* ================================================================== */}
      {currentView === "landing" ? (
        <div className="w-full">
          {/* Part 1: Route-Style Explosive Letter Zoom & Scatter Portal */}
          <ScrollPortalHero
            onNavigateView={(v) => {
              setCurrentView(v);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onEnterDemoMode={handleEnterDemoMode}
            onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
            studentName={studentName}
            stream={stream}
            score={score}
            onUpdateScore={(s) => setScore(s)}
            onUpdateStream={(st) => setStream(st)}
          />

          {/* Part 2: Numbered Editorial Chapters (01 Possibility, Marquee, 02 Sectors, 03 4-Step Journey) */}
          <EditorialLandingFlow
            stream={stream}
            score={score}
            onUpdateScore={(s) => setScore(s)}
            onUpdateStream={(st) => setStream(st)}
            onNavigateView={(v) => {
              setCurrentView(v);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            onEnterDemoMode={handleEnterDemoMode}
          />

          {/* Enterprise Multi-Column Footer */}
          <EnterpriseFooter onSelectView={(v) => setCurrentView(v)} />
        </div>
      ) : (
        /* ================================================================ */
        /* CASE B: FULL ENTERPRISE WORKSPACE & 4-STATION JOURNEY ARCHITECTURE */
        /* ================================================================ */
        <div className="bg-[#0F172A] text-slate-100">
          {/* Permanent Sticky Dark Header across all views */}
          <header className="sticky top-0 z-40 h-16 bg-[#0F172A]/95 border-b border-slate-800 text-white px-4 sm:px-6 flex items-center justify-between gap-3 shadow-lg no-print">
            {/* Right side: Mobile Menu Button + ChooseU Brand Logo + Breadcrumb */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 cursor-pointer"
                title="القائمة الجانبية"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
                </svg>
              </button>

              <div
                onClick={() => {
                  setCurrentView("journey");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-2 cursor-pointer group"
                title="الانتقال لرحلة الـ 4 محطات (Journey Stepper)"
              >
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center p-1.5 group-hover:border-blue-500 transition-colors shrink-0">
                  <svg width="20" height="20" viewBox="0 0 36 36" fill="none">
                    <path
                      d="M23 11.5C19.5 11.5 16.5 11.5 14.5 13.5C12.5 15.5 12.5 20.5 14.5 22.5C16.5 24.5 19.5 24.5 23 24.5"
                      stroke="#FFFFFF"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M17.5 11.5V20.5C17.5 22.7 19.3 24.5 21.5 24.5C23.7 24.5 25.5 22.7 25.5 20.5V11.5"
                      stroke="#2563EB"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="25.5" cy="11.5" r="2.2" fill="#60A5FA" />
                    <circle cx="13.2" cy="18" r="1.8" fill="#FFFFFF" />
                  </svg>
                </div>
                <span dir="ltr" className="font-black text-lg tracking-tight font-sans text-white">
                  Choose<span className="text-blue-500">U</span>
                </span>
              </div>

              <div className="hidden sm:flex items-center gap-2 border-r border-slate-700 pr-3 mr-1">
                <span className="text-[11px] text-slate-400 font-mono">2026 /</span>
                <span className="text-[13px] font-bold text-white truncate max-w-[150px] sm:max-w-none">
                  {viewTitles[currentView]}
                </span>
              </div>
            </div>

            {/* Center: Command Palette Trigger */}
            <button
              type="button"
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden md:flex items-center justify-between gap-3 w-64 lg:w-80 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-[11px] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
                </svg>
                <span>ابحث في كل الكليات والصفحات...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
                Ctrl+K
              </kbd>
            </button>

            {/* Left side: Student Pill + Journey Button + Return to Hero */}
            <div className="flex items-center gap-2">
              <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-[11px]">
                <span className="font-semibold text-slate-200">{studentName}</span>
                <span className="text-[10px] text-blue-400 font-bold bg-slate-800 px-1.5 py-0.2 rounded border border-slate-700">
                  {streamLabel}
                </span>
                <span className="font-mono text-white tabular-nums">{score}%</span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setCurrentView("journey");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors ${
                  currentView === "journey"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                }`}
                title="الرحلة الموحدة (4 محطات)"
              >
                رحلة الـ 4 محطات ✦
              </button>

              <button
                type="button"
                onClick={handleEnterDemoMode}
                className="hidden sm:flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
              >
                <span>حساب تجريبي (Demo)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCurrentView("landing");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
                title="العودة لبوابة البداية والأنيميشن الكامل"
              >
                بوابة البداية ↻
              </button>
            </div>
          </header>

          {/* Workspace Body with Sticky Sidebar and View Area */}
          <div className="relative flex min-h-[calc(100vh-4rem)] bg-[#0F172A]">
            {/* Right Sidebar (RTL) */}
            <EnterpriseSidebar
              currentView={currentView}
              onSelectView={(v) => setCurrentView(v)}
              isOpenMobile={isMobileSidebarOpen}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
              isCollapsed={isSidebarCollapsed}
              onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
              vsCount={comparedIds.length}
            />

            {/* Main Content Viewport */}
            <div className="flex-1 min-w-0">
              <main className="p-4 sm:p-6 lg:p-8 w-full space-y-6">
                {/* PRIMARY VIEW: 4-STATION JOURNEY STEPPER */}
                {currentView === "journey" && (
                  <FourStationJourney
                    initialStudentName={studentName}
                    initialStream={stream}
                    initialScore={score}
                    initialBudget={budget}
                    initialGov={governorate}
                    initialLivingMode={livingMode}
                    onOpenFacultyDrawer={(f: Faculty) => setActiveAuditedFaculty(f)}
                    onSelectView={(v: string) => setCurrentView(v as EnterpriseViewKey)}
                  />
                )}

                {/* VIEW 2: AUTH PORTAL */}
                {currentView === "auth" && (
                  <AuthPortalView
                    onLoginSuccess={(data) => {
                      setStudentName(data.name);
                      setStream(data.stream);
                      setScore(data.score);
                      setGovernorate(data.governorate);
                      setCurrentView("dashboard");
                    }}
                    onEnterDemoMode={handleEnterDemoMode}
                    clusterAffinities={clusterAffinities}
                  />
                )}

                {/* VIEW 3: ONBOARDING WIZARD */}
                {currentView === "onboarding" && (
                  <OnboardingWizardView
                    initialStream={stream}
                    initialScore={score}
                    initialGov={governorate}
                    initialBudget={budget}
                    onComplete={(data) => {
                      setStream(data.stream);
                      setScore(data.score);
                      setGovernorate(data.gov);
                      setBudget(data.budget);
                      setLivingMode(data.dormPreference);
                      setCurrentView("dashboard");
                    }}
                  />
                )}

                {/* VIEW 4: DASHBOARD */}
                {currentView === "dashboard" && (
                  <DashboardView
                    studentName={studentName}
                    stream={stream}
                    score={score}
                    budget={budget}
                    governorate={governorate}
                    clusterAffinities={clusterAffinities}
                    topFaculties={topFaculties}
                    comparedIds={comparedIds}
                    onToggleCompare={handleToggleCompare}
                    onOpenFacultyDrawer={(f) => setActiveAuditedFaculty(f)}
                    onNavigateView={(v) => setCurrentView(v)}
                  />
                )}

                {/* VIEW 5: ASSESSMENT LAB */}
                {currentView === "assessment" && (
                  <AssessmentLabView
                    studentName={studentName}
                    stream={stream}
                    score={score}
                    budget={budget}
                    governorate={governorate}
                    quizAnswers={quizAnswers}
                    onAnswerQuestion={handleAnswerQuizQuestion}
                    onResetQuiz={handleResetQuiz}
                    evaluation={evaluation}
                    clusterAffinities={clusterAffinities}
                    onOpenFacultyDrawer={(f) => setActiveAuditedFaculty(f)}
                  />
                )}

                {/* VIEW 6: TANSIK SIMULATOR */}
                {currentView === "tansik-simulator" && (
                  <TansikSimulatorView
                    stream={stream}
                    score={score}
                    onUpdateScore={(s) => setScore(s)}
                    tansikShift={tansikShift}
                    onUpdateTansikShift={(shift) => setTansikShift(shift)}
                    onOpenFacultyDrawer={(f) => setActiveAuditedFaculty(f)}
                    onToggleCompare={handleToggleCompare}
                    comparedIds={comparedIds}
                  />
                )}

                {/* VIEW 7: TCO CALCULATOR */}
                {currentView === "calculator" && (
                  <TcoCalculatorView
                    stream={stream}
                    governorate={governorate}
                    onUpdateGovernorate={(gov) => setGovernorate(gov)}
                    livingMode={livingMode}
                    onUpdateLivingMode={(mode) => setLivingMode(mode)}
                    onOpenFacultyDrawer={(f) => setActiveAuditedFaculty(f)}
                  />
                )}

                {/* VIEW 8: EXPLORE CATALOG */}
                {currentView === "explore" && (
                  <ExploreCatalogView
                    initialStream={stream}
                    comparedIds={comparedIds}
                    onToggleCompare={handleToggleCompare}
                    onOpenFacultyDrawer={(f) => setActiveAuditedFaculty(f)}
                  />
                )}

                {/* VIEW 10: COMPARE ARENA */}
                {currentView === "compare" && (
                  <CompareArenaView
                    stream={stream}
                    comparedIds={comparedIds}
                    onToggleCompare={handleToggleCompare}
                    onOpenFacultyDrawer={(f) => setActiveAuditedFaculty(f)}
                    governorate={governorate}
                  />
                )}

                {/* VIEW 11: ALTERNATIVES ENGINE */}
                {currentView === "alternatives" && (
                  <AlternativesEngineView
                    stream={stream}
                    score={score}
                    onOpenFacultyDrawer={(f) => setActiveAuditedFaculty(f)}
                    onToggleCompare={handleToggleCompare}
                    comparedIds={comparedIds}
                  />
                )}

                {/* VIEW 12: CAREER OBSERVATORY */}
                {currentView === "careers" && <CareerObservatoryView />}

                {/* VIEW 13: TIMELINE & CHECKLIST */}
                {currentView === "timeline" && <TimelineChecklistView />}

                {/* VIEW 14: PROFILE & PARENT REPORT */}
                {currentView === "profile" && (
                  <ProfileVaultView
                    studentName={studentName}
                    onUpdateStudentName={(n) => setStudentName(n)}
                    stream={stream}
                    onUpdateStream={(s) => setStream(s)}
                    score={score}
                    onUpdateScore={(s) => setScore(s)}
                    budget={budget}
                    onUpdateBudget={(b) => setBudget(b)}
                    governorate={governorate}
                    onUpdateGovernorate={(g) => setGovernorate(g)}
                    livingMode={livingMode}
                    onUpdateLivingMode={(m) => setLivingMode(m)}
                    bookmarkedIds={bookmarkedIds}
                    onRemoveBookmark={handleRemoveBookmark}
                    onOpenFacultyDrawer={(f) => setActiveAuditedFaculty(f)}
                    topFaculties={topFaculties}
                  />
                )}

                {/* VIEW 15: ADMIN STAFF PORTAL */}
                {currentView === "admin" && (
                  <AdminPortalView
                    onOpenFacultyDrawer={(f) => setActiveAuditedFaculty(f)}
                  />
                )}

                {/* Enterprise Multi-Column Footer */}
                <EnterpriseFooter onSelectView={(v) => setCurrentView(v)} />
              </main>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
