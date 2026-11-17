"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { LazyMotion, domAnimation, useScroll } from "framer-motion";
import { ChooseULogoSplit } from "./ChooseULogoSplit";
import { IntroBackground } from "./IntroBackground";
import { IntroControls } from "./IntroControls";
import {
  markIntroAsSeen,
  useAccessibilityPreferences,
  useIsMobile,
  useIntroSeen,
} from "@/hooks/useEntryScroll";
import { INTRO_SCROLL_MILESTONES } from "@/lib/motion-tokens";

interface IntroScrollStageProps {
  children?: (props: {
    scrollYProgress: ReturnType<typeof useScroll>["scrollYProgress"];
    isReducedMotion: boolean;
    isReducedTransparency: boolean;
  }) => React.ReactNode;
  onIntroComplete?: () => void;
}

export function IntroScrollStage({ children, onIntroComplete }: IntroScrollStageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const introSeen = useIntroSeen();

  const { prefersReducedMotion, prefersReducedTransparency } =
    useAccessibilityPreferences();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Skip handler: scrolls straight to the login area & marks session
  const handleSkip = useCallback(() => {
    markIntroAsSeen();

    if (containerRef.current) {
      const targetTop =
        containerRef.current.offsetTop +
        containerRef.current.offsetHeight -
        window.innerHeight;
      window.scrollTo({
        top: Math.max(0, targetTop),
        behavior: prefersReducedMotion ? "auto" : "smooth",
      });
    }

    if (onIntroComplete) {
      onIntroComplete();
    }
  }, [prefersReducedMotion, onIntroComplete]);

  // If already seen this session or prefers-reduced-motion, jump to bottom on initial mount
  useEffect(() => {
    if (introSeen || prefersReducedMotion) {
      if (containerRef.current) {
        const targetTop =
          containerRef.current.offsetTop +
          containerRef.current.offsetHeight -
          window.innerHeight;
        window.scrollTo({
          top: Math.max(0, targetTop),
          behavior: "instant" as ScrollBehavior,
        });
      }
    }
  }, [introSeen, prefersReducedMotion]);

  const shouldBypassIntro = introSeen || prefersReducedMotion;

  return (
    <LazyMotion features={domAnimation}>
      <div
        ref={containerRef}
        style={{
          // On reduced motion or returning sessions, keep a compact 100vh container; otherwise 300vh for kinetic scroll
          height: shouldBypassIntro ? "100vh" : `${INTRO_SCROLL_MILESTONES.containerHeightVh}vh`,
        }}
        className="relative w-full bg-[#0F172A]"
      >
        {/* Pinned Sticky Viewport */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          {/* Ambient Obsidian Background */}
          <IntroBackground scrollYProgress={scrollYProgress} />

          {/* Centered Animatable Wordmark (Only if not already skipped/seen) */}
          {!shouldBypassIntro && (
            <ChooseULogoSplit
              scrollYProgress={scrollYProgress}
              isMobile={isMobile}
            />
          )}

          {/* Interactive Controls (Skip & Scroll Hint) */}
          {!shouldBypassIntro && (
            <IntroControls
              scrollYProgress={scrollYProgress}
              onSkip={handleSkip}
            />
          )}

          {/* Slot for Login Card & Children */}
          {children &&
            children({
              scrollYProgress,
              isReducedMotion: prefersReducedMotion,
              isReducedTransparency: prefersReducedTransparency,
            })}
        </div>
      </div>
    </LazyMotion>
  );
}
