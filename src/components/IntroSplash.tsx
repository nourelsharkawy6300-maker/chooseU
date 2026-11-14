"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

interface IntroSplashProps {
  onComplete?: () => void;
}

export function IntroSplash({ onComplete }: IntroSplashProps) {
  const [isReady, setIsReady] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);
  const hasExitedRef = useRef(false);

  // Trigger Exit Transition & Cleanup
  const triggerExit = useCallback(() => {
    if (hasExitedRef.current) return;
    hasExitedRef.current = true;

    // Immediately restore body scroll
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
    setIsExiting(true);
  }, []);

  // Strict Scroll Lock with Guaranteed Cleanup
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Fast, Deterministic Pacing (under 500ms total)
  useEffect(() => {
    // Frame 1: Trigger crisp brand entrance (fade-in & subtle settle)
    const enterTimer = setTimeout(() => {
      setIsReady(true);
    }, 30);

    // Frame 2: Trigger smooth curtain lift at 220ms
    const exitTimer = setTimeout(() => {
      triggerExit();
    }, 220);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [triggerExit]);

  // Clean unmount from DOM when the curtain transition completes
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    // Only react to the container's transform transition
    if (e.target === e.currentTarget && isExiting && !isUnmounted) {
      setIsUnmounted(true);
      if (onComplete) onComplete();
    }
  };

  // If unmounted, remove completely from DOM
  if (isUnmounted) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ChooseU Intro"
      onClick={triggerExit}
      onTransitionEnd={handleTransitionEnd}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F172A] text-white select-none cursor-pointer border-b border-slate-800"
      style={{
        transform: isExiting ? "translate3d(0, -100%, 0)" : "translate3d(0, 0, 0)",
        transition: "transform 0.28s cubic-bezier(0.8, 0, 0.2, 1)",
        willChange: "transform",
      }}
    >
      {/* Centered Brand Presentation */}
      <div
        className="flex flex-col items-center text-center px-6 max-w-sm"
        style={{
          opacity: isReady && !isExiting ? 1 : isExiting ? 0.3 : 0,
          transform: isReady
            ? "translate3d(0, 0, 0) scale(1)"
            : "translate3d(0, 8px, 0) scale(0.97)",
          transition: "opacity 0.2s ease-out, transform 0.2s ease-out",
          willChange: "transform, opacity",
        }}
      >
        {/* Minimalist Architectural Brand Icon */}
        <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center p-2.5 mb-4 shadow-sm">
          <svg
            width="28"
            height="28"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M23 11.5C19.5 11.5 16.5 11.5 14.5 13.5C12.5 15.5 12.5 20.5 14.5 22.5C16.5 24.5 19.5 24.5 23 24.5"
              stroke="#FFFFFF"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <path
              d="M17.5 11.5V20.5C17.5 22.7 19.3 24.5 21.5 24.5C23.7 24.5 25.5 22.7 25.5 20.5V11.5"
              stroke="#3B82F6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <circle cx="25.5" cy="11.5" r="2.2" fill="#60A5FA" />
            <circle cx="13.2" cy="18" r="1.8" fill="#FFFFFF" />
          </svg>
        </div>

        {/* Clean Typography */}
        <h1
          dir="ltr"
          className="text-3xl font-black tracking-tight leading-none font-sans text-white"
        >
          Choose<span className="text-blue-500">U</span>
        </h1>

        <p className="text-[12px] text-slate-400 mt-2 font-medium tracking-wide">
          المنصة الوطنية للتوجيه الجامعي والتحليل الأكاديمي 2026
        </p>
      </div>
    </div>
  );
}
