"use client";

import React, { useRef, useEffect } from "react";
import { m, MotionValue, useTransform } from "framer-motion";
import { EntryGateway, EntryGatewayHandle } from "./EntryGateway";
import { INTRO_SCROLL_MILESTONES } from "@/lib/motion-tokens";

interface AscendingLoginCardProps {
  scrollYProgress: MotionValue<number>;
  isReducedMotion: boolean;
  isReducedTransparency: boolean;
}

export function AscendingLoginCard({
  scrollYProgress,
  isReducedMotion,
  isReducedTransparency,
}: AscendingLoginCardProps) {
  const gatewayRef = useRef<EntryGatewayHandle>(null);
  const hasFocusedRef = useRef(false);

  // Smooth GPU transforms: translateY, opacity, scale
  const opacity = useTransform(
    scrollYProgress,
    [INTRO_SCROLL_MILESTONES.loginCardStart, INTRO_SCROLL_MILESTONES.loginCardFull],
    [0, 1]
  );

  const y = useTransform(
    scrollYProgress,
    [INTRO_SCROLL_MILESTONES.loginCardStart, INTRO_SCROLL_MILESTONES.loginCardFull],
    [72, 0]
  );

  const scale = useTransform(
    scrollYProgress,
    [INTRO_SCROLL_MILESTONES.loginCardStart, INTRO_SCROLL_MILESTONES.loginCardFull],
    [0.94, 1]
  );

  const pointerEvents = useTransform(
    scrollYProgress,
    (val) => (val >= INTRO_SCROLL_MILESTONES.loginCardStart + 0.15 ? "auto" : "none")
  );

  // Auto-focus primary CTA button when scroll handoff finishes
  useEffect(() => {
    if (isReducedMotion) {
      const timer = setTimeout(() => {
        gatewayRef.current?.focusPrimary();
      }, 300);
      return () => clearTimeout(timer);
    }

    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest >= INTRO_SCROLL_MILESTONES.loginCardFull - 0.05 && !hasFocusedRef.current) {
        hasFocusedRef.current = true;
        setTimeout(() => {
          gatewayRef.current?.focusPrimary();
        }, 120);
      }
    });

    return () => unsubscribe();
  }, [scrollYProgress, isReducedMotion]);

  if (isReducedMotion) {
    return (
      <div className="relative z-10 w-full max-w-md px-4 py-8">
        <EntryGateway
          ref={gatewayRef}
          isReducedMotion={isReducedMotion}
          isReducedTransparency={isReducedTransparency}
        />
      </div>
    );
  }

  return (
    <m.div
      style={{
        opacity,
        y,
        scale,
        pointerEvents,
      }}
      className="absolute inset-0 z-10 flex items-center justify-center p-4 transform-gpu will-change-transform"
    >
      <EntryGateway
        ref={gatewayRef}
        isReducedMotion={isReducedMotion}
        isReducedTransparency={isReducedTransparency}
      />
    </m.div>
  );
}
