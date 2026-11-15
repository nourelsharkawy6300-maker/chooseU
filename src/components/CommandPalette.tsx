"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  X,
  Compass,
  SlidersHorizontal,
  Calculator,
  Layers,
  Scale,
  Briefcase,
  User,
  ShieldCheck,
  Building2,
} from "lucide-react";
import { EnterpriseViewKey, Faculty } from "@/types/chooseu";
import { FACULTIES_DATABASE } from "@/data/faculties-db";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectView: (view: EnterpriseViewKey) => void;
  onSelectFaculty: (fac: Faculty) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onSelectView,
  onSelectFaculty,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else setQuery("");
      } else if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const viewOptions: {
    key: EnterpriseViewKey;
    title: string;
    category: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  }[] = [
    { key: "journey", title: "خطوات التنسيق واختبار الميول (4-Station Journey)", category: "التوجيه", icon: Compass },
    { key: "landing", title: "الصفحة الرئيسية (Home)", category: "الرئيسية", icon: Building2 },
    { key: "dashboard", title: "لوحة التحكم الأكاديمية (Dashboard)", category: "التحليل الأكاديمي", icon: Compass },
    { key: "assessment", title: "اختبار الميول والتقييم الأكاديمي (Assessment)", category: "التحليل الأكاديمي", icon: Compass },
    { key: "tansik-simulator", title: "محاكاة درجات التنسيق والحدود الدنيا", category: "التنسيق", icon: SlidersHorizontal },
    { key: "calculator", title: "حاسبة التكلفة الشاملة لسنوات الدراسة (TCO)", category: "التخطيط المالي", icon: Calculator },
    { key: "explore", title: "دليل استكشاف الكليات والجامعات", category: "الاستكشاف", icon: Building2 },
    { key: "compare", title: "مقارنة الكليات والبرامج الأكاديمية", category: "الاستكشاف", icon: Scale },
    { key: "alternatives", title: "ترتيب الرغبات والمسارات البديلة", category: "الاستكشاف", icon: Layers },
    { key: "careers", title: "دليل الوظائف وسوق العمل (Future Me)", category: "سوق العمل", icon: Briefcase },
    { key: "profile", title: "بيانات الطالب والملف الأكاديمي", category: "الملف الشخصي", icon: User },
    { key: "admin", title: "دخول الإدارة", category: "الإدارة", icon: ShieldCheck },
  ];

  const filteredViews = viewOptions.filter(
    (v) =>
      v.title.toLowerCase().includes(query.toLowerCase()) ||
      v.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredFaculties = query.trim()
    ? FACULTIES_DATABASE.filter(
        (f) =>
          f.name.toLowerCase().includes(query.toLowerCase()) ||
          f.university.toLowerCase().includes(query.toLowerCase()) ||
          f.gov.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 overflow-y-auto no-print">
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 bg-slate-50">
          <Search className="w-4 h-4 text-slate-400 shrink-0 stroke-[1.5]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث عن صفحة، كلية، جامعة، أو تخصص (اكتب للبحث)..."
            className="w-full bg-transparent text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-slate-500 bg-white border border-slate-200 rounded">
            ESC
          </kbd>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Search Results list */}
        <div className="max-h-[60vh] overflow-y-auto p-2 space-y-4">
          {/* Quick Views */}
          <div>
            <div className="px-3 py-1.5 text-xs font-semibold text-slate-400">
              أقسام المنصة
            </div>
            <div className="space-y-1">
              {filteredViews.slice(0, 7).map((item) => {
                const IconComp = item.icon;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      onSelectView(item.key);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-right hover:bg-slate-100 transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-slate-200/80 group-hover:bg-[#377ef0] group-hover:text-white flex items-center justify-center text-slate-700 transition-colors">
                        <IconComp className="w-3.5 h-3.5 stroke-[1.5]" />
                      </div>
                      <span className="text-[12px] font-semibold text-slate-800">
                        {item.title}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Faculties */}
          {filteredFaculties.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <div className="px-3 py-1.5 text-xs font-semibold text-slate-400">
                الكليات والبرامج المعتمدة
              </div>
              <div className="space-y-1">
                {filteredFaculties.map((fac) => (
                  <button
                    key={fac.id}
                    type="button"
                    onClick={() => {
                      onSelectFaculty(fac);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-lg text-right hover:bg-slate-100 transition-colors cursor-pointer group"
                  >
                    <div>
                      <div className="text-[12px] font-bold text-slate-900">
                        {fac.name}
                      </div>
                      <div className="text-[10px] text-slate-600">
                        {fac.university} • محافظة {fac.gov}
                      </div>
                    </div>
                    <div className="text-left">
                      <span className="text-[11px] font-bold text-blue-700 tabular-nums">
                        {fac.cutoff_2026}%
                      </span>
                      <span className="block text-[9px] text-slate-600">
                        {fac.y1_base_fee.toLocaleString()} ج.م
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 text-[10px] text-slate-600 flex items-center justify-between">
          <span>استخدم الأسهم للتنقل و Enter للاختيار</span>
          <span>منظومة ChooseU 2026</span>
        </div>
      </div>
    </div>
  );
}
