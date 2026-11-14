"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronDown,
  Search,
  Sparkles,
  UserCheck,
  Compass,
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

  // 1. Zoom and Divergence Calculations
  const wordScale = 1 + progress * 14;
  const wordOpacity = progress > 0.82 ? Math.max(0, 1 - (progress - 0.82) * 5.8) : 1;

  // 2. Emerging Section calculations (p from 0.35 to 1.0)
  const emergeP = progress < 0.35 ? 0 : Math.min(1, (progress - 0.35) / 0.65);
  const emergeScale = 0.82 + emergeP * 0.18;
  const emergeOpacity = emergeP;

  // 3. Docked Header Trigger (p >= 0.85)
  const isHeaderDocked = progress >= 0.85;

  const streamLabel =
    stream === "Science" ? "علمي علوم" : stream === "Math" ? "علمي رياضة" : "أدبي";

  return (
    <div
      ref={containerRef}
      className="relative w-full no-print"
      style={{ height: "280vh" }}
    >
      {/* ==================================================================== */}
      {/* STICKY VIEWPORT (100vh pinned during 280vh scroll track)             */}
      {/* ==================================================================== */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#0F172A] text-white flex flex-col justify-between select-none">
        {/* Background Architectural Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #FFFFFF 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF 1px, transparent 1px)`,
            backgroundSize: "32px 32px",
          }}
        />

        {/* Ambient Center Radial Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none transition-opacity duration-300"
          style={{ opacity: 1 - progress * 0.5 }}
        />

        {/* ================================================================== */}
        {/* TOP METADATA BAR (p = 0 -> 1 progress counter)                     */}
        {/* ================================================================== */}
        <div className="relative z-20 w-full px-6 py-4 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="tracking-wider text-slate-300 font-bold">
              CHOOSEU® / THE OPENING — 0 → 1
            </span>
          </div>

          {/* Center progress indicator pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-400">
            <span>SCROLL PROGRESS:</span>
            <span className="font-bold text-white tabular-nums">
              {(progress * 100).toFixed(0)}%
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-500 hidden md:inline">26+ كليات معتمدة</span>
            <span className="text-slate-700 hidden md:inline">|</span>
            <span className="text-blue-400 font-semibold">تنسيق الجامعات 2026</span>
          </div>
        </div>

        {/* ================================================================== */}
        {/* CENTER STAGE: EXPLOSIVE SCATTERING 'ChooseU' LETTERS               */}
        {/* ================================================================== */}
        <div className="relative z-10 my-auto flex items-center justify-center w-full px-4 perspective-1000">
          {/* A. The Massive Zooming & Scattering Word Container */}
          <div
            dir="ltr"
            style={{
              transform: `scale(${wordScale})`,
              opacity: wordOpacity,
              pointerEvents: progress > 0.75 ? "none" : "auto",
              transformOrigin: "center center",
            }}
            className="relative inline-flex items-center text-[62px] sm:text-[96px] md:text-[120px] font-black tracking-tight leading-none font-sans will-change-transform"
          >
            {/* Letter 1: 'C' (Flies far left & up) */}
            <span
              onMouseEnter={() => setHoveredLetter(0)}
              onMouseLeave={() => setHoveredLetter(null)}
              style={{
                transform: `translate3d(${-progress * 900}px, ${-progress * 350}px, 0) rotate(${-progress * 12}deg)`,
                display: "inline-block",
                filter: hoveredLetter === 0 ? "drop-shadow(0 0 24px rgba(37,99,235,1))" : "none",
                willChange: "transform",
              }}
              className="relative text-white hover:text-blue-400 cursor-pointer transition-colors duration-150"
            >
              C
            </span>

            {/* Letter 2: 'h' (Flies left & down) */}
            <span
              onMouseEnter={() => setHoveredLetter(1)}
              onMouseLeave={() => setHoveredLetter(null)}
              style={{
                transform: `translate3d(${-progress * 550}px, ${progress * 420}px, 0) rotate(${progress * 8}deg)`,
                display: "inline-block",
                filter: hoveredLetter === 1 ? "drop-shadow(0 0 24px rgba(37,99,235,1))" : "none",
                willChange: "transform",
              }}
              className="relative text-white hover:text-blue-400 cursor-pointer transition-colors duration-150"
            >
              h
            </span>

            {/* Letter 3: 'o' 1st (Flies up-left) */}
            <span
              onMouseEnter={() => setHoveredLetter(2)}
              onMouseLeave={() => setHoveredLetter(null)}
              style={{
                transform: `translate3d(${-progress * 250}px, ${-progress * 500}px, 0)`,
                display: "inline-block",
                filter: hoveredLetter === 2 ? "drop-shadow(0 0 24px rgba(37,99,235,1))" : "none",
                willChange: "transform",
              }}
              className="relative text-white hover:text-blue-400 cursor-pointer transition-colors duration-150"
            >
              o
            </span>

            {/* Letter 4: 'o' 2nd (Zooms straight past camera center & fades into portal glow) */}
            <span
              onMouseEnter={() => setHoveredLetter(3)}
              onMouseLeave={() => setHoveredLetter(null)}
              style={{
                transform: `scale(${1 + progress * 6})`,
                opacity: progress > 0.35 ? Math.max(0, 1 - (progress - 0.35) * 3) : 1,
                display: "inline-block",
                filter: hoveredLetter === 3 ? "drop-shadow(0 0 24px rgba(37,99,235,1))" : "none",
                willChange: "transform, opacity",
              }}
              className="relative text-white hover:text-blue-400 cursor-pointer transition-colors duration-150"
            >
              o
            </span>

            {/* Letter 5: 's' (Flies down-right) */}
            <span
              onMouseEnter={() => setHoveredLetter(4)}
              onMouseLeave={() => setHoveredLetter(null)}
              style={{
                transform: `translate3d(${progress * 300}px, ${progress * 480}px, 0)`,
                display: "inline-block",
                filter: hoveredLetter === 4 ? "drop-shadow(0 0 24px rgba(37,99,235,1))" : "none",
                willChange: "transform",
              }}
              className="relative text-white hover:text-blue-400 cursor-pointer transition-colors duration-150"
            >
              s
            </span>

            {/* Letter 6: 'e' (Flies right & up) */}
            <span
              onMouseEnter={() => setHoveredLetter(5)}
              onMouseLeave={() => setHoveredLetter(null)}
              style={{
                transform: `translate3d(${progress * 600}px, ${-progress * 380}px, 0) rotate(${progress * 10}deg)`,
                display: "inline-block",
                filter: hoveredLetter === 5 ? "drop-shadow(0 0 24px rgba(37,99,235,1))" : "none",
                willChange: "transform",
              }}
              className="relative text-white hover:text-blue-400 cursor-pointer transition-colors duration-150"
            >
              e
            </span>

            {/* Letter 7: 'U' (Royal Blue #2563EB - Flies far right & down) */}
            <span
              onMouseEnter={() => setHoveredLetter(6)}
              onMouseLeave={() => setHoveredLetter(null)}
              style={{
                transform: `translate3d(${progress * 950}px, ${progress * 320}px, 0) rotate(${-progress * 14}deg)`,
                display: "inline-block",
                filter: "drop-shadow(0 0 28px rgba(37,99,235,0.9))",
                willChange: "transform",
              }}
              className="relative text-blue-500 hover:text-blue-400 cursor-pointer transition-colors duration-150"
            >
              U
            </span>
          </div>

          {/* B. The Emerging Section through the gap (p from 0.35 to 1.0) */}
          <div
            dir="rtl"
            style={{
              transform: `scale(${emergeScale})`,
              opacity: emergeOpacity,
              pointerEvents: progress > 0.65 ? "auto" : "none",
              willChange: "transform, opacity",
            }}
            className="absolute inset-0 flex flex-col items-center justify-center max-w-2xl mx-auto px-4 text-center space-y-5"
          >
            {/* Numbered Chapter Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-mono tracking-wider">
              <Sparkles className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>01 / البداية والقرار — THE THRESHOLD</span>
            </div>

            {/* Headline */}
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white leading-tight">
              المستقبل الأكاديمي يبدأ من هنا
            </h1>
            <p className="text-[13px] sm:text-[15px] text-slate-300 max-w-lg leading-relaxed">
              تحليل خوارزمي دقيق لـ 26+ كلية ومصروفات 4 سنوات كاملة (TCO) مع بدائل ذكية تناسب مجموعك وميزانيتك.
            </p>

            {/* Interactive Quick-Score Simulator Card */}
            <div className="w-full max-w-md bg-slate-900/90 border border-slate-700/80 rounded-xl p-4 shadow-2xl backdrop-blur-md space-y-3.5 text-right">
              {/* Stream Switcher */}
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-400 font-medium">الشعبة الثانوية:</span>
                <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
                  {(["Science", "Math", "Arts"] as StreamType[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => onUpdateStream(st)}
                      className={`px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                        stream === st
                          ? "bg-blue-600 text-white shadow-2xs"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      {st === "Science" ? "علمي علوم" : st === "Math" ? "علمي رياضة" : "أدبي"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Score Slider & Live Output */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">مجموع الثانوية العامة:</span>
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
                  <span>دخول مساحة العمل ←</span>
                </button>
                <button
                  type="button"
                  onClick={onEnterDemoMode}
                  className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <UserCheck className="w-3.5 h-3.5 stroke-[1.5]" />
                  <span>حساب تجريبي (Demo)</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ================================================================== */}
        {/* BOTTOM SCROLL INDICATOR (0 -> 1 progress line)                     */}
        {/* ================================================================== */}
        <div
          style={{ opacity: 1 - progress * 1.8 }}
          className="relative z-20 w-full px-6 py-6 flex flex-col items-center justify-center gap-2.5 text-center transition-opacity"
        >
          <button
            type="button"
            onClick={scrollToNext}
            className="text-[12px] text-slate-400 hover:text-white transition-colors flex items-center gap-1.5 font-medium cursor-pointer"
          >
            <span>حرّك بكرة الماوس للدخول إلى مستقبلك • Scroll into possibility</span>
            <ChevronDown className="w-4 h-4 text-blue-400 animate-bounce" />
          </button>

          {/* Animated 0 -> 1 progress line */}
          <div className="w-48 bg-slate-800 h-[2px] rounded-full overflow-hidden relative">
            <div
              dir="ltr"
              className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-75 ease-out"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* 3. STICKY TOP NAVBAR DOCKING (p >= 0.85)                             */}
      {/* ==================================================================== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 h-16 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800 text-white px-4 sm:px-6 flex items-center justify-between gap-3 shadow-xl transition-all duration-300 no-print ${
          isHeaderDocked
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        {/* Right side: Logo + Numbered Chapter Links */}
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

          {/* Numbered Chapter Quick Links */}
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

        {/* Left side: Student Info & Action CTAs */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px]">
            <span className="font-semibold text-slate-200">{studentName}</span>
            <span className="text-[10px] text-blue-400 font-bold">{streamLabel}</span>
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
