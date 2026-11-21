"use client";

import React, { useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface AmbientGoldOrbsProps {
  variant?: "dark" | "light";
  className?: string;
}

/**
 * 60fps GPU-composited ambient gold/amber orbs with subtle pointer parallax.
 * Only transforms & opacity are animated; respects prefers-reduced-motion.
 */
export function AmbientGoldOrbs({
  variant = "dark",
  className = "",
}: AmbientGoldOrbsProps) {
  const prefersReducedMotion = useReducedMotion();
  const parallaxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (prefersReducedMotion) return;
    let rafId = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMove = (e: PointerEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      targetX = nx * 28;
      targetY = ny * 22;
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.06;
      currentY += (targetY - currentY) * 0.06;
      if (parallaxRef.current) {
        parallaxRef.current.style.transform = `translate3d(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px, 0)`;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", handleMove, { passive: true });
    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.cancelAnimationFrame(rafId);
    };
  }, [prefersReducedMotion]);

  const isDark = variant === "dark";

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
    >
      <div
        ref={parallaxRef}
        className="absolute inset-0 will-change-transform"
      >
        {/* Primary Signal Yellow Orb (Top-Right) */}
        <motion.div
          className={`absolute -top-28 -right-24 h-[380px] w-[380px] sm:h-[480px] sm:w-[480px] rounded-full blur-[110px] will-change-transform ${
            isDark ? "bg-[#FACC15]/28" : "bg-[#FACC15]/32"
          }`}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, -34, 18, 0],
                  y: [0, 26, -16, 0],
                  scale: [1, 1.09, 0.95, 1],
                }
          }
          transition={{
            duration: 19,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Deep Warm Amber Orb (Bottom-Left) */}
        <motion.div
          className={`absolute -bottom-32 -left-24 h-[340px] w-[340px] sm:h-[460px] sm:w-[460px] rounded-full blur-[120px] will-change-transform ${
            isDark ? "bg-amber-500/22" : "bg-amber-400/25"
          }`}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [0, 38, -20, 0],
                  y: [0, -30, 18, 0],
                  scale: [1, 0.93, 1.08, 1],
                }
          }
          transition={{
            duration: 23,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Soft Core Highlight Orb (Center-Back) */}
        <motion.div
          className={`absolute top-1/3 left-1/2 -translate-x-1/2 h-[240px] w-[240px] sm:h-[320px] sm:w-[320px] rounded-full blur-[100px] will-change-transform ${
            isDark ? "bg-yellow-300/14" : "bg-yellow-200/35"
          }`}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  x: [-16, 22, -16],
                  y: [12, -18, 12],
                  opacity: isDark ? [0.55, 0.9, 0.55] : [0.5, 0.85, 0.5],
                }
          }
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Ultra-fine Architectural Dot Grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: isDark
            ? "radial-gradient(rgba(250, 204, 21, 0.14) 1px, transparent 1px)"
            : "radial-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage:
            "radial-gradient(ellipse 75% 65% at 50% 35%, black 35%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 75% 65% at 50% 35%, black 35%, transparent 100%)",
        }}
      />
    </div>
  );
}