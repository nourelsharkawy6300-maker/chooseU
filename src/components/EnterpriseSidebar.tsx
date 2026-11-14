"use client";

import React from "react";
import {
  Compass,
  SlidersHorizontal,
  Calculator,
  Layers,
  Scale,
  Sparkles,
  Briefcase,
  CalendarCheck,
  User,
  ShieldCheck,
  CheckCircle2,
  Building2,
  GraduationCap,
  ChevronRight,
  ChevronLeft,
  X,
  Phone,
} from "lucide-react";
import { EnterpriseViewKey } from "@/types/chooseu";

interface EnterpriseSidebarProps {
  currentView: EnterpriseViewKey;
  onSelectView: (view: EnterpriseViewKey) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  vsCount: number;
}

export function EnterpriseSidebar({
  currentView,
  onSelectView,
  isOpenMobile,
  onCloseMobile,
  isCollapsed,
  onToggleCollapse,
  vsCount,
}: EnterpriseSidebarProps) {
  const navSections = [
    {
      title: "رحلة التوجيه الموحدة",
      items: [
        {
          key: "journey" as EnterpriseViewKey,
          label: "رحلة الـ 4 محطات (Journey Stepper)",
          icon: Compass,
        },
        {
          key: "landing" as EnterpriseViewKey,
          label: "بوابة البداية والأنيميشن (Hero)",
          icon: Sparkles,
        },
        {
          key: "auth" as EnterpriseViewKey,
          label: "بوابة الدخول والحساب",
          icon: GraduationCap,
        },
        {
          key: "onboarding" as EnterpriseViewKey,
          label: "معالج الإعداد الذكي",
          icon: CheckCircle2,
        },
      ],
    },
    {
      title: "التحليل الذكي والأبعاد",
      items: [
        {
          key: "dashboard" as EnterpriseViewKey,
          label: "لوحة التحكم التنفيذية",
          icon: Compass,
        },
        {
          key: "assessment" as EnterpriseViewKey,
          label: "مختبر التقييم والتقرير",
          icon: Sparkles,
        },
        {
          key: "tansik-simulator" as EnterpriseViewKey,
          label: "محاكي درجات التنسيق",
          icon: SlidersHorizontal,
        },
        {
          key: "calculator" as EnterpriseViewKey,
          label: "حاسبة تكلفة 4 سنوات (TCO)",
          icon: Calculator,
        },
      ],
    },
    {
      title: "الاستكشاف وسوق العمل",
      items: [
        {
          key: "explore" as EnterpriseViewKey,
          label: "دليل استكشاف الكليات",
          icon: Building2,
        },
        {
          key: "compare" as EnterpriseViewKey,
          label: "مواجهة الكليات (VS Arena)",
          icon: Scale,
          badge: vsCount > 0 ? vsCount : undefined,
        },
        {
          key: "alternatives" as EnterpriseViewKey,
          label: "محرك الحلم والبديل",
          icon: Layers,
        },
        {
          key: "careers" as EnterpriseViewKey,
          label: "مرصد الوظائف والمرتبات",
          icon: Briefcase,
        },
      ],
    },
    {
      title: "التخطيط والإدارة",
      items: [
        {
          key: "timeline" as EnterpriseViewKey,
          label: "مراحل التنسيق والمستندات",
          icon: CalendarCheck,
        },
        {
          key: "profile" as EnterpriseViewKey,
          label: "الملف وتقرير ولي الأمر",
          icon: User,
        },
        {
          key: "admin" as EnterpriseViewKey,
          label: "بوابة المستشارين (Staff)",
          icon: ShieldCheck,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col justify-between select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center p-1.5 shadow-xs shrink-0">
              <svg
                width="18"
                height="18"
                viewBox="0 0 36 36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M23 11.5C19.5 11.5 16.5 11.5 14.5 13.5C12.5 15.5 12.5 20.5 14.5 22.5C16.5 24.5 19.5 24.5 23 24.5"
                  stroke="#FFFFFF"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <path
                  d="M17.5 11.5V20.5C17.5 22.7 19.3 24.5 21.5 24.5C23.7 24.5 25.5 22.7 25.5 20.5V11.5"
                  stroke="#2563EB"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                />
                <circle cx="25.5" cy="11.5" r="2.2" fill="#60A5FA" />
                <circle cx="13.2" cy="18" r="1.8" fill="#FFFFFF" />
              </svg>
            </div>
            {!isCollapsed && (
              <div>
                <span className="font-bold text-[16px] tracking-tight text-slate-900 block leading-tight">
                  ChooseU
                </span>
                <span className="text-[10px] text-slate-600 block">
                  المنظومة الوطنية 2026
                </span>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
            title={isCollapsed ? "توسيع القائمة" : "طي القائمة"}
          >
            {isCollapsed ? (
              <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
            ) : (
              <ChevronRight className="w-4 h-4 stroke-[1.5]" />
            )}
          </button>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="lg:hidden p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="px-3 space-y-5 overflow-y-auto max-h-[calc(100vh-140px)]">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              {!isCollapsed && (
                <div className="px-2.5 py-1 text-[10px] font-bold text-slate-600 tracking-wider">
                  {sec.title}
                </div>
              )}
              <div className="space-y-0.5">
                {sec.items.map((item) => {
                  const isActive = currentView === item.key;
                  const IconComp = item.icon;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        onSelectView(item.key);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-right text-[12px] font-medium transition-colors cursor-pointer group ${
                        isActive
                          ? "bg-[#0F172A] text-white font-semibold shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <IconComp
                          className={`w-4 h-4 shrink-0 stroke-[1.5] ${
                            isActive
                              ? "text-blue-400"
                              : "text-slate-500 group-hover:text-slate-900"
                          }`}
                        />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>

                      {!isCollapsed && item.badge !== undefined && (
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold tabular-nums ${
                            isActive
                              ? "bg-blue-600 text-white"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-medium text-slate-700">تحديثات التنسيق 2026 مفعلة</span>
          </div>
          <a
            href="https://wa.me/201066594552"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-blue-700 hover:underline font-semibold"
          >
            <Phone className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>استشارة فورية مع مستشار</span>
          </a>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Persistent RTL Sidebar */}
      <aside
        className={`hidden lg:block bg-white border-l border-slate-200 transition-all duration-200 sticky top-16 self-start z-30 h-[calc(100vh-4rem)] shrink-0 no-print ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop & Sidebar */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 lg:hidden flex justify-end no-print"
          onClick={onCloseMobile}
        >
          <div
            className="w-72 bg-white h-full shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
