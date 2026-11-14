"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarCheck,
  CheckCircle2,
  Printer,
  RotateCcw,
} from "lucide-react";

interface TimelinePhase {
  id: string;
  stageName: string;
  expectedDate: string;
  minScoreScience: string;
  minScoreMath: string;
  minScoreArts: string;
  status: "قادم" | "جاري" | "مكتمل";
  details: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  requiredForMaleOnly?: boolean;
}

export function TimelineChecklistView() {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);

  // Load from localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem("chooseu_admission_checklist");
        if (saved) {
          setCheckedIds(JSON.parse(saved));
        }
      } catch {
        // fallback
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggleItem = (id: string) => {
    const next = checkedIds.includes(id)
      ? checkedIds.filter((item) => item !== id)
      : [...checkedIds, id];
    setCheckedIds(next);
    try {
      localStorage.setItem("chooseu_admission_checklist", JSON.stringify(next));
    } catch {
      // fallback
    }
  };

  const resetChecklist = () => {
    setCheckedIds([]);
    try {
      localStorage.removeItem("chooseu_admission_checklist");
    } catch {
      // fallback
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const phases: TimelinePhase[] = [
    {
      id: "phase_1",
      stageName: "المرحلة الأولى للتنسيق الحكومي (Stage 1)",
      expectedDate: "أواخر يوليو / أوائل أغسطس 2026",
      minScoreScience: "88.5% فأكثر",
      minScoreMath: "83.0% فأكثر",
      minScoreArts: "70.0% فأكثر",
      status: "قادم",
      details: "تسجيل رغبات كليات القمة (طب، أسنان، علاج، صيدلة، هندسة، حاسبات، اقتصاد وسياسة، إعلام، ألسن).",
    },
    {
      id: "phase_2",
      stageName: "المرحلة الثانية للتنسيق الحكومي (Stage 2)",
      expectedDate: "منتصف أغسطس 2026",
      minScoreScience: "68.0% فأكثر",
      minScoreMath: "60.0% فأكثر",
      minScoreArts: "58.0% فأكثر",
      status: "قادم",
      details: "تسجيل رغبات الكليات النظرية والمعاهد العليا وبواقي كليات الحاسبات والتمريض والعلوم والتربية والآداب.",
    },
    {
      id: "phase_reduct",
      stageName: "مرحلة تقليل الاغتراب والتحويلات (القومية والإقليمية)",
      expectedDate: "أواخر أغسطس 2026",
      minScoreScience: "جميع المرشحين",
      minScoreMath: "جميع المرشحين",
      minScoreArts: "جميع المرشحين",
      status: "قادم",
      details: "التحويل المناظر وغير المناظر للتقريب إلى النطاق الجغرافي (أ) في حدود نسبة الـ 10% المقررة من المجلس الأعلى.",
    },
    {
      id: "phase_ahleya",
      stageName: "تنسيق الجامعات الأهلية والتكنولوجية والخاصة",
      expectedDate: "بالتوازي مع المرحلتين الأولى والثانية",
      minScoreScience: "وفق الحدود الدنيا المعتمدة",
      minScoreMath: "وفق الحدود الدنيا المعتمدة",
      minScoreArts: "وفق الحدود الدنيا المعتمدة",
      status: "قادم",
      details: "التقديم الإلكتروني المباشر عبر مواقع الجامعات الأهلية الدولية (الجلالة، العلمين، الملك سلمان، المنصورة الجديدة) والأهلية المنبثقة من الحكومية.",
    },
    {
      id: "phase_3",
      stageName: "المرحلة الثالثة ومستنفدو الرغبات والشهادات المعادلة",
      expectedDate: "أوائل سبتمبر 2026 (بعد نتيجة الدور الثاني)",
      minScoreScience: "50% فأكثر",
      minScoreMath: "50% فأكثر",
      minScoreArts: "50% فأكثر",
      status: "قادم",
      details: "استكمال الترشيح للمعاهد الفنية والجامعات العمالية وباقي الكليات المتاحة.",
    },
  ];

  const checklistItems: ChecklistItem[] = [
    {
      id: "doc_thanaweya",
      label: "أصل استمارة نجاح الثانوية العامة (البيضاء الأصلية)",
      description: "مع عدد 4 صور ضوئية واضحة منها.",
    },
    {
      id: "doc_birth",
      label: "أصل شهادة الميلاد الكمبيوتر الحديثة (مائية)",
      description: "تحتوي على الرقم القومي والرقم التأميني الثلاثي للذكور + 4 صور.",
    },
    {
      id: "doc_photos",
      label: "عدد 8 صور شخصية حديثة مقاس 4×6",
      description: "خلفية بيضاء، ويكتب اسم الطالب والرقم القومي خلف كل صورة.",
    },
    {
      id: "doc_gond",
      label: "نماذج التجنيد للطلاب الذكور (نموذج 2 جند + بطاقة 6 جند أو 7 جند)",
      description: "تستخرج من قسم الشرطة أو مديرية الأمن التابع لها محل السكن.",
      requiredForMaleOnly: true,
    },
    {
      id: "doc_tansik_card",
      label: "بطاقة الترشيح النهائية المطبوعة من موقع التنسيق",
      description: "تطبع بعد إعلان نتيجة التنسيق وتقليل الاغتراب وتكون ملونة.",
    },
    {
      id: "doc_id_cards",
      label: "صور بطاقة الرقم القومي للطالب وولي الأمر (سارية)",
      description: "عدد 3 صور من بطاقة الطالب + صورتين من بطاقة ولي الأمر.",
    },
    {
      id: "doc_medical",
      label: "استمارة الكشف الطبي المعتمدة من الإدارة الطبية بالجامعة",
      description: "يتم حجز موعد الكشف الطبي عبر موقع الجامعة وسداد رسومه المقررة.",
    },
    {
      id: "doc_receipt",
      label: "إيصال سداد المصروفات الدراسية (فوري / فيزا بنكية)",
      description: "إيصال السداد البنكي الدال على دفع القسط الأول أو المصروفات الإدارية.",
    },
  ];

  const totalItems = checklistItems.length;
  const completedCount = checkedIds.length;
  const progressPercent = Math.round((completedCount / totalItems) * 100);

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold mb-1">
            <CalendarCheck className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>الجدول الزمني ومستندات التقديم الرسمي 2026</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            مراحل التنسيق وملف التقديم الورقي للجامعة
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            الجدول الزمني المعتمد لفتح مراحل التنسيق وقائمة الفحص التفاعلية لأوراق ملف التقديم
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#0F172A] hover:bg-slate-800 text-white text-[12px] font-bold rounded-lg transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>طباعة القائمة</span>
          </button>
        </div>
      </div>

      {/* 2. Interactive Folder Checklist */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 stroke-[1.5]" />
              <h2 className="text-base font-bold text-slate-900">
                قائمة فحص ملف التقديم الورقي (Admission Dossier Checklist)
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              حدد المستندات التي قمت بتجهيزها؛ يتم حفظ التحديد تلقائياً في متصفحك
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] text-slate-500 font-medium">جاهزية الملف</div>
              <div className="text-base font-mono font-bold text-emerald-600 tabular-nums">
                {completedCount} من {totalItems} ({progressPercent}%)
              </div>
            </div>
            <button
              type="button"
              onClick={resetChecklist}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 rounded-lg transition-colors cursor-pointer"
              title="إعادة ضبط القائمة"
            >
              <RotateCcw className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Checklist items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {checklistItems.map((item) => {
            const isDone = checkedIds.includes(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleItem(item.id)}
                className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer flex items-start gap-3 ${
                  isDone
                    ? "bg-emerald-50/50 border-emerald-300"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 border ${
                    isDone
                      ? "bg-emerald-600 border-emerald-600 text-white"
                      : "border-slate-300 bg-white"
                  }`}
                >
                  {isDone && <CheckCircle2 className="w-3.5 h-3.5 stroke-[2]" />}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[12px] font-bold ${
                        isDone ? "text-emerald-950 line-through" : "text-slate-900"
                      }`}
                    >
                      {item.label}
                    </span>
                    {item.requiredForMaleOnly && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        ذكور فقط
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Chronological Coordination Stages Roadmap */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            الجدول الزمني لمراحل التنسيق والحدود الدنيا المتوقعة
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            طبقاً لقرارات المجلس الأعلى للجامعات ووزارة التعليم العالي والبحث العلمي
          </p>
        </div>

        <div className="relative border-r-2 border-slate-200 pr-5 space-y-6 mr-2">
          {phases.map((ph) => (
            <div key={ph.id} className="relative space-y-2">
              <div className="absolute -right-[27px] top-1 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white" />

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h3 className="text-sm font-bold text-slate-900">
                  {ph.stageName}
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  {ph.expectedDate}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-[11px]">
                <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 font-medium">
                  علمي علوم: {ph.minScoreScience}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                  علمي رياضة: {ph.minScoreMath}
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-medium">
                  أدبي: {ph.minScoreArts}
                </span>
              </div>

              <p className="text-[12px] text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                {ph.details}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
