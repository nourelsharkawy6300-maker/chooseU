"use client";

import { useSyncExternalStore } from "react";

const INTRO_STORAGE_KEY = "chooseu_intro_completed_session";

/**
 * Checks if the intro experience has already been completed in the current session.
 * Safely wrapped in try/catch to handle private browsing or blocked storage.
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

function subscribeMediaQuery(query: string, callback: () => void) {
  if (typeof window === "undefined") return () => {};
  try {
    const mql = window.matchMedia(query);
    if (mql.addEventListener) {
      mql.addEventListener("change", callback);
      return () => mql.removeEventListener("change", callback);
    } else {
      mql.addListener(callback);
      return () => mql.removeListener(callback);
    }
  } catch {
    return () => {};
  }
}

/**
 * Hook to track user accessibility preferences:
 * - prefers-reduced-motion
 * - prefers-reduced-transparency
 */
export function useAccessibilityPreferences() {
  const prefersReducedMotion = useSyncExternalStore(
    (cb) => subscribeMediaQuery("(prefers-reduced-motion: reduce)", cb),
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false,
    () => false
  );

  const prefersReducedTransparency = useSyncExternalStore(
    (cb) => subscribeMediaQuery("(prefers-reduced-transparency: reduce)", cb),
    () => {
      try {
        return typeof window !== "undefined"
          ? window.matchMedia("(prefers-reduced-transparency: reduce)").matches
          : false;
      } catch {
        return false;
      }
    },
    () => false
  );

  return { prefersReducedMotion, prefersReducedTransparency };
}

/**
 * Hook to track responsive mobile viewport (< 640px)
 */
export function useIsMobile(): boolean {
  return useSyncExternalStore(
    (cb) => {
      if (typeof window === "undefined") return () => {};
      window.addEventListener("resize", cb);
      return () => window.removeEventListener("resize", cb);
    },
    () => (typeof window !== "undefined" ? window.innerWidth < 640 : false),
    () => false
  );
}

/**
 * Hook to track if the intro was completed this session
 */
export function useIntroSeen(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => hasSeenIntroThisSession(),
    () => false
  );
}
