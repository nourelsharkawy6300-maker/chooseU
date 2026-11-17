"use client";

import React, { useState } from "react";
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
  ShieldCheck,
  Brain,
  MapPin,
  CheckCircle2,
  ChevronDown,
  Layers,
  GraduationCap,
  Coins,
  Lock,
  Flame,
  HelpCircle,
  Clock,
  FileText,
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
import { COMPLIANCE_COPY } from "@/lib/copy-registry";

const MODULES = [
  {
    title: "لوحة التحكم وتنسيق الرغبات",
    desc: "4 محطات متتابعة: مقياس الميول، ترشيح الكليات، محاكاة التنسيق، وتقرير القرار النهائي.",
    href: "/workspace",
    icon: Compass,
    badge: "المسار الأكاديمي",
    highlight: "نواة التنسيق",
  },
  {
    title: "حاسبة التكلفة الشاملة (TCO)",
    desc: "حساب تكلفة سنوات الدراسة بالكامل شاملة التضخم السنوي، نفقات السكن الجامعي، والانتقالات.",
    href: "/tco-matrix",
    icon: Calculator,
    badge: "التخطيط المالي",
    highlight: "3 سيناريوهات تضخم",
  },
  {
    title: "دليل الجامعات والبرامج",
    desc: "دليل استرشادي شامل للكليات الحكومية والبرامج الأهلية والخاصة مع مؤشرات القبول التاريخية.",
    href: "/universities",
    icon: Building2,
    badge: "دليل الكليات",
    highlight: "قاعدة بيانات 2026",
  },
  {
    title: "دليل الوظائف وسوق العمل",
    desc: "ربط التخصص الأكاديمي بالمهارات المطلوبة وسلاسل الرواتب المتوقعة في السوق المصري والإقليمي.",
    href: "/future-me",
    icon: Milestone,
    badge: "سوق العمل",
    highlight: "خارطة 4 سنوات",
  },
  {
    title: "عينة التقرير الاستشاري (A4)",
    desc: "نموذج استرشادي يوضح هيكل تقرير ترتيب الرغبات الاستراتيجي وملاحظات اللائحة والمذكرة الصوتية.",
    href: "/sample-report",
    icon: FileCheck2,
    badge: "نموذج استرشادي",
    highlight: "جاهز للطباعة PDF",
  },
  {
    title: "متابعة حالة الطلب",
    desc: "متابعة مراجعة طلبك، استرجاع التقرير برقم العملية أو الهاتف، والتواصل مع فريق الاستشارات.",
    href: "/track-order",
    icon: Receipt,
    badge: "خدمة المتابعة",
    highlight: "استعلام فوري",
  },
];

