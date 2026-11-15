import type { Metadata } from "next";
import { IBM_Plex_Sans_Arabic, JetBrains_Mono } from "next/font/google";
import Link from "next/link";
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
} from "lucide-react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const ibmPlexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans-arabic",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ChooseU | منصة التدقيق الأكاديمي والمالي للجامعات المصرية",
  description:
    "نظام التوجيه الجامعي، حساب التكلفة الشاملة (TCO)، وتحليل المسارات المهنية لطلاب الثانوية العامة وSTEM.",
};

interface NavItem {
  label: string;
  sublabel: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAVIGATION_ITEMS: NavItem[] = [
  {
    label: "مساحة العمل التحليلية",
    sublabel: "الرحلة الرباعية والاختبار النفسي",
    href: "/workspace",
    icon: Compass,
  },
  {
    label: "مصفوفة التكلفة الشاملة",
    sublabel: "تدقيق TCO والمحاكاة المالية",
    href: "/tco-matrix",
    icon: Calculator,
  },
  {
    label: "دليل الجامعات والأهلية",
    sublabel: "تنسيق الشعب والبدائل المتاحة",
    href: "/universities",
    icon: Building2,
  },
  {
    label: "خارطة المستقبل المهني",
    sublabel: "Future Me والمسارات الوظيفية",
    href: "/future-me",
    icon: Milestone,
  },
  {
    label: "التقرير الاستشاري (A4)",
    sublabel: "النسخة المعتمدة والملخص الصوتي",
    href: "/sample-report",
    icon: FileCheck2,
  },
  {
    label: "تتبع الطلب والدفع",
    sublabel: "بوابة InstaPay وحالة المراجعة",
    href: "/track-order",
    icon: Receipt,
  },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${ibmPlexArabic.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="bg-[#0F172A] text-slate-100 font-sans antialiased selection:bg-indigo-500/30 selection:text-indigo-200 overflow-hidden">
        <div className="flex h-screen w-screen overflow-hidden bg-[#0F172A]">
          <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:shrink-0 border-l border-slate-800 bg-[#0F172A]">
            <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-lg tracking-tight">
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
              <span className="inline-flex items-center rounded-md bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-300 border border-slate-700">
                v2.4
              </span>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-1">
              <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                وحدات المنصة الأساسية
              </div>
              {NAVIGATION_ITEMS.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800/70 hover:text-white"
                  >
                    <IconComponent className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-indigo-400" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-200 group-hover:text-white">
                        {item.label}
                      </p>
                      <p className="truncate text-xs text-slate-400">
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
                <span className="font-mono text-[11px] text-slate-400">
                  2026/2027
                </span>
              </div>
              <Link
                href="/admin"
                className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
                  بوابة المراجعين (Staff Admin)
                </span>
                <span className="font-mono text-[10px] text-slate-400">
                  /admin
                </span>
              </Link>
            </div>
          </aside>

          <div className="flex flex-1 flex-col min-w-0 overflow-hidden bg-[#0B1120]">
            <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-slate-800 bg-[#0F172A] px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar py-1">
                <div className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs">
                  <GraduationCap className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span className="text-slate-400 hidden sm:inline">الشعبة:</span>
                  <span className="font-semibold text-slate-100 whitespace-nowrap">
                    علمي رياضة (Math)
                  </span>
                </div>

                <div className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs">
                  <Percent className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="text-slate-400 hidden sm:inline">المجموع:</span>
                  <span className="font-mono font-semibold text-slate-100 tabular-nums whitespace-nowrap">
                    89.4%
                  </span>
                </div>

                <div className="flex items-center gap-2 rounded-md border border-slate-800 bg-slate-900/90 px-3 py-1.5 text-xs">
                  <Wallet className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span className="text-slate-400 hidden md:inline">
                    الميزانية السنوية:
                  </span>
                  <span className="font-mono font-semibold text-slate-100 tabular-nums whitespace-nowrap">
                    95,000 EGP
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/workspace?step=profile"
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
        <Analytics />
      </body>
    </html>
  );
}