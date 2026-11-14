"use client";

import React from "react";
import { Phone } from "lucide-react";
import { EnterpriseViewKey } from "@/types/chooseu";

interface EnterpriseFooterProps {
  onSelectView: (view: EnterpriseViewKey) => void;
}

export function EnterpriseFooter({ onSelectView }: EnterpriseFooterProps) {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-[#0B0F19] py-12 px-4 sm:px-6 lg:px-8 text-[12px] text-slate-400 no-print">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Philosophy & Identity */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center p-1.5 shadow-xs">
                <svg
                  width="16"
                  height="16"
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
              <span className="font-bold text-[16px] text-white">ChooseU</span>
            </div>
            <p className="text-[12px] text-slate-400 leading-relaxed">
              المنظومة الوطنية الموحدة للتوجيه الجامعي والتحليل المالي لطلاب
              الثانوية العامة والأزهرية والشهادات المعادلة 2026.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>حالة الأنظمة: تعمل بكفاءة 100%</span>
            </div>
          </div>

          {/* Column 2: Data Sources & Regulatory Compliance */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-[13px] text-white">
              مصادر البيانات الرسمية 2025/2026
            </h4>
            <ul className="space-y-1.5 text-[11px] text-slate-400">
              <li>• قرارات المجلس الأعلى للجامعات المصرية (SCU)</li>
              <li>• الحدود الدنيا لتنسيق 2024 و 2025 المعتمدة</li>
              <li>• لوائح البرامج الخاصة والساعات المعتمدة في 27 محافظة</li>
              <li>• دليل الجامعات الأهلية والخاصة المعتمدة بوزارة التعليم العالي</li>
            </ul>
          </div>

          {/* Column 3: Algorithm Methodology */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-[13px] text-white">
              منهجية التقييم الخوارزمي
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              يعتمد محرك التوجيه على معادلة الترجيح الرباعية:
              40% التوافق مع اختبار الميول سداسي الأبعاد + 30% أمان هامش
              التنسيق + 20% الملاءمة المالية لـ 4 سنوات (TCO) + 10% معيار
              الاستقرار الجغرافي وخفض تكلفة الاغتراب.
            </p>
          </div>

          {/* Column 4: Quick Views & Support */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-[13px] text-white">
              روابط سريعة واستشارات
            </h4>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => onSelectView("journey")}
                className="text-right text-blue-400 hover:text-blue-300 hover:underline cursor-pointer"
              >
                رحلة الـ 4 محطات
              </button>
              <button
                type="button"
                onClick={() => onSelectView("dashboard")}
                className="text-right text-slate-400 hover:text-white hover:underline cursor-pointer"
              >
                لوحة التحكم
              </button>
              <button
                type="button"
                onClick={() => onSelectView("assessment")}
                className="text-right text-slate-400 hover:text-white hover:underline cursor-pointer"
              >
                مختبر التقييم
              </button>
              <button
                type="button"
                onClick={() => onSelectView("tansik-simulator")}
                className="text-right text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
              >
                محاكي التنسيق
              </button>
              <button
                type="button"
                onClick={() => onSelectView("calculator")}
                className="text-right text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
              >
                حاسبة TCO
              </button>
              <button
                type="button"
                onClick={() => onSelectView("explore")}
                className="text-right text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
              >
                دليل الكليات
              </button>
              <button
                type="button"
                onClick={() => onSelectView("compare")}
                className="text-right text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
              >
                مواجهة VS
              </button>
              <button
                type="button"
                onClick={() => onSelectView("careers")}
                className="text-right text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
              >
                مرصد الوظائف
              </button>
              <button
                type="button"
                onClick={() => onSelectView("timeline")}
                className="text-right text-slate-600 hover:text-slate-900 hover:underline cursor-pointer"
              >
                مراحل التنسيق
              </button>
            </div>
            <a
              href="https://wa.me/201066594552"
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center gap-1.5 text-blue-700 hover:underline font-semibold text-[11px]"
            >
              <Phone className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>واتساب المستشار المعتمد: 01066594552</span>
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            جميع الحقوق محفوظة © 2026 ChooseU — One Platform. Every Student. Every
            Major. Every Future.
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectView("admin")}
              className="hover:underline text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              بوابة المشرفين والمستشارين
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => onSelectView("auth")}
              className="hover:underline text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              تسجيل الخروج والتبديل
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
