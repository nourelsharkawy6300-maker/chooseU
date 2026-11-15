"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Compass,
  Calculator,
  Building2,
  Milestone,
  FileCheck2,
  Receipt,
  ShieldCheck,
  SlidersHorizontal,
  GraduationCap,
  Wallet,
  Percent,
  Menu,
  X,
  Check,
} from "lucide-react";
import { useStudent } from "@/context/StudentContext";
import { StreamType } from "@/types/chooseu";

interface NavItem {
  label: string;
  sublabel: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAVIGATION_ITEMS: NavItem[] = [
  {
    label: "لوحة التحكم وتنسيق الرغبات",
    sublabel: "خطوات التنسيق واختبار الميول",
    href: "/workspace",
    icon: Compass,
  },
  {
    label: "حاسبة التكلفة",
    sublabel: "حساب تكلفة السنوات الأربع والتضخم",
    href: "/tco-matrix",
    icon: Calculator,
  },
  {
    label: "دليل الجامعات والبرامج",
    sublabel: "الجامعات الحكومية والأهلية والخاصة",
    href: "/universities",
    icon: Building2,
  },
  {
    label: "دليل الوظائف وسوق العمل",
    sublabel: "المسارات الوظيفية والمهارات المطلوبة",
    href: "/future-me",
    icon: Milestone,
  },
  {
    label: "التقرير الاستشاري (A4)",
    sublabel: "النسخة المعتمدة والمراجعة الأكاديمية",
    href: "/sample-report",
    icon: FileCheck2,
  },
  {
    label: "متابعة الطلب",
    sublabel: "بوابة InstaPay وحالة المراجعة",
    href: "/track-order",
    icon: Receipt,
  },
];

export function AppShellClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const {
    stream,
    scorePercentage,
    annualBudgetEgp,
    setStream,
    setScorePercentage,
    setAnnualBudgetEgp,
  } = useStudent();

  const streamDisplay =
    stream === "Science"
      ? "علمي علوم (Science)"
      : stream === "Math"
      ? "علمي رياضة (Math)"
      : stream === "stem"
      ? "مدارس STEM (النسبة المرنة)"
      : "أدبي (Arts)";

