import React from "react";
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div
      dir="rtl"
      className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-4 py-16"
    >
      <div className="relative flex items-center justify-center">
        <div className="w-14 h-14 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
        <Loader2 className="w-6 h-6 text-blue-600 absolute animate-pulse" />
      </div>
      <div className="text-center space-y-1">
        <p className="text-sm font-semibold text-slate-800">جاري التحميل...</p>
        <p className="text-xs text-slate-500">تحضير البيانات الاسترشادية للتنسيق</p>
      </div>
    </div>
  );
}
