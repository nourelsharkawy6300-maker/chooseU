"use client";

import React from "react";
import {
  Menu,
  Search,
  UserCheck,
  RotateCcw,
} from "lucide-react";
import { StreamType } from "@/types/chooseu";

interface TopCommandBarProps {
  onOpenMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
  studentName: string;
  stream: StreamType;
  score: number;
  onToggleDemoMode: () => void;
  onReplayIntro: () => void;
  currentViewTitle: string;
}

export function TopCommandBar({
  onOpenMobileSidebar,
  onOpenCommandPalette,
  studentName,
  stream,
  score,
  onToggleDemoMode,
  onReplayIntro,
  currentViewTitle,
}: TopCommandBarProps) {
  const streamLabel =
    stream === "Science" ? "علمي علوم" : stream === "Math" ? "علمي رياضة" : "أدبي";

  return (
    <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-xs no-print">
      {/* Right side: Mobile Menu Toggle & View Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
        >
          <Menu className="w-5 h-5 stroke-[1.5]" />
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline-block">
            ChooseU 2026 /
          </span>
          <h1 className="text-[15px] font-bold text-slate-900 truncate">
            {currentViewTitle}
          </h1>
        </div>
      </div>

      {/* Center: Global Search / Command Palette (Ctrl+K) Trigger */}
      <button
        type="button"
        onClick={onOpenCommandPalette}
        className="hidden md:flex items-center justify-between gap-3 w-64 lg:w-80 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 text-[12px] transition-colors cursor-pointer text-right"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-slate-400 stroke-[1.5]" />
          <span>ابحث في كل الكليات والصفحات...</span>
        </div>
        <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-600 bg-white border border-slate-200 rounded shadow-2xs">
          Ctrl+K
        </kbd>
      </button>

      {/* Left side: Student Quick Chip & Demo Mode CTA */}
      <div className="flex items-center gap-2">
        {/* Student Quick Pill */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-lg text-[11px]">
          <span className="font-semibold text-slate-800 truncate max-w-[110px]">
            {studentName}
          </span>
          <span className="text-[10px] font-bold text-blue-700 bg-white px-1.5 py-0.2 rounded border border-slate-200">
            {streamLabel}
          </span>
          <span className="font-bold text-slate-900 tabular-nums">{score}%</span>
        </div>

        {/* 1-Click Instant Demo Mode Button */}
        <button
          type="button"
          onClick={onToggleDemoMode}
          className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
          title="الدخول الفوري بحساب تجريبي كامل لتجربة كل الميزات بضغطة واحدة"
        >
          <UserCheck className="w-3.5 h-3.5 text-emerald-700 stroke-[1.5]" />
          <span className="hidden sm:inline">حساب تجريبي (Demo Mode)</span>
          <span className="sm:hidden">تجريبي</span>
        </button>

        {/* Replay Intro Splash Button */}
        <button
          type="button"
          onClick={onReplayIntro}
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
          title="إعادة تشغيل أنيميشن الدخول"
        >
          <RotateCcw className="w-4 h-4 stroke-[1.5]" />
        </button>
      </div>
    </header>
  );
}
