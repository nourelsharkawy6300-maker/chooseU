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
} from "lucide-react";
import { useStudent } from "@/context/StudentContext";

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
    label: "حاسبة المصروفات ونفقات المعيشة (TCO)",
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
  const { stream, scorePercentage, annualBudgetEgp } = useStudent();

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
      <div className="flex min-h-screen w-full bg-[#0F172A] text-slate-100">
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0F172A]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:shrink-0 border-l border-slate-800 bg-[#0F172A]">
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-lg tracking-tight">
              U
            </div>
            <div>
              <span className="block text-base font-bold tracking-tight text-white">
                ChooseU
              </span>
              <span className="block text-[11px] text-slate-400">
                التدقيق الأكاديمي والمالي
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
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
                    ? "bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold"
                    : "text-slate-300 hover:bg-slate-800/70 hover:text-white border border-transparent"
                }`}
              >
                <IconComponent
                  className={`mt-0.5 h-4 w-4 shrink-0 transition-colors ${
                    isActive ? "text-indigo-400" : "text-slate-400 group-hover:text-indigo-400"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-medium ${isActive ? "text-white" : "text-slate-200 group-hover:text-white"}`}>
                    {item.label}
                  </p>
                  <p className={`truncate text-xs ${isActive ? "text-indigo-200/80" : "text-slate-400"}`}>
                    {item.sublabel}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-4 space-y-3 bg-slate-900/40">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              بيانات التنسيق والمصروفات محدثة
            </span>
            <span className="font-mono text-[11px] text-slate-400">2026/2027</span>
          </div>
          <Link
            href="/admin"
            className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
          >
            <span className="flex items-center gap-2">
              <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
              بوابة المراجعين (Staff Admin)
            </span>
            <span className="font-mono text-[10px] text-slate-400">/admin</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden bg-[#0B1120]">
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-800 bg-[#0F172A] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileNavOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="فتح القائمة"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Live Student Context Pills */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
              <div className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs">
                <GraduationCap className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                <span className="text-slate-400 hidden sm:inline">الشعبة:</span>
                <span className="font-semibold text-slate-100 whitespace-nowrap">
                  {streamDisplay}
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs">
                <Percent className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="text-slate-400 hidden sm:inline">المجموع:</span>
                <span className="font-mono font-semibold text-slate-100 tabular-nums whitespace-nowrap">
                  {scorePercentage.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs">
                <Wallet className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span className="text-slate-400 hidden md:inline">الميزانية السنوية:</span>
                <span className="font-mono font-semibold text-slate-100 tabular-nums whitespace-nowrap">
                  {annualBudgetEgp.toLocaleString()} EGP
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/workspace"
              className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-slate-400" />
              <span>تعديل المعايير</span>
            </Link>
            <Link
              href="/sample-report"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-indigo-500"
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>التقرير النهائي</span>
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
            <div className="fixed inset-y-0 right-0 w-72 bg-[#0F172A] border-l border-slate-800 p-4 flex flex-col justify-between shadow-2xl z-50">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                      U
                    </div>
                    <span className="font-bold text-white">ChooseU</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileNavOpen(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
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
                            ? "bg-blue-600/20 text-blue-300 border border-blue-500/30 font-semibold"
                            : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                        }`}
                      >
                        <IconComponent className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{item.label}</p>
                          <p className="truncate text-xs text-slate-400">{item.sublabel}</p>
                        </div>
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="border-t border-slate-800 pt-3">
                <Link
                  href="/admin"
                  onClick={() => setIsMobileNavOpen(false)}
                  className="flex items-center gap-2 rounded-lg bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-slate-300"
                >
                  <ShieldCheck className="h-4 w-4 text-blue-400" />
                  <span>بوابة المراجعين (Staff Admin)</span>
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
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
