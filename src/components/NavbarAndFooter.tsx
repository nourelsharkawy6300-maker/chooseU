"use client";

import React, { useState, useRef, useEffect } from "react";
import { PlatformView } from "../types/chooseu";
import { generateCopilotResponse, formatFacultyCount } from "../lib/engine";
import {
  ArrowLeft,
  Bot,
  Send,
  X,
} from "lucide-react";

export function ChooseULogoMark({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="8" fill="#0F172A" />
      <path
        d="M23 11.5C19.5 11.5 16.5 11.5 14.5 13.5C12.5 15.5 12.5 20.5 14.5 22.5C16.5 24.5 19.5 24.5 23 24.5"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M17.5 11.5V20.5C17.5 22.7091 19.2909 24.5 21.5 24.5C23.7091 24.5 25.5 22.7091 25.5 20.5V11.5"
        stroke="#2563EB"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="25.5" cy="11.5" r="2" fill="#60A5FA" />
      <circle cx="13.2" cy="18" r="1.5" fill="#FFFFFF" />
    </svg>
  );
}

interface PlatformNavbarProps {
  activeView: PlatformView;
  setActiveView: (v: PlatformView) => void;
  matchedCount: number;
  onOpenCopilot: () => void;
  onOpenCheckout: () => void;
}

