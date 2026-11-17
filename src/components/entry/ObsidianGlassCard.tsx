"use client";

import React from "react";

interface ObsidianGlassCardProps {
  children: React.ReactNode;
  className?: string;
  isReducedTransparency?: boolean;
}

export function ObsidianGlassCard({
  children,
  className = "",
  isReducedTransparency = false,
}: ObsidianGlassCardProps) {
  return (
    <div
      className={`relative w-full rounded-3xl transition-colors duration-300 ${
        isReducedTransparency
          ? "bg-[#0F172A] border border-slate-700/80 shadow-2xl"
          : "bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8),0_0_60px_-15px_rgba(37,99,235,0.18)]"
      } ${className}`}
    >
      {/* Top Specular Perimeter Highlight (withprimer / sparkleapp style) */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-white/25 to-transparent rounded-t-3xl"
        aria-hidden="true"
      />

      {/* Subtle Bottom Ambient Glow */}
      <div
        className="pointer-events-none absolute -bottom-4 inset-x-12 h-8 bg-blue-500/10 blur-xl rounded-full"
        aria-hidden="true"
      />

      <div className="relative z-10">{children}</div>
    </div>
  );
}
