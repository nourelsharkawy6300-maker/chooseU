"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Award,
  Bot,
  Building2,
  Calculator,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileText,
  HeartHandshake,
  Milestone,
  Receipt,
  UserCheck,
} from "lucide-react";
import { useStudent } from "@/context/StudentContext";
import { formatStream } from "@/types/chooseu";
import { AmbientGoldOrbs } from "@/components/AmbientGoldOrbs";
import { AnimatedCounter } from "@/components/MotionPrimitives";

const JOURNEY_STEPS = [
  {
    num: "01",
    title: "قيّم ميولك ونقاط قوتك",
    desc: "اختبار ذكي حسب شعبتك يحدد أنسب المسارات والتخصصات لك.",
    href: "/workspace",
  },
  {
    num: "02",
    title: "طابق الكليات والمنح",
    desc: "كليات مصر + جامعات دولية ومنح ممولة حتى لو مجموعك أقل من تنسيق مصر.",
    href: "/scholarships",
  },
  {
    num: "03",
    title: "احسب التكلفة الـ 4 سنوات",
    desc: "مصروفات + تضخم + سكن ومواصلات مطروح منها تغطية المنحة.",
    href: "/tco-matrix",
  },
  {
    num: "04",
    title: "اطبع تقرير قرارك ونفّذ",
    desc: "تقرير A4 موحد + وضع ولي الأمر + قائمة المستندات والمواعيد.",
    href: "/decision-report",
  },
];

const PLATFORM_MODULES = [
  {
    title: "لوحة التنسيق واختبار الميول",
    desc: "4 محطات متتابعة: تقييم الميول، ترشيح الكليات، محاكاة التنسيق، والمنح المطابقة لمجموعك.",
    href: "/workspace",
    icon: Compass,
    tag: "البداية",
  },
  {
    title: "محرك المنح المحلية والدولية",
    desc: "منح مصرية وجامعية ودولية (المجر، إيطاليا، الصين، ألمانيا، تركيا) مع شروط الأهلية والمواعيد.",
    href: "/scholarships",
    icon: Award,
    tag: "محلي + دولي",
  },
  {
    title: "حاسبة التكلفة لـ 4 سنوات (TCO)",
    desc: "حساب المصروفات بالتضخم والسكن والمواصلات وصافي مساهمة الأسرة بعد المنح.",
    href: "/tco-matrix",
    icon: Calculator,
    tag: "التخطيط المالي",
  },
  {
    title: "دليل الجامعات والاعتماد",
    desc: "كليات حكومية وأهلية وخاصة + جامعات دولية مختارة مع شروط القبول والاعتماد.",
    href: "/universities",
    icon: Building2,
    tag: "دليل 2026",
  },
  {
    title: "وضع ولي الأمر (Parent Mode)",
    desc: "مساحة اختيارية بتحكم الطالب لمشاركة المقارنة المالية وتسجيل رأي الأسرة بهدوء.",
    href: "/parent-mode",
    icon: HeartHandshake,
    tag: "القرار الأسري",
  },
  {
    title: "المستشار الذكي (AI Advisor)",
    desc: "محادثة فورية مربوطة بمجموعك وشعبتك وميزانيتك للإجابة عن أي سؤال في التنسيق والمنح.",
    href: "/advisor",
    icon: Bot,
    tag: "متاح 24/7",
  },
  {
    title: "استشارة الخبراء وطلاب الجامعات",
    desc: "احجز جلسة مع مرشدين مهنيين وأكاديميين، خبراء منح، أو طلاب وخريجين عاشوا التجربة.",
    href: "/consultations",
    icon: UserCheck,
    tag: "خبرة بشرية",
  },
  {
    title: "تقرير القرار الشامل (PDF)",
    desc: "ملف A4 متكامل يجمع التقييم، الجامعات، المنح، الميزانية، وملاحظات ولي الأمر للطباعة.",
    href: "/decision-report",
    icon: FileText,
    tag: "قابل للطباعة",
  },
  {
    title: "خطة التنفيذ والقائمة المختصرة",
    desc: "ابنِ قائمتك المختصرة للجامعات والمنح وتابع المستندات المطلوبة ومواعيد التقديم.",
    href: "/action-plan",
    icon: ClipboardCheck,
    tag: "متابعة التقديم",
  },
];

