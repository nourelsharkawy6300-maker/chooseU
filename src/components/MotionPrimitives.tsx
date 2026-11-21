"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  HTMLMotionProps,
} from "framer-motion";

// ============================================================================
// 1. ANIMATED COUNTER (Spring Real-Time Value Roll)
// ============================================================================
interface AnimatedCounterProps {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: AnimatedCounterProps) {
  const motionVal = useMotionValue(value);
  const spring = useSpring(motionVal, { stiffness: 260, damping: 24 });
  const [displayValue, setDisplayValue] = useState(() =>
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString()
  );

  useEffect(() => {
    motionVal.set(value);
  }, [value, motionVal]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      if (decimals > 0) {
        setDisplayValue(latest.toFixed(decimals));
      } else {
        setDisplayValue(Math.round(latest).toLocaleString());
      }
    });
    return () => unsubscribe();
  }, [spring, decimals]);

  return (
    <span dir="ltr" className={`font-mono tabular-nums ${className}`}>
      {prefix}
      {displayValue}
      {suffix}
    </span>
  );
}

// ============================================================================
// 2. MASK REVEAL HEADING (Overflow Masked Kinetic Entrance)
// ============================================================================
interface MaskRevealHeadingProps {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  delay?: number;
}

export function MaskRevealHeading({
  children,
  as: Component = "h2",
  className = "",
  delay = 0,
}: MaskRevealHeadingProps) {
  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        whileInView={{ y: "0%", opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.55,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        <Component className={className}>{children}</Component>
      </motion.div>
    </div>
  );
}

// ============================================================================
// 3. SPOTLIGHT CARD (UIMaven Curated Gallery Framing & Spring Micro-Feedback)
// ============================================================================
interface SpotlightCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  spotlightColor?: string;
  className?: string;
}

export function SpotlightCard({
  children,
  spotlightColor = "rgba(234, 179, 8, 0.08)",
  className = "",
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 340, damping: 28 }}
      className={`uimaven-card overflow-hidden ${className}`}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-200 rounded-[inherit]"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, ${spotlightColor}, transparent 65%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

// ============================================================================
// 4. MAGNETIC BUTTON (Spring Offset & Physical Action Response)
// ============================================================================
interface MagneticButtonProps
  extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  variant?: "primary" | "accent" | "secondary";
  className?: string;
  icon?: React.ReactNode;
}

