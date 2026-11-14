"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  User,
  GraduationCap,
  Layers,
  MapPin,
} from "lucide-react";
import { StreamType, InterestCluster } from "@/types/chooseu";
import { EGYPT_GOVERNORATES } from "@/data/faculties-db";
import { PersonaRadarHexagon } from "@/app/page";

interface AuthPortalViewProps {
  onLoginSuccess: (studentData: {
    name: string;
    stream: StreamType;
    score: number;
    governorate: string;
  }) => void;
  onEnterDemoMode: () => void;
  clusterAffinities: Record<InterestCluster, number>;
}

export function AuthPortalView({
  onLoginSuccess,
  onEnterDemoMode,
  clusterAffinities,
}: AuthPortalViewProps) {
  const [authTab, setAuthTab] = useState<"login" | "register">("register");
  const [fullName, setFullName] = useState<string>("عمر خالد محمود");
  const [phone, setPhone] = useState<string>("01012345678");
  const [stream, setStream] = useState<StreamType>("Math");
  const [score, setScore] = useState<number>(83.5);
  const [governorate, setGovernorate] = useState<string>("المنوفية");
  const [password, setPassword] = useState<string>("******");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess({
      name: fullName || "طالب ChooseU",
      stream,
      score,
      governorate,
    });
  };

  return (
    <div className="py-8 px-4 sm:px-6">
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        {/* Right Side: Authentication Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-mono tracking-wider mb-2">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600 stroke-[1.5]" />
                <span>CHOOSEU SECURE ACCESS 2026</span>
              </div>
              <h2 className="text-[22px] font-bold text-slate-900 tracking-tight">
                بوابة التوجيه الأكاديمي والتحليل المالي
              </h2>
              <p className="text-[12px] text-slate-500 mt-1">
                سجل بياناتك للوصول إلى محاكي التنسيق وخارطة الـ 4 سنوات الكاملة
              </p>
            </div>

            {/* Prominent 1-Click Demo Mode Banner */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-emerald-950 font-bold text-[12px]">
                  <Sparkles className="w-4 h-4 text-emerald-600 stroke-[1.5]" />
                  <span>تصفح المنصة مباشرة دون انتظار:</span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  حساب تجريبي مكتمل (علمي رياضة • 83.5% • المنوفية • 65,000 ج.م)
                </p>
              </div>
              <button
                type="button"
                onClick={onEnterDemoMode}
                className="w-full sm:w-auto bg-[#0F172A] hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0"
              >
                الدخول الفوري كزائر (Demo) ←
              </button>
            </div>

            {/* Auth Tab Switcher */}
            <div className="grid grid-cols-2 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setAuthTab("register")}
                className={`py-1.5 text-[12px] font-bold rounded-md transition-colors cursor-pointer ${
                  authTab === "register"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                إنشاء ملف طالب جديد
              </button>
              <button
                type="button"
                onClick={() => setAuthTab("login")}
                className={`py-1.5 text-[12px] font-bold rounded-md transition-colors cursor-pointer ${
                  authTab === "login"
                    ? "bg-white text-slate-900 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                تسجيل الدخول لملفي
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  اسم الطالب ثلاثياً
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: عمر خالد محمود"
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] bg-slate-50 focus:outline-none focus:border-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    رقم الواتساب
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] bg-slate-50 focus:outline-none focus:border-slate-800 dir-ltr text-right"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    محافظة الإقامة
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] bg-slate-50 focus:outline-none focus:border-slate-800"
                  >
                    {EGYPT_GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    الشعبة الدراسية
                  </label>
                  <select
                    value={stream}
                    onChange={(e) => setStream(e.target.value as StreamType)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] bg-slate-50 focus:outline-none focus:border-slate-800"
                  >
                    <option value="Science">علمي علوم</option>
                    <option value="Math">علمي رياضة</option>
                    <option value="Arts">أدبي</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    النسبة المئوية المقدرة (%)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    step="0.1"
                    value={score}
                    onChange={(e) => setScore(parseFloat(e.target.value) || 50)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] bg-slate-50 focus:outline-none focus:border-slate-800 tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  كلمة المرور
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 text-[12px] bg-slate-50 focus:outline-none focus:border-slate-800"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0F172A] hover:bg-slate-800 text-white py-2.5 rounded-lg text-[12px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5 mt-2"
              >
                <span>{authTab === "register" ? "تأكيد وبدء التحليل الأكاديمي" : "تسجيل الدخول للمنصة"}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[1.5]" />
              </button>
            </form>
          </div>

          <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center">
            تخضع كافة البيانات لحماية الخصوصية وقواعد المجلس الأعلى للجامعات 2026.
          </div>
        </div>

        {/* Left Side: Obsidian Showcase */}
        <div className="lg:col-span-5 bg-[#0F172A] text-white p-6 sm:p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                CHOOSEU LIVE PREVIEW
              </span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                معتمد 2026
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-[18px] font-bold text-white">
                خريطة المستقبل الأكاديمي
              </h3>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                معاينة فورية لرادار الميول سداسي الأبعاد والتوافق المركب مع كليات
                مصر المعتمدة.
              </p>
            </div>

            {/* Radar Hexagon Preview */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col items-center">
              <PersonaRadarHexagon
                affinities={clusterAffinities}
                size={230}
              />
            </div>

            {/* Micro Stats */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg space-y-0.5">
                <span className="text-slate-400 block text-[10px]">الكليات المعتمدة</span>
                <span className="text-[15px] font-bold text-white tabular-nums">26+ كلية</span>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg space-y-0.5">
                <span className="text-slate-400 block text-[10px]">دقة التوجيه</span>
                <span className="text-[15px] font-bold text-emerald-400 tabular-nums">99.2%</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-[10px] text-slate-400 leading-relaxed">
            «حسابات التكلفة والـ TCO تشمل مصروفات الساعات المعتمدة ومعدل التضخم السنوي المقدر بـ 10%».
          </div>
        </div>
      </div>
    </div>
  );
}