export function PlatformNavbar({
  activeView,
  setActiveView,
  matchedCount,
  onOpenCopilot,
  onOpenCheckout,
}: PlatformNavbarProps) {
  const navItems: { id: PlatformView; label: string; badge?: number }[] = [
    { id: "landing", label: "الرئيسية" },
    { id: "workspace", label: "اختار كليتك (المحرك الذكي)", badge: matchedCount },
    { id: "future_me", label: "الوظائف والمرتبات (Future Me)" },
    { id: "directory", label: "دليل الجامعات والمصاريف" },
    { id: "sample_report", label: "نموذج التقرير المعتمد" },
    { id: "track_order", label: "متابعة طلبك" },
  ];

  return (
    <>
      <header className="h-16 bg-white/95 border-b border-slate-200 sticky top-0 z-40 px-4 sm:px-6 lg:px-10 no-print">
        <div className="h-full flex items-center justify-between gap-3">
          {/* Right: Bespoke Geometric Brand Mark */}
          <button
            type="button"
            onClick={() => setActiveView("landing")}
            className="flex items-center gap-3 text-right cursor-pointer shrink-0"
          >
            <ChooseULogoMark className="w-9 h-9" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-[17px] tracking-tight text-slate-900">
                  ChooseU
                </span>
                <span className="hidden xl:inline-block text-[10px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded tabular-nums">
                  2026
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                منصة التوجيه الجامعي والتدقيق المالي
              </p>
            </div>
          </button>

          {/* Center: 6 Platform Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
            {navItems.map((item) => {
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveView(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? "bg-white text-slate-900 font-semibold shadow-2xs"
                      : "text-slate-600 hover:text-slate-900 font-medium"
                  }`}
                >
                  <span>{item.label}</span>
                  {typeof item.badge === "number" && (
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
          </nav>

          {/* Left: AI Copilot Trigger + Primary Report CTA */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenCopilot}
              className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-xl text-[12px] font-medium flex items-center gap-1.5 transition cursor-pointer"
            >
              <Bot className="w-4 h-4 text-blue-600" strokeWidth={1.5} />
              <span className="hidden sm:inline">المساعد الذكي AI</span>
            </button>

            <button
              type="button"
              onClick={onOpenCheckout}
              className="bg-[#0F172A] hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-[12px] font-medium flex items-center gap-1.5 transition cursor-pointer tabular-nums"
            >
              <span>إصدار التقرير (150 ج.م)</span>
              <ArrowLeft className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </header>

      {/* Responsive Sub-Header Navigation for Mobile & Tablet */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-print">
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveView(item.id)}
              className={`px-3 py-1.5 rounded-lg text-[12px] whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                isActive
                  ? "bg-[#0F172A] text-white font-semibold"
                  : "bg-slate-100 text-slate-600 font-medium"
              }`}
            >
              <span>{item.label}</span>
              {typeof item.badge === "number" && (
                <span className="px-1.5 py-0.2 rounded bg-white/20 text-[10px] tabular-nums">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
}

interface PlatformFooterProps {
  setActiveView: (v: PlatformView) => void;
  onLoadDemo?: () => void;
}

export function PlatformFooter({
  setActiveView,
  onLoadDemo,
}: PlatformFooterProps) {
  return (
    <footer className="bg-white border-t border-slate-200 pt-12 pb-8 px-6 lg:px-12 mt-auto no-print">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-200 text-[12px] text-slate-500">
        {/* Column 1: Brand Overview & Audit Compliance */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <ChooseULogoMark className="w-7 h-7" />
            <span className="font-bold text-[15px] text-slate-900">ChooseU</span>
          </div>
          <p className="leading-relaxed">
            منصة التوجيه الجامعي والتدقيق المالي الشامل في مصر. بيانات تنسيق ومصروفات العام الأكاديمي 2026/2027 مدققة وفق اللوائح الرسمية للجامعات الحكومية والأهلية والخاصة.
          </p>
        </div>

        {/* Column 2: Quick Links to All 6 Sections */}
        <div className="space-y-2">
          <div className="font-semibold text-slate-900">أقسام المنصة</div>
          <ul className="space-y-1.5">
            <li>
              <button
                type="button"
                onClick={() => setActiveView("landing")}
                className="hover:text-slate-900 cursor-pointer"
              >
                الرئيسية
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveView("workspace")}
                className="hover:text-slate-900 cursor-pointer"
              >
                اختار كليتك (المحرك الذكي)
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveView("future_me")}
                className="hover:text-slate-900 cursor-pointer"
              >
                الوظائف والمرتبات (Future Me)
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveView("directory")}
                className="hover:text-slate-900 cursor-pointer"
              >
                دليل الجامعات والمصاريف
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveView("sample_report")}
                className="hover:text-slate-900 cursor-pointer"
              >
                نموذج التقرير المعتمد
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveView("track_order")}
                className="hover:text-slate-900 cursor-pointer"
              >
                متابعة طلبك
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Financial & Academic Methodology */}
        <div className="space-y-2">
          <div className="font-semibold text-slate-900">
            منهجية التدقيق المالي والأكاديمي
          </div>
          <ul className="space-y-1.5 leading-relaxed">
            <li>• حساب التضخم التراكمي لـ 4 سنوات (10% / 15% / 22%).</li>
            <li>• تطبيق قواعد التوزيع الجغرافي (نطاق أ / ب / ج) وتكلفة السكن.</li>
            <li>• تدقيق لوائح الـ GPA الداخلي للسنة التأسيسية الأولى.</li>
            <li>• التوافق مع قانون حماية البيانات الشخصية رقم 151 لسنة 2020.</li>
          </ul>
        </div>

        {/* Column 4: Direct WhatsApp Support & Discreet Staff Link */}
        <div className="space-y-2.5">
          <div className="font-semibold text-slate-900">
            الدعم الفني والتواصل المباشر
          </div>
          <p className="tabular-nums">
            واتساب خدمة العملاء:{" "}
            <a
              href="https://wa.me/201066594552"
              target="_blank"
              rel="noreferrer"
              className="text-slate-900 font-semibold hover:underline dir-ltr inline-block"
            >
              01066594552
            </a>
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-4">
            {onLoadDemo && (
              <button
                type="button"
                onClick={onLoadDemo}
                className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                تعبئة معطيات قياسية للمعاينة
              </button>
            )}
            <a
              href="/admin"
              className="text-[11px] text-slate-400 hover:text-slate-600 transition"
            >
              بوابة المستشارين (Staff)
            </a>
          </div>
        </div>
      </div>

      <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-[11px] text-slate-400 tabular-nums">
        <span>
          ChooseU © 2026 — جميع الحقوق محفوظة لمنصة التوجيه الجامعي والتدقيق المالي
        </span>
        <span>الإصدار المؤسسي المعتمد (v2026.11)</span>
      </div>
    </footer>
  );
}