export function MagneticButton({
  children,
  variant = "primary",
  className = "",
  icon,
  onClick,
  ...props
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 350, damping: 20 });
  const springY = useSpring(y, { stiffness: 350, damping: 20 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const distanceX = (e.clientX - centerX) * 0.18;
    const distanceY = (e.clientY - centerY) * 0.18;
    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const baseStyle =
    variant === "primary"
      ? "bg-[#FACC15] hover:bg-[#EAB308] text-white shadow-sm"
      : variant === "accent"
      ? "bg-[#fe6d2e] hover:bg-[#e0591f] text-white shadow-sm"
      : "bg-white hover:bg-[#f3f3f3] text-[#1c1736] border border-[#e2e2e2]";

  return (
    <motion.button
      ref={btnRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[13px] transition-colors cursor-pointer select-none overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 ${baseStyle} ${className}`}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {icon && (
          <span className="transition-transform duration-200 group-hover:-translate-x-1">
            {icon}
          </span>
        )}
      </span>
    </motion.button>
  );
}

// ============================================================================
// 5. ARCHITECTURAL DIVIDER (Self-Drawing 1px Line With Crosshair Terminals)
// ============================================================================
interface ArchitecturalDividerProps {
  className?: string;
  showCrosshairs?: boolean;
}

export function ArchitecturalDivider({
  className = "",
  showCrosshairs = true,
}: ArchitecturalDividerProps) {
  return (
    <div className={`relative w-full flex items-center my-6 ${className}`}>
      {showCrosshairs && (
        <span
          className="absolute -start-1.5 text-[11px] font-mono text-[#94a3b8] leading-none select-none z-10"
          aria-hidden="true"
        >
          +
        </span>
      )}
      <motion.div
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{ originX: 0 }}
        className="w-full h-[1px] bg-[#e2e2e2]"
      />
      {showCrosshairs && (
        <span
          className="absolute -end-1.5 text-[11px] font-mono text-[#94a3b8] leading-none select-none z-10"
          aria-hidden="true"
        >
          +
        </span>
      )}
    </div>
  );
}

// ============================================================================
// 6. UIMAVEN GALLERY STAGGER VARIANTS (Clean, Zero-Blur, Single Trigger)
// ============================================================================
export const uimavenStaggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.05,
    },
  },
};

export const uimavenStaggerItem = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1],
    },
  },
};

// ============================================================================
// 7. UIMAVEN DOUBLE-BEZEL GALLERY CARD
// ============================================================================
export interface UIMavenCardProps {
  indexCode: string;
  badgeText?: string;
  statusDotColor?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function UIMavenCard({
  indexCode,
  badgeText,
  statusDotColor = "bg-[#FACC15]",
  children,
  className = "",
  onClick,
}: UIMavenCardProps) {
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      onClick={onClick}
      className={`uimaven-shell group cursor-pointer ${className}`}
    >
      {/* Top Metadata Rail */}
      <div className="px-3 py-1.5 flex items-center justify-between text-xs select-none">
        <span
          dir="ltr"
          className="font-mono tabular-nums font-bold text-slate-600 group-hover:text-amber-600 transition-colors"
        >
          {indexCode}
        </span>
        {badgeText && (
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-100/90 border border-slate-200/80 text-[11px] font-semibold text-slate-700">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDotColor}`} />
            <span>{badgeText}</span>
          </div>
        )}
      </div>

      {/* Inner White Stage with Radial Spotlight Tracking */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="uimaven-inner p-5 relative"
      >
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300 rounded-[inherit]"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(360px circle at ${mousePos.x}px ${mousePos.y}px, rgba(234, 179, 8, 0.08), transparent 45%)`,
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}

// ============================================================================
// 8. BLUEPRINT FRAME (Primer Exposed Structural Crosshairs & Coordinate Tag)
// ============================================================================
export interface BlueprintFrameProps {
  children: React.ReactNode;
  className?: string;
  label?: string;
}

export function BlueprintFrame({
  children,
  className = "",
  label,
}: BlueprintFrameProps) {
  return (
    <div
      className={`relative border border-[#e2e2e2] bg-[#fbfaf6]/90 rounded-2xl p-6 sm:p-8 transition-colors ${className}`}
    >
      {/* Corner SVG + Crosshairs */}
      <svg
        className="absolute -top-2 -right-2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M7 1v12M1 7h12" />
      </svg>
      <svg
        className="absolute -top-2 -left-2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M7 1v12M1 7h12" />
      </svg>
      <svg
        className="absolute -bottom-2 -right-2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M7 1v12M1 7h12" />
      </svg>
      <svg
        className="absolute -bottom-2 -left-2 w-3.5 h-3.5 text-slate-400 pointer-events-none z-10"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M7 1v12M1 7h12" />
      </svg>

      {/* Monospace Blueprint Coordinate Tag */}
      {label && (
        <div className="absolute top-3 start-4 px-2.5 py-0.5 rounded-md bg-white border border-[#e2e2e2] text-[10px] font-mono font-bold tracking-wider text-slate-500 select-none shadow-2xs z-10">
          {label}
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}

// ============================================================================
// 9. ARCHIVAL INDEX BADGE (Dsquared Zero-Padded Tabular Numeral Pill)
// ============================================================================
export interface ArchivalIndexBadgeProps {
  index: number | string;
  className?: string;
}

export function ArchivalIndexBadge({ index, className = "" }: ArchivalIndexBadgeProps) {
  const formatted = typeof index === "number" ? String(index).padStart(3, "0") : index;
  return (
    <span
      dir="ltr"
      className={`font-mono tabular-nums text-xs font-bold tracking-wider px-2.5 py-1 rounded-md bg-[#fbfaf6] border border-[#e2e2e2] text-slate-700 group-hover:bg-[#FACC15] group-hover:text-white group-hover:border-amber-500 transition-colors duration-300 inline-block shrink-0 ${className}`}
    >
      {formatted}
    </span>
  );
}

// ============================================================================
// 10. KINETIC ROLL BUTTON (Primer Curtain Fill Upward Slide)
// ============================================================================
export interface KineticRollButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  variant?: "primary" | "accent" | "secondary";
  className?: string;
}

export function KineticRollButton({
  children,
  icon,
  variant = "primary",
  className = "",
  onClick,
  ...props
}: KineticRollButtonProps) {
  const baseColor =
    variant === "primary"
      ? "bg-[#FACC15] text-white border-amber-500"
      : variant === "accent"
      ? "bg-[#fe6d2e] text-white border-[#fe6d2e]"
      : "bg-white text-slate-900 border-[#dedad0]";

  const fillColor =
    variant === "primary"
      ? "bg-[#CA8A04]"
      : variant === "accent"
      ? "bg-[#e0591f]"
      : "bg-[#eaeff8]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`primer-btn-roll relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer select-none group shadow-xs active:scale-[0.98] ${baseColor} ${className}`}
      {...props}
    >
      <span className={`primer-btn-roll-fill ${fillColor}`} />
      <span className="relative z-10 flex items-center gap-2">
        <span>{children}</span>
        {icon && (
          <span className="transition-transform duration-200 group-hover:-translate-x-1 shrink-0">
            {icon}
          </span>
        )}
      </span>
    </button>
  );
}
