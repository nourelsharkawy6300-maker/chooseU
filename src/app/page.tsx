"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStudent } from "@/context/StudentContext";
import { IntroScrollStage } from "@/components/entry/IntroScrollStage";
import { AscendingLoginCard } from "@/components/entry/AscendingLoginCard";

function EntryExperienceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get("returnTo") || "/workspace";

  const { hydrated, hasCompletedOnboarding } = useStudent();

  // If user is already authenticated/onboarded, skip intro and redirect to workspace or returnTo
  useEffect(() => {
    if (hydrated && hasCompletedOnboarding) {
      router.replace(returnTo);
    }
  }, [hydrated, hasCompletedOnboarding, router, returnTo]);

  // Loading state during initial hydration
  if (!hydrated) {
    return (
      <div
        className="min-h-screen bg-[#0F172A] flex items-center justify-center text-slate-400"
        dir="rtl"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-slate-500 tracking-wider">
            CHOOSEU ENGINE 2026
          </span>
        </div>
      </div>
    );
  }

  // If already authenticated, show brief transition spinner while redirecting
  if (hasCompletedOnboarding) {
    return (
      <div
        className="min-h-screen bg-[#0F172A] flex items-center justify-center text-slate-400"
        dir="rtl"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
          <span className="text-xs text-slate-400">جاري توجيهك إلى منصتك...</span>
        </div>
      </div>
    );
  }

  return (
    <main dir="rtl" className="relative w-full min-h-screen bg-[#0F172A]">
      <IntroScrollStage>
        {({ scrollYProgress, isReducedMotion, isReducedTransparency }) => (
          <AscendingLoginCard
            scrollYProgress={scrollYProgress}
            isReducedMotion={isReducedMotion}
            isReducedTransparency={isReducedTransparency}
          />
        )}
      </IntroScrollStage>
    </main>
  );
}

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div
          dir="rtl"
          className="min-h-screen bg-[#0F172A] flex items-center justify-center text-slate-500 text-sm font-mono"
        >
          LOADING CHOOSEU...
        </div>
      }
    >
      <EntryExperienceContent />
    </Suspense>
  );
}
