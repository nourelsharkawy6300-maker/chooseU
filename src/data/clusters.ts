import React from "react";
import {
  HeartPulse,
  Cpu,
  Languages,
  TrendingUp,
  Scale,
  Sparkles,
} from "lucide-react";
import { InterestCluster } from "@/types/chooseu";

export interface ClusterInfo {
  key: InterestCluster;
  title: string;
  subtitle: string;
  color: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  badgeClass: string;
  ringColor: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
}

export const CLUSTERS: Record<InterestCluster, ClusterInfo> = {
  Medical_Bio: {
    key: "Medical_Bio",
    title: "القطاع الطبي والصحي والعلوم الحيوية",
    subtitle: "الطب، الصيدلة، الأسنان، العلاج الطبيعي، التمريض والتكنولوجيا الحيوية",
    color: "#059669",
    textClass: "text-emerald-700",
    bgClass: "bg-emerald-50",
    borderClass: "border-emerald-200",
    badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
    ringColor: "#059669",
    icon: HeartPulse,
  },
  Eng_Tech: {
    key: "Eng_Tech",
    title: "الهندسة والحاسبات والذكاء الاصطناعي",
    subtitle: "علوم الحاسب، الأمن السيبراني، الذكاء الاصطناعي وهندسة البرمجيات",
    color: "#FACC15",
    textClass: "text-amber-800",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
    badgeClass: "bg-amber-50 text-amber-900 border-amber-200",
    ringColor: "#FACC15",
    icon: Cpu,
  },
  Media_Lang: {
    key: "Media_Lang",
    title: "الإعلام واللغات والترجمة الفورية",
    subtitle: "الألسن، اللغات والترجمة، الإعلام الرقمي وصناعة المحتوى",
    color: "#7C3AED",
    textClass: "text-purple-700",
    bgClass: "bg-purple-50",
    borderClass: "border-purple-200",
    badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
    ringColor: "#7C3AED",
    icon: Languages,
  },
  Biz_Econ: {
    key: "Biz_Econ",
    title: "إدارة الأعمال والتمويل والاقتصاد",
    subtitle: "التمويل والاستثمار، نظم معلومات الأعمال (BIS) والتسويق الدولي",
    color: "#D97706",
    textClass: "text-amber-700",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
    badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
    ringColor: "#D97706",
    icon: TrendingUp,
  },
  Law_Edu_Social: {
    key: "Law_Edu_Social",
    title: "العلوم الإنسانية والقانون والتربية",
    subtitle: "الحقوق، الاقتصاد والعلوم السياسية، والتربية والآداب",
    color: "#475569",
    textClass: "text-slate-700",
    bgClass: "bg-slate-50",
    borderClass: "border-slate-300",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
    ringColor: "#475569",
    icon: Scale,
  },
  Applied_Agri_Arts: {
    key: "Applied_Agri_Arts",
    title: "الفنون التطبيقية والعلوم والزراعة",
    subtitle: "الفنون التطبيقية، العلوم التخصصية، والزراعة الحديثة والبيئة",
    color: "#CA8A04",
    textClass: "text-amber-700",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
    badgeClass: "bg-amber-50 text-amber-900 border-amber-200",
    ringColor: "#CA8A04",
    icon: Sparkles,
  },
};
