"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log non-sensitive error representation in dev
    console.error("[ChooseU Error Boundary]", error?.message || error);
  }, [error]);

  return (
    <div
      dir="rtl"
      className="min-h-[70vh] flex items-center justify-center px-4 py-16"
    >
      <div className="max-w-md w-full text-center space-y-6 bg-white border border-rose-100 rounded-2xl p-8 sm:p-10 shadow-sm">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
          <AlertCircle className="w-8 h-8" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
            خطأ غير متوقع
          </span>
          <h1 className="text-2xl font-bold text-slate-900">
            حدث خطأ أثناء تحميل الصفحة
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            نعتذر عن هذا العطل المؤقت. بياناتك ومدخلاتك محفوظة بأمان على جهازك.
            يمكنك إعادة المحاولة الآن.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors cursor-pointer shadow-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة المحاولة</span>
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>العودة للرئيسية</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
