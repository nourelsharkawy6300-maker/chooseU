"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Mail, Loader2, AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const linkExpired = searchParams.get("error") === "link_expired";

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    linkExpired
      ? "انتهت صلاحية رابط إعادة تعيين كلمة المرور أو تم استخدامه مسبقاً. اطلب رابطاً جديداً أدناه."
      : null
  );

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setErrorMessage("يرجى إدخال بريد إلكتروني صحيح.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "";
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(
        "/auth/reset-password"
      )}`;

      const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
        redirectTo,
      });

      if (error && (error.status === 429 || error.message.toLowerCase().includes("rate limit"))) {
        setErrorMessage("تم إرسال عدد كبير من الطلبات. يرجى الانتظار دقيقة ثم المحاولة مرة أخرى.");
        setLoading(false);
        return;
      }

      // Generic success state regardless of whether account exists (anti-enumeration)
      setSubmitted(true);
      setLoading(false);
    } catch {
      setErrorMessage("تعذر إرسال الطلب حالياً. يرجى المحاولة مرة أخرى.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-3 group focus:outline-hidden"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xl tracking-tight shadow-xs">
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
          استعادة كلمة المرور
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          أدخل بريدك الإلكتروني وسنرسل لك رابطاً لتعيين كلمة مرور جديدة
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        {submitted ? (
          <div className="text-center space-y-5">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">
                راجع بريدك الإلكتروني
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                إذا كان البريد الإلكتروني مسجلاً لدينا، فقد أرسلنا رابطاً لإعادة تعيين كلمة المرور. يرجى فتح الرابط خلال الساعة القادمة.
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3.5 text-right text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-700">لم تصلك الرسالة؟</p>
              <p>• تفقد مجلد الرسائل غير المرغوب فيها (Spam / Junk).</p>
              <p>• قد يستغرق وصول الرسالة دقيقة أو دقيقتين.</p>
            </div>
            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 px-4 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
            >
              <span>العودة لتسجيل الدخول</span>
            </Link>
          </div>
        ) : (
          <>
            {errorMessage && (
              <div
                role="alert"
                className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/70 p-3.5 text-sm text-red-800"
              >
                <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
                <p className="leading-relaxed font-medium">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="reset-email"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  البريد الإلكتروني
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="reset-email"
                    type="email"
                    dir="ltr"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-10 pl-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition-all text-left"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 px-4 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <span>إرسال رابط الاستعادة</span>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
              تذكرت كلمة المرور؟{" "}
              <Link
                href="/login"
                className="font-bold text-blue-600 hover:text-blue-700 hover:underline transition-colors"
              >
                العودة لتسجيل الدخول
              </Link>
            </div>
          </>
        )}
      </div>

      <div className="text-center mt-6">
        <Link
          href="/"
          className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1"
        >
          <ArrowRight className="h-3.5 w-3.5" />
          <span>العودة للصفحة الرئيسية</span>
        </Link>
      </div>
    </div>
  );
}

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[var(--paper)]">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        }
      >
        <ForgotPasswordForm />
      </Suspense>
    </div>
  );
}