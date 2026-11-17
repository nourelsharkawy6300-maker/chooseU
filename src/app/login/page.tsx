"use client";

import React, { Suspense } from "react";
import { RedesignedLoginForm } from "@/components/entry/RedesignedLoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          dir="rtl"
          className="min-h-screen bg-[#0F172A] flex items-center justify-center text-slate-400 text-sm"
        >
          جاري تحميل بوابة الدخول...
        </div>
      }
    >
      <div
        dir="rtl"
        className="min-h-screen bg-[#0F172A] flex items-center justify-center px-4 py-12 relative overflow-hidden"
      >
        {/* Subtle Ambient Radial Glow */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-radial from-blue-600/15 via-indigo-600/10 to-transparent blur-3xl"
          aria-hidden="true"
        />
        <RedesignedLoginForm />
      </div>
    </Suspense>
  );
}