interface AiCopilotDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  studentContext: any;
}

export function AiCopilotDrawer({
  isOpen,
  onClose,
  studentContext,
}: AiCopilotDrawerProps) {
  const [inputQuery, setInputQuery] = useState<string>("");
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; text: string }[]
  >([
    {
      role: "assistant",
      text: "مرحباً بك في المساعد الاستشاري الذكي لـ ChooseU. يمكنني تحليل كلياتك المطابقة، حساب تأثير رفع الميزانية، توضيح شروط الـ GPA الداخلي، أو استعراض الرواتب والوظائف المتوقعة لتخصصك.",
    },
  ]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const quickPrompts = [
    "ما هي أفضل كلية تناسب مجموعي وميولي؟",
    "ماذا لو رفعت الميزانية أو اخترت جامعة أهلية؟",
    "ما هي شروط الـ GPA في السنة الأولى؟",
    "ما هي الوظائف والرواتب المتوقعة لتخصصي؟",
  ];

  const handleSendPrompt = (promptText: string) => {
    const clean = promptText.trim();
    if (!clean) return;
    const reply = generateCopilotResponse(clean, studentContext);
    setMessages((prev) => [
      ...prev,
      { role: "user", text: clean },
      { role: "assistant", text: reply },
    ]);
    setInputQuery("");
  };

  const streamLabel =
    studentContext?.stream === "Science"
      ? "علمي علوم"
      : studentContext?.stream === "Math"
      ? "علمي رياضة"
      : "أدبي";

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 -xs flex justify-end no-print">
      <div className="bg-white w-full h-full shadow-2xl border-r border-slate-200 flex flex-col justify-between">
        {/* Top Drawer Header & Student Context Pills */}
        <div className="p-5 border-b border-slate-200 space-y-3 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F172A] text-white flex items-center justify-center">
                <Bot className="w-4 h-4 text-blue-400" strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-slate-900">
                  المستشار الأكاديمي الذكي (ChooseU Copilot)
                </h3>
                <p className="text-[11px] text-slate-500">
                  تحليل فوري مربوط بمعطياتك الحالية
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          {/* Context Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] tabular-nums">
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
              {streamLabel}
            </span>
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-blue-700 font-semibold">
              {Number(studentContext?.score || 83).toFixed(1)}%
            </span>
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
              {Number(studentContext?.budget || 65000).toLocaleString()} ج.م
            </span>
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700 font-medium">
              {studentContext?.gov || "المنوفية"}
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-medium">
              {formatFacultyCount(
                studentContext?.evaluation?.allRanked?.length || 0
              )}
            </span>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex ${
                m.role === "user" ? "justify-start" : "justify-end"
              }`}
            >
              <div
                className={`max-w-[88%] rounded-xl px-4 py-3 text-[12px] leading-relaxed whitespace-pre-line tabular-nums ${
                  m.role === "user"
                    ? "bg-[#0F172A] text-white"
                    : "bg-slate-100 border border-slate-200 text-slate-800"
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Quick Prompts & Input Form */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((qp) => (
              <button
                key={qp}
                type="button"
                onClick={() => handleSendPrompt(qp)}
                className="text-right text-[11px] bg-white hover:bg-blue-50 hover:border-blue-200 text-slate-700 border border-slate-200 px-2.5 py-1.5 rounded-lg transition cursor-pointer"
              >
                {qp}
              </button>
            ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(inputQuery);
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="اسأل عن الكليات، المصروفات، شروط الـ GPA..."
              className="flex-1 bg-white border border-slate-200 focus:border-slate-900 rounded-xl px-3.5 py-2 text-[12px] text-slate-900 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-[#0F172A] hover:bg-slate-800 text-white p-2.5 rounded-xl transition cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}