"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Compass,
  Bot,
  Calculator,
  Award,
  HeartHandshake,
  UserCheck,
  ClipboardCheck,
  FileText,
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
  LogOut,
  LogIn,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { FloatingAiAdvisor } from "./FloatingAiAdvisor";
import { useStudent } from "@/context/StudentContext";
import { StreamType } from "@/types/chooseu";
import { AnimatedCounter } from "./MotionPrimitives";

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
    label: "المنح الدراسية",
    sublabel: "منح محلية وجامعية ودولية مطابقة لك",
    href: "/scholarships",
    icon: Award,
  },
  {
    label: "وضع ولي الأمر",
    sublabel: "مشاركة القرار الأسري والملاحظات",
    href: "/parent-mode",
    icon: HeartHandshake,
  },
  {
    label: "استشارة الخبراء",
    sublabel: "مرشدون مهنيون وأكاديميون وطلاب جامعات",
    href: "/consultations",
    icon: UserCheck,
  },
  {
    label: "تقرير القرار الشامل",
    sublabel: "ملفك الكامل الموحد للطباعة وPDF",
    href: "/decision-report",
    icon: FileText,
  },
  {
    label: "خطة التنفيذ والمتابعة",
    sublabel: "القائمة المختصرة والمستندات والمواعيد",
    href: "/action-plan",
    icon: ClipboardCheck,
  },
  {
    label: "دليل الوظائف وسوق العمل",
    sublabel: "المسارات الوظيفية والمهارات المطلوبة",
    href: "/future-me",
    icon: Milestone,
  },
  {
    label: "المستشار الذكي",
    sublabel: "محادثة فورية مع الذكاء الاصطناعي",
    href: "/advisor",
    icon: Bot,
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
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const isStandalonePage =
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/onboarding") || pathname.startsWith("/auth");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const {
    studentName,
    stream,
    scorePercentage,
    annualBudgetEgp,
    authUser,
    syncStatus,
    setStream,
    setScorePercentage,
    setAnnualBudgetEgp,
    signOut,
  } = useStudent();

  const [modalScoreStr, setModalScoreStr] = useState<string>(scorePercentage.toString());
  const [modalBudgetStr, setModalBudgetStr] = useState<string>(annualBudgetEgp.toString());
  const [prevScore, setPrevScore] = useState(scorePercentage);
  const [prevBudget, setPrevBudget] = useState(annualBudgetEgp);

  if (scorePercentage !== prevScore) {
    setPrevScore(scorePercentage);
    setModalScoreStr(scorePercentage.toString());
  }

  if (annualBudgetEgp !== prevBudget) {
    setPrevBudget(annualBudgetEgp);
    setModalBudgetStr(annualBudgetEgp.toString());
  }

  const streamDisplay =
    stream === "Science"
      ? "علمي علوم"
      : stream === "Math"
      ? "علمي رياضة"
      : stream === "stem"
      ? "مدارس STEM"
      : "أدبي";

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      setIsMobileNavOpen(false);
      setIsEditingProfile(false);
      window.location.assign("/login");
    } finally {
      setSigningOut(false);
    }
  };

  if (isStandalonePage) {
    return (
      <div className="flex min-h-screen w-full bg-[var(--paper)] text-slate-900">
        <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth">
          {children}
        </main>
      <FloatingAiAdvisor />
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[var(--paper)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:shrink-0 border-l border-slate-200 bg-white">
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#FACC15] text-slate-950 font-bold text-lg tracking-tight">
              U
            </div>
            <div>
              <span className="block text-base font-bold tracking-tight text-slate-900">
                ChooseU
              </span>
              <span className="block text-xs text-slate-600 font-medium">
                دليلك الأكاديمي والمالي
              </span>
            </div>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
          <div className="px-3 pb-2 text-xs font-semibold text-slate-700">
            أقسام المنصة
          </div>
          {NAVIGATION_ITEMS.map((item, idx) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href;
            const indexStr = `0${idx + 1}`;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group relative flex items-start gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-[#1c1736] font-bold"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav-pill"
                    className="absolute inset-0 rounded-xl bg-amber-50/90 border border-amber-200/90 shadow-2xs"
                    transition={{
                      type: "spring",
                      stiffness: 380,
                      damping: 32,
                    }}
                  />
                )}
                <IconComponent
                  className={`relative z-10 mt-0.5 h-4 w-4 shrink-0 transition-colors duration-200 ${
                    isActive ? "text-amber-600" : "text-slate-400 group-hover:text-amber-600"
                  }`}
                />
                <div className="relative z-10 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`truncate font-semibold transition-colors duration-200 ${isActive ? "text-[#1c1736]" : "text-slate-700 group-hover:text-slate-900"}`}>
                      {item.label}
                    </p>
                    <span dir="ltr" className="font-mono text-[10px] text-slate-400 opacity-60 shrink-0">
                      {indexStr}
                    </span>
                  </div>
                  <p className={`truncate text-xs transition-colors duration-200 ${isActive ? "text-amber-600" : "text-slate-500"}`}>
                    {item.sublabel}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 p-4 space-y-3 bg-slate-50/70">
          {authUser ? (
            <div className="rounded-xl border border-slate-200 bg-white p-2.5 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                  <User className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-slate-800">
                    {studentName.trim() || authUser.email || "حساب الطالب"}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500">
                    {syncStatus === "saving" && (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin text-amber-700" />
                        <span>جاري الحفظ بالحساب...</span>
                      </>
                    )}
                    {syncStatus === "saved" && (
                      <>
                        <Check className="h-3 w-3 text-emerald-600" />
                        <span className="text-emerald-700">محفوظ بالحساب</span>
                      </>
                    )}
                    {syncStatus === "error" && (
                      <>
                        <AlertCircle className="h-3 w-3 text-rose-600" />
                        <span className="text-rose-700">تعذر المزامنة</span>
                      </>
                    )}
                    {syncStatus === "idle" && (
                      <span className="truncate" dir="ltr">
                        {authUser.email || "مسجّل الدخول"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Link
                href="/profile"
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-200 hover:text-amber-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
              >
                <User className="h-3.5 w-3.5" />
                <span>الملف الشخصي</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={signingOut}
                className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
              >
                {signingOut ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <LogOut className="h-3.5 w-3.5" />
                )}
                <span>{signingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}</span>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100/70 px-3 py-2 text-xs font-bold text-amber-800 transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>تسجيل الدخول / إنشاء حساب</span>
            </Link>
          )}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              بيانات التنسيق والمصروفات محدثة
            </span>
            <span className="text-xs text-slate-600 font-medium">
              <span dir="ltr" className="font-mono tabular-nums">2026/2027</span>
            </span>
          </div>


          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
            <Link href="/privacy" className="hover:text-slate-900 transition-colors">
              سياسة الخصوصية
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-slate-900 transition-colors">
              الشروط والأحكام
            </Link>
          </div>
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

            {/* Live Student Context Telemetry Capsules with UIMaven Mini-Bezel Framing */}
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
              {/* Stream Capsule */}
              <button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                title="اضغط لتعديل الشعبة الدراسية"
                className="bg-[#f2efe9] p-1 rounded-xl border border-[#dedad0] hover:border-amber-500/50 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs group"
              >
                <div className="bg-white px-2.5 py-1 rounded-lg border border-[#e6e4dd] flex items-center gap-1.5 text-xs">
                  <GraduationCap className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span className="text-slate-500 hidden sm:inline">الشعبة:</span>
                  <span className="font-bold text-slate-900 whitespace-nowrap">
                    {streamDisplay}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 group-hover:text-amber-600 px-1.5 hidden md:inline">
                  تعديل
                </span>
              </button>

              {/* Score Capsule */}
              {scorePercentage > 0 && (
<button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                title="اضغط لتعديل المجموع"
                className="bg-[#f2efe9] p-1 rounded-xl border border-[#dedad0] hover:border-amber-500/50 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs group"
              >
                <div className="bg-white px-2.5 py-1 rounded-lg border border-[#e6e4dd] flex items-center gap-1.5 text-xs">
                  <Percent className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="text-slate-500 hidden sm:inline">المجموع:</span>
                  <span className="font-bold text-slate-900 whitespace-nowrap">
                    {scorePercentage > 0 ? (
                      <AnimatedCounter
                        value={scorePercentage}
                        decimals={scorePercentage % 1 !== 0 ? 1 : 0}
                        suffix="%"
                      />
                    ) : (
                      <span className="text-slate-400 font-medium">غير محدد</span>
                    )}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 group-hover:text-amber-600 px-1.5 hidden md:inline">
                  تعديل
                </span>
              </button>
)}

              {/* Budget Capsule */}
              {annualBudgetEgp > 0 && (
<button
                type="button"
                onClick={() => setIsEditingProfile(true)}
                title="اضغط لتعديل الميزانية السنوية"
                className="bg-[#f2efe9] p-1 rounded-xl border border-[#dedad0] hover:border-amber-500/50 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs group"
              >
                <div className="bg-white px-2.5 py-1 rounded-lg border border-[#e6e4dd] flex items-center gap-1.5 text-xs">
                  <Wallet className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                  <span className="text-slate-500 hidden lg:inline font-medium">الميزانية:</span>
                  <span className="font-bold text-slate-900 whitespace-nowrap">
                    <AnimatedCounter value={annualBudgetEgp} suffix=" ج.م" />
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 group-hover:text-amber-600 px-1.5 hidden md:inline">
                  تعديل
                </span>
              </button>
)}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => setIsEditingProfile(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#dedad0] bg-[#f2efe9] hover:bg-[#eaeff8] hover:border-amber-500/50 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-amber-600" />
              <span>تعديل معاييري</span>
            </button>
            <Link
              href="/sample-report"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-md bg-[#FACC15] px-3.5 py-1.5 text-xs font-semibold text-slate-950 transition-colors hover:bg-amber-400"
            >
              <FileCheck2 className="h-3.5 w-3.5" />
              <span>تقريري</span>
            </Link>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileNavOpen && (
            <div className="fixed inset-0 z-50 lg:hidden">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setIsMobileNavOpen(false)}
              />
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                className="fixed inset-y-0 right-0 w-72 bg-white border-l border-slate-200 p-4 flex flex-col justify-between shadow-2xl z-50"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FACC15] text-slate-950 font-bold">
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
                          className={`group relative flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                            isActive
                              ? "text-amber-900 font-semibold"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="mobile-nav-pill"
                              className="absolute inset-0 rounded-lg bg-amber-50 border border-amber-200"
                              transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 32,
                              }}
                            />
                          )}
                          <IconComponent
                            className={`relative z-10 mt-0.5 h-4 w-4 shrink-0 transition-colors duration-200 ${
                              isActive ? "text-amber-600" : "text-slate-400"
                            }`}
                          />
                          <div className="relative z-10 min-w-0 flex-1">
                            <p className="truncate font-medium">{item.label}</p>
                            <p className={`truncate text-xs ${isActive ? "text-amber-600" : "text-slate-500"}`}>{item.sublabel}</p>
                          </div>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
                <div className="border-t border-slate-200 pt-3 space-y-2">
                  {authUser ? (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 space-y-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <User className="h-4 w-4 text-amber-700 shrink-0" />
                        <p className="truncate text-xs font-bold text-slate-800">
                          {studentName.trim() || authUser.email || "حساب الطالب"}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        onClick={() => setIsMobileNavOpen(false)}
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-amber-50 hover:border-amber-200 hover:text-amber-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors"
                      >
                        <User className="h-3.5 w-3.5" />
                        <span>الملف الشخصي</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="w-full flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {signingOut ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <LogOut className="h-3.5 w-3.5" />
                        )}
                        <span>{signingOut ? "جاري تسجيل الخروج..." : "تسجيل الخروج"}</span>
                      </button>
                    </div>
                  ) : (
                    <Link
                      href="/login"
                      onClick={() => setIsMobileNavOpen(false)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      <span>تسجيل الدخول / إنشاء حساب</span>
                    </Link>
                  )}


                  <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
                    <Link
                      href="/privacy"
                      onClick={() => setIsMobileNavOpen(false)}
                      className="hover:text-slate-900 transition-colors"
                    >
                      سياسة الخصوصية
                    </Link>
                    <span>•</span>
                    <Link
                      href="/terms"
                      onClick={() => setIsMobileNavOpen(false)}
                      className="hover:text-slate-900 transition-colors"
                    >
                      الشروط والأحكام
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Scrollable Canvas */}
        <main
          id="chooseu-main-canvas"
          className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth"
        >
          <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-8 pb-24 lg:pb-8">
            {children}
          </div>
        </main>
      <FloatingAiAdvisor />

        {/* Quick Profile Editor Modal */}
        <AnimatePresence>
          {isEditingProfile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs"
                onClick={() => setIsEditingProfile(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 12 }}
                transition={{ type: "spring", stiffness: 380, damping: 28 }}
                className="relative z-10 bg-white border border-[#e2e2e2] rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-5 w-5 text-amber-600" />
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
                          ? "bg-amber-50 text-amber-800 border-amber-300"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <span>{s.label}</span>
                      {stream === s.id && <Check className="h-3.5 w-3.5 text-amber-700" />}
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
                      value={modalScoreStr}
                      onChange={(e) => setModalScoreStr(e.target.value)}
                      onBlur={() => {
                        const val = parseFloat(modalScoreStr);
                        if (isNaN(val)) {
                          setModalScoreStr(scorePercentage.toString());
                        } else {
                          const clamped = Math.min(100, Math.max(50, val));
                          setScorePercentage(clamped);
                          setModalScoreStr(clamped.toString());
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      }}
                      className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right font-mono text-xs font-bold text-emerald-700 focus:border-amber-500 focus:outline-none"
                    />
                    <span className="font-mono text-slate-600 text-xs font-semibold">%</span>
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
                <div className="flex items-center justify-between text-xs font-semibold text-slate-800">
                  <label htmlFor="modal-budget-input">سقف الميزانية السنوية (المصروفات فقط):</label>
                  <div className="flex items-center gap-1.5">
                    <input
                      id="modal-budget-input"
                      type="number"
                      min={0}
                      max={300000}
                      step={5000}
                      value={modalBudgetStr}
                      onChange={(e) => setModalBudgetStr(e.target.value)}
                      onBlur={() => {
                        const val = parseInt(modalBudgetStr, 10);
                        if (isNaN(val)) {
                          setModalBudgetStr(annualBudgetEgp.toString());
                        } else {
                          const clamped = Math.min(300000, Math.max(0, val));
                          setAnnualBudgetEgp(clamped);
                          setModalBudgetStr(clamped.toString());
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                      }}
                      className="w-28 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right font-mono text-xs font-bold text-amber-700 focus:border-amber-500 focus:outline-none"
                    />
                    <span className="text-slate-600 text-xs font-semibold">ج.م</span>
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
                  <span className="text-xs text-slate-600 font-medium">خيارات سريعة:</span>
                  {[50000, 100000, 150000, 200000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAnnualBudgetEgp(preset)}
                      className={`px-2 py-0.5 rounded text-xs border transition-colors cursor-pointer ${
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
                className="w-full py-2.5 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 text-xs font-bold transition-colors cursor-pointer shadow-md"
              >
                تطبيق وتحديث نتائج التنسيق والمصفوفة
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
            { label: "متابعة الطلب", href: "/track-order", icon: Receipt },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? "text-amber-700 font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? "text-amber-700" : "text-slate-400"}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