const FAQS = [
  {
    q: "هل منصة ChooseU جهة حكومية أو تابعة لمكتب التنسيق؟",
    a: "منصة ChooseU منصة مستقلة للاستشارات الأكاديمية والتخطيط المالي للتعليم الجامعي، وليست جهة حكومية ولا تمثل مكتب التنسيق. المنصة تقدم توجيهاً استرشادياً مبنياً على البيانات واللوائح لمساعدتك في بناء بطاقة رغباتك، ويجب عليك تسجيل رغباتك النهائية عبر بوابة التنسيق الحكومية الرسمية.",
  },
  {
    q: "كيف تحسب المنصة التكلفة التقديرية الشاملة (TCO) لسنوات الدراسة؟",
    a: "المنصة لا تكتفي بعرض المصروفات الدراسية المعلنة للعام الأول، بل تحسب الرسوم الإدارية ومعامل الكليات، تكاليف السكن الطلابي في حال الاغتراب (نطاق ب وج)، وتطبق 3 سيناريوهات للتضخم المالي السنوي (12%، 18%، 24%) لتقديم رؤية واضحة للأسرة لسنوات الدراسة بالكامل.",
  },
  {
    q: "ما الفرق بين الكليات الحكومية العامة وبرامج الساعات المعتمدة والجامعات الأهلية؟",
    a: "الكليات الحكومية (انتظام) تتميز بمصروفات رمزية لكنها تتطلب مجموعاً مرتفعاً. برامج الساعات المعتمدة تقدم تعليماً متخصصاً بأعداد أقل ولوائح مرنة بمصروفات متوسطة داخل نفس الجامعات الحكومية. بينما الجامعات الأهلية المنبثقة عن الجامعات الحكومية تقدم برامج حديثة بحدود قبول أقل ومصروفات محددة وفق لوائح المجلس الأعلى للجامعات.",
  },
  {
    q: "كيف تساعدني المنصة في توزيع الـ 75 رغبة في التنسيق؟",
    a: "يقسم محرك التنسيق الاسترشادي رغباتك إلى 3 مستويات: رغبات طموحة (أعلى بقليل من مجموعك لاقتناص أي انخفاض في الحدود الدنيا)، رغبات متوازنة تناسب مجموعك وميولك، ورغبات آمنة استرشادياً داخل نطاقك الجغرافي لحمايتك من الاستنفاد أو الاغتراب غير المحسوب.",
  },
  {
    q: "كيف تتم مراجعة التقرير المدفوع (150 ج.م) واستلامه؟",
    a: "بعد ملء بياناتك وإتمام تحويل رسوم المراجعة الاسترشادية (150 ج.م) عبر تطبيق InstaPay للحساب المصرح به، يقوم مستشار أكاديمي بمراجعة معطياتك وكتابة توصيات مخصصة لملفك وإرفاق مذكرة صوتية تلخيصية لولي الأمر، وتستلم تقريرك عبر بوابة «متابعة حالة الطلب» وواتساب.",
  },
  {
    q: "هل بياناتي الشخصية ومدخلاتي محمية على المنصة؟",
    a: "نعم تماماً. تطبق المنصة معمارية أمان مشددة (Zero-Trust) مع سياسات أمان على مستوى الصفوف (RLS) وتشفير كامل للمعلومات. نحن لا نبيع البيانات ولا نشاركها مع أي أطراف إعلانية خارجية، وتبقى جلسات التصفح الاستكشافي محفوظة محلياً داخل متصفحك.",
  },
];

