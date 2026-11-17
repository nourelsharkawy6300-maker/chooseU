"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { LazyMotion, domAnimation, useScroll } from "framer-motion";
import { ChooseULogoSplit } from "./ChooseULogoSplit";
import { IntroBackground } from "./IntroBackground";
import { IntroControls } from "./IntroControls";
import {
  hasSeenIntroThisSession,
  markIntroAsSeen,
  useAccessibilityPreferences,
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
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [introSeen, setIntroSeen] = useState(false);

  const { prefersReducedMotion, prefersReducedTransparency } =
    useAccessibilityPreferences();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Track responsive screen width
  useEffect(() => {
    setMounted(true);
    setIntroSeen(hasSeenIntroThisSession());

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Skip handler: scrolls straight to the login area & marks session
  const handleSkip = useCallback(() => {
    markIntroAsSeen();
    setIntroSeen(true);

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
    if (mounted && (introSeen || prefersReducedMotion)) {
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
  }, [mounted, introSeen, prefersReducedMotion]);

  return (
    <LazyMotion features={domAnimation}>
      <div
        ref={containerRef}
        style={{
          // On reduced motion, keep a compact container; otherwise 300vh for kinetic scroll
          height: prefersReducedMotion || introSeen ? "100vh" : `${INTRO_SCROLL_MILESTONES.containerHeightVh}vh`,
        }}
        className="relative w-full bg-[#0F172A]"
      >
        {/* Pinned Sticky Viewport */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
          {/* Ambient Obsidian Background */}
          <IntroBackground scrollYProgress={scrollYProgress} />

          {/* Centered Animatable Wordmark (Only if not already skipped/seen) */}
          {!introSeen && !prefersReducedMotion && (
            <ChooseULogoSplit
              scrollYProgress={scrollYProgress}
              isMobile={isMobile}
            />
          )}

          {/* Interactive Controls (Skip & Scroll Hint) */}
          {!introSeen && !prefersReducedMotion && (
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
