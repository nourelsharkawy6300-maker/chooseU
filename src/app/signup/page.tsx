"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { safeNext } from "@/lib/security/url";

const ENABLE_GOOGLE_OAUTH = process.env.NEXT_PUBLIC_ENABLE_GOOGLE_OAUTH === "true";

function SignupForm() {
  const searchParams = useSearchParams();
  const rawNext = searchParams.get("next");
  const nextPath = safeNext(rawNext);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Age choice: null (unselected), true (minor < 18), false (adult >= 18)
  const [isMinor, setIsMinor] = useState<boolean | null>(null);
  const [guardianAck, setGuardianAck] = useState(false);

  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successSubmitted, setSuccessSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  // Submit button validation
  const isAgeValid =
    isMinor === false || (isMinor === true && guardianAck === true);
  const isFormValid =
    fullName.trim().length > 1 &&
    email.trim().length > 3 &&
    password.length >= 8 &&
    isAgeValid &&
    isMinor !== null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setErrorMessage("يرجى إدخال اسمك بالكامل.");
      return;
    }
    if (!cleanEmail) {
      setErrorMessage("يرجى إدخال بريدك الإلكتروني.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("كلمة المرور يجب ألا تقل عن 8 أحرف.");
      return;
    }
    if (isMinor === null) {
      setErrorMessage("يرجى تحديد ما إذا كنت أقل من 18 سنة.");
      return;
    }
    if (isMinor === true && !guardianAck) {
      setErrorMessage("يتطلب تسجيل الطلاب الأقل من 18 عاماً موافقة وإقرار ولي الأمر.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "";
      const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(
        nextPath
      )}`;

      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: {
            full_name: cleanName,
            is_minor: isMinor,
            guardian_ack: isMinor ? guardianAck : false,
            guardian_ack_at: isMinor && guardianAck ? new Date().toISOString() : null,
            age_declared: true,
          },
          emailRedirectTo,
        },
      });

      if (error) {
        // Anti-enumeration: if user is already registered, do not reveal it
        const msg = error.message.toLowerCase();
        if (
          msg.includes("already registered") ||
          msg.includes("already exists") ||
          error.status === 422
        ) {
          // Display identical calm confirmation screen
          setSubmittedEmail(cleanEmail);
          setSuccessSubmitted(true);
          setLoading(false);
          return;
        }

        setErrorMessage("حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة مرة أخرى.");
        setLoading(false);
        return;
      }

      setSubmittedEmail(cleanEmail);
      setSuccessSubmitted(true);
      setLoading(false);
    } catch {
      setErrorMessage("حدث خطأ غير متوقع، يرجى المحاولة مرة أخرى.");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setOauthLoading(true);

    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" && window.location.origin
          ? window.location.origin
          : "";
      const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(
        nextPath
      )}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) {
        setErrorMessage("تعذر الاتصال بـ Google، يرجى المحاولة مرة أخرى.");
        setOauthLoading(false);
      }
    } catch {
      setErrorMessage("تعذر الاتصال بـ Google، يرجى المحاولة مرة أخرى.");
      setOauthLoading(false);
    }
  };

  // Success State: Calm "Check your email" screen
  if (successSubmitted) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-xs">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-100">
            <CheckCircle2 className="h-8 w-8 text-amber-700" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-2">
            راجع بريدك الإلكتروني لتأكيد الحساب
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            أرسلنا رسالة تأكيد إلى{" "}
            <span dir="ltr" className="font-semibold text-slate-900">
              {submittedEmail}
            </span>
            .<br />
            يرجى فتح الرابط الموجود في الرسالة لتفعيل حسابك والبدء في استخدام ChooseU.
          </p>

          <div className="rounded-xl bg-slate-50 border border-slate-200/70 p-3.5 text-xs text-slate-600 text-right space-y-1 mb-6">
            <p className="font-semibold text-slate-700">لم تصلك الرسالة؟</p>
            <p>• تفقد مجلد الرسائل غير المرغوب فيها (Spam / Junk).</p>
            <p>• قد يستغرق وصول الرسالة دقيقة أو دقيقتين.</p>
          </div>

          <Link
            href="/login"
            className="block w-full rounded-xl bg-[#FACC15] py-3 px-4 text-sm font-semibold text-slate-950 hover:bg-[#EAB308] transition-colors shadow-xs"
          >
            الانتقال إلى صفحة تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
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
          إنشاء حساب جديد
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          ابدأ رحلتك الجامعية باختيارات مدروسة وموثوقة
        </p>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        {/* Error Alert */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/70 p-3.5 text-sm text-red-800"
          >
            <AlertCircle className="h-5 w-5 shrink-0 text-red-600 mt-0.5" />
            <p className="leading-relaxed font-medium">{errorMessage}</p>
          </div>
        )}

        {ENABLE_GOOGLE_OAUTH && (
          <>
            {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={oauthLoading || loading}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white py-3 px-4 text-sm font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          {oauthLoading ? (
            <Loader2 className="h-5 w-5 animate-spin text-slate-600" />
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
          )}
          <span>التسجيل باستخدام Google</span>
        </button>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-3 text-xs text-slate-500 font-medium">
            أو عبر البريد الإلكتروني
          </span>
        </div>
          </>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              الاسم بالكامل
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                id="fullName"
                type="text"
                required
                autoComplete="name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="مثال: أحمد محمود"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-10 pl-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-600 focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 transition-all text-right"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              البريد الإلكتروني
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="email"
                type="email"
                dir="ltr"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-10 pl-3 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-600 focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 transition-all text-left"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              كلمة المرور (8 أحرف على الأقل)
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                dir="ltr"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-10 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-600 focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 transition-all text-left"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 hover:text-slate-600 focus:outline-hidden"
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Age Selection Section (Strict Requirement) */}
          <div className="pt-2 border-t border-slate-100">
            <span className="block text-xs font-semibold text-slate-800 mb-2">
              هل عمرك أقل من 18 سنة؟ <span className="text-red-500">*</span>
            </span>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsMinor(true);
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isMinor === true
                    ? "border-amber-600 bg-amber-50/70 text-amber-800 ring-2 ring-amber-600/20"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                نعم، أقل من 18 سنة
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMinor(false);
                  setGuardianAck(false);
                }}
                className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  isMinor === false
                    ? "border-amber-600 bg-amber-50/70 text-amber-800 ring-2 ring-amber-600/20"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                لا، 18 سنة أو أكثر
              </button>
            </div>

            {/* Conditional Guardian Acknowledgment Checkbox */}
            {isMinor === true && (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/50 p-3.5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                  <ShieldCheck className="h-4 w-4 text-amber-700 shrink-0" />
                  <span>إقرار ولي الأمر (إلزامي للطلاب دون 18 سنة)</span>
                </div>
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 leading-relaxed">
                  <input
                    type="checkbox"
                    checked={guardianAck}
                    onChange={(e) => setGuardianAck(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-amber-700 focus:ring-amber-500"
                  />
                  <span>
                    أقر بموافقة ولي أمري على إنشاء الحساب واستخدام خدمات المنصة وفقاً لشروط الاستخدام وسياسة الخصوصية.
                  </span>
                </label>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!isFormValid || loading || oauthLoading}
            className="w-full mt-4 flex items-center justify-center gap-2 rounded-xl bg-[#FACC15] py-3 px-4 text-sm font-semibold text-slate-950 hover:bg-[#EAB308] focus:outline-hidden focus:ring-2 focus:ring-amber-600/20 active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <span>إنشاء الحساب</span>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
          لديك حساب بالفعل؟{" "}
          <Link
            href={`/login${rawNext ? `?next=${encodeURIComponent(nextPath)}` : ""}`}
            className="font-bold text-amber-700 hover:text-amber-800 hover:underline transition-colors"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>

      {/* Back to Home link */}
      <div className="text-center mt-6">
        <Link
          href="/"
          className="text-xs text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1"
        >
          ← العودة للصفحة الرئيسية
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[var(--paper)]">
      <Suspense
        fallback={
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
          </div>
        }
      >
        <SignupForm />
      </Suspense>
    </div>
  );
}
