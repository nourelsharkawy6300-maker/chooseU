"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Search,
} from "lucide-react";
import { Faculty, ConsultationOrderRow } from "@/types/chooseu";
import { FACULTIES_DATABASE } from "@/data/faculties-db";

interface AdminPortalViewProps {
  onOpenFacultyDrawer: (faculty: Faculty) => void;
}

export function AdminPortalView({ onOpenFacultyDrawer }: AdminPortalViewProps) {
  const [activeTab, setActiveTab] = useState<"telemetry" | "consultations" | "cutoffs">("telemetry");

  // Sample Consultation Orders for Staff management
  const [orders, setOrders] = useState<ConsultationOrderRow[]>([
    {
      order_code: "ORD-8492",
      student_name: "عمر خالد محمود",
      whatsapp_phone: "01012345678",
      academic_stream: "علمي رياضة",
      score_percentage: 83.5,
      max_budget: 65000,
      governorate: "المنوفية",
      quiz_results: {},
      instapay_ref: "IP-940285012",
      order_status: "approved",
      advisor_notes: "تم التواصل عبر واتساب وتحديد كليات حاسبات المنوفية وأهلية بنها كخيارات أولى.",
      created_at: "2026-08-14 11:30",
    },
    {
      order_code: "ORD-8493",
      student_name: "سارة أحمد إبراهيم",
      whatsapp_phone: "01123456789",
      academic_stream: "علمي علوم",
      score_percentage: 91.2,
      max_budget: 120000,
      governorate: "الإسكندرية",
      quiz_results: {},
      instapay_ref: "IP-940285013",
      order_status: "pending",
      created_at: "2026-08-14 13:45",
    },
    {
      order_code: "ORD-8494",
      student_name: "يوسف محمد عبد الله",
      whatsapp_phone: "01234567890",
      academic_stream: "أدبي",
      score_percentage: 76.0,
      max_budget: 45000,
      governorate: "الجيزة",
      quiz_results: {},
      instapay_ref: "IP-940285014",
      order_status: "pending",
      created_at: "2026-08-14 15:10",
    },
  ]);

  const [orderSearch, setOrderSearch] = useState<string>("");

  const updateOrderStatus = (
    orderCode: string,
    status: "pending" | "approved" | "rejected"
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.order_code === orderCode ? { ...o, order_status: status } : o))
    );
  };

  const filteredOrders = orders.filter((o) => {
    if (!orderSearch.trim()) return true;
    const q = orderSearch.toLowerCase();
    return (
      o.student_name.toLowerCase().includes(q) ||
      o.order_code.toLowerCase().includes(q) ||
      o.whatsapp_phone.includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold mb-1">
            <ShieldCheck className="w-3.5 h-3.5 stroke-[1.5]" />
            <span>بوابة المستشارين وإدارة المنصة (Staff Command Portal)</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            لوحة الإشراف، مؤشرات الأداء، وطلبات الاستشارات
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5">
            إدارة طلبات الطلاب، تدقيق تحويلات إنستاباي، والتحكم في قواعد بيانات الكليات والحدود الدنيا
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-[11px]">
          <button
            type="button"
            onClick={() => setActiveTab("telemetry")}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
              activeTab === "telemetry"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            المؤشرات الحيوية
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("consultations")}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
              activeTab === "consultations"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            طلبات الاستشارات ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("cutoffs")}
            className={`px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
              activeTab === "cutoffs"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            جدول الكليات والمصروفات ({FACULTIES_DATABASE.length})
          </button>
        </div>
      </div>

      {/* TAB 1: TELEMETRY & STATS */}
      {activeTab === "telemetry" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">الكليات المسجلة بالمنصة</div>
              <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums mt-1">
                {FACULTIES_DATABASE.length}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                حكومي • أهلي • خاص • تكنولوجي
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">متوسط الحد الأدنى (عام)</div>
              <div className="text-2xl font-mono font-bold text-blue-600 tabular-nums mt-1">
                {(
                  FACULTIES_DATABASE.reduce((acc, f) => acc + f.cutoff_2026, 0) /
                  FACULTIES_DATABASE.length
                ).toFixed(1)}
                %
              </div>
              <div className="text-[11px] text-slate-500 mt-1">مؤشرات المجلس الأعلى 2026</div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">طلبات الاستشارات المباشرة</div>
              <div className="text-2xl font-mono font-bold text-slate-900 tabular-nums mt-1">
                {orders.length}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                {orders.filter((o) => o.order_status === "approved").length} معتمدة •{" "}
                {orders.filter((o) => o.order_status === "pending").length} قيد المراجعة
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="text-[11px] text-slate-500 font-medium">حالة المحرك والخوادم</div>
              <div className="text-2xl font-mono font-bold text-emerald-600 tabular-nums mt-1 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>100% HEALTH</span>
              </div>
              <div className="text-[11px] text-slate-500 mt-1">Next.js 16 + Turbopack</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CONSULTATION ORDERS */}
      {activeTab === "consultations" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-900">
              قائمة طلبات الاستشارات الخاصة بالطلاب
            </h2>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 stroke-[1.5]" />
              <input
                type="text"
                placeholder="بحث بالاسم أو الكود أو الهاتف..."
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pr-9 pl-3 py-1.5 text-[11px] text-slate-900"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-[12px] border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                  <th className="p-3">كود الطلب</th>
                  <th className="p-3">الطالب</th>
                  <th className="p-3">الهاتف (واتساب)</th>
                  <th className="p-3">الشعبة والنسبة</th>
                  <th className="p-3">مرجع إنستاباي</th>
                  <th className="p-3">الحالة</th>
                  <th className="p-3">الإجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOrders.map((order) => (
                  <tr key={order.order_code} className="hover:bg-slate-50/50">
                    <td className="p-3 font-mono font-bold text-slate-900">{order.order_code}</td>
                    <td className="p-3 font-bold text-slate-900">{order.student_name}</td>
                    <td className="p-3 font-mono text-slate-600">{order.whatsapp_phone}</td>
                    <td className="p-3">
                      <span className="font-bold text-blue-600">{order.academic_stream}</span> •{" "}
                      <span className="font-mono tabular-nums">{order.score_percentage}%</span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-500">{order.instapay_ref}</td>
                    <td className="p-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                          order.order_status === "approved"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : order.order_status === "pending"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : "bg-rose-50 text-rose-800 border-rose-200"
                        }`}
                      >
                        {order.order_status === "approved"
                          ? "تم الاعتماد والتواصل"
                          : order.order_status === "pending"
                          ? "قيد المراجعة"
                          : "مرفوض"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        {order.order_status !== "approved" && (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.order_code, "approved")}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer"
                          >
                            اعتماد
                          </button>
                        )}
                        {order.order_status !== "rejected" && (
                          <button
                            type="button"
                            onClick={() => updateOrderStatus(order.order_code, "rejected")}
                            className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded text-[10px] font-bold cursor-pointer"
                          >
                            رفض
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FACULTIES & TUITION TABLE */}
      {activeTab === "cutoffs" && (
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              قاعدة بيانات الكليات والحدود الدنيا والمصروفات
            </h2>
            <span className="text-[11px] text-slate-500 font-mono">
              SCU-SYNCCED-2026
            </span>
          </div>

          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-right text-[12px] border-collapse">
              <thead className="sticky top-0 bg-slate-100 z-10 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="p-2.5">الكود</th>
                  <th className="p-2.5">الكلية والجامعة</th>
                  <th className="p-2.5">النوع</th>
                  <th className="p-2.5">المحافظة</th>
                  <th className="p-2.5">الحد الأدنى 2026</th>
                  <th className="p-2.5">المصروفات</th>
                  <th className="p-2.5">القدرات</th>
                  <th className="p-2.5">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {FACULTIES_DATABASE.map((f) => (
                  <tr key={f.id} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-mono text-[11px] text-slate-500">{f.id}</td>
                    <td className="p-2.5">
                      <div className="font-bold text-slate-900">{f.name}</div>
                      <div className="text-[10px] text-slate-500">{f.university}</div>
                    </td>
                    <td className="p-2.5 text-slate-700">{f.type}</td>
                    <td className="p-2.5 text-slate-600">{f.gov}</td>
                    <td className="p-2.5 font-mono font-bold text-slate-900 tabular-nums">
                      {f.cutoff_2026}%
                    </td>
                    <td className="p-2.5 font-mono text-slate-800 tabular-nums">
                      {f.y1_base_fee === 0 ? "مجاني" : `${f.y1_base_fee.toLocaleString("en-US")} ج.م`}
                    </td>
                    <td className="p-2.5">
                      {f.aptitude_test ? (
                        <span className="text-amber-700 font-bold text-[10px]">مطلوب</span>
                      ) : (
                        <span className="text-slate-400 text-[10px]">بدون</span>
                      )}
                    </td>
                    <td className="p-2.5">
                      <button
                        type="button"
                        onClick={() => onOpenFacultyDrawer(f)}
                        className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-[10px] font-bold cursor-pointer"
                      >
                        معاينة
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
