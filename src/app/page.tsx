"use client";

import React from "react";
import Link from "next/link";
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

const MODULES = [
  {
    title: "لوحة التحكم وتنسيق الرغبات",
    desc: "4 محطات متتابعة: اختبار الميول، ترشيح الكليات، محاكاة التنسيق، وتقرير القرار النهائي.",
    href: "/workspace",
    icon: Compass,
    badge: "المسار الأكاديمي",
  },
  {
    title: "حاسبة المصروفات ونفقات المعيشة (TCO)",
    desc: "حساب تكلفة 4 سنوات دراسية شاملة التضخم السنوي، نفقات السكن الجامعي، والانتقالات.",
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
    title: "عينة التقرير الاستشاري (A4)",
    desc: "نموذج استرشادي يوضح هيكل تقرير ترتيب الرغبات الاستراتيجي وملاحظات اللائحة.",
    href: "/sample-report",
    icon: FileCheck2,
    badge: "تقرير استشاري",
  },
  {
    title: "متابعة حالة الطلب",
    desc: "متابعة تدقيق طلبك، إدخال رقم عملية InstaPay، والتواصل المباشر مع فريق المراجعة.",
    href: "/track-order",
    icon: Receipt,
    badge: "خدمة المتابعة",
  },
];

export default function HomePage() {
  const { studentName, scorePercentage, stream } = useStudent();
  const streamAr =
    stream === "Science" ? "علمي علوم" : stream === "Math" ? "علمي رياضة" : "أدبي";

  return (
    <div className="space-y-10">
      {/* Editorial Hero Header */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-[#0F172A] p-8 sm:p-12 text-right">
        <div className="max-w-3xl space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-400">
            <span>منظومة التوجيه الجامعي والتدقيق المالي لطلاب الثانوية والشهادات المعادلة</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white leading-[1.35]">
            قرارك الأكاديمي والمالي
            <br />
            <span className="text-blue-400">
              مدقق بحسابات حقيقية لسنوات دراستك
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-2xl">
            مرحباً بك {studentName} ({streamAr} — {scorePercentage.toFixed(1)}%). اختر القسم الذي ترغب في
            استكشافه أو ابدأ مباشرة في لوحة التحكم وتنسيق الرغبات لاستكمال الخطوات الأكاديمية.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-blue-500 hover:shadow-lg hover:shadow-blue-500/25 cursor-pointer"
            >
              <span>دخول مساحة العمل التحليلية</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/sample-report"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-5 py-3 text-sm font-semibold text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <span>معاينة نموذج التقرير A4</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of Platform Modules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">وحدات المنصة المتكاملة</h2>
          <span className="text-xs text-slate-400">6 بوابات متخصصة</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((m) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                href={m.href}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-800 bg-[#0F172A] p-6 transition-all hover:border-slate-700 hover:bg-slate-900/60 shadow-lg"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-md border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-[11px] font-medium text-slate-300">
                      {m.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-blue-400 font-semibold group-hover:translate-x-[-2px] transition-transform">
                  <span>فتح الوحدة</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
