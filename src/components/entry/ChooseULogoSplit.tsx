"use client";

import React, { useMemo } from "react";
import { m, MotionValue, useTransform } from "framer-motion";
import { CHOOSE_U_LETTERS, INTRO_SCROLL_MILESTONES, LetterDispersionToken } from "@/lib/motion-tokens";

interface ChooseULogoSplitProps {
  scrollYProgress: MotionValue<number>;
  isMobile?: boolean;
}

interface LetterItemProps {
  token: LetterDispersionToken;
  scrollYProgress: MotionValue<number>;
  isMobile: boolean;
}

function LetterItem({ token, scrollYProgress, isMobile }: LetterItemProps) {
  const xDistance = isMobile ? 55 : 145;

  // GPU-only transforms: translateX, translateY, rotate, scale, opacity
  const x = useTransform(
    scrollYProgress,
    [INTRO_SCROLL_MILESTONES.spreadStart, INTRO_SCROLL_MILESTONES.spreadEnd],
    [0, token.centerDelta * xDistance]
  );

  const y = useTransform(
    scrollYProgress,
    [INTRO_SCROLL_MILESTONES.spreadStart, INTRO_SCROLL_MILESTONES.spreadEnd],
    [0, token.yDelta * (isMobile ? 0.6 : 1)]
  );

  const rotate = useTransform(
    scrollYProgress,
    [INTRO_SCROLL_MILESTONES.spreadStart, INTRO_SCROLL_MILESTONES.spreadEnd],
    [0, token.rotDelta]
  );

  const opacity = useTransform(
    scrollYProgress,
    [0, INTRO_SCROLL_MILESTONES.fadeOutStart, INTRO_SCROLL_MILESTONES.fadeOutEnd],
    [1, 1, 0]
  );

  const scale = useTransform(
    scrollYProgress,
    [INTRO_SCROLL_MILESTONES.spreadStart, INTRO_SCROLL_MILESTONES.spreadEnd],
    [1, 1.25]
  );

  return (
    <m.span
      style={{
        x,
        y,
        rotate,
        opacity,
        scale,
      }}
      className={`inline-block select-none transform-gpu will-change-transform ${
        token.isAccent
          ? "text-blue-500 drop-shadow-[0_0_24px_rgba(59,130,246,0.6)] font-black"
          : "text-white font-extrabold"
      }`}
    >
      {token.char}
    </m.span>
  );
}

export function ChooseULogoSplit({ scrollYProgress, isMobile = false }: ChooseULogoSplitProps) {
  // Container scale and overall opacity
  const containerOpacity = useTransform(
    scrollYProgress,
    [0, INTRO_SCROLL_MILESTONES.fadeOutStart, INTRO_SCROLL_MILESTONES.fadeOutEnd],
    [1, 1, 0]
  );

  // Subtitle fade: disappears early as scroll starts (0 to 15%)
  const subtitleOpacity = useTransform(
    scrollYProgress,
    [0, INTRO_SCROLL_MILESTONES.hintFadeEnd],
    [1, 0]
  );

  const subtitleY = useTransform(
    scrollYProgress,
    [0, INTRO_SCROLL_MILESTONES.hintFadeEnd],
    [0, -10]
  );

  const letters = useMemo(() => CHOOSE_U_LETTERS, []);

  return (
    <m.div
      style={{ opacity: containerOpacity }}
      className="flex flex-col items-center justify-center text-center pointer-events-none select-none"
    >
      {/* Latin Wordmark with Letter-by-Letter Dispersion */}
      <div
        dir="ltr"
        className="flex items-center justify-center tracking-tight text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-sans"
        aria-label="ChooseU"
      >
        {letters.map((token) => (
          <LetterItem
            key={token.index}
            token={token}
            scrollYProgress={scrollYProgress}
            isMobile={isMobile}
          />
        ))}
      </div>

      {/* Arabic Subtitle: Strictly unbroken word/line reveal (Never character-split) */}
      <m.div
        style={{
          opacity: subtitleOpacity,
          y: subtitleY,
        }}
        dir="rtl"
        className="mt-4 sm:mt-6 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-xs transform-gpu"
      >
        <span className="text-xs sm:text-sm md:text-base font-medium text-slate-300 tracking-normal">
          دليلك الأكاديمي والمالي للجامعات المصرية
        </span>
      </m.div>
    </m.div>
  );
}