export default function HomePage() {
  const router = useRouter();
  const { studentName, scorePercentage, annualBudgetEgp, stream } = useStudent();
  const streamAr = formatStream(stream);

  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeRoadmapYear, setActiveRoadmapYear] = useState<number>(1);

  return (
    <div className="space-y-16 pb-12" dir="rtl">
      {/* ==================================================================== */}
      {/* 1. EDITORIAL HERO SECTION                                            */}
      {/* ==================================================================== */}
      <BlueprintFrame label="CHOOSEU // STRATEGIC ADVISORY ENGINE 2026" className="primer-grid-bg">
        <div className="max-w-4xl space-y-6 pt-2 text-start relative z-10">
          {/* Status Ticker */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-[#dedad0] text-xs font-semibold text-slate-700 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>نظام التوجيه الأكاديمي والمالي الاسترشادي للجامعات المصرية 2026/2027</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-[clamp(2.1rem,4.4vw,3.6rem)] font-extrabold text-[#1c1736] leading-[1.2] tracking-tight">
              قرارك الأكاديمي والمالي
            </h1>
            <h2 className="text-[clamp(2.1rem,4.4vw,3.6rem)] font-extrabold text-[#377ef0] leading-[1.2] tracking-tight">
              تحليل شامل ومصروفات استرشادية لسنوات دراستك
            </h2>
          </div>

          <p className="text-sm sm:text-base text-[#48425f] leading-relaxed max-w-2xl">
            {studentName ? `مرحباً بك ${studentName}. ` : "مرحباً بك في ChooseU. "}
            منصة معمارية هندسية لطلاب الثانوية العامة وSTEM وأولياء الأمور؛ تفحص التوافق التخصصي الاسترشادي،
            تكشف مصاريف سنوات دراستك التراكمية بالكامل، وتبني بطاقة رغباتك الاستراتيجية بدقة.
          </p>

          {/* 3-Column Live Telemetry Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#f2efe9] border border-[#dedad0]">
            <div className="bg-white p-3.5 rounded-xl border border-[#e6e4dd] flex flex-col justify-between shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500">الشعبة الدراسية</span>
              <span className="text-sm font-bold text-slate-900 mt-1">{streamAr}</span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-[#e6e4dd] flex flex-col justify-between shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500">المجموع المدخل</span>
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

          {/* Hero CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <KineticRollButton
              variant="primary"
              onClick={() => router.push("/workspace")}
              icon={<ArrowRight className="h-4 w-4" />}
            >
              ابدأ التنسيق وحساب التكلفة
            </KineticRollButton>

            <KineticRollButton
              variant="secondary"
              onClick={() => router.push("/sample-report")}
            >
              معاينة نموذج التقرير الاستشاري (PDF)
            </KineticRollButton>

            <Link
              href="/track-order"
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors inline-flex items-center gap-1.5"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>متابعة حالة طلب سابق</span>
            </Link>
          </div>
        </div>
      </BlueprintFrame>

      <ArchitecturalDivider />

      {/* ==================================================================== */}
      {/* 2. THE TENSION // EGYPTIAN STUDENT & PARENT REALITY CHECK            */}
      {/* ==================================================================== */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700">
            <Flame className="w-3.5 h-3.5" />
            <span>معضلة التنسيق في مصر</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            لماذا يفشل التنسيق التقليدي العشوائي؟
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            القرارات الجامعية المتسرعة المبنية على المجموع فقط دون فحص القدرة المالية والميول تؤدي إلى تعثر مالي أو ضياع سنوات دراسية.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-mono font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900">
              صدمة المصروفات الخفية والتضخم
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              الإعلانات تعرض رسوم السنة الأولى فقط، متجاهلة مصاريف السكن الجامعي (30-40 ألف ج.م سنوياً) ومعدلات التضخم السنوية التي تضاعف التكلفة قبل التخرج.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-mono font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900">
              فخ كليات القمة بدون توافق تخصصي
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              دخول كلية لمجرد أن مجموعك سمح بها دون قياس ميولك الأكاديمية يخلق ضغطاً نفسياً حاداً ومخاطر الرسوب في السنة التأسيسية الأولى وشروط الـ GPA الداخلي.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 relative overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-mono font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900">
              استنفاد الرغبات والتوزيع الجغرافي
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              عدم فهم قواعد النطاقات (أ، ب، ج) وترتيب الـ 75 رغبة بدون شبكة أمان استرشادية يوقع الطالب في استنفاد الرغبات أو الاغتراب في محافظات نائية.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 3. HOW IT WORKS // 4-STATION INTERACTIVE JOURNEY                     */}
      {/* ==================================================================== */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-[#dedad0] pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 font-mono">
              <Layers className="w-3.5 h-3.5" />
              <span>THE 4-STATION ARCHITECTURE</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">
              رحلة المحطات الأربع لبناء قرارك الجامعي
            </h2>
          </div>
          <Link
            href="/workspace"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>دخول مسار المحطات الآن</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              step: "المحطة 01",
              title: "مقياس الميول الأكاديمية",
              desc: "12 سؤالاً تفاعلياً لتحديد ميولك الدقيقة بين 6 مسارات تخصصية ومستقبل العمل.",
              icon: Brain,
              badge: "التوافق النفسي",
            },
            {
              step: "المحطة 02",
              title: "مطابقة الكليات والنطاق",
              desc: "فرز الكليات المؤهلة لمجموعك ومحافظتك وفق قواعد التوزيع الجغرافي وقاعدة البيانات.",
              icon: MapPin,
              badge: "التوزيع الجغرافي",
            },
            {
              step: "المحطة 03",
              title: "مصفوفة التدفق المالي TCO",
              desc: "حساب التكلفة التقديرية التراكمية ومقارنة السكن الجامعي تحت 3 سيناريوهات تضخم.",
              icon: Coins,
              badge: "التخطيط المالي",
            },
            {
              step: "المحطة 04",
              title: "التقرير وبطاقة الـ 75 رغبة",
              desc: "استخراج وثيقة التقرير الاسترشادي مع خطة توزيع الرغبات الاستراتيجية وجاهزية الطباعة.",
              icon: FileText,
              badge: "خطة الرغبات",
            },
          ].map((st, i) => {
            const Icon = st.icon;
            return (
              <div
                key={st.step}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3 flex flex-col justify-between group hover:border-blue-400 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                      {st.step}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {st.badge}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-800 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Icon className="w-5 h-5 stroke-[1.75]" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    {st.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {st.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400 group-hover:text-blue-600">
                  <span>خطوة {i + 1} من 4</span>
                  <ArrowRight className="w-3.5 h-3.5 rotate-180 group-hover:-translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 4. BENTO GRID // THE 6 PILLARS & TOOLS (001 - 006)                   */}
      {/* ==================================================================== */}
      <section className="space-y-4">
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
                      <div>
                        <h3 className="text-base font-bold text-[#1c1736] group-hover:text-[#377ef0] transition-colors leading-[1.4]">
                          {m.title}
                        </h3>
                        <span className="text-[10px] font-mono font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                          {m.highlight}
                        </span>
                      </div>
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
      </section>

      {/* ==================================================================== */}
      {/* 5. 4-YEAR PRACTICAL ROADMAP PREVIEW                                  */}
      {/* ==================================================================== */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full mb-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>خارطة ما بعد القبول</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              خارطة التأهيل العملي لسنوات دراستك (4-Year Blueprint)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              كيف تبني سجلك الأكاديمي والمهني من السنة الأولى حتى التخرج لتجنب البطالة المقنعة.
            </p>
          </div>

          {/* Year Switcher Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            {[1, 2, 3, 4].map((y) => (
              <button
                key={y}
                type="button"
                onClick={() => setActiveRoadmapYear(y)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  activeRoadmapYear === y
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                السنة {y}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-blue-600 block">
              1. التركيز الأكاديمي والـ GPA
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {activeRoadmapYear === 1 &&
                "اجتياز المقررات التأسيسية بمعدل تراكمي GPA >= 2.7 لتأمين التخصص في الشعب الدقيقة (AI أو اتصالات) أو الاحتفاظ بمنحة التفوق."}
              {activeRoadmapYear === 2 &&
                "التخصص المباشر في المسار التقني المختار، مع استيفاء متطلبات المقررات المتزامنة ومنع أي إنذار أكاديمي."}
              {activeRoadmapYear === 3 &&
                "التركيز على المقررات المتقدمة ومقررات الاختيار الحر المرتبطة بالشهادات المهنية التخصصية المعترف بها."}
              {activeRoadmapYear === 4 &&
                "إتمام مشروع التخرج التطبيقي بإشراف مشترك مع جهة صناعية أو بحثية لتحقيق أعلى تقييم جامعي."}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-emerald-700 block">
              2. التدريب الصيفي والمهارات
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {activeRoadmapYear === 1 &&
                "بناء الأساسيات البرمجية/الهندسية، إتقان اللغة الإنجليزية التقنية، والمشاركة في الأنشطة الطلابية الفنية."}
              {activeRoadmapYear === 2 &&
                "بناء أول مشاريع حقيقية على GitHub، التدريب في شركات ناشئة محلية، وتنمية مهارات حل المشكلات والخوارزميات."}
              {activeRoadmapYear === 3 &&
                "قضاء تدريب صيفي تخصصي (Internship) في بيئة عمل متقدمة، وبناء شبكة علاقات مع مديري المشروعات."}
              {activeRoadmapYear === 4 &&
                "تجهيز ملف أعمال احترافي (Portfolio)، إجراء المقابلات الوظيفية التجريبية، والتواصل مع مسؤولي التوظيف."}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-purple-700 block">
              3. العائد المالي وفرص السوق
            </span>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">
              {activeRoadmapYear === 1 &&
                "استثمار الفائض المالي من تقليل تكلفة السكن في الدورات المتخصصة وشراء حاسوب محمول عالي الكفاءة."}
              {activeRoadmapYear === 2 &&
                "بدء العمل الحر المصغر (Freelancing) في المهام البسيطة لاسترداد جزء من المصروفات الدراسية."}
              {activeRoadmapYear === 3 &&
                "الاستعداد لسوق العمل الإقليمي وتحديد مسارات العمل عن بُعد مع شركات الخليج وأوروبا."}
              {activeRoadmapYear === 4 &&
                "التخرج مع فرصة عمل مؤكدة أو بدء العمل المهني برواتب أولية تتراوح بين 15,000 و 30,000 ج.م شهرياً."}
            </p>
          </div>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/future-me"
            className="inline-flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 underline underline-offset-4"
          >
            <span>استعرض تفاصيل سلاسل الرواتب والمهارات لجميع التخصصات</span>
            <ArrowRight className="w-3.5 h-3.5 rotate-180" />
          </Link>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 6. TRUST, PRIVACY & ZERO-TRUST SECURITY                              */}
      {/* ==================================================================== */}
      <section className="bg-slate-900 text-white rounded-2xl p-6 sm:p-10 shadow-xl space-y-6 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>الأمان والشفافية التامة</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-white">
            مبنية بمعايير Zero-Trust لحماية خصوصية أسرتك
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            المنصة صُممت هندسياً لتكون محايدة تماماً ومستقلة؛ لا إعلانات تجارية، لا بيع للبيانات، ولا تضليل بمعلومات غير مدعومة باللوائح.
          </p>
        </div>

        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <Lock className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">عزل البيانات بـ RLS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              سياسات أمان صارمة على مستوى الصفوف في Supabase تضمن عدم وصول أي طرف غير مصرح له لبيانات طلبك.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <Coins className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-white">تسعير شفاف 150 ج.م</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              رسوم استشارة ثابتة ومحددة لتغطية وقت المستشار في الفحص البشري والمذكرة الصوتية عبر InstaPay.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60 space-y-1.5">
            <CheckCircle2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-sm font-bold text-white">حيادية تامة واستقلالية</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              لا نروج لأي جامعة خاصة أو برنامج على حساب مصلحة الطالب؛ المعيار الوحيد هو مجموعك وميزانيتك وميولك.
            </p>
          </div>
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 7. FREQUENTLY ASKED QUESTIONS (FAQ ACCORDION)                        */}
      {/* ==================================================================== */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-xs font-semibold text-slate-700">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>الأسئلة الشائعة</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            إجابات واضحة لأهم تساؤلات أولياء الأمور والطلاب
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.q}
                className="bg-white border border-slate-200/90 rounded-xl overflow-hidden transition-all shadow-2xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full text-right p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-900 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-blue-600" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================================================================== */}
      {/* 8. FORMAL COMPLIANCE DISCLAIMER & FOOTER NOTICES                     */}
      {/* ==================================================================== */}
      <section className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-3 leading-relaxed">
        <div className="flex items-center gap-2 text-slate-800 font-bold">
          <Clock className="w-4 h-4 text-blue-600" />
          <span>تنبيه وإخلاء مسؤولية استرشادي — تحديث {COMPLIANCE_COPY.lastUpdatedYear}</span>
        </div>
        <p>
          {COMPLIANCE_COPY.officialDisclaimer}
        </p>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 font-mono">
          <span>آخر تحديث للقواعد الاسترشادية: 2026/2027</span>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-slate-900 underline">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="hover:text-slate-900 underline">
              الشروط والأحكام
            </Link>
            <Link href="/login" className="hover:text-slate-900 underline">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
