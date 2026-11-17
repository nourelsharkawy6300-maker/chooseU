"use client";

import React, { useState, useRef, forwardRef, useImperativeHandle } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Compass,
  ArrowLeft,
  Eye,
  EyeOff,
  Phone,
  Mail,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useStudent } from "@/context/StudentContext";
import { DataService } from "@/lib/security-db";
import { StreamType } from "@/types/chooseu";
import { ENTRY_COPY } from "@/lib/copy-registry";
import { ObsidianGlassCard } from "./ObsidianGlassCard";

export interface RedesignedLoginFormHandle {
  focusFirstInput: () => void;
}

interface RedesignedLoginFormProps {
  isReducedTransparency?: boolean;
}

export const RedesignedLoginForm = forwardRef<
  RedesignedLoginFormHandle,
  RedesignedLoginFormProps
>(function RedesignedLoginForm({ isReducedTransparency }, ref) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get("returnTo") || "/workspace";

  const { updateStudent, setHasCompletedOnboarding } = useStudent();

  const [activeTab, setActiveTab] = useState<"quick" | "credentials">("quick");

  // Quick Access State (Phone or Order Code)
  const [quickIdentifier, setQuickIdentifier] = useState("");
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickError, setQuickError] = useState("");
  const [quickSuccess, setQuickSuccess] = useState("");

  // Credentials State (Email & Password)
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [credLoading, setCredLoading] = useState(false);
  const [credError, setCredError] = useState("");

  // First input ref for keyboard focus handoff
  const quickInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focusFirstInput: () => {
      if (activeTab === "quick") {
        quickInputRef.current?.focus();
      } else {
        emailInputRef.current?.focus();
      }
    },
  }));

  // Handler for Quick Identifier (Order Code or Phone)
  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setQuickError("");
    setQuickSuccess("");

    const val = quickIdentifier.trim();
    if (!val) {
      setQuickError(ENTRY_COPY.errors.emptyIdentifier);
      return;
    }

    setQuickLoading(true);
    try {
      const order = await DataService.getOrderByCodeOrPhone(val);
      if (order) {
        // Restore student profile from retrieved consultation data
        updateStudent({
          studentName: order.student_name,
          stream: order.academic_stream as StreamType,
          scorePercentage: Number(order.score_percentage),
          annualBudgetEgp: Number(order.max_budget),
          governorate: order.governorate,
          hasCompletedOnboarding: true,
          privacyConsent: true,
        });
        setHasCompletedOnboarding(true);
        setQuickSuccess(ENTRY_COPY.status.successRedirect);
        setTimeout(() => {
          router.push(returnTo);
        }, 900);
      } else {
        // Fallback: If phone is valid 11 digits, let them log in with fresh workspace
        const cleaned = val.replace(/\D/g, "");
        if (/^01[0125][0-9]{8}$/.test(cleaned)) {
          updateStudent({
            hasCompletedOnboarding: true,
            privacyConsent: true,
          });
          setHasCompletedOnboarding(true);
          setQuickSuccess(ENTRY_COPY.status.successRedirect);
          setTimeout(() => {
            router.push(returnTo);
          }, 900);
        } else {
          setQuickError(ENTRY_COPY.errors.notFound);
        }
      }
    } catch (err: unknown) {
      const message = (err as Error)?.message || "";
      if (message.includes("429")) {
        setQuickError(ENTRY_COPY.errors.rateLimited);
      } else {
        setQuickError(ENTRY_COPY.errors.network);
      }
    } finally {
      setQuickLoading(false);
    }
  };

  // Handler for Email/Password Login
  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError("");

    if (!email.trim() || !password.trim()) {
      setCredError(ENTRY_COPY.errors.emptyCredentials);
      return;
    }

    setCredLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      updateStudent({
        hasCompletedOnboarding: true,
        privacyConsent: true,
      });
      setHasCompletedOnboarding(true);
      router.push(returnTo);
    } catch {
      setCredError(ENTRY_COPY.errors.invalidCredentials);
    } finally {
      setCredLoading(false);
    }
  };

  return (
    <ObsidianGlassCard
      isReducedTransparency={isReducedTransparency}
      className="max-w-md w-full p-6 sm:p-8 space-y-6 text-start"
    >
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner">
          <Compass className="w-6 h-6 stroke-[1.75]" />
        </div>
        <h1 className="text-2xl font-bold text-white tracking-tight">
          {ENTRY_COPY.loginTitle}
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xs mx-auto">
          {ENTRY_COPY.loginSubtitle}
        </p>
      </div>

      {/* Accessible Tab Switcher */}
      <div
        role="tablist"
        aria-label="خيارات تسجيل الدخول"
        className="grid grid-cols-2 p-1 bg-slate-900/80 border border-white/5 rounded-2xl text-xs font-semibold"
      >
        <button
          role="tab"
          aria-selected={activeTab === "quick"}
          type="button"
          onClick={() => setActiveTab("quick")}
          className={`py-2 px-3 rounded-xl transition-all duration-200 cursor-pointer text-center ${
            activeTab === "quick"
              ? "bg-white/10 text-white shadow-xs border border-white/10"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {ENTRY_COPY.tabQuick}
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "credentials"}
          type="button"
          onClick={() => setActiveTab("credentials")}
          className={`py-2 px-3 rounded-xl transition-all duration-200 cursor-pointer text-center ${
            activeTab === "credentials"
              ? "bg-white/10 text-white shadow-xs border border-white/10"
              : "text-slate-400 hover:text-slate-200"
          }`}
        >
          {ENTRY_COPY.tabCredentials}
        </button>
      </div>

      {/* Tab 1: Quick Access Form */}
      {activeTab === "quick" && (
        <form onSubmit={handleQuickLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200">
              {ENTRY_COPY.phoneOrOrderLabel}
            </label>
            <div className="relative">
              <input
                ref={quickInputRef}
                type="text"
                dir="ltr"
                inputMode="text"
                autoComplete="username"
                value={quickIdentifier}
                onChange={(e) => setQuickIdentifier(e.target.value)}
                placeholder={ENTRY_COPY.phoneOrOrderPlaceholder}
                className="w-full bg-slate-900/60 border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-xl ps-4 pe-10 py-2.5 text-sm font-mono text-left text-white placeholder:text-slate-500 focus:outline-none transition-colors"
              />
              <div className="absolute inset-y-0 end-3 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal">
              {ENTRY_COPY.phoneOrOrderHint}
            </p>
          </div>

          {quickError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{quickError}</span>
            </div>
          )}

          {quickSuccess && (
            <div
              role="status"
              className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{quickSuccess}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={quickLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {quickLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{ENTRY_COPY.status.loadingQuick}</span>
              </div>
            ) : (
              <>
                <span>{ENTRY_COPY.submitQuick}</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Tab 2: Email & Password Form */}
      {activeTab === "credentials" && (
        <form onSubmit={handleCredentialsLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200">
              {ENTRY_COPY.emailLabel}
            </label>
            <div className="relative">
              <input
                ref={emailInputRef}
                type="email"
                dir="ltr"
                inputMode="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={ENTRY_COPY.emailPlaceholder}
                className="w-full bg-slate-900/60 border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-xl ps-4 pe-10 py-2.5 text-sm font-mono text-left text-white placeholder:text-slate-500 focus:outline-none transition-colors"
              />
              <div className="absolute inset-y-0 end-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-200">
              {ENTRY_COPY.passwordLabel}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                dir="ltr"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={ENTRY_COPY.passwordPlaceholder}
                className="w-full bg-slate-900/60 border border-slate-700/80 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 rounded-xl ps-10 pe-10 py-2.5 text-sm font-mono text-left text-white placeholder:text-slate-500 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 start-3 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
              <div className="absolute inset-y-0 end-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
            </div>
          </div>

          {credError && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{credError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={credLoading}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {credLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{ENTRY_COPY.status.loadingCredentials}</span>
              </div>
            ) : (
              <>
                <span>{ENTRY_COPY.submitCredentials}</span>
                <ArrowLeft className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* Accessible Bottom Navigation & Recovery Links */}
      <div className="pt-2 border-t border-white/10 text-center space-y-3">
        <p className="text-xs text-slate-300">
          {ENTRY_COPY.newStudentPrompt}{" "}
          <Link
            href="/workspace"
            className="font-bold text-blue-400 hover:text-blue-300 underline underline-offset-4 transition-colors"
          >
            {ENTRY_COPY.startCoordinationLink}
          </Link>
        </p>

        <div className="text-[11px] text-slate-400">
          <Link
            href="/track-order"
            className="hover:text-slate-200 transition-colors"
          >
            {ENTRY_COPY.trackOrderLink}
          </Link>
        </div>
      </div>
    </ObsidianGlassCard>
  );
});
