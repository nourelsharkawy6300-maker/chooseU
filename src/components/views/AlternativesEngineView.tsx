"use client";

import React, { useState } from "react";
import {
  Layers,
  Sparkles,
  Briefcase,
} from "lucide-react";
import { Faculty, StreamType } from "@/types/chooseu";
import { FACULTIES_DATABASE } from "@/data/faculties-db";

interface AlternativesEngineViewProps {
  stream: StreamType;
  score: number;
  onOpenFacultyDrawer: (faculty: Faculty) => void;
  onToggleCompare: (id: string) => void;
  comparedIds: string[];
}

interface CareerPathwayAlternative {
  id: string;
  title: string;
  stream: StreamType;
  dreamFacultyName: string;
  dreamCutoff: number;
  dreamUniversity: string;
  sameCareerRole: string;
  alternatives: {
    facultyId: string;
    name: string;
    university: string;
    type: string;
    cutoff: number;
    fee: number;
    overlapPct: number;
    advantageReason: string;
  }[];
}

export function AlternativesEngineView({
  stream,
  onOpenFacultyDrawer,
  onToggleCompare,
  comparedIds,
}: AlternativesEngineViewProps) {
  const pathways: CareerPathwayAlternative[] = [
    {
      id: "cs_ai",
      title: "هندسة البرمجيات والذكاء الاصطناعي",
      stream: "Math",
      dreamFacultyName: "حاسبات ومعلومات (حكومي انتظام)",
      dreamCutoff: 88.5,
      dreamUniversity: "جامعة القاهرة / عين شمس",
      sameCareerRole: "مهندس برمجيات • متخصص ذكاء اصطناعي • مهندس بيانات",
      alternatives: [
        {
          facultyId: "f_eelu_cs",
          name: "كلية الحاسبات وتكنولوجيا المعلومات",
          university: "الجامعة المصرية للتعلم الإلكتروني الأهلية (EELU)",
          type: "جامعات أهلية",
          cutoff: 78.0,
          fee: 38000,
          overlapPct: 94,
          advantageReason:
            "منهج مطابق بنسبة 94%، شراكات مع جامعات حكومية، ونظام ساعات معتمدة مرن يؤهلك لنفس الوظائف الدولية.",
        },
        {
          facultyId: "f_tech_cs",
          name: "كلية تكنولوجيا العلوم الصحية والصناعية",
          university: "جامعة مصر التكنولوجية الدولية",
          type: "جامعات خاصة وتكنولوجية",
          cutoff: 72.5,
          fee: 32000,
          overlapPct: 88,
          advantageReason:
            "تركيز عملي وتطبيقي على بنية النظم والأمن السيبراني، مع سنة تدريب إجبارية بالشركات.",
        },
        {
          facultyId: "f_cairo_bis",
          name: "برنامج نظم معلومات الأعمال (BIS)",
          university: "جامعة القاهرة (برامج خاصة)",
          type: "برامج خاصة وساعات معتمدة",
          cutoff: 75.0,
          fee: 28000,
          overlapPct: 85,
          advantageReason:
            "دمج قوي بين تحليل البيانات وتطوير النظم وإدارة الأعمال التقنية، مطلوب بشدة في البنوك والشركات متعددة الجنسيات.",
        },
      ],
    },
    {
      id: "med_health",
      title: "القطاع الطبي والعلوم الصحية",
      stream: "Science",
      dreamFacultyName: "كلية الطب البشري (حكومي انتظام)",
      dreamCutoff: 91.5,
      dreamUniversity: "جامعة الإسكندرية / القصر العيني",
      sameCareerRole: "أخصائي رعاية صحية • أخصائي تحاليل وتكنولوجيا حيوية • صيدلي إكلينيكي",
      alternatives: [
        {
          facultyId: "f_nile_biotech",
          name: "كلية التكنولوجيا الحيوية (Biotechnology)",
          university: "جامعة النيل الأهلية",
          type: "جامعات أهلية",
          cutoff: 80.0,
          fee: 65000,
          overlapPct: 90,
          advantageReason:
            "مجال المستقبل في الجينوم وتطوير اللقاحات والأبحاث الجينية، تفتح فرص عمل دولية في معامل الأبحاث العالمية.",
        },
        {
          facultyId: "f_tech_health",
          name: "كلية تكنولوجيا العلوم الصحية التطبيقية",
          university: "جامعة 6 أكتوبر التكنولوجية",
          type: "جامعات خاصة وتكنولوجية",
          cutoff: 74.0,
          fee: 35000,
          overlapPct: 86,
          advantageReason:
            "تكليف مهني معتمد وتسجيل بنقابة التكنولوجيين الصحيين، تخصصات المختبرات الطبية والأشعة والرعاية المركزة.",
        },
        {
          facultyId: "f_cairo_pt",
          name: "كلية العلاج الطبيعي والتأهيل",
          university: "جامعة بنها الأهلية",
          type: "جامعات أهلية",
          cutoff: 84.5,
          fee: 65000,
          overlapPct: 88,
          advantageReason:
            "ترخيص مزاولة مهنة طبية وعيادات تأهيل مستقلة، مع طلب إقليمي ودولي مرتفع.",
        },
      ],
    },
    {
      id: "fin_biz",
      title: "إدارة الأعمال والتمويل الدولي",
      stream: "Arts",
      dreamFacultyName: "كلية الاقتصاد والعلوم السياسية (حكومي)",
      dreamCutoff: 86.0,
      dreamUniversity: "جامعة القاهرة",
      sameCareerRole: "محلل مالي واستثماري • مدير تسويق دولي • مستشار اقتصادي",
      alternatives: [
        {
          facultyId: "f_cairo_fmi",
          name: "برنامج الأسواق والمنشآت المالية (FMI)",
          university: "جامعة حلوان (برامج خاصة)",
          type: "برامج خاصة وساعات معتمدة",
          cutoff: 71.0,
          fee: 25000,
          overlapPct: 92,
          advantageReason:
            "دراسة باللغة الإنجليزية متخصصة في البورصة والاستثمار وإدارة المحافظ، تفضله بنوك الاستثمار.",
        },
        {
          facultyId: "f_bue_econ",
          name: "كلية الاقتصاد وإدارة الأعمال",
          university: "الجامعة البريطانية في مصر (BUE)",
          type: "جامعات خاصة وتكنولوجية",
          cutoff: 68.0,
          fee: 85000,
          overlapPct: 95,
          advantageReason:
            "شهادة بريطانية مزدوجة (London South Bank) تؤهل للعمل مباشرة في الأسواق الخليجية والأوروبية.",
        },
      ],
    },
  ];

  const currentPathways = pathways.filter(
    (p) => p.stream === stream || stream === "Science" || stream === "Math"
  );

  const [activePathwayId, setActivePathwayId] = useState<string>(
    currentPathways[0]?.id || "cs_ai"
  );

  const activePathway =
    pathways.find((p) => p.id === activePathwayId) || pathways[0];

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold mb-1">
            <Layers className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>الكليات والمسارات البديلة</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            نفس المستقبل المهني، بمسارات قبول أوسع
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            إذا لم يحالفك المجموع في الكلية الحكومية الحلم، استكشف البرامج الموازية التي تشترك في 90%+ من المقررات
          </p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px]">
          {pathways.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setActivePathwayId(p.id)}
              className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
                activePathway.id === p.id
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Visual Dream vs Reality Connection Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
        {/* The Dream Faculty Anchor */}
        <div className="bg-slate-900 text-white rounded-xl p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-300 px-2 py-0.5 rounded bg-slate-800">
                الكلية الحلم المستهدفة (DREAM BENCHMARK)
              </span>
              <h2 className="text-lg font-bold text-white">
                {activePathway.dreamFacultyName} — {activePathway.dreamUniversity}
              </h2>
            </div>
            <div className="text-right sm:text-left">
              <div className="text-[10px] text-slate-400">الحد الأدنى الحكومي</div>
              <div className="text-2xl font-mono font-bold text-white tabular-nums">
                {activePathway.dreamCutoff}%
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center gap-2 text-[12px] text-slate-300">
            <Briefcase className="w-4 h-4 text-blue-400 stroke-[1.5]" />
            <span>
              <strong>المسار الوظيفي المشترك:</strong> {activePathway.sameCareerRole}
            </span>
          </div>
        </div>

        {/* The Alternative Routes Heading */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600 stroke-[1.5]" />
            <h3 className="text-sm font-bold text-slate-900">
              البدائل المعتمدة لنفس المسار المهني
            </h3>
          </div>
          <p className="text-[11px] text-slate-500">
            تمنحك نفس المهارات ورخصة العمل بحدود دنيا أقل تتوافق مع مجموعك
          </p>
        </div>

        {/* 3 Alternatives Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activePathway.alternatives.map((alt) => {
            const facultyObj = FACULTIES_DATABASE.find((f) => f.id === alt.facultyId) || FACULTIES_DATABASE[0];
            const isCompared = comparedIds.includes(facultyObj.id);
            const cutoffDiff = +(activePathway.dreamCutoff - alt.cutoff).toFixed(1);

            return (
              <div
                key={alt.facultyId}
                className="border border-slate-200 rounded-xl p-4 bg-white flex flex-col justify-between hover:border-slate-300 transition-colors shadow-2xs space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
                      تطابق منهج {alt.overlapPct}%
                    </span>
                    <span className="text-[10px] font-bold text-blue-600">
                      أقل بـ {cutoffDiff}%
                    </span>
                  </div>

                  <div>
                    <h4 className="text-[13px] font-bold text-slate-900 line-clamp-1">
                      {alt.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {alt.university} • {alt.type}
                    </p>
                  </div>

                  {/* Cutoff & Fee metrics */}
                  <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex items-center justify-around text-center text-[10px]">
                    <div>
                      <div className="text-slate-400">الحد الأدنى</div>
                      <div className="font-mono font-bold text-slate-900 text-xs tabular-nums">
                        {alt.cutoff}%
                      </div>
                    </div>
                    <div className="w-px h-5 bg-slate-200" />
                    <div>
                      <div className="text-slate-400">المصروفات السنوية</div>
                      <div className="font-mono font-bold text-slate-900 text-xs tabular-nums">
                        {alt.fee.toLocaleString("en-US")} ج.م
                      </div>
                    </div>
                  </div>

                  {/* Advantage Reason */}
                  <p className="text-[11px] text-slate-600 leading-relaxed bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
                    {alt.advantageReason}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenFacultyDrawer(facultyObj)}
                    className="flex-1 py-1.5 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg text-[11px] font-bold transition-colors cursor-pointer text-center"
                  >
                    تفاصيل الكلية
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleCompare(facultyObj.id)}
                    className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                      isCompared
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-white border-slate-200 hover:bg-slate-50 text-slate-700"
                    }`}
                    title={isCompared ? "إزالة من المقارنة" : "إضافة للمقارنة"}
                  >
                    <Layers className="w-4 h-4 stroke-[1.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