export default function HomePage() {
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();
  const {
    studentName,
    scorePercentage,
    annualBudgetEgp,
    stream,
    hasCompletedOnboarding,
  } = useStudent();

  const streamAr = formatStream(stream);
  const hasUserData = Boolean(
    hasCompletedOnboarding || (studentName && scorePercentage > 0)
  );

  return (
    <div className="space-y-10 pb-8">
      {/* ================================================================= */}
      {/* HERO SECTION: Obsidian Ink + 60fps AmbientGoldOrbs + Signal Yellow */}
      {/* ================================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-zinc-950 text-white border border-zinc-800/90 px-6 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16 shadow-xl">
        <AmbientGoldOrbs variant="dark" />

        <div className="relative z-10 max-w-4xl space-y-6 text-start">
          {/* Top Live Pill */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-200 backdrop-blur-xs"
          >
            <span className="w-2 h-2 rounded-full bg-[#FACC15] animate-pulse shrink-0" />
            <span>منصة ChooseU • التوجيه الجامعي، المنح، وحاسبة التكلفة 2026</span>
          </motion.div>

          {/* Display Headline */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-2"
          >
            <h1 className="text-[clamp(2rem,4.6vw,3.6rem)] font-extrabold text-white leading-[1.18] tracking-tight">
              قرارك الجامعي والمالي
            </h1>
            <h2 className="text-[clamp(2rem,4.6vw,3.6rem)] font-extrabold text-[#FACC15] leading-[1.18] tracking-tight">
              بأرقام واضحة ومنح تناسب مجموعك
            </h2>
          </motion.div>

          {/* Subtitle */}
          <motion.p
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-sm sm:text-base text-zinc-300 leading-relaxed max-w-2xl"
          >
            {hasUserData && studentName
              ? `أهلاً بك يا ${studentName}. `
              : "أهلاً بك في ChooseU. "}
            اكتشف التخصص الأنسب لشخصيتك، قارن الكليات المصرية والدولية بتكلفتها الحقيقية لـ 4 سنوات، واستكشف المنح المتاحة لمجموعك مع دعم الأسرة والمستشار الذكي في مكان واحد.
          </motion.p>

          {/* Primary Actions */}
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.42, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center gap-3 pt-1"
          >
            <button
              type="button"
              onClick={() => router.push("/workspace")}
              className="inline-flex items-center gap-2 bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 font-extrabold text-sm px-6 py-3.5 rounded-xl transition-transform duration-150 hover:-translate-y-0.5 active:scale-[0.98] shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <span>{hasUserData ? "استكمل رحلتك الجامعية" : "ابدأ التقييم والترشيح مجاناً"}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>

            <Link
              href="/advisor"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white font-bold text-sm px-5 py-3.5 rounded-xl transition backdrop-blur-xs"
            >
              <Bot className="w-4 h-4 text-[#FACC15]" />
              <span>اسأل المستشار الذكي</span>
            </Link>

            <Link
              href="/scholarships"
              className="inline-flex items-center gap-2 bg-transparent hover:bg-white/5 border border-zinc-700 text-zinc-200 font-semibold text-sm px-4 py-3.5 rounded-xl transition"
            >
              <Award className="w-4 h-4 text-[#FACC15]" />
              <span>المنح المتاحة</span>
            </Link>
          </motion.div>

          {/* Live Student Metrics OR Transparent Value Strip */}
          {hasUserData ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
                <span className="text-[11px] font-medium text-zinc-400 block">
                  الشعبة الدراسية
                </span>
                <span className="text-base font-extrabold text-white mt-1 block">
                  {streamAr}
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
                <span className="text-[11px] font-medium text-zinc-400 block">
                  المجموع المسجّل
                </span>
                <span className="text-base font-extrabold text-[#FACC15] mt-1 block tabular-nums">
                  <AnimatedCounter
                    value={scorePercentage}
                    decimals={scorePercentage % 1 !== 0 ? 1 : 0}
                    suffix="%"
                  />
                </span>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-xs">
                <span className="text-[11px] font-medium text-zinc-400 block">
                  الميزانية السنوية
                </span>
                <span className="text-base font-extrabold text-emerald-400 mt-1 block tabular-nums">
                  <AnimatedCounter value={annualBudgetEgp} suffix=" ج.م" />
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-zinc-300 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 w-fit backdrop-blur-xs">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FACC15]" />
                الأدوات والمنح والمقارنات: <strong className="text-white">مجانية (0 ج.م)</strong>
              </span>
              <span className="text-zinc-600 hidden sm:inline">|</span>
              <span>
                المراجعة المعتمدة: <strong className="text-[#FACC15]">150 ج.م</strong>
              </span>
              <span className="text-zinc-600 hidden sm:inline">|</span>
              <span>
                التسليم: <strong className="text-white">خلال 24 ساعة عبر واتساب</strong>
              </span>
            </div>
          )}
        </div>
      </section>

      {/* ================================================================= */}
      {/* 4-STEP JOURNEY STRIP                                              */}
      {/* ================================================================= */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
              كيف تعمل المنصة
            </span>
            <h2 className="text-xl font-extrabold text-zinc-950 mt-0.5">
              رحلتك من الحيرة إلى قرار جامعي واضح في 4 خطوات
            </h2>
          </div>
          <Link
            href="/workspace"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center gap-1"
          >
            <span>ابدأ الخطوة الأولى</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {JOURNEY_STEPS.map((step) => (
            <Link
              key={step.num}
              href={step.href}
              className="group bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-5 transition-all duration-150 hover:-translate-y-0.5 shadow-2xs flex flex-col justify-between gap-3"
            >
              <div className="space-y-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-950 text-[#FACC15] font-mono text-xs font-extrabold">
                  {step.num}
                </span>
                <h3 className="text-[15px] font-extrabold text-zinc-950 group-hover:text-amber-700 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">{step.desc}</p>
              </div>
              <span className="text-[11px] font-bold text-zinc-900 inline-flex items-center gap-1 group-hover:text-amber-700">
                <span>انتقل الآن</span>
                <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ================================================================= */}
      {/* COMPLETE MVP MODULES BENTO GRID                                   */}
      {/* ================================================================= */}
      <section className="space-y-4">
        <div>
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            أدوات ChooseU المتكاملة
          </span>
          <h2 className="text-xl font-extrabold text-zinc-950 mt-0.5">
            كل ما تحتاجه للتنسيق، المنح، والقرار الأسري في مكان واحد
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PLATFORM_MODULES.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.href}
                href={mod.href}
                className="group bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-5 transition-all duration-150 hover:-translate-y-0.5 shadow-2xs flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center group-hover:bg-[#FACC15] group-hover:text-slate-950 group-hover:border-[#FACC15] transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-100 text-zinc-700">
                      {mod.tag}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-[15px] font-extrabold text-zinc-950 group-hover:text-amber-700 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      {mod.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-zinc-900 group-hover:text-amber-700">
                  <span>فتح القسم</span>
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ================================================================= */}
      {/* SECONDARY QUICK ACCESS STRIP (Career Market & Order Tracking)     */}
      {/* ================================================================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/future-me"
          className="group bg-zinc-950 text-white border border-zinc-800 rounded-2xl p-6 flex items-center justify-between gap-4 hover:border-[#FACC15]/60 transition"
        >
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#FACC15]">
              <Milestone className="w-3.5 h-3.5" />
              <span>دليل الوظائف وسوق العمل</span>
            </div>
            <h3 className="text-base font-extrabold text-white">
              شوف مستقبل تخصصك ورواتبه وخارطة الـ 4 سنوات
            </h3>
            <p className="text-xs text-zinc-400">
              ربط مباشر بين الكلية والمهارات الفعلية المطلوبة في السوق المصري والدولي.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-[#FACC15] text-slate-950 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </div>
        </Link>

        <Link
          href="/track-order"
          className="group bg-white border border-slate-200 hover:border-amber-400 rounded-2xl p-6 flex items-center justify-between gap-4 transition shadow-2xs"
        >
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700">
              <Receipt className="w-3.5 h-3.5" />
              <span>بوابة المراجعة المعتمدة (InstaPay)</span>
            </div>
            <h3 className="text-base font-extrabold text-zinc-950">
              متابعة حالة طلبك والتقرير الصوتي المعتمد
            </h3>
            <p className="text-xs text-zinc-600">
              تأكيد رقم عملية التحويل ومتابعة مراجعة المستشار والتواصل عبر واتساب.
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-zinc-950 text-[#FACC15] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ArrowLeft className="w-5 h-5" />
          </div>
        </Link>
      </section>
    </div>
  );
}