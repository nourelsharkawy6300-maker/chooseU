"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { ConsultationOrderRow } from "@/types/chooseu";
import { DataService, SecurityValidator } from "@/lib/security-db";
import { ChooseULogoMark } from "@/components/NavbarAndFooter";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Database,
  FileCheck,
  KeyRound,
  Link as LinkIcon,
  Loader2,
  Lock,
  LogOut,
  RefreshCw,
  Send,
  ShieldCheck,
  Wallet,
} from "lucide-react";

const DEFAULT_ADVISOR_NOTES = `1. الأولوية الأكاديمية والمالية الأولى:
البدء بالكليات الحكومية (انتظام) وبرامج الساعات المعتمدة المتخصصة داخل نطاق محافظتك نظراً لتقارب مجموعك الفعلي مع حدود القبول لعام 2026 وتوفير نفقات السكن الطلابي المغترب.

2. خطة التأمين والبدائل الاستراتيجية:
إدراج الجامعات الأهلية في النطاق الجغرافي الأقرب كرغبات تالية مضمونة القبول، مع الالتزام الكامل بتحقيق معدل تراكمي (GPA >= 2.7) في نهاية السنة التأسيسية الأولى لضمان التخصص في قسم الذكاء الاصطناعي أو الأمن السيبراني.`;

