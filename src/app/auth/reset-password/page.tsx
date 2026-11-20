"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff, Loader2, AlertCircle, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasValidSession, setHasValidSession] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function verifyRecoveryUser() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!active) return;
        setHasValidSession(Boolean(user));
      } catch {
        if (!active) return;
        setHasValidSession(false);
      } finally {
        if (active) setCheckingSession(false);
      }
    }

    void verifyRecoveryUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (!active) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        void verifyRecoveryUser();
      }
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 8) {
      setErrorMessage("يجب أن تتكون كلمة المرور الجديدة من 8 أحرف على الأقل.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("كلمتا المرور غير متطابقتين.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        if (error.message.toLowerCase().includes("different from the old")) {
          setErrorMessage("يجب أن تكون كلمة المرور الجديدة مختلفة عن السابقة.");
        } else {
          setErrorMessage("تعذر تحديث كلمة المرور. ربما انتهت صلاحية الجلسة، اطلب رابطاً جديداً.");
        }
        setLoading(false);
        return;
      }

      // Sign out cleanly so the user authenticates fresh with the new password
      await supabase.auth.signOut();
      router.replace("/login?reset=success");
      router.refresh();
    } catch {
      setErrorMessage("حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[var(--paper)]">
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
            تعيين كلمة مرور جديدة
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            اختر كلمة مرور قوية مكونة من 8 أحرف على الأقل
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
          {checkingSession ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-500">
              <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
              <span className="text-xs font-medium">جاري التحقق من رابط الاستعادة...</span>
            </div>
          ) : !hasValidSession ? (
            <div className="text-center space-y-5">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-bold text-slate-900">
                  الرابط غير صالح أو منتهي الصلاحية
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  يرجى طلب رابط جديد لإعادة تعيين كلمة المرور والضغط عليه من نفس المتصفح.
                </p>
              </div>
              <Link
                href="/auth/forgot-password"
                className="w-full inline-flex items-center justify-center rounded-xl bg-blue-600 py-3 px-4 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                طلب رابط جديد
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
                    htmlFor="new-password"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      dir="ltr"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pr-10 pl-10 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-600 focus:outline-hidden focus:ring-2 focus:ring-blue-600/20 transition-all text-left"
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

                <div>
                  <label
                    htmlFor="confirm-password"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    تأكيد كلمة المرور الجديدة
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <input
                      id="confirm-password"
                      type={showPassword ? "text" : "password"}
                      dir="ltr"
                      required
                      minLength={8}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
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
                    <span>حفظ كلمة المرور الجديدة</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}