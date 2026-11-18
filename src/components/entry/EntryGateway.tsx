"use client";

/**
 * EntryGateway — the first card a new visitor sees after the logo intro.
 *
 * Layout rules:
 * - Obsidian glass style (one backdrop-filter layer max via ObsidianGlassCard).
 * - RTL logical properties throughout.
 * - 360px mobile: primary button visible without scroll on 360×640.
 * - Reduced-motion / reduced-transparency fallbacks respected.
 * - Focus management: primaryBtnRef exposed via ref handle.
 * - Swap: "عندي حساب" swaps same card to login form with fade+translate,
 *   "رجوع" swaps back.
 */

import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import { AnimatePresence, m } from "framer-motion";
import { ArrowLeft, Compass } from "lucide-react";
import { ObsidianGlassCard } from "./ObsidianGlassCard";
import {
  RedesignedLoginForm,
  RedesignedLoginFormHandle,
} from "./RedesignedLoginForm";
import { GATEWAY_COPY } from "@/lib/copy-registry";

// ─── Public handle ───────────────────────────────────────────────────────────

export interface EntryGatewayHandle {
  /** Focus the primary CTA (called after intro completes or is skipped). */
  focusPrimary: () => void;
  /** Focus the first login field (called when swap-to-login animation settles). */
  focusLoginFirst: () => void;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface EntryGatewayProps {
  isReducedMotion?: boolean;
  isReducedTransparency?: boolean;
}

// ─── Swap animation variants ──────────────────────────────────────────────────

const panelVariants = {
  enter: (dir: 1 | -1) => ({
    opacity: 0,
    y: dir * 16,
  }),
  center: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
  exit: (dir: 1 | -1) => ({
    opacity: 0,
    y: dir * -12,
    transition: { duration: 0.2, ease: [0.4, 0, 1, 1] as [number, number, number, number] },
  }),
};

// ─── Component ────────────────────────────────────────────────────────────────

export const EntryGateway = forwardRef<EntryGatewayHandle, EntryGatewayProps>(
  function EntryGateway({ isReducedMotion = false, isReducedTransparency = false }, ref) {
    const [view, setView] = useState<"gateway" | "login">("gateway");
    // dir: 1 = forward (gateway→login), -1 = back (login→gateway)
    const [swapDir, setSwapDir] = useState<1 | -1>(1);

    const primaryBtnRef = useRef<HTMLButtonElement>(null);
    const loginFormRef = useRef<RedesignedLoginFormHandle>(null);
    const backBtnRef = useRef<HTMLButtonElement>(null);

    useImperativeHandle(ref, () => ({
      focusPrimary: () => {
        // Slight delay so layout paint is committed
        setTimeout(() => primaryBtnRef.current?.focus(), 80);
      },
      focusLoginFirst: () => {
        setTimeout(() => loginFormRef.current?.focusFirstInput(), 80);
      },
    }));

    function handleShowLogin() {
      setSwapDir(1);
      setView("login");
      // Focus first login field after animation
      setTimeout(() => loginFormRef.current?.focusFirstInput(), 320);
    }

    function handleBack() {
      setSwapDir(-1);
      setView("gateway");
      // Return focus to primary button
      setTimeout(() => primaryBtnRef.current?.focus(), 320);
    }

    // Reduced-motion: skip AnimatePresence, render directly
    if (isReducedMotion) {
      return (
        <ObsidianGlassCard
          isReducedTransparency={isReducedTransparency}
          className="w-full max-w-[min(400px,calc(100vw-2rem))] mx-auto"
        >
          <div className="p-6 flex flex-col gap-5" dir="rtl">
            {view === "gateway" ? (
              <GatewayPanel
                primaryBtnRef={primaryBtnRef}
                onShowLogin={handleShowLogin}
                isReducedTransparency={isReducedTransparency}
              />
            ) : (
              <LoginPanel
                loginFormRef={loginFormRef}
                backBtnRef={backBtnRef}
                onBack={handleBack}
                isReducedTransparency={isReducedTransparency}
              />
            )}
          </div>
        </ObsidianGlassCard>
      );
    }

    return (
      <ObsidianGlassCard
        isReducedTransparency={isReducedTransparency}
        className="w-full max-w-[min(400px,calc(100vw-2rem))] mx-auto overflow-hidden"
      >
        {/* Fixed-height container prevents card resize during swap */}
        <div className="relative" dir="rtl">
          <AnimatePresence mode="wait" custom={swapDir} initial={false}>
            {view === "gateway" ? (
              <m.div
                key="gateway"
                custom={swapDir}
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="p-6 flex flex-col gap-5"
              >
                <GatewayPanel
                  primaryBtnRef={primaryBtnRef}
                  onShowLogin={handleShowLogin}
                  isReducedTransparency={isReducedTransparency}
                />
              </m.div>
            ) : (
              <m.div
                key="login"
                custom={swapDir}
                variants={panelVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="p-6 flex flex-col gap-4"
              >
                <LoginPanel
                  loginFormRef={loginFormRef}
                  backBtnRef={backBtnRef}
                  onBack={handleBack}
                  isReducedTransparency={isReducedTransparency}
                />
              </m.div>
            )}
          </AnimatePresence>
        </div>
      </ObsidianGlassCard>
    );
  }
);

// ─── Gateway panel (the default view) ────────────────────────────────────────

interface GatewayPanelProps {
  primaryBtnRef: React.RefObject<HTMLButtonElement | null>;
  onShowLogin: () => void;
  isReducedTransparency?: boolean;
}

function GatewayPanel({ primaryBtnRef, onShowLogin }: GatewayPanelProps) {
  return (
    <>
      {/* Logo mark */}
      <div className="flex items-center gap-2 text-blue-400">
        <Compass size={20} aria-hidden="true" />
        <span className="text-xs font-mono tracking-widest uppercase text-slate-400">
          ChooseU
        </span>
      </div>

      {/* Value-proposition headline */}
      <h1 className="text-lg font-semibold text-white leading-snug">
        {GATEWAY_COPY.headline}
      </h1>

      {/* Primary CTA */}
      <Link
        href="/workspace"
        tabIndex={-1}
        className="block w-full"
        aria-label={GATEWAY_COPY.primaryCta}
      >
        <button
          ref={primaryBtnRef}
          type="button"
          className="
            w-full py-3 px-6 rounded-2xl font-semibold text-sm
            bg-blue-600 hover:bg-blue-500 active:bg-blue-700
            text-white shadow-lg shadow-blue-900/40
            transition-colors duration-150 focus-visible:outline-none
            focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2
            focus-visible:ring-offset-[#0F172A]
          "
          onClick={() => {
            /* navigation handled by Link wrapper */
          }}
        >
          {GATEWAY_COPY.primaryCta}
        </button>
      </Link>

      {/* Secondary ghost CTA */}
      <button
        type="button"
        onClick={onShowLogin}
        className="
          w-full py-2.5 px-6 rounded-2xl font-medium text-sm
          border border-white/15 text-slate-300 hover:text-white
          hover:border-white/25 hover:bg-white/5 active:bg-white/10
          transition-colors duration-150 focus-visible:outline-none
          focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2
          focus-visible:ring-offset-[#0F172A]
        "
      >
        {GATEWAY_COPY.secondaryCta}
      </button>

      {/* Discover link */}
      <div className="text-center">
        <Link
          href="/discover"
          className="text-xs text-slate-500 hover:text-slate-300 underline underline-offset-2 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400 rounded"
        >
          {GATEWAY_COPY.discoverLink}
        </Link>
      </div>

      {/* Indicative disclaimer */}
      <p className="text-[11px] text-slate-600 leading-relaxed text-center border-t border-white/5 pt-3">
        {GATEWAY_COPY.disclaimer}
      </p>
    </>
  );
}

// ─── Login panel (swapped in-place) ──────────────────────────────────────────

interface LoginPanelProps {
  loginFormRef: React.RefObject<RedesignedLoginFormHandle | null>;
  backBtnRef: React.RefObject<HTMLButtonElement | null>;
  onBack: () => void;
  isReducedTransparency?: boolean;
}

function LoginPanel({ loginFormRef, backBtnRef, onBack, isReducedTransparency }: LoginPanelProps) {
  return (
    <>
      {/* Back control */}
      <button
        ref={backBtnRef}
        type="button"
        onClick={onBack}
        aria-label="رجوع إلى البداية"
        className="
          flex items-center gap-1.5 text-xs text-slate-400 hover:text-white
          transition-colors duration-150 focus-visible:outline-none
          focus-visible:ring-1 focus-visible:ring-slate-400 rounded px-1
          -mx-1 self-start
        "
      >
        <ArrowLeft size={14} aria-hidden="true" />
        {GATEWAY_COPY.backLabel}
      </button>

      {/* Login form — rendered inside the same card, no navigation */}
      <RedesignedLoginForm
        ref={loginFormRef}
        isReducedTransparency={isReducedTransparency}
      />
    </>
  );
}
