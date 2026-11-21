"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserCheck,
  HelpCircle,
  ArrowLeft,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { safeNext } from "@/lib/security/url";

function DeclareAgeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  const nextPath = safeNext(rawNext);

  // Age selection: null (unselected), false (18 or older), true (under 18)
  const [isMinor, setIsMinor] = useState<boolean | null>(null);
  const [guardianAck, setGuardianAck] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [initialChecking, setInitialChecking] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const supabase = createClient();

    async function checkExistingProfile() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("age_declared")
          .eq("id", user.id)
          .single();

        if (mounted && profile?.age_declared) {
          router.replace(nextPath);
          return;
        }
      } catch {
        // Continue to declaration form if query fails
      } finally {
        if (mounted) setInitialChecking(false);
      }
    }

    void checkExistingProfile();

    return () => {
      mounted = false;
    };
  }, [router, nextPath]);

  const isFormValid =
    isMinor === false || (isMinor === true && guardianAck === true);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isMinor === null) {
      setErrorMessage("يرجى اختيار فئتك العمرية للمتابعة.");
      return;
    }

    if (isMinor === true && !guardianAck) {
      setErrorMessage(
        "يجب الحصول على موافقة ولي الأمر وإقرار الموافقة لإتمام التسجيل للطلاب دون 18 عاماً."
      );
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      // Strict RPC-only age declaration (atomic, one-time, constraint-enforced)
      const { error: rpcError } = await supabase.rpc("declare_age", {
        p_is_minor: isMinor,
        p_guardian_ack: isMinor ? guardianAck : false,
      });

      if (rpcError) {
        const rawMsg = rpcError.message || "";

        if (rawMsg.includes("already been declared")) {
          router.refresh();
          router.replace(nextPath);
          return;
        }

        if (rawMsg.includes("Unauthorized")) {
          throw new Error("انتهت جلستك. يرجى تسجيل الدخول مجدداً.");
        }

        if (rawMsg.includes("guardian")) {
          throw new Error(
            "يجب الحصول على موافقة ولي الأمر وإقرار الموافقة لإتمام التسجيل للطلاب دون 18 عاماً."
          );
        }

        throw new Error(
          "تعذر حفظ بيانات الفئة العمرية حالياً. يرجى المحاولة مرة أخرى."
        );
      }

      // Success: Refresh and navigate to destination
      router.refresh();
      router.replace(nextPath);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.";
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  if (initialChecking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[360px] py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-700 mb-3" />
        <p className="text-sm text-slate-500 font-medium">جاري التحقق من بيانات الحساب...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-3 group focus:outline-hidden"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FACC15] text-slate-950 font-bold text-xl tracking-tight shadow-xs">
            U
          </div>
          <div className="text-right">
            <span className="block text-xl font-bold tracking-tight text-slate-900">
              ChooseU
            </span>
            <span className="block text-xs text-slate-500 font-medium">
              دليلك الأكاديمي والمالي
            </span>
          </div>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 mt-6 tracking-tight">
          تأكيد الفئة العمرية
        </h1>
        <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">
          خطوة تنظيمية واحدة لحماية خصوصيتك وتقديم التوجيه الأكاديمي الأنسب
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/70 p-3.5 text-sm text-red-800"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <p className="leading-relaxed font-medium">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-800 mb-1">
              ما هو عمرك الحالي؟
            </label>

            {/* Option A: Adult */}
            <label
              className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                isMinor === false
                  ? "border-amber-600 bg-amber-50/40 ring-1 ring-amber-600/30"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <input
                type="radio"
                name="age_choice"
                value="adult"
                checked={isMinor === false}
                onChange={() => {
                  setIsMinor(false);
                  setGuardianAck(false);
                  setErrorMessage(null);
                }}
                className="mt-1 h-4 w-4 text-amber-700 focus:ring-amber-600 border-slate-300"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-slate-700" />
                  <span className="text-sm font-semibold text-slate-900">
                    أنا بعمر 18 عاماً أو أكبر
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  طالب جامعي أو راشد مؤهل قانونياً لإدارة الحساب بصورة مستقلة.
                </p>
              </div>
            </label>

            {/* Option B: Minor */}
            <label
              className={`flex items-start gap-3.5 p-4 rounded-xl border cursor-pointer transition-all ${
                isMinor === true
                  ? "border-amber-600 bg-amber-50/40 ring-1 ring-amber-600/30"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <input
                type="radio"
                name="age_choice"
                value="minor"
                checked={isMinor === true}
                onChange={() => {
                  setIsMinor(true);
                  setErrorMessage(null);
                }}
                className="mt-1 h-4 w-4 text-amber-700 focus:ring-amber-600 border-slate-300"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-amber-700" />
                  <span className="text-sm font-semibold text-slate-900">
                    أنا دون سن 18 عاماً (قاصر)
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  طالب ثانوية عامة أو ما دون سن الرشد القانوني (يتطلب موافقة ولي الأمر).
                </p>
              </div>
            </label>
          </div>

          {/* Minor Guardian Consent Accordion */}
          {isMinor === true && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4.5 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                <HelpCircle className="h-4 w-4 text-amber-700 shrink-0" />
                <span>إقرار موافقة ولي الأمر (إلزامي للطلاب دون 18 عاماً)</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                طبقاً لسياسة حماية القُصّر في ChooseU، يشترط حصولك على موافقة الأب أو الأم أو
                الوصي القانوني لإنشاء الحساب ومشاركة درجات الثانوية العامة وبيانات استشارات التنسيق.
              </p>
              <label className="flex items-start gap-3 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={guardianAck}
                  onChange={(e) => {
                    setGuardianAck(e.target.checked);
                    setErrorMessage(null);
                  }}
                  className="mt-0.5 h-4 w-4 rounded-sm border-slate-300 text-amber-700 focus:ring-amber-600 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-800 leading-relaxed">
                  أقر بموافقة ولي أمري الصريحة على تسجيلي في منصة ChooseU والموافقة على{" "}
                  <Link
                    href="/terms"
                    target="_blank"
                    className="text-amber-700 hover:underline"
                  >
                    شروط الاستخدام
                  </Link>{" "}
                  و
                  <Link
                    href="/privacy"
                    target="_blank"
                    className="text-amber-700 hover:underline"
                  >
                    سياسة الخصوصية
                  </Link>
                  .
                </span>
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#FACC15] py-3 px-4 text-sm font-semibold text-slate-950 hover:bg-[#EAB308] focus:outline-hidden focus:ring-2 focus:ring-amber-600/30 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جاري الحفظ...</span>
              </>
            ) : (
              <>
                <span>تأكيد ومتابعة</span>
                <ArrowLeft className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <div className="text-center mt-6">
        <p className="text-xs text-slate-500">
          بياناتك محمية بتشفير عالي ومعزولة بالكامل وفق قواعد Zero-Trust RLS.
        </p>
      </div>
    </div>
  );
}

export default function OnboardingAgePage() {
  return (
    <div
      dir="rtl"
      className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-center items-center px-4 py-12"
    >
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-700 mb-3" />
            <p className="text-sm text-slate-500 font-medium">جاري التحميل...</p>
          </div>
        }
      >
        <DeclareAgeForm />
      </Suspense>
    </div>
  );
}
