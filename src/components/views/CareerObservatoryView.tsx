"use client";

import React, { useState } from "react";
import {
  Briefcase,
  TrendingUp,
  AlertTriangle,
  Award,
  DollarSign,
  Cpu,
  Layers,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
} from "lucide-react";

interface CareerTrackData {
  id: string;
  title: string;
  sector: string;
  roles: string[];
  salaryEgypt: string;
  salaryRemoteUsd: string;
  demandTrend: "نمو فائق (+35%)" | "نمو قوي (+20%)" | "متوازن ومستقر" | "تشبع نسبي";
  demandColor: string;
  aiRiskLevel: "منخفض جداً (محمي)" | "متوسط (أداة مساعدة)" | "مرتفع (معرض للأتمتة)";
  aiRiskColor: string;
  aiRiskDesc: string;
  topCerts: string[];
  year1to4Focus: string[];
}

export function CareerObservatoryView() {
  const [selectedSector, setSelectedSector] = useState<string>("الكل");

  const careerTracks: CareerTrackData[] = [
    {
      id: "ai_swe",
      title: "هندسة البرمجيات والذكاء الاصطناعي التوليدي",
      sector: "التكنولوجيا والبرمجيات",
      roles: ["Full-Stack Engineer", "AI/ML Specialist", "Data Engineer", "Cloud Architect"],
      salaryEgypt: "22,000 - 95,000 ج.م / شهرياً",
      salaryRemoteUsd: "$1,800 - $6,500 / شهرياً",
      demandTrend: "نمو فائق (+35%)",
      demandColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      aiRiskLevel: "منخفض جداً (محمي)",
      aiRiskColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      aiRiskDesc: "الذكاء الاصطناعي يسرع الإنتاجية ولكنه يزيد الطلب على مهندسي النظم المعقدة.",
      topCerts: ["AWS Solutions Architect", "Google Cloud ML Engineer", "CKA Kubernetes"],
      year1to4Focus: [
        "سنة 1: خوارزميات وهياكل بيانات + Python & C++",
        "سنة 2: أنظمة تشغيل وشبكات + قواعد بيانات SQL/NoSQL",
        "سنة 3: هندسة برمجيات سحابية + مشاريع مفتوحة المصدر",
        "سنة 4: مشروع تخرج عملي + تدريب شركات عالمية",
      ],
    },
    {
      id: "cyber_sec",
      title: "الأمن السيبراني والدفاع الرقمي",
      sector: "التكنولوجيا والبرمجيات",
      roles: ["SOC Analyst", "Penetration Tester", "Cloud Security Engineer", "CISO"],
      salaryEgypt: "25,000 - 110,000 ج.م / شهرياً",
      salaryRemoteUsd: "$2,200 - $7,000 / شهرياً",
      demandTrend: "نمو فائق (+35%)",
      demandColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      aiRiskLevel: "منخفض جداً (محمي)",
      aiRiskColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      aiRiskDesc: "مجال أمني حساس يتطلب تدخلاً بشرياً صارماً وتحليلاً جنائياً معقداً.",
      topCerts: ["CompTIA Security+", "CEH", "OSCP (Offensive Security)", "CISSP"],
      year1to4Focus: [
        "سنة 1: شبكات TCP/IP ونظم Linux المتقدمة",
        "سنة 2: كشف الثغرات والبرمجة النصية (Python/Bash)",
        "سنة 3: اختبار الاختراق وأمن السحابة",
        "سنة 4: شهادة OSCP والتدريب في مراكز العمليات الأمنية",
      ],
    },
    {
      id: "biotech_pharma",
      title: "التكنولوجيا الحيوية والتحاليل الجينية",
      sector: "القطاع الطبي والصحي",
      roles: ["Biotech Researcher", "Clinical Trial Analyst", "Bioinformatics Specialist"],
      salaryEgypt: "18,000 - 65,000 ج.م / شهرياً",
      salaryRemoteUsd: "$1,200 - $4,000 / شهرياً",
      demandTrend: "نمو قوي (+20%)",
      demandColor: "text-blue-700 bg-blue-50 border-blue-200",
      aiRiskLevel: "منخفض جداً (محمي)",
      aiRiskColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      aiRiskDesc: "أبحاث معملية واختبارات حيوية ميدانية غير قابلة للأتمتة الكاملة.",
      topCerts: ["GMP Pharma Certification", "Next-Gen Sequencing (NGS)", "GLP Lab Auditor"],
      year1to4Focus: [
        "سنة 1: كيمياء عضوية وحيوية وبيولوجيا جزيئية",
        "سنة 2: تقنيات PCR والتحليل الطيفي والمعملي",
        "سنة 3: المعلوماتية الحيوية (Bioinformatics)",
        "سنة 4: بحوث سريرية في مراكز الأورام وشركات اللقاحات",
      ],
    },
    {
      id: "fintech_invest",
      title: "التكنولوجيا المالية وتحليل الاستثمار (Fintech)",
      sector: "المالية والأعمال",
      roles: ["Financial Analyst", "Risk Manager", "Fintech Product Manager", "Equity Analyst"],
      salaryEgypt: "20,000 - 80,000 ج.م / شهرياً",
      salaryRemoteUsd: "$1,500 - $5,000 / شهرياً",
      demandTrend: "نمو قوي (+20%)",
      demandColor: "text-blue-700 bg-blue-50 border-blue-200",
      aiRiskLevel: "متوسط (أداة مساعدة)",
      aiRiskColor: "text-amber-700 bg-amber-50 border-amber-200",
      aiRiskDesc: "الذكاء الاصطناعي يحلل التقارير، بينما يتطلب القرار الاستثماري حكمة بشرية.",
      topCerts: ["CFA Level 1", "FMVA Financial Modeling", "PRM Risk Management"],
      year1to4Focus: [
        "سنة 1: مبادئ الاقتصاد الجزئي والكلي والرياضيات المالية",
        "سنة 2: تحليل القوائم المالية ونمذجة Excel المتقدمة",
        "سنة 3: تقنيات Fintech وبلوك تشين وتحليل البيانات المالية",
        "سنة 4: اجتياز CFA Level 1 وتدريب بنوك الاستثمار",
      ],
    },
    {
      id: "renewable_energy",
      title: "الطاقة المتجددة والأنظمة الهندسية الذكية",
      sector: "الهندسة والصناعة",
      roles: ["Solar Energy Engineer", "EV Infrastructure Planner", "SCADA Automation"],
      salaryEgypt: "18,000 - 75,000 ج.م / شهرياً",
      salaryRemoteUsd: "$1,600 - $4,500 / شهرياً",
      demandTrend: "نمو قوي (+20%)",
      demandColor: "text-blue-700 bg-blue-50 border-blue-200",
      aiRiskLevel: "منخفض جداً (محمي)",
      aiRiskColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
      aiRiskDesc: "مشاريع بنية تحتية ومحطات طاقة وهندسة ميدانية واقعية.",
      topCerts: ["NABCEP Solar PV", "PLC Siemens Certification", "LEED Green Associate"],
      year1to4Focus: [
        "سنة 1: كهرومغناطيسية ودوائر كهربية وتصميم هندسي",
        "سنة 2: إلكترونيات القوى وتحويل الطاقة",
        "سنة 3: نظم الطاقة الشمسية والرياح والتحكم الآلي",
        "سنة 4: مشروع تخرج لمحطة طاقة متجددة وشبكات ذكية",
      ],
    },
    {
      id: "digital_marketing",
      title: "التسويق الرقمي وإدارة المحتوى والنمو (Growth)",
      sector: "الإعلام واللغات",
      roles: ["Growth Marketer", "SEO & Analytics Specialist", "Brand Strategist"],
      salaryEgypt: "15,000 - 55,000 ج.م / شهرياً",
      salaryRemoteUsd: "$1,000 - $3,500 / شهرياً",
      demandTrend: "متوازن ومستقر",
      demandColor: "text-slate-700 bg-slate-100 border-slate-300",
      aiRiskLevel: "مرتفع (معرض للأتمتة)",
      aiRiskColor: "text-rose-700 bg-rose-50 border-rose-200",
      aiRiskDesc: "كتابة المحتوى البسيط تؤتمت؛ البقاء للمحللين الاستراتيجيين ومتخصصي الـ CRO.",
      topCerts: ["Google Analytics 4 (GA4)", "Meta Certified Media Buyer", "HubSpot Inbound"],
      year1to4Focus: [
        "سنة 1: سلوك المستهلك وأساسيات التواصل الجماهيري",
        "سنة 2: تحليل البيانات الرقمية والحملات الإعلانية المدفوعة",
        "سنة 3: استراتيجيات تحسين محركات البحث والنمو الرقمي",
        "سنة 4: إدارة ميزانيات إعلانية ضخمة وبناء الهوية التجارية",
      ],
    },
  ];

  const sectors = ["الكل", "التكنولوجيا والبرمجيات", "القطاع الطبي والصحي", "الهندسة والصناعة", "المالية والأعمال", "الإعلام واللغات"];

  const filtered = careerTracks.filter(
    (c) => selectedSector === "الكل" || c.sector === selectedSector
  );

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 text-[11px] font-bold mb-1">
            <Briefcase className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>مرصد الوظائف وسوق العمل المصري والإقليمي 2026 - 2030</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            بوصلة المهن والرواتب ومخاطر الذكاء الاصطناعي
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            بيانات واقعية للرواتب بالجنيه والدولار، مؤشرات النمو، والشهادات المهنية التي تضمن وظيفتك الأولى
          </p>
        </div>

        <div className="flex flex-wrap gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px]">
          {sectors.map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSelectedSector(sec)}
              className={`px-2.5 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
                selectedSector === sec
                  ? "bg-white text-slate-900 shadow-2xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Career Track Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filtered.map((track) => (
          <div
            key={track.id}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                  {track.sector}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border ${track.demandColor}`}
                >
                  {track.demandTrend}
                </span>
              </div>

              {/* Title & Roles */}
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {track.title}
                </h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {track.roles.map((r, i) => (
                    <span
                      key={i}
                      className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-50 text-slate-700 border border-slate-200"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              {/* Salary Benchmarks */}
              <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2 text-right">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">الراتب في السوق المصري</div>
                  <div className="text-sm font-mono font-bold text-slate-900 tabular-nums mt-0.5">
                    {track.salaryEgypt}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">العمل عن بعد بالدولار (Remote)</div>
                  <div className="text-sm font-mono font-bold text-blue-600 tabular-nums mt-0.5">
                    {track.salaryRemoteUsd}
                  </div>
                </div>
              </div>

              {/* AI Disruption Risk */}
              <div className="p-3 rounded-lg border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5 text-purple-600 stroke-[1.5]" />
                    <span>مستوى أمان الوظيفة من الذكاء الاصطناعي:</span>
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${track.aiRiskColor}`}>
                    {track.aiRiskLevel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  {track.aiRiskDesc}
                </p>
              </div>

              {/* Recommended Certifications */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500 stroke-[1.5]" />
                  <span>الشهادات المهنية الموصى بها أثناء الدراسة:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {track.topCerts.map((cert, cIdx) => (
                    <span
                      key={cIdx}
                      className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-mono font-bold"
                    >
                      {cert}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 4-Year Self-Study Blueprint */}
            <div className="pt-3 border-t border-slate-100 space-y-1 text-[11px]">
              <span className="font-bold text-slate-800">خارطة التطور الموصى بها:</span>
              <div className="space-y-0.5 text-slate-600 text-[10px]">
                {track.year1to4Focus.slice(0, 2).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
