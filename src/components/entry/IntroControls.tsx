"use client";

import React, { useEffect, useCallback } from "react";
import { m, MotionValue, useTransform } from "framer-motion";
import { ChevronDown, FastForward } from "lucide-react";
import { ENTRY_COPY } from "@/lib/copy-registry";
import { INTRO_SCROLL_MILESTONES } from "@/lib/motion-tokens";

interface IntroControlsProps {
  scrollYProgress: MotionValue<number>;
  onSkip: () => void;
  isVisible?: boolean;
}

export function IntroControls({
  scrollYProgress,
  onSkip,
  isVisible = true,
}: IntroControlsProps) {
  // Fade out both skip and scroll hint early as user scrolls down
  const controlsOpacity = useTransform(
    scrollYProgress,
    [0, INTRO_SCROLL_MILESTONES.hintFadeEnd],
    [1, 0]
  );

  const controlsPointerEvents = useTransform(
    scrollYProgress,
    (val) => (val > INTRO_SCROLL_MILESTONES.hintFadeEnd ? "none" : "auto")
  );

  // Keyboard navigation support: Enter, Space, ArrowDown, PageDown trigger skip to login
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === "input" || targetTag === "textarea") return;

      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown" || e.key === "PageDown") {
        e.preventDefault();
        onSkip();
      }
    },
    [onSkip]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  if (!isVisible) return null;

  return (
    <m.div
      style={{
        opacity: controlsOpacity,
        pointerEvents: controlsPointerEvents,
      }}
      className="absolute inset-0 z-20 pointer-events-none select-none"
    >
      {/* Skip Button: Logical start alignment */}
      <div className="absolute top-6 start-6 pointer-events-auto">
        <button
          type="button"
          onClick={onSkip}
          className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-medium backdrop-blur-xs transition-all duration-200 cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          aria-label={ENTRY_COPY.skipButton}
        >
          <span>{ENTRY_COPY.skipButton}</span>
          <FastForward className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors" />
        </button>
      </div>

      {/* Scroll Hint & Keyboard Hint at Bottom Center */}
      <div className="absolute bottom-8 inset-x-0 flex flex-col items-center justify-center text-center gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={onSkip}
          className="flex flex-col items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer group"
          aria-label={ENTRY_COPY.scrollHint}
        >
          <span className="text-xs font-medium tracking-wide">
            {ENTRY_COPY.scrollHint}
          </span>
          <m.div
            animate={{ y: [0, 5, 0] }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="flex items-center justify-center w-7 h-7 rounded-full border border-white/10 bg-white/5 group-hover:border-white/20 group-hover:bg-white/10 transition-colors"
          >
            <ChevronDown className="w-4 h-4 text-blue-400" />
          </m.div>
        </button>
        <span className="text-[10px] text-slate-500 font-mono hidden sm:inline-block">
          {ENTRY_COPY.keyboardHint}
        </span>
      </div>
    </m.div>
  );
}