export default function AdvisorAdminPortalPage() {
  // Security Passcode Gate State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passcode, setPasscode] = useState<string>("");
  const [authError, setAuthError] = useState<string>("");
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(() =>
    SecurityValidator.getLockoutRemainingSeconds()
  );

  // Live Orders & Inspection State
  const [orders, setOrders] = useState<ConsultationOrderRow[]>([]);
  const [selectedOrderCode, setSelectedOrderCode] = useState<string>("");
  const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(false);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [statusBanner, setStatusBanner] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved">("all");
  const [copiedOrderCode, setCopiedOrderCode] = useState<string>("");

  // Check server-side session cookie on initial load
  useEffect(() => {
    let mounted = true;
    fetch("/api/admin/session")
      .then((res) => res.json())
      .then((data) => {
        if (mounted && data.authenticated && data.role === "admin") {
          setIsAuthenticated(true);
        }
      })
      .catch(() => {
        // Fallback to unauthenticated login view
      });
    return () => {
      mounted = false;
    };
  }, []);

  const refreshOrdersFromServer = useCallback(async () => {
    setIsLoadingOrders(true);
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        if (data.orders && Array.isArray(data.orders) && data.orders.length > 0) {
          setOrders(data.orders);
          setSelectedOrderCode((curr) => curr || data.orders[0].order_code);
          setIsLoadingOrders(false);
          return;
        }
      }
    } catch {
      // Fallback to local DataService
    }
    const list = await DataService.fetchAllOrdersForAdmin();
    setOrders(list);
    if (list.length > 0) {
      setSelectedOrderCode((curr) => curr || list[0].order_code);
    }
    setIsLoadingOrders(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        void refreshOrdersFromServer();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, refreshOrdersFromServer]);

  const handlePasscodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setAuthError("");
        setPasscode("");
        refreshOrdersFromServer();
        return;
      }

      if (res.status === 429) {
        setAuthError(data.error || "تم تعليق المحاولات مؤقتاً لتكرار الفشل.");
        return;
      }

      setAuthError(
        data.error ||
          (data.remainingAttempts !== undefined
            ? `رمز المرور غير صحيح. المحاولات المتبقية: ${data.remainingAttempts}`
            : "رمز المرور غير صحيح.")
      );
    } catch {
      // Local fallback check if offline
      const ok = SecurityValidator.verifyAdminPasscode(passcode);
      if (ok) {
        setIsAuthenticated(true);
        setAuthError("");
        setPasscode("");
      } else {
        setAuthError("فشل الاتصال بالخادم وتحقق رمز المرور.");
      }
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
    } catch {
      // Ignore network errors on logout
    }
    setIsAuthenticated(false);
    setOrders([]);
    setSelectedOrderCode("");
  };

  const selectedOrder = useMemo(() => {
    return (
      orders.find((o) => o.order_code === selectedOrderCode) ||
      orders[0] ||
      null
    );
  }, [orders, selectedOrderCode]);

  const handleApproveSelectedOrder = async () => {
    if (!selectedOrder) return;
    setIsApproving(true);
    const notesToSave =
      selectedOrder.advisor_notes?.trim() || DEFAULT_ADVISOR_NOTES;
    const voiceToSave = selectedOrder.voice_note_url?.trim() || "";

    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_code: selectedOrder.order_code,
          order_status: "approved",
          advisor_notes: notesToSave,
          voice_note_url: voiceToSave,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.order) {
          setOrders((prev) =>
            prev.map((o) =>
              o.order_code === data.order.order_code
                ? { ...o, ...data.order }
                : o
            )
          );
          setStatusBanner(
            `تم اعتماد الطلب (${data.order.order_code}) للطالب «${selectedOrder.student_name}» وفتح التقرير الكامل في قاعدة البيانات فوراً.`
          );
          setIsApproving(false);
          return;
        }
      }
    } catch {
      // Fallback to local DataService
    }

    const updated = await DataService.approveOrderInAdmin(
      selectedOrder.order_code,
      notesToSave,
      voiceToSave,
      "approved"
    );
    setIsApproving(false);

    if (updated) {
      setOrders((prev) =>
        prev.map((o) =>
          o.order_code === updated.order_code ? updated : o
        )
      );
      setStatusBanner(
        `تم اعتماد الطلب (${updated.order_code}) للطالب «${updated.student_name}» وفتح التقرير الكامل في قاعدة البيانات فوراً.`
      );
    }
  };

  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(
    (o) => o.order_status === "pending"
  ).length;
  const approvedOrdersCount = orders.filter(
    (o) => o.order_status === "approved"
  ).length;
  const totalRevenueEgp = approvedOrdersCount * 150;

  const filteredOrders = useMemo(() => {
    if (statusFilter === "pending") return orders.filter((o) => o.order_status === "pending");
    if (statusFilter === "approved") return orders.filter((o) => o.order_status === "approved");
    return orders;
  }, [orders, statusFilter]);

  const ADVISOR_TEMPLATES = [
    {
      label: "الأولوية الحكومية",
      text: "1. الأولوية الأكاديمية والمالية الأولى:\nالبدء بالكليات الحكومية (انتظام) وبرامج الساعات المعتمدة المتخصصة داخل نطاق محافظتك نظراً لتقارب مجموعك الفعلي مع حدود القبول لعام 2026 وتوفير نفقات السكن الطلابي المغترب.\n\n2. خطة التأمين والبدائل الاستراتيجية:\nإدراج الجامعات الأهلية في النطاق الجغرافي الأقرب كرغبات تالية مضمونة القبول.",
    },
    {
      label: "التميز الأكاديمي",
      text: "1. بناءً على مجموعك المرتفع، تُعدّ كليات الذكاء الاصطناعي وعلوم الحاسب بالجامعات الأهلية خياراً استراتيجياً لضمان التخصص الدقيق.\n\n2. الالتزام بتحقيق GPA >= 3.0 في السنة التأسيسية الأولى لفتح منح التفوق الداخلية.",
    },
    {
      label: "القبول المضمون",
      text: "1. بناءً على الميزانية والمحافظة، أولوية القبول في البرامج المتاحة ضمن نطاق جغرافي قريب لتقليص نفقات الإقامة والانتقال.\n\n2. المتابعة المنتظمة لتحديثات حدود القبول الرسمية خلال فترة التنسيق (يوليو–أغسطس 2026).",
    },
  ];

  const studentWhatsappNotificationUrl = useMemo(() => {
    if (!selectedOrder) return "https://wa.me/201066594552";
    const normalizedPhone = SecurityValidator.normalizeEgyptianPhone(
      selectedOrder.whatsapp_phone
    );
    const intlPhone = normalizedPhone.startsWith("0")
      ? `2${normalizedPhone}`
      : normalizedPhone;
    const msg = `مرحباً ${selectedOrder.student_name}،
تمت مراجعة واعتماد تقريرك المالي والأكاديمي الشامل لـ 4 سنوات في منصة ChooseU بنجاح.
• رقم الطلب المعتمد: ${selectedOrder.order_code}
• حالة التقرير: تم الاعتماد والفتح (Approved)
يمكنك الآن الدخول إلى قسم «متابعة حالة الطلب» على المنصة وإدخال كود الطلب (${selectedOrder.order_code}) لاستعراض الجدول الكامل، الاستماع للمذكرة الصوتية، وتحميل نسخة الـ PDF.`;
    return `https://wa.me/${intlPhone}?text=${encodeURIComponent(msg)}`;
  }, [selectedOrder]);

  // ===========================================================================
  // 1. SECURITY PASSCODE GATE VIEW
  // ===========================================================================
  if (!isAuthenticated) {
    return (
      <div
        dir="rtl"
        className="bg-[#0F172A] text-slate-900 flex flex-col justify-center items-center p-4"
      >
        <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-6 py-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <ChooseULogoMark className="w-9 h-9" />
              <div>
                <h1 className="text-[16px] font-bold">
                  بوابة المستشارين الأكاديميين
                </h1>
                <p className="text-[11px] text-slate-400">
                  ChooseU Security & Operations Portal
                </p>
              </div>
            </div>
            <KeyRound className="w-5 h-5 text-blue-400" strokeWidth={1.5} />
          </div>

          <form onSubmit={handlePasscodeSubmit} className="p-6 space-y-5">
            {authError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 px-3.5 py-2.5 rounded-xl text-[12px] leading-relaxed">
                {authError}
              </div>
            )}

            <div>
              <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                رمز مرور المستشار الأكاديمي (Staff Passcode)
              </label>
              <input
                type="password"
                required
                disabled={lockoutSeconds > 0}
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="أدخل رمز المرور..."
                className="w-full border border-slate-200 focus:border-slate-900 rounded-xl px-3.5 py-2.5 text-[13px] dir-ltr text-left focus:outline-none disabled:bg-slate-100"
              />
              <p className="text-[11px] text-slate-400 mt-1.5 tabular-nums">
                رمز المرور الافتراضي للمراجعة:{" "}
                <code className="font-mono font-semibold text-slate-600">
                  admin2026
                </code>
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <Link
                href="/"
                className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2.5 rounded-xl text-[12px] font-medium flex items-center gap-1.5 transition"
              >
                <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                <span>العودة لمنصة الطلاب (/)</span>
              </Link>

              <button
                type="submit"
                disabled={lockoutSeconds > 0}
                className="bg-[#0F172A] hover:bg-slate-800 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 transition cursor-pointer"
              >
                <Lock className="w-4 h-4" strokeWidth={1.5} />
                <span>دخول لوحة العمليات</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // 2. FULL-SCREEN DARK-SIDEBAR ADMIN LAYOUT
  // ===========================================================================
  return (
    <div dir="rtl" className="bg-slate-100 text-slate-900 flex flex-col lg:flex-row">
      {/* Dark Operations Sidebar */}
      <aside className="w-full lg:w-72 bg-[#0F172A] text-white p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <ChooseULogoMark className="w-8 h-8" />
              <div>
                <div className="font-bold text-[15px]">ChooseU Staff</div>
                <div className="text-[11px] text-slate-400">
                  بوابة المستشارين الأكاديميين
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
              LIVE
            </span>
          </div>

          <div className="space-y-3 text-[12px]">
            <div className="text-slate-400 font-semibold text-[11px]">
              حالة الربط السحابي
            </div>
            <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <Database className="w-4 h-4" strokeWidth={1.5} />
                <span>Supabase REST Connected</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed font-mono dir-ltr text-left">
                eu-west-1 • consultation_orders
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 space-y-2.5 mt-6">
          <Link
            href="/"
            className="w-full border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 py-2.5 px-4 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2 transition"
          >
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            <span>العودة لمنصة الطلاب (/)</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-200 py-2 px-4 rounded-xl text-[12px] font-medium flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.5} />
            <span>تسجيل خروج آمن</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 overflow-y-auto">
        {/* Top Bar with Live Metrics & Server Refresh Button */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className="w-5 h-5 text-blue-600"
                  strokeWidth={1.5}
                />
                <h1 className="text-[19px] font-bold text-slate-900">
                  غرفة عمليات التدقيق واعتماد التقارير
                </h1>
              </div>
              <p className="text-[12px] text-slate-500 mt-0.5">
                مراجعة طلبات الطلاب، كتابة التوجيه الاستشاري، إرفاق المذكرة الصوتية، وتفعيل فتح التقرير الكامل.
              </p>
            </div>

            <button
              type="button"
              onClick={refreshOrdersFromServer}
              className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 px-4 py-2 rounded-xl text-[12px] font-semibold flex items-center gap-2 transition cursor-pointer"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  isLoadingOrders ? "animate-spin text-blue-600" : ""
                }`}
                strokeWidth={1.5}
              />
              <span>تحديث القائمة من السيرفر</span>
            </button>
          </div>

          {/* 4 KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 tabular-nums">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <span className="text-[11px] text-slate-500 block">
                إجمالي الطلبات
              </span>
              <strong className="text-[20px] font-bold text-slate-900 mt-0.5 block">
                {totalOrdersCount}
              </strong>
            </div>

            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-4">
              <span className="text-[11px] text-amber-800 block">
                قيد المراجعة
              </span>
              <strong className="text-[20px] font-bold text-amber-900 mt-0.5 block">
                {pendingOrdersCount}
              </strong>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4">
              <span className="text-[11px] text-emerald-800 block">
                التقارير المعتمدة
              </span>
              <strong className="text-[20px] font-bold text-emerald-900 mt-0.5 block">
                {approvedOrdersCount}
              </strong>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4">
              <span className="text-[11px] text-blue-800 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5" strokeWidth={1.5} />
                <span>إجمالي الإيرادات المعتمدة</span>
              </span>
              <strong className="text-[20px] font-bold text-blue-900 mt-0.5 block">
                {totalRevenueEgp.toLocaleString()} ج.م
              </strong>
            </div>
          </div>
        </div>

        {statusBanner && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-[12px] flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <CheckCircle2
                className="w-4 h-4 text-emerald-600 shrink-0"
                strokeWidth={1.5}
              />
              <span>{statusBanner}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusBanner("")}
              className="text-emerald-700 hover:text-emerald-950 font-semibold cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        )}

        {/* Orders Queue Table & Inspection Panel */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Orders Queue Table (xl:col-span-7) */}
          <div className="xl:col-span-7 bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[14px] font-bold text-slate-900">
                سجل طلبات الطلاب (`consultation_orders`)
              </h2>
              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5">
                {(["all", "pending", "approved"] as const).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setStatusFilter(f)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition ${
                      statusFilter === f
                        ? "bg-[#0F172A] text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {f === "all" ? `الكل (${totalOrdersCount})` : f === "pending" ? `قيد المراجعة (${pendingOrdersCount})` : `معتمد (${approvedOrdersCount})`}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right border-collapse text-[12px] tabular-nums">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-semibold text-[11px]">
                    <th className="py-3 px-3.5">كود الطلب</th>
                    <th className="py-3 px-3.5">الطالب والواتساب</th>
                    <th className="py-3 px-3.5">الشعبة والمجموع</th>
                    <th className="py-3 px-3.5">الميزانية والمحافظة</th>
                    <th className="py-3 px-3.5">مرجع InstaPay</th>
                    <th className="py-3 px-3.5">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredOrders.map((ord) => {
                    const isSelected =
                      selectedOrder?.order_code === ord.order_code;
                    return (
                      <tr
                        key={ord.order_code}
                        onClick={() => setSelectedOrderCode(ord.order_code)}
                        className={`cursor-pointer transition ${
                          isSelected ? "bg-blue-50/70" : "hover:bg-slate-50"
                        }`}
                      >
                        <td className="py-3 px-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900">{ord.order_code}</span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(ord.order_code);
                                setCopiedOrderCode(ord.order_code);
                                setTimeout(() => setCopiedOrderCode(""), 1500);
                              }}
                              className="text-slate-400 hover:text-slate-700 cursor-pointer"
                              title="نسخ كود الطلب"
                            >
                              {copiedOrderCode === ord.order_code ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" strokeWidth={1.5} />
                              ) : (
                                <LinkIcon className="w-3.5 h-3.5" strokeWidth={1.5} />
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="font-semibold text-slate-900">
                            {ord.student_name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono dir-ltr text-right">
                            {ord.whatsapp_phone}
                          </div>
                        </td>
                        <td className="py-3 px-3.5">
                          <div>
                            {ord.academic_stream === "Science"
                              ? "علمي علوم"
                              : ord.academic_stream === "Math"
                              ? "علمي رياضة"
                              : "أدبي"}
                          </div>
                          <div className="font-semibold text-blue-700">
                            {Number(ord.score_percentage).toFixed(1)}%
                          </div>
                        </td>
                        <td className="py-3 px-3.5">
                          <div className="font-semibold text-slate-900">
                            {Number(ord.max_budget).toLocaleString()} ج.م
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {ord.governorate}
                          </div>
                        </td>
                        <td className="py-3 px-3.5 font-mono text-slate-800">
                          {ord.instapay_ref}
                        </td>
                        <td className="py-3 px-3.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                              ord.order_status === "approved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-amber-50 text-amber-800 border-amber-200"
                            }`}
                          >
                            {ord.order_status === "approved" ? (
                              <>
                                <CheckCircle2
                                  className="w-3 h-3"
                                  strokeWidth={1.5}
                                />
                                <span>معتمد</span>
                              </>
                            ) : (
                              <>
                                <Clock className="w-3 h-3" strokeWidth={1.5} />
                                <span>قيد المراجعة</span>
                              </>
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Inspection & Approval Panel (xl:col-span-5) */}
          {selectedOrder && (
            <div className="xl:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
              <div className="border-b border-slate-200 pb-4 flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded">
                    {selectedOrder.order_code}
                  </span>
                  <h3 className="text-[16px] font-bold text-slate-900 mt-1.5">
                    فحص واعتماد طلب: {selectedOrder.student_name}
                  </h3>
                  <p className="text-[12px] text-slate-500 mt-0.5 tabular-nums">
                    مرجع InstaPay: <strong>{selectedOrder.instapay_ref}</strong>{" "}
                    • واتساب: <strong>{selectedOrder.whatsapp_phone}</strong>
                  </p>
                </div>
              </div>

              {/* Student Parameters Summary */}
              <div className="grid grid-cols-3 gap-2.5 bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-[11px] tabular-nums">
                <div>
                  <span className="text-slate-500 block">الشعبة والمجموع</span>
                  <strong className="text-slate-900 font-semibold">
                    {selectedOrder.academic_stream === "Science"
                      ? "علمي علوم"
                      : selectedOrder.academic_stream === "Math"
                      ? "علمي رياضة"
                      : "أدبي"}{" "}
                    ({Number(selectedOrder.score_percentage).toFixed(1)}%)
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">الميزانية السنوية</span>
                  <strong className="text-slate-900 font-semibold">
                    {Number(selectedOrder.max_budget).toLocaleString()} ج.م
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 block">المحافظة</span>
                  <strong className="text-slate-900 font-semibold">
                    {selectedOrder.governorate}
                  </strong>
                </div>
              </div>

              {/* Voice Note URL Input */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-700 mb-1.5">
                  رابط المذكرة الصوتية (`voice_note_url`)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={selectedOrder.voice_note_url || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      setOrders((prev) =>
                        prev.map((o) =>
                          o.order_code === selectedOrder.order_code
                            ? { ...o, voice_note_url: val }
                            : o
                        )
                      );
                    }}
                    placeholder="https://example.com/advisor-voice-note.mp3"
                    className="w-full border border-slate-200 focus:border-slate-900 rounded-xl pl-3.5 pr-9 py-2 text-[12px] dir-ltr text-left focus:outline-none"
                  />
                  <LinkIcon
                    className="w-4 h-4 text-slate-400 absolute right-3 top-2.5"
                    strokeWidth={1.5}
                  />
                </div>
              </div>

              {/* Advisor Notes Textarea */}
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <label className="block text-[12px] font-semibold text-slate-700">
                    التوجيه الأكاديمي والمالي المعتمد للأسرة (`advisor_notes`)
                  </label>
                  {/* Quick Template Buttons */}
                  <div className="flex flex-wrap gap-1.5">
                    {ADVISOR_TEMPLATES.map((tpl) => (
                      <button
                        key={tpl.label}
                        type="button"
                        onClick={() => {
                          setOrders((prev) =>
                            prev.map((o) =>
                              o.order_code === selectedOrder.order_code
                                ? { ...o, advisor_notes: tpl.text }
                                : o
                            )
                          );
                        }}
                        className="px-2.5 py-1 border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-medium rounded-lg cursor-pointer transition"
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  rows={6}
                  value={selectedOrder.advisor_notes ?? DEFAULT_ADVISOR_NOTES}
                  onChange={(e) => {
                    const val = e.target.value;
                    setOrders((prev) =>
                      prev.map((o) =>
                        o.order_code === selectedOrder.order_code
                          ? { ...o, advisor_notes: val }
                          : o
                      )
                    );
                  }}
                  className="w-full border border-slate-200 focus:border-slate-900 rounded-xl p-3.5 text-[12px] text-slate-800 leading-relaxed focus:outline-none"
                />
              </div>

              {/* Action Buttons: Approve in DB + Send WhatsApp Notification */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  disabled={isApproving}
                  onClick={handleApproveSelectedOrder}
                  className="w-full bg-[#0F172A] hover:bg-slate-800 text-white py-3 px-4 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  {isApproving ? (
                    <Loader2
                      className="w-4 h-4 animate-spin"
                      strokeWidth={1.5}
                    />
                  ) : (
                    <FileCheck className="w-4 h-4" strokeWidth={1.5} />
                  )}
                  <span>اعتماد التحويل وفتح التقرير للطالب فوراً</span>
                </button>

                <a
                  href={studentWhatsappNotificationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 py-2.5 px-4 rounded-xl text-[12px] font-semibold flex items-center justify-center gap-2 transition"
                >
                  <Send className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
                  <span>إرسال إشعار الاعتماد عبر واتساب للطالب</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}