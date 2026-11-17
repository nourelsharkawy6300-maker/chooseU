"use client";

import { useEffect, useState } from "react";

const INTRO_STORAGE_KEY = "chooseu_intro_completed_session";

/**
 * Checks if the intro experience has already been completed in the current session.
 * Always safely wrapped in try/catch to handle private browsing or blocked storage.
 */
export function hasSeenIntroThisSession(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(INTRO_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Marks the intro experience as completed in the current session.
 */
export function markIntroAsSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(INTRO_STORAGE_KEY, "true");
  } catch {
    // Graceful degradation when sessionStorage is unavailable
  }
}

/**
 * Hook to track user accessibility preferences:
 * - prefers-reduced-motion
 * - prefers-reduced-transparency
 */
export function useAccessibilityPreferences() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [prefersReducedTransparency, setPrefersReducedTransparency] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    if (motionQuery.addEventListener) {
      motionQuery.addEventListener("change", handleMotionChange);
    } else {
      motionQuery.addListener(handleMotionChange);
    }

    // Check transparency query if supported
    try {
      const transparencyQuery = window.matchMedia("(prefers-reduced-transparency: reduce)");
      setPrefersReducedTransparency(transparencyQuery.matches);

      const handleTransparencyChange = (e: MediaQueryListEvent) => {
        setPrefersReducedTransparency(e.matches);
      };

      if (transparencyQuery.addEventListener) {
        transparencyQuery.addEventListener("change", handleTransparencyChange);
      } else {
        transparencyQuery.addListener(handleTransparencyChange);
      }

      return () => {
        if (motionQuery.removeEventListener) {
          motionQuery.removeEventListener("change", handleMotionChange);
        } else {
          motionQuery.removeListener(handleMotionChange);
        }
        if (transparencyQuery.removeEventListener) {
          transparencyQuery.removeEventListener("change", handleTransparencyChange);
        } else {
          transparencyQuery.removeListener(handleTransparencyChange);
        }
      };
    } catch {
      return () => {
        if (motionQuery.removeEventListener) {
          motionQuery.removeEventListener("change", handleMotionChange);
        } else {
          motionQuery.removeListener(handleMotionChange);
        }
      };
    }
  }, []);

  return { prefersReducedMotion, prefersReducedTransparency };
}
