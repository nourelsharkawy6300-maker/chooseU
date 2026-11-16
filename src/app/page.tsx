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
    desc: "4 محطات متتابعة: اختبار الميول، ترشيح الكليات، محاكاة التنسيق، وتقرير القرار النهائي.",
    href: "/workspace",
    icon: Compass,
    badge: "المسار الأكاديمي",
  },
  {
    title: "حاسبة التكلفة",
    desc: "حساب تكلفة سنوات الدراسة بالكامل شاملة التضخم السنوي، نفقات السكن الجامعي، والانتقالات.",
    href: "/tco-matrix",
    icon: Calculator,
    badge: "التخطيط المالي",
  },
  {
    title: "دليل الجامعات والبرامج الأكاديمية",
    desc: "دليل استرشادي شامل للكليات الحكومية والأهلية والخاصة مع مؤشرات القبول التاريخية.",
    href: "/universities",
    icon: Building2,
    badge: "دليل الكليات",
  },
  {
    title: "دليل الوظائف وسوق العمل",
    desc: "ربط التخصص الأكاديمي بالمهارات المطلوبة وسلاسل الرواتب المتوقعة في السوق المصري والإقليمي.",
    href: "/future-me",
    icon: Milestone,
    badge: "سوق العمل",
  },
  {
    title: "عينة تقريري (A4)",
    desc: "نموذج استرشادي يوضح هيكل تقرير ترتيب الرغبات الاستراتيجي وملاحظات اللائحة.",
    href: "/sample-report",
    icon: FileCheck2,
    badge: "تقرير استشاري",
  },
  {
    title: "متابعة حالة الطلب",
    desc: "متابعة مراجعة طلبك، إدخال رقم عملية InstaPay، والتواصل المباشر مع فريق المراجعة.",
    href: "/track-order",
    icon: Receipt,
    badge: "خدمة المتابعة",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { studentName, scorePercentage, annualBudgetEgp, stream } = useStudent();
  const streamAr = formatStream(stream);

  return (
    <div className="space-y-12">
      {/* Editorial Hero Header with Primer Blueprint Frame */}
      <BlueprintFrame label="CHOOSEU // ARCHIVAL ENGINE 2026" className="primer-grid-bg">
        <div className="max-w-4xl space-y-6 pt-2 text-start relative z-10">
          {/* Top Status Ticker Pill */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-[#dedad0] text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>نظام التدقيق الأكاديمي والمالي المعتمد للتنسيق المصري 2026</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-[clamp(2.1rem,4.4vw,3.5rem)] font-extrabold text-[#1c1736] leading-[1.2] tracking-tight">
              قرارك الأكاديمي والمالي
            </h1>
            <h2 className="text-[clamp(2.1rem,4.4vw,3.5rem)] font-extrabold text-[#377ef0] leading-[1.2] tracking-tight">
              مدقق بحسابات حقيقية لسنوات دراستك
            </h2>
          </div>

          <p className="text-sm sm:text-base text-[#48425f] leading-relaxed max-w-2xl">
            {studentName ? `مرحباً بك ${studentName}. ` : "مرحباً بك في ChooseU. "}منصة معمارية هندسية لطلاب الثانوية العامة وSTEM وأولياء الأمور؛ تفحص التوافق التخصصي الفعلي، تكشف مصاريف سنوات دراستك التراكمية بالكامل، وتبني بطاقة رغباتك الاستراتيجية.
          </p>

          {/* 3-Column Live Telemetry Console Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#f2efe9] border border-[#dedad0]">
            <div className="bg-white p-3.5 rounded-xl border border-[#e6e4dd] flex flex-col justify-between shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500">الشعبة الدراسية</span>
              <span className="text-sm font-bold text-slate-900 mt-1">{streamAr}</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#e6e4dd] flex flex-col justify-between shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500">المجموع الفعلي</span>
              <span className="text-sm font-bold text-[#377ef0] mt-1">
                <AnimatedCounter value={scorePercentage} suffix="%" />
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#e6e4dd] flex flex-col justify-between shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500">الميزانية السنوية</span>
              <span className="text-sm font-bold text-emerald-700 mt-1">
                <AnimatedCounter value={annualBudgetEgp} suffix=" ج.م" />
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <KineticRollButton
              variant="primary"
              onClick={() => router.push("/workspace")}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              ابدأ التنسيق الهندسي
            </KineticRollButton>

            <KineticRollButton
              variant="secondary"
              onClick={() => router.push("/sample-report")}
            >
              معاينة نموذج التقرير A4
            </KineticRollButton>
          </div>
        </div>
      </BlueprintFrame>

      <ArchitecturalDivider />

      {/* Grid of Platform Modules Wrapped in UIMaven Double-Bezel Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#dedad0] pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#377ef0]" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider font-mono">
              SYSTEM MODULES // معمارية الأدوات الست
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-500">INDEX: 001 - 006</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((m, idx) => {
            const Icon = m.icon;
            return (
              <UIMavenCard
                key={m.href}
                indexCode={`00${idx + 1} // SYS`}
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

                  {/* 1px Dashed Architectural Divider & Action Rail */}
                  <div className="space-y-3 pt-2">
                    <div className="border-t border-dashed border-[#dedad0]" />
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 group-hover:text-[#377ef0] transition-colors">
                      <span>فتح الأداة الهندسية</span>
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