  if (isAdmin) {
    return (
      <div className="flex min-h-screen w-full bg-[var(--paper)] text-slate-900">
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--paper)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:shrink-0 border-l border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg tracking-tight">
              U
            </div>
            <div>
              <span className="block text-base font-bold tracking-tight text-slate-900">
                ChooseU
              </span>
              <span className="block text-[11px] text-slate-500">
                التدقيق الأكاديمي والمالي
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-medium text-slate-500">
            أقسام المنصة
          </div>
          {NAVIGATION_ITEMS.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200 font-semibold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent"
                }`}
              >
                <IconComponent
                  className={`mt-0.5 h-4 w-4 shrink-0 transition-colors ${
                    isActive ? "text-blue-600" : "text-slate-400 group-hover:text-blue-600"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-medium ${isActive ? "text-blue-900" : "text-slate-700 group-hover:text-slate-900"}`}>
                    {item.label}
                  </p>
                  <p className={`truncate text-xs ${isActive ? "text-blue-600" : "text-slate-500"}`}>
                    {item.sublabel}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4 space-y-3 bg-slate-50/70">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              بيانات التنسيق والمصروفات محدثة
            </span>
            <span className="text-[11px] text-slate-500">
              <span dir="ltr" className="font-mono tabular-nums">2026/2027</span>
            </span>
          </div>
          <Link
            href="/admin"
            className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              دخول الإدارة
            </span>
            <span dir="ltr" className="font-mono text-[10px] text-slate-500">/admin</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden bg-[var(--paper)]">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="فتح القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Live Student Context Pills with Quick Inline Edit Click */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                title="اضغط لتعديل الشعبة والمجموع والميزانية"
                className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 hover:border-slate-300 px-3 py-1.5 text-xs transition-colors cursor-pointer"
              >
                <GraduationCap className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="text-slate-500 hidden sm:inline">الشعبة:</span>
                <span className="font-semibold text-slate-900 whitespace-nowrap">
                  {streamDisplay}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                title="اضغط لتعديل المجموع"
                className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 hover:border-slate-300 px-3 py-1.5 text-xs transition-colors cursor-pointer"
              >
                <Percent className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                <span className="text-slate-500 hidden sm:inline">المجموع:</span>
                <span dir="ltr" className="font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                  {scorePercentage.toFixed(1)}%
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                title="اضغط لتعديل الميزانية السنوية"
                className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 hover:border-slate-300 px-3 py-1.5 text-xs transition-colors cursor-pointer"
              >
                <Wallet className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span className="text-slate-500 hidden md:inline">الميزانية السنوية:</span>
                <span dir="ltr" className="font-mono font-semibold text-slate-900 tabular-nums whitespace-nowrap">
                  {annualBudgetEgp.toLocaleString()} EGP
                </span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900 cursor-pointer"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
              <span>بياناتي</span>
            </button>
            <Link
              href="/sample-report"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-blue-500"
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>تقريري</span>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMobileNavOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 w-72 bg-white border-l border-slate-200 p-4 flex flex-col justify-between shadow-2xl z-50">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                      U
                    </div>
                    <span className="font-bold text-slate-900">ChooseU</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {NAVIGATION_ITEMS.map((item) => {
                    const IconComponent = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileNavOpen(false)}
                        className={`flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-blue-50 text-blue-700 border border-blue-200 font-semibold"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`}
                      >
                        <IconComponent className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{item.label}</p>
                          <p className="truncate text-xs text-slate-500">{item.sublabel}</p>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="border-t border-slate-200 pt-3">
                <Link
                  href="/admin"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-700 hover:bg-slate-100"
                >
                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                  <span>دخول الإدارة</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Scrollable Canvas */}
        <main
          id="chooseu-main-canvas"
          className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
            {children}
          </div>
        </main>

        {/* Quick Profile Editor Modal */}
        {isEditingProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
            <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-bold text-slate-900">
                    تعديل الملف الأكاديمي ومعايير التنسيق
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Stream Selection */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700">
                  الشعبة في الثانوية العامة:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(
                    [
                      { id: "Math", label: "علمي رياضة" },
                      { id: "Science", label: "علمي علوم" },
                      { id: "stem", label: "مدارس STEM (النسبة المرنة)" },
                      { id: "Arts", label: "أدبي" },
                    ] as const
                  ).map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setStream(s.id as StreamType)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                        stream === s.id
                          ? "bg-blue-50 text-blue-700 border-blue-300"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <span>{s.label}</span>
                      {stream === s.id && <Check className="h-3.5 w-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Score Percentage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                  <label htmlFor="modal-score-input">المجموع بالنسبة المئوية:</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="modal-score-input"
                      type="number"
                      min={50}
                      max={100}
                      step={0.1}
                      value={scorePercentage}
                      onChange={(e) => setScorePercentage(parseFloat(e.target.value) || 50)}
                      className="w-20 rounded border border-slate-300 bg-white px-2 py-1 text-right font-mono text-xs font-bold text-emerald-700 focus:border-blue-500 focus:outline-none"
                    />
                    <span className="font-mono text-slate-500 text-xs">%</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={50}
                  max={100}
                  step={0.1}
                  value={scorePercentage}
                  onChange={(e) => setScorePercentage(parseFloat(e.target.value))}
                  className="w-full cursor-pointer"
                />
              </div>

              {/* Annual Budget */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-medium text-slate-700">
                  <label htmlFor="modal-budget-input">سقف الميزانية السنوية (المصروفات فقط):</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="modal-budget-input"
                      type="number"
                      min={0}
                      max={300000}
                      step={5000}
                      value={annualBudgetEgp}
                      onChange={(e) => setAnnualBudgetEgp(parseInt(e.target.value, 10) || 0)}
                      className="w-28 rounded border border-slate-300 bg-white px-2 py-1 text-right font-mono text-xs font-bold text-amber-700 focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-slate-500 text-xs">ج.م</span>
                  </div>
                </div>
                <input
                  type="range"
                  min={0}
                  max={300000}
                  step={5000}
                  value={annualBudgetEgp}
                  onChange={(e) => setAnnualBudgetEgp(parseInt(e.target.value, 10))}
                  className="w-full cursor-pointer"
                />

                {/* Budget Preset Chips */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500">خيارات سريعة:</span>
                  {[50000, 100000, 150000, 200000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAnnualBudgetEgp(preset)}
                      className={`px-2 py-0.5 rounded text-[11px] border transition-colors cursor-pointer ${
                        annualBudgetEgp === preset
                          ? "bg-amber-50 text-amber-800 border-amber-300 font-semibold"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <span dir="ltr" className="font-mono tabular-nums">{(preset / 1000).toFixed(0)}k</span> ج.م
                    </button>
                  ))}
                </div>
              </div>

              {/* Confirm / Close Button */}
              <button
                type="button"
                onClick={() => setIsEditingProfile(false)}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors cursor-pointer shadow-md"
              >
                تطبيق وتحديث نتائج التنسيق والمصفوفة
              </button>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation Bar (Screens < 1024px) */}
        <nav
          id="app-mobile-nav"
          className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 flex items-center justify-around py-1.5 px-2 no-print"
        >
          {[
            { label: "التنسيق", href: "/workspace", icon: Compass },
            { label: "المصروفات", href: "/tco-matrix", icon: Calculator },
            { label: "الجامعات", href: "/universities", icon: Building2 },
            { label: "سوق العمل", href: "/future-me", icon: Milestone },
            { label: "التقرير A4", href: "/sample-report", icon: FileCheck2 },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-lg text-[11px] font-medium transition-colors ${
                  isActive
                    ? "text-blue-600 font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
