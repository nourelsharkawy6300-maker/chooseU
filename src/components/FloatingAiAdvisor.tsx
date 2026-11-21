"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bot } from "lucide-react";

export function FloatingAiAdvisor() {
  const pathname = usePathname();
  if (
    !pathname ||
    pathname === "/advisor" ||
    pathname.startsWith("/admin") ||
    pathname === "/login" ||
    pathname === "/signup"
  ) {
    return null;
  }

  return (
    <Link
      href="/advisor"
      aria-label="اسأل المستشار الذكي"
      className="fixed bottom-20 lg:bottom-6 left-4 z-40 bg-[#FACC15] hover:bg-[#EAB308] text-slate-950 px-4 py-2.5 rounded-full shadow-lg shadow-amber-600/25 flex items-center gap-2 text-[12px] font-bold transition-transform hover:scale-105 no-print"
    >
      <Bot className="w-4 h-4" />
      <span className="hidden sm:inline">اسأل المستشار الذكي</span>
    </Link>
  );
}