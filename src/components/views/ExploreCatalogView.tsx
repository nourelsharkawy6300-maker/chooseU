"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Building2,
  Scale,
  RotateCcw,
} from "lucide-react";
import { Faculty, StreamType } from "@/types/chooseu";
import { FACULTIES_DATABASE, EGYPT_GOVERNORATES } from "@/data/faculties-db";

interface ExploreCatalogViewProps {
  initialStream: StreamType;
  comparedIds: string[];
  onToggleCompare: (id: string) => void;
  onOpenFacultyDrawer: (faculty: Faculty) => void;
}

export function ExploreCatalogView({
  initialStream,
  comparedIds,
  onToggleCompare,
  onOpenFacultyDrawer,
}: ExploreCatalogViewProps) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [streamFilter, setStreamFilter] = useState<string>(initialStream);
  const [categoryFilter, setCategoryFilter] = useState<string>("الكل");
  const [govFilter, setGovFilter] = useState<string>("الكل");
  const [feeFilter, setFeeFilter] = useState<string>("الكل");
  const [aptitudeOnly, setAptitudeOnly] = useState<boolean>(false);

  const resetFilters = () => {
    setSearchQuery("");
    setStreamFilter("الكل");
    setCategoryFilter("الكل");
    setGovFilter("الكل");
    setFeeFilter("الكل");
    setAptitudeOnly(false);
  };

  const filteredFaculties = useMemo(() => {
    return FACULTIES_DATABASE.filter((f) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = f.name.toLowerCase().includes(q);
        const matchUni = f.university.toLowerCase().includes(q);
        const matchGov = f.gov.toLowerCase().includes(q);
        if (!matchTitle && !matchUni && !matchGov) return false;
      }

      // 2. Stream
      if (streamFilter !== "الكل") {
        if (f.stream !== "Both" && f.stream !== streamFilter) return false;
      }

      // 3. Category
      if (categoryFilter !== "الكل") {
        if (f.type !== categoryFilter) return false;
      }

      // 4. Governorate
      if (govFilter !== "الكل") {
        if (f.gov !== govFilter) return false;
      }

      // 5. Fee range
      if (feeFilter === "مجاني") {
        if (f.y1_base_fee > 0) return false;
      } else if (feeFilter === "أقل من 50,000") {
        if (f.y1_base_fee > 50000) return false;
      } else if (feeFilter === "أكثر من 50,000") {
        if (f.y1_base_fee <= 50000) return false;
      }

      // 6. Aptitude Test
      if (aptitudeOnly && !f.aptitude_test) {
        return false;
      }

      return true;
    });
  }, [
    searchQuery,
    streamFilter,
    categoryFilter,
    govFilter,
    feeFilter,
    aptitudeOnly,
  ]);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold mb-1">
            <Building2 className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>الدليل الأكاديمي الشامل للجامعات المصرية</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            استكشاف الكليات والبرامج التخصصية 2026
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            تصفح قاعدة بيانات الكليات الحكومية والأهلية والخاصة والتكنولوجية مع اللوائح والمصروفات
          </p>
        </div>

        <div className="text-[11px] font-mono font-bold px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
          إجمالي الكليات: {filteredFaculties.length} / {FACULTIES_DATABASE.length}
        </div>
      </div>

      {/* 2. Multi-Facet Search & Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 stroke-[1.5]" />
          <input
            type="text"
            placeholder="ابحث باسم الكلية أو الجامعة أو المحافظة (مثال: حاسبات، عين شمس، الذكاء الاصطناعي)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-[12px] text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600"
          />
        </div>

        {/* Multi-Facet Dropdowns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 text-[11px]">
          {/* Stream */}
          <div>
            <label className="block text-slate-500 mb-1 font-medium">الشعبة:</label>
            <select
              value={streamFilter}
              onChange={(e) => setStreamFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-800 cursor-pointer"
            >
              <option value="الكل">جميع الشُعب</option>
              <option value="Science">علمي علوم</option>
              <option value="Math">علمي رياضة</option>
              <option value="Arts">أدبي</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-slate-500 mb-1 font-medium">نوع الجامعة:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-800 cursor-pointer"
            >
              <option value="الكل">كل الأنواع</option>
              <option value="حكومي انتظام">حكومي انتظام</option>
              <option value="برامج خاصة وساعات معتمدة">برامج وساعات معتمدة</option>
              <option value="جامعات أهلية">جامعات أهلية</option>
              <option value="جامعات خاصة وتكنولوجية">خاصة وتكنولوجية</option>
            </select>
          </div>

          {/* Governorate */}
          <div>
            <label className="block text-slate-500 mb-1 font-medium">المحافظة:</label>
            <select
              value={govFilter}
              onChange={(e) => setGovFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-800 cursor-pointer"
            >
              <option value="الكل">كل المحافظات</option>
              {EGYPT_GOVERNORATES.map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
          </div>

          {/* Fee Range */}
          <div>
            <label className="block text-slate-500 mb-1 font-medium">المصروفات السنوية:</label>
            <select
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg p-2 font-bold text-slate-800 cursor-pointer"
            >
              <option value="الكل">كل الفئات</option>
              <option value="مجاني">مجاني (حكومي)</option>
              <option value="أقل من 50,000">أقل من 50,000 ج.م</option>
              <option value="أكثر من 50,000">أكثر من 50,000 ج.م</option>
            </select>
          </div>

          {/* Reset Action */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={resetFilters}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>إعادة تعيين</span>
            </button>
          </div>
        </div>

        {/* Aptitude test toggle */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
          <label className="inline-flex items-center gap-2 text-[11px] font-medium text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={aptitudeOnly}
              onChange={(e) => setAptitudeOnly(e.target.checked)}
              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
            />
            <span>عرض الكليات التي تتطلب اختبار قدرات مسبق فقط</span>
          </label>
        </div>
      </div>

      {/* 3. Catalog Grid */}
      {filteredFaculties.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center space-y-3 shadow-xs">
          <Building2 className="w-8 h-8 text-slate-400 mx-auto stroke-[1.5]" />
          <h3 className="text-sm font-bold text-slate-900">
            لم يتم العثور على كليات مطابقة لمعايير البحث الحالية
          </h3>
          <p className="text-[12px] text-slate-500">
            جرب تخفيف الفلاتر أو إعادة ضبط البحث لعرض كافة الكليات المتاحة.
          </p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-[12px] font-bold rounded-lg transition-colors cursor-pointer"
          >
            إعادة تعيين الفلاتر
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFaculties.map((faculty) => {
            const isCompared = comparedIds.includes(faculty.id);

            return (
              <div
                key={faculty.id}
                className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300 transition-colors shadow-2xs space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold truncate">
                      {faculty.type}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium">
                      {faculty.gov}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-[14px] font-bold text-slate-900 line-clamp-1">
                      {faculty.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {faculty.university}
                    </p>
                  </div>

                  {/* Badges / Metrics */}
                  <div className="bg-slate-50/70 rounded-lg p-2.5 border border-slate-100 flex items-center justify-around text-center text-[10px]">
                    <div>
                      <div className="text-slate-400">الحد الأدنى 2026</div>
                      <div className="font-mono font-bold text-slate-900 text-[12px] tabular-nums">
                        {faculty.cutoff_2026}%
                      </div>
                    </div>
                    <div className="w-px h-5 bg-slate-200" />
                    <div>
                      <div className="text-slate-400">المصروفات</div>
                      <div className="font-mono font-bold text-slate-900 text-[12px] tabular-nums">
                        {faculty.y1_base_fee === 0
                          ? "مجاني"
                          : `${(faculty.y1_base_fee / 1000).toFixed(0)}k ج.م`}
                      </div>
                    </div>
                    <div className="w-px h-5 bg-slate-200" />
                    <div>
                      <div className="text-slate-400">القدرات</div>
                      <div className="font-bold text-slate-700 text-[11px]">
                        {faculty.aptitude_test ? "مطلوب" : "بدون"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenFacultyDrawer(faculty)}
                    className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold rounded-lg transition-colors cursor-pointer text-center"
                  >
                    عرض التفاصيل واللائحة
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleCompare(faculty.id)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                      isCompared
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                    title={isCompared ? "إزالة من المقارنة" : "إضافة للمقارنة (VS)"}
                  >
                    <Scale className="w-4 h-4 stroke-[1.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
