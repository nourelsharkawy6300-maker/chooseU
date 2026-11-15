"use client";

import React from "react";
import Link from "next/link";
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
import {
  MaskRevealHeading,
  SpotlightCard,
  MagneticButton,
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
  const { studentName, scorePercentage, stream } = useStudent();
  const streamAr =
    stream === "Science" ? "علمي علوم" : stream === "Math" ? "علمي رياضة" : "أدبي";

  return (
    <div className="space-y-10">
      {/* Editorial Hero Header with Primer Blueprint & Mask Reveal */}
      <div className="relative overflow-hidden rounded-2xl border border-[#e2e2e2] bg-white primer-grid-bg p-8 sm:p-12 text-start shadow-xs">
        <span className="grid-crosshair top-0 start-0" />
        <span className="grid-crosshair top-0 end-0" />
        <span className="grid-crosshair bottom-0 start-0" />
        <span className="grid-crosshair bottom-0 end-0" />

        <div className="max-w-3xl space-y-5 text-start relative z-10">
          <MaskRevealHeading as="h1" className="text-3xl sm:text-5xl font-black text-[#1c1736] leading-[1.3]">
            قرارك الأكاديمي والمالي
          </MaskRevealHeading>

          <MaskRevealHeading as="h2" delay={0.12} className="text-3xl sm:text-5xl font-black text-[#377ef0] leading-[1.3]">
            مدقق بحسابات حقيقية لسنوات دراستك
          </MaskRevealHeading>

          <p className="text-sm sm:text-base text-[#48425f] leading-relaxed max-w-2xl pt-2">
            مرحباً بك {studentName} ({streamAr} — <span dir="ltr" className="font-mono tabular-nums font-bold text-[#377ef0]"><AnimatedCounter value={scorePercentage} />%</span>). اختر القسم الذي ترغب في
            استكشافه أو ابدأ مباشرة في لوحة التحكم وتنسيق الرغبات لاستكمال الخطوات الأكاديمية.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <MagneticButton
              variant="primary"
              onClick={() => router.push("/workspace")}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              ابدأ التنسيق
            </MagneticButton>

            <MagneticButton
              variant="secondary"
              onClick={() => router.push("/sample-report")}
            >
              معاينة نموذج التقرير A4
            </MagneticButton>
          </div>
        </div>
      </div>

      <ArchitecturalDivider />

      {/* Grid of Platform Modules Wrapped in Interactive Spotlight Cards */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {MODULES.map((m) => (
            <Link key={m.href} href={m.href} className="block group">
              <SpotlightCard className="p-5 h-full transition-all group-hover:border-[#377ef0]/40 shadow-2xs">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <h3 className="text-[15px] font-bold text-[#1c1736] group-hover:text-[#377ef0] transition-colors">
                      {m.title}
                    </h3>
                    <p className="text-xs text-[#48425f] leading-relaxed line-clamp-2">
                      {m.desc}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-[#377ef0] group-hover:-translate-x-1 transition-all shrink-0" />
                </div>
              </SpotlightCard>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
