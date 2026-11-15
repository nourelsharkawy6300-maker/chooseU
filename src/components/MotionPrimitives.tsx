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
        initial={{ y: "105%", rotateZ: 1.2, opacity: 0 }}
        whileInView={{ y: "0%", rotateZ: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{
          duration: 0.65,
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
// 3. SPOTLIGHT CARD (Interactive Cursor Coordinate Tracking & Spring Hover)
// ============================================================================
interface SpotlightCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  spotlightColor?: string;
  className?: string;
}

export function SpotlightCard({
  children,
  spotlightColor = "rgba(55, 126, 240, 0.10)",
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
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className={`relative overflow-hidden bg-white border border-[#e2e2e2] rounded-xl ${className}`}
      {...props}
    >
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(450px circle at ${mousePosition.x}px ${mousePosition.y}px, ${spotlightColor}, transparent 60%)`,
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
      ? "bg-[#377ef0] hover:bg-[#2962be] text-white shadow-sm"
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
      className={`relative inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[13px] transition-colors cursor-pointer select-none overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#377ef0] focus-visible:ring-offset-2 ${baseStyle} ${className}`}
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
