"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Compass,
  Calculator,
  Building2,
  Milestone,
  FileCheck2,
  Receipt,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { useStudent } from "@/context/StudentContext";
import { formatStream } from "@/types/chooseu";
import {
  BlueprintFrame,
  UIMavenCard,
  KineticRollButton,
  ArchitecturalDivider,
  AnimatedCounter,
} from "@/components/MotionPrimitives";

const MODULES = [
  {
    title: "لوحة التحكم وتنسيق الرغبات",
    desc: "4 خطوات متتابعة: اختبار الميول، ترشيح الكليات، محاكاة التنسيق، وملخص القرار النهائي.",
    href: "/workspace",
    icon: Compass,
    badge: "المسار الأكاديمي",
  },
  {
    title: "حاسبة التكلفة",
    desc: "حساب تقديري لتكلفة سنوات الدراسة شاملة الزيادة السنوية، السكن الجامعي، والانتقالات.",
    href: "/tco-matrix",
    icon: Calculator,
    badge: "التخطيط المالي",
  },
  {
    title: "دليل الجامعات والبرامج الأكاديمية",
    desc: "دليل استرشادي للكليات الحكومية والأهلية والخاصة مع مؤشرات القبول السابقة.",
    href: "/universities",
    icon: Building2,
    badge: "دليل الكليات",
  },
  {
    title: "دليل الوظائف وسوق العمل",
    desc: "ربط التخصص الأكاديمي بالمهارات المطلوبة ومتوسط الرواتب المتوقعة في السوق المصري والإقليمي.",
    href: "/future-me",
    icon: Milestone,
    badge: "سوق العمل",
  },
  {
    title: "عينة تقريري (A4)",
    desc: "نموذج استرشادي يوضح شكل تقرير ترتيب الرغبات وتقدير المصاريف السنوية.",
    href: "/sample-report",
    icon: FileCheck2,
    badge: "نموذج التقرير",
  },
  {
    title: "متابعة حالة الطلب",
    desc: "متابعة حالة طلبك، تأكيد رقم عملية InstaPay، والتواصل عبر واتساب (01066594552).",
    href: "/track-order",
    icon: Receipt,
    badge: "متابعة الطلب",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { studentName, scorePercentage, annualBudgetEgp, stream, hasCompletedOnboarding } = useStudent();
  const streamAr = formatStream(stream);
  const hasUserData = Boolean(hasCompletedOnboarding || (studentName && scorePercentage > 0));

  return (
    <div className="space-y-12">
      {/* Hero Header */}
      <BlueprintFrame label="منصة ChooseU للتوجيه الجامعي" className="primer-grid-bg">
        <div className="max-w-4xl space-y-6 pt-2 text-start relative z-10">
          {/* Top Status Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-[#dedad0] text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>دليل استرشادي للتنسيق ومصاريف الجامعات المصرية</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-[clamp(2.1rem,4.4vw,3.5rem)] font-extrabold text-[#1c1736] leading-[1.2] tracking-tight">
              قرارك الأكاديمي والمالي
            </h1>
            <h2 className="text-[clamp(2.1rem,4.4vw,3.5rem)] font-extrabold text-[#377ef0] leading-[1.2] tracking-tight">
              بأرقام واضحة لمصاريف سنوات دراستك
            </h2>
          </div>

          <p className="text-sm sm:text-base text-[#48425f] leading-relaxed max-w-2xl">
            {hasUserData && studentName ? `مرحباً بك ${studentName}. ` : "مرحباً بك في ChooseU. "}
            منصة توجيه جامعي ومالي لطلاب الثانوية العامة وSTEM وأولياء الأمور؛ تساعدك تقارن الكليات المناسبة لمجموعك، تحسب المصاريف التقديرية لسنوات الدراسة، وترتّب رغباتك بوضوح قبل التنسيق.
          </p>

          {/* Transparent Pricing & Delivery Strip */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-700 bg-white/90 border border-[#dedad0] rounded-xl px-4 py-2.5 w-fit">
            <span>الأدوات والمقارنات: <strong className="text-emerald-700">مجانية (0 ج.م)</strong></span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span>التقرير المخصص والمراجعة: <strong className="text-[#1c1736]">150 ج.م</strong></span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span>التسليم: <strong className="text-[#377ef0]">خلال 24 ساعة عبر واتساب</strong></span>
          </div>

          {/* 3-Column Live Summary / Empty State */}
          {hasUserData ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#f2efe9] border border-[#dedad0]">
              <div className="bg-white p-3.5 rounded-xl border border-[#e6e4dd] flex flex-col justify-between shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500">الشعبة الدراسية</span>
                <span className="text-sm font-bold text-slate-900 mt-1">{streamAr}</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-[#e6e4dd] flex flex-col justify-between shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500">المجموع</span>
                <span className="text-sm font-bold text-[#377ef0] mt-1">
                  <AnimatedCounter
                    value={scorePercentage}
                    decimals={scorePercentage % 1 !== 0 ? 1 : 0}
                    suffix="%"
                  />
                </span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-[#e6e4dd] flex flex-col justify-between shadow-2xs">
                <span className="text-[11px] font-semibold text-slate-500">الميزانية السنوية</span>
                <span className="text-sm font-bold text-emerald-700 mt-1">
                  <AnimatedCounter value={annualBudgetEgp} suffix=" ج.م" />
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#f2efe9] border border-[#dedad0] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 text-start">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                  <span className="text-xs font-bold text-slate-800">
                    لم تسجل بياناتك بعد
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  سجّل شعبتك ومجموعك وميزانيتك لبدء مطابقة الكليات وحساب التكلفة التقديرية مجاناً.
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push("/workspace")}
                className="shrink-0 px-4 py-2 rounded-xl bg-white border border-[#dedad0] text-xs font-bold text-[#377ef0] hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
              >
                إدخال بياناتي الآن
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <KineticRollButton
              variant="primary"
              onClick={() => router.push("/workspace")}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              ابدأ الآن مجاناً
            </KineticRollButton>

            <KineticRollButton
              variant="secondary"
              onClick={() => router.push("/sample-report")}
            >
              معاينة نموذج التقرير A4
            </KineticRollButton>

            <a
              href="https://wa.me/201066594552"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#dedad0] text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span dir="ltr">01066594552</span>
            </a>
          </div>
        </div>
      </BlueprintFrame>

      <ArchitecturalDivider />

      {/* Grid of Platform Tools */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#dedad0] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#377ef0]" />
            <h2 className="text-sm font-bold text-slate-900">
              أدوات المنصة
            </h2>
          </div>
          <span className="text-xs font-medium text-slate-500">6 أدوات مجانية</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((m, idx) => {
            const Icon = m.icon;
            return (
              <UIMavenCard
                key={m.href}
                indexCode={`0${idx + 1}`}
                badgeText={m.badge}
                onClick={() => router.push(m.href)}
                className="h-full"
              >
                <div className="space-y-4 flex flex-col justify-between h-full min-h-[175px]">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50/80 border border-blue-200/80 flex items-center justify-center text-[#377ef0] group-hover:bg-[#377ef0] group-hover:text-white transition-colors duration-300 shrink-0">
                        <Icon className="h-5 w-5 stroke-[1.75]" />
                      </div>
                      <h3 className="text-base font-bold text-[#1c1736] group-hover:text-[#377ef0] transition-colors leading-[1.4]">
                        {m.title}
                      </h3>
                    </div>
                    <p className="text-xs text-[#48425f] leading-relaxed line-clamp-2">
                      {m.desc}
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="border-t border-dashed border-[#dedad0]" />
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-[#377ef0] transition-colors">
                      <span>افتح الأداة</span>
                      <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#377ef0] group-hover:-translate-x-1.5 transition-transform duration-200 shrink-0" />
                    </div>
                  </div>
                </div>
              </UIMavenCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}