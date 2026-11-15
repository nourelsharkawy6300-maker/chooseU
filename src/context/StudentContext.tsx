"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { StreamType, LivingMode } from "@/types/chooseu";

export interface StudentProfile {
  studentName: string;
  stream: StreamType;
  scorePercentage: number;
  annualBudgetEgp: number;
  governorate: string;
  livingMode: LivingMode;
  inflationScenario: number;
  comparedIds: string[];
}

export interface StudentContextType extends StudentProfile {
  setStudentName: (name: string) => void;
  setStream: (stream: StreamType) => void;
  setScorePercentage: (score: number) => void;
  setAnnualBudgetEgp: (budget: number) => void;
  setGovernorate: (gov: string) => void;
  setLivingMode: (mode: LivingMode) => void;
  setInflationScenario: (scenario: number) => void;
  setComparedIds: (ids: string[]) => void;
  toggleComparedId: (id: string) => void;
  updateStudent: (patch: Partial<StudentProfile>) => void;
  resetStudent: () => void;
}

const STORAGE_KEY = "chooseu_student_profile_v2";

const DEFAULT_PROFILE: StudentProfile = {
  studentName: "عمر خالد محمود",
  stream: "Math",
  scorePercentage: 89.4,
  annualBudgetEgp: 95000,
  governorate: "القاهرة",
  livingMode: "commute",
  inflationScenario: 12,
  comparedIds: [],
};

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setTimeout(() => {
          setProfile((prev) => ({ ...prev, ...parsed }));
          setHydrated(true);
        }, 0);
        return;
      }
    } catch {
      // localStorage not accessible or SSR
    }
    setTimeout(() => {
      setHydrated(true);
    }, 0);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // quota exceeded or storage disabled
    }
  }, [profile, hydrated]);

  const value: StudentContextType = useMemo(
    () => ({
      ...profile,
      setStudentName: (studentName: string) => setProfile((p) => ({ ...p, studentName })),
      setStream: (stream: StreamType) => setProfile((p) => ({ ...p, stream })),
      setScorePercentage: (scorePercentage: number) => setProfile((p) => ({ ...p, scorePercentage })),
      setAnnualBudgetEgp: (annualBudgetEgp: number) => setProfile((p) => ({ ...p, annualBudgetEgp })),
      setGovernorate: (governorate: string) => setProfile((p) => ({ ...p, governorate })),
      setLivingMode: (livingMode: LivingMode) => setProfile((p) => ({ ...p, livingMode })),
      setInflationScenario: (inflationScenario: number) => setProfile((p) => ({ ...p, inflationScenario })),
      setComparedIds: (comparedIds: string[]) => setProfile((p) => ({ ...p, comparedIds })),
      toggleComparedId: (id: string) =>
        setProfile((p) => {
          const prev = p.comparedIds || [];
          const next = prev.includes(id)
            ? prev.filter((x) => x !== id)
            : prev.length < 4
            ? [...prev, id]
            : prev;
          return { ...p, comparedIds: next };
        }),
      updateStudent: (patch: Partial<StudentProfile>) => setProfile((p) => ({ ...p, ...patch })),
      resetStudent: () => setProfile(DEFAULT_PROFILE),
    }),
    [profile]
  );

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export function useStudent(): StudentContextType {
  const ctx = useContext(StudentContext);
  if (!ctx) {
    throw new Error("useStudent must be used within a StudentProvider");
  }
  return ctx;
}
