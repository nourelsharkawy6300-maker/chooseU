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
    title: "حاسبة التكلفة",
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
      <div
        style={{
          animation: "fade-up var(--dur-base) var(--ease-out-expo) both",
        }}
        className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 sm:p-12 text-right shadow-2xs"
      >
        <div className="max-w-3xl space-y-5">
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-[1.45]">
            قرارك الأكاديمي والمالي
            <br />
            <span className="text-blue-600">
              مدقق بحسابات حقيقية لسنوات دراستك
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl">
            مرحباً بك {studentName} ({streamAr} — {scorePercentage.toFixed(1)}%). اختر القسم الذي ترغب في
            استكشافه أو ابدأ مباشرة في لوحة التحكم وتنسيق الرغبات لاستكمال الخطوات الأكاديمية.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/workspace"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 shadow-sm cursor-pointer"
            >
              <span>ابدأ التنسيق</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/sample-report"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
            >
              <span>معاينة نموذج التقرير A4</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of Platform Modules */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {MODULES.map((m, idx) => {
            const Icon = m.icon;
            return (
              <Link
                key={m.href}
                href={m.href}
                style={{
                  animation: "fade-up var(--dur-base) var(--ease-out-expo) both",
                  animationDelay: `${(idx + 1) * 60}ms`,
                }}
                className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {m.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {m.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-blue-600 font-semibold group-hover:translate-x-[-2px] transition-transform">
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
