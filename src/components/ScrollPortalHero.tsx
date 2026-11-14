"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  Search,
  Sparkles,
  UserCheck,
  Compass,
  ArrowRight,
} from "lucide-react";
import { StreamType, EnterpriseViewKey } from "@/types/chooseu";

interface ScrollPortalHeroProps {
  onNavigateView: (view: EnterpriseViewKey) => void;
  onEnterDemoMode: () => void;
  onOpenCommandPalette: () => void;
  studentName?: string;
  stream: StreamType;
  score: number;
  onUpdateScore: (score: number) => void;
  onUpdateStream: (stream: StreamType) => void;
}

const LETTERS = ["C", "h", "o", "o", "s", "e", "U"];

export function ScrollPortalHero({
  onNavigateView,
  onEnterDemoMode,
  onOpenCommandPalette,
  studentName = "عمر خالد محمود",
  stream,
  score,
  onUpdateScore,
  onUpdateStream,
}: ScrollPortalHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState<number>(0);
  const [hoveredLetter, setHoveredLetter] = useState<number | null>(null);
  const [waveIndex, setWaveIndex] = useState<number>(-1);

  // Smooth 60fps Scroll Progress Listener (0.0 -> 1.0)
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (!containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const maxDistance = rect.height - window.innerHeight;
          if (maxDistance > 0) {
            const currentScroll = -rect.top;
            const p = Math.max(0, Math.min(1, currentScroll / maxDistance));
            setProgress(p);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Continuous wave animation for letters when not scrolled
  useEffect(() => {
    if (progress > 0.1) return;
    let i = 0;
    const interval = setInterval(() => {
      setWaveIndex(i % LETTERS.length);
      i++;
      if (i >= LETTERS.length) {
        setTimeout(() => setWaveIndex(-1), 300);
        i = LETTERS.length + 2; // pause before next wave
        if (i > LETTERS.length + 4) i = 0;
      }
    }, 120);
    return () => clearInterval(interval);
  }, [progress]);

  // Smooth scroll helper
  const scrollToNext = () => {
    const el = document.getElementById("chapter-possibility");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: window.innerHeight * 2.8, behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Scroll-Scrubbed Calculations ──────────────────────────────────────────

  // Phase 1 (0 → 0.55): Letters zoom + scatter
  const wordScale = 1 + progress * 14;
  const wordOpacity =
    progress > 0.82 ? Math.max(0, 1 - (progress - 0.82) * 5.8) : 1;

  // Phase 2 (0.35 → 1.0): Emerge section fades in behind letters
  const emergeP =
    progress < 0.35 ? 0 : Math.min(1, (progress - 0.35) / 0.65);
  const emergeScale = 0.82 + emergeP * 0.18;
  const emergeOpacity = emergeP;

  // Docked Header Trigger (p >= 0.85)
  const isHeaderDocked = progress >= 0.85;

  const streamLabel =
    stream === "Science"
      ? "علمي علوم"
      : stream === "Math"
      ? "علمي رياضة"
      : "أدبي";

  return (
    <div
      ref={containerRef}
      className="relative w-full no-print"
      style={{ height: "280vh" }}
    >
      {/* ================================================================= */}
      {/* STICKY VIEWPORT — 100vh pinned during the 280vh scroll track       */}
      {/* ================================================================= */}
      <div
        className="sticky top-0 w-full overflow-hidden bg-[#0F172A] text-white flex flex-col justify-between select-none"
        style={{ height: "100vh" }}
      >
        {/* Background Architectural Grid Pattern */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PHASE 1 — SCROLL-SCRUBBED LETTER ZOOM                          */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{
            opacity: wordOpacity,
            transform: `scale(${wordScale})`,
            willChange: "transform, opacity",
          }}
        >
          <div className="flex items-center gap-2 sm:gap-3" dir="ltr">
            {LETTERS.map((letter, idx) => {
              const isHovered = hoveredLetter === idx;
              const isWave = waveIndex === idx;
              const offset =
                progress > 0.05
                  ? (idx - 3) * progress * 60
                  : 0;
              const letterScale =
                isHovered || isWave ? 1.25 : 1;
              const letterColor =
                letter === "U"
                  ? "#2563EB"
                  : isHovered || isWave
                  ? "#60A5FA"
                  : "#FFFFFF";

              return (
                <span
                  key={idx}
                  onMouseEnter={() => setHoveredLetter(idx)}
                  onMouseLeave={() => setHoveredLetter(null)}
                  className="font-black leading-none tracking-tighter pointer-events-auto cursor-default"
                  style={{
                    fontSize: "clamp(3rem, 10vw, 7rem)",
                    color: letterColor,
                    transform: `translate3d(${offset}px, ${
                      isHovered || isWave ? "-8px" : "0px"
                    }, 0) scale(${letterScale})`,
                    transition:
                      "transform 0.2s cubic-bezier(0.34,1.56,0.64,1), color 0.2s ease",
                    willChange: "transform, color",
                    display: "inline-block",
                    textShadow:
                      isHovered || isWave
                        ? "0 0 32px rgba(37,99,235,0.6)"
                        : "none",
                  }}
                >
                  {letter}
                </span>
              );
            })}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* PHASE 2 — EMERGING PORTAL CONTENT (fades in at p > 0.35)       */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div
          className="absolute inset-0 z-20 flex flex-col items-center justify-center px-4 gap-8 pointer-events-none"
          style={{
            opacity: emergeOpacity,
            transform: `scale(${emergeScale})`,
            willChange: "transform, opacity",
            pointerEvents: emergeP > 0.5 ? "auto" : "none",
          }}
        >
          {/* Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/25 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-blue-400 stroke-[1.5]" />
            <span className="text-[11px] font-semibold text-blue-300 tracking-widest uppercase">
              AI-Powered · مدعوم بالذكاء الاصطناعي
            </span>
          </div>

          {/* Headline */}
          <div className="text-center space-y-3 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              اكتشف مسارك الجامعي
              <br />
              <span className="text-blue-400">بدقة حسابية حقيقية</span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
              محرك تنسيق ذكي يحلل درجاتك، اهتماماتك، وسوق العمل — ليرشدك إلى
              الكلية المثالية من بين آلاف الخيارات.
            </p>
          </div>

          {/* Portal Card — Score + Stream + CTAs */}
          <div className="w-full max-w-sm bg-[#1E293B] border border-slate-700 rounded-xl p-4 space-y-4 shadow-2xl">
            {/* Stream Toggle */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400">
                المسار الدراسي:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                {(["Science", "Math", "Arts"] as StreamType[]).map((s) => {
                  const labels: Record<StreamType, string> = {
                    Science: "علمي علوم",
                    Math: "علمي رياضة",
                    Arts: "أدبي",
                  };
                  return (
                    <button
                      key={s}
                      type="button"
                      onClick={() => onUpdateStream(s)}
                      className={`py-1.5 rounded-lg text-[11px] font-bold border transition-colors cursor-pointer ${
                        stream === s
                          ? "bg-blue-600 border-blue-500 text-white"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500"
                      }`}
                    >
                      {labels[s]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Score Slider & Live Output */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  مجموع الثانوية العامة:
                </span>
                <span className="text-xl font-mono font-bold text-white tabular-nums">
                  {score.toFixed(1)}%
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                step="0.1"
                value={score}
                onChange={(e) => onUpdateScore(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {/* Action Buttons inside Portal Card */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => onNavigateView("dashboard")}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[12px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>دخول مساحة العمل</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2]" />
              </button>
              <button
                type="button"
                onClick={onEnterDemoMode}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1"
              >
                <UserCheck className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Demo</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================================================================= */}
        {/* BOTTOM SCROLL INDICATOR (fades out as user scrolls)               */}
        {/* ================================================================= */}
        <div
          style={{ opacity: Math.max(0, 1 - progress * 1.8) }}
          className="relative z-30 w-full px-6 py-6 flex flex-col items-center justify-center gap-2.5 text-center"
        >
          <button
            type="button"
            onClick={scrollToNext}
            className="text-[12px] text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <span>
              حرّك بكرة الماوس للدخول إلى مستقبلك • Scroll into possibility
            </span>
            <ChevronDown className="w-4 h-4 text-blue-400 animate-bounce" />
          </button>

          {/* Animated scroll progress line */}
          <div className="w-48 bg-slate-800 h-[2px] rounded-full overflow-hidden relative">
            <div
              dir="ltr"
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-75 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ================================================================= */}
      {/* STICKY DOCKED NAVBAR (appears at p >= 0.85)                        */}
      {/* ================================================================= */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16 bg-[#0F172A]/95 border-b border-slate-800 text-white px-4 sm:px-6 flex items-center justify-between gap-3 shadow-xl transition-all duration-300 no-print ${
          isHeaderDocked
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Right side: Logo + Chapter Links */}
        <div className="flex items-center gap-4">
          <div
            onClick={scrollToTop}
            className="flex items-center gap-2 cursor-pointer group"
            title="العودة لأعلى الصفحة"
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
            <span
              dir="ltr"
              className="font-black text-lg tracking-tight font-sans text-white"
            >
              Choose<span className="text-blue-500">U</span>
            </span>
          </div>

          {/* Chapter Quick Links */}
          <nav className="hidden lg:flex items-center gap-3 text-[11px] font-mono text-slate-400 border-r border-slate-700 pr-3 mr-1">
            <a
              href="#chapter-possibility"
              className="hover:text-white transition-colors"
            >
              01 الإمكانية
            </a>
            <a
              href="#chapter-sectors"
              className="hover:text-white transition-colors"
            >
              02 القطاعات
            </a>
            <a
              href="#chapter-methodology"
              className="hover:text-white transition-colors"
            >
              03 المنهجية
            </a>
            <button
              onClick={() => onNavigateView("dashboard")}
              className="text-blue-400 hover:text-blue-300 font-bold transition-colors cursor-pointer"
            >
              04 مساحة العمل ←
            </button>
          </nav>
        </div>

        {/* Center: Command Palette Trigger */}
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="hidden md:flex items-center justify-between gap-3 w-56 lg:w-72 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700 rounded-lg text-slate-400 text-[11px] transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 stroke-[1.5]" />
            <span>ابحث في كل الكليات والصفحات...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[9px] font-mono text-slate-400 bg-slate-800 border border-slate-700 rounded">
            Ctrl+K
          </kbd>
        </button>

        {/* Left side: Student Info & CTAs */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px]">
            <span className="font-semibold text-slate-200">{studentName}</span>
            <span className="text-[10px] text-blue-400 font-bold">
              {streamLabel}
            </span>
            <span className="font-mono text-white tabular-nums">{score}%</span>
          </div>

          <button
            type="button"
            onClick={onEnterDemoMode}
            className="flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400 stroke-[1.5]" />
            <span className="hidden sm:inline">حساب تجريبي (Demo)</span>
            <span className="sm:hidden">تجريبي</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateView("dashboard")}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
          >
            مساحة العمل
          </button>
        </div>
      </header>
    </div>
  );
}
