import Link from "next/link";
import { ArrowRight, Compass, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div
      dir="rtl"
      className="min-h-[70vh] flex items-center justify-center px-4 py-16"
    >
      <div className="max-w-md w-full text-center space-y-6 bg-white border border-slate-200/80 rounded-2xl p-8 sm:p-10 shadow-sm">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Compass className="w-8 h-8" strokeWidth={1.5} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            خطأ 404
          </span>
          <h1 className="text-2xl font-bold text-slate-900">
            الصفحة غير موجودة
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            الصفحة التي تحاول الوصول إليها غير موجودة أو تم نقلها إلى مسار آخر.
            يمكنك العودة إلى لوحة التحكم أو الصفحة الرئيسية.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>الرئيسية</span>
          </Link>
          <Link
            href="/workspace"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span>لوحة التنسيق</span>
            <ArrowRight className="w-4 h-4 rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
