"use client";

import React from "react";
import { m, MotionValue, useTransform } from "framer-motion";

interface IntroBackgroundProps {
  scrollYProgress?: MotionValue<number>;
}

export function IntroBackground({ scrollYProgress }: IntroBackgroundProps) {
  // Glow intensity and shift driven by scroll
  const glowScale = useTransform(
    scrollYProgress || { get: () => 0 } as unknown as MotionValue<number>,
    [0, 0.5, 1],
    [1, 1.15, 0.95]
  );

  const glowOpacity = useTransform(
    scrollYProgress || { get: () => 0 } as unknown as MotionValue<number>,
    [0, 0.5, 1],
    [0.8, 1, 0.7]
  );

  return (
    <div className="absolute inset-0 z-0 bg-[#0F172A] overflow-hidden pointer-events-none select-none">
      {/* Primary Radial Ambient Glow */}
      <m.div
        style={{
          scale: glowScale,
          opacity: glowOpacity,
        }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-radial from-blue-600/20 via-indigo-600/10 to-transparent blur-3xl transform-gpu will-change-transform"
        aria-hidden="true"
      />

      {/* Secondary Cyan Accent Pool */}
      <div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full bg-radial from-cyan-500/10 via-blue-500/5 to-transparent blur-2xl transform-gpu"
        aria-hidden="true"
      />

      {/* Fine Architectural Grid Lines (subtle Obsidian blueprint aesthetic) */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"
        aria-hidden="true"
      />

      {/* Vignette border to deepen edges */}
      <div
        className="absolute inset-0 bg-radial from-transparent via-[#0F172A]/40 to-[#0F172A]"
        aria-hidden="true"
      />
    </div>
  );
}
