"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import { StreamType, LivingMode, TrackKey, UserRole } from "@/types/chooseu";
import { createClient } from "@/lib/supabase/client";

export interface StudentProfile {
  studentName: string;
  stream: StreamType;
  scorePercentage: number;
  annualBudgetEgp: number;
  governorate: string;
  livingMode: LivingMode;
  inflationScenario: number;
  comparedIds: string[];
  assessmentAnswers: Record<number, TrackKey>;
  hasCompletedOnboarding?: boolean;
  privacyConsent?: boolean;
  privacyConsentTimestamp?: string;
}

export interface AuthUserSummary {
  id: string;
  email: string | null;
  role: UserRole;
  ageDeclared: boolean;
  isMinor: boolean;
}

export type ProfileSyncStatus = "idle" | "saving" | "saved" | "error";

export interface StudentContextType extends StudentProfile {
  hydrated: boolean;
  authUser: AuthUserSummary | null;
  syncStatus: ProfileSyncStatus;
  setStudentName: (name: string) => void;
  setStream: (stream: StreamType) => void;
  setScorePercentage: (score: number) => void;
  setAnnualBudgetEgp: (budget: number) => void;
  setGovernorate: (gov: string) => void;
  setLivingMode: (mode: LivingMode) => void;
  setInflationScenario: (scenario: number) => void;
  setComparedIds: (ids: string[]) => void;
  toggleComparedId: (id: string) => void;
  setAssessmentAnswers: (
    answers:
      | Record<number, TrackKey>
      | ((prev: Record<number, TrackKey>) => Record<number, TrackKey>)
  ) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  updateStudent: (patch: Partial<StudentProfile>) => void;
  resetStudent: () => void;
  signOut: () => Promise<void>;
}

interface DbProfileRow {
  id: string;
  full_name: string | null;
  track: string | null;
  score: number | string | null;
  annual_budget: number | string | null;
  age_declared: boolean;
  is_minor: boolean;
  role: string;
}

const LEGACY_STORAGE_KEY = "chooseu_student_profile_v2";
const GUEST_STORAGE_KEY = "chooseu_student_profile_v2_guest";
const VALID_STREAMS = new Set<StreamType>(["Science", "Math", "Arts", "stem"]);

function getUserStorageKey(userId: string | null): string {
  return userId ? `${LEGACY_STORAGE_KEY}_${userId}` : GUEST_STORAGE_KEY;
}

function isSupabaseEnvConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(url && url.startsWith("https://") && key && key.length > 20);
}

function parseStream(value: string | null | undefined): StreamType | null {
  if (!value) return null;
  return VALID_STREAMS.has(value as StreamType) ? (value as StreamType) : null;
}

function parseRole(value: string | null | undefined): UserRole {
  if (value === "admin" || value === "advisor" || value === "student") {
    return value;
  }
  return "student";
}

function readLocalProfile(key: string): Partial<StudentProfile> | null {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return null;
    const parsed = JSON.parse(stored);

    // One-time cleanup: wipe legacy demo profile ONLY if exact values match
    const isLegacyDemo =
      parsed?.studentName === "عمر خالد محمود" &&
      (parsed?.scorePercentage === 89.4 || parsed?.scorePercentage === 89) &&
      parsed?.annualBudgetEgp === 95000 &&
      parsed?.stream === "Math";

    if (isLegacyDemo) {
      localStorage.removeItem(key);
      return null;
    }

    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

const DEFAULT_PROFILE: StudentProfile = {
  studentName: "",
  stream: "Science",
  scorePercentage: 0,
  annualBudgetEgp: 0,
  governorate: "القاهرة",
  livingMode: "commute",
  inflationScenario: 12,
  comparedIds: [],
  assessmentAnswers: {},
  hasCompletedOnboarding: false,
  privacyConsent: false,
  privacyConsentTimestamp: "",
};

const StudentContext = createContext<StudentContextType | undefined>(undefined);

export function StudentProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [hydrated, setHydrated] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUserSummary | null>(null);
  const [syncStatus, setSyncStatus] = useState<ProfileSyncStatus>("idle");

  const profileRef = useRef<StudentProfile>(DEFAULT_PROFILE);
  const activeUserIdRef = useRef<string | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const persistToDb = useCallback(async (userId: string, next: StudentProfile) => {
    if (!isSupabaseEnvConfigured()) return;
    if (activeUserIdRef.current !== userId) return;

    const safeTrack = VALID_STREAMS.has(next.stream) ? next.stream : "Undecided";
    const safeScore =
      Number.isFinite(next.scorePercentage) &&
      next.scorePercentage >= 0 &&
      next.scorePercentage <= 100
        ? Math.round(next.scorePercentage * 100) / 100
        : null;
    const safeBudget =
      Number.isFinite(next.annualBudgetEgp) && next.annualBudgetEgp >= 0
        ? Math.round(next.annualBudgetEgp * 100) / 100
        : null;

    setSyncStatus("saving");
    try {
      const supabase = createClient();
      // Strictly column-scoped update matching 002_profiles_and_auth.sql grants
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: next.studentName.trim(),
          track: safeTrack,
          score: safeScore,
          annual_budget: safeBudget,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (activeUserIdRef.current !== userId) return;
      if (error) {
        setSyncStatus("error");
      } else {
        setSyncStatus("saved");
      }
    } catch {
      if (activeUserIdRef.current === userId) {
        setSyncStatus("error");
      }
    }
  }, []);

  const scheduleDbSync = useCallback(
    (next: StudentProfile, immediate = false) => {
      const userId = activeUserIdRef.current;
      if (!userId) return;

      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }

      if (immediate) {
        void persistToDb(userId, next);
      } else {
        syncTimerRef.current = setTimeout(() => {
          syncTimerRef.current = null;
          void persistToDb(userId, next);
        }, 450);
      }
    },
    [persistToDb]
  );

  const applyProfileChange = useCallback(
    (
      updater: (prev: StudentProfile) => StudentProfile,
      options?: { syncDb?: boolean; immediate?: boolean }
    ) => {
      const next = updater(profileRef.current);
      profileRef.current = next;
      setProfile(next);

      if (options?.syncDb) {
        scheduleDbSync(next, Boolean(options.immediate));
      }
    },
    [scheduleDbSync]
  );

  useEffect(() => {
    let cancelled = false;

    const loadGuestState = () => {
      activeUserIdRef.current = null;
      setAuthUser(null);
      setSyncStatus("idle");

      const guestData =
        readLocalProfile(GUEST_STORAGE_KEY) || readLocalProfile(LEGACY_STORAGE_KEY);
      const next = guestData ? { ...DEFAULT_PROFILE, ...guestData } : DEFAULT_PROFILE;

      if (!cancelled) {
        profileRef.current = next;
        setProfile(next);
        setHydrated(true);
      }
    };

    const loadAuthenticatedState = async (userId: string, email: string | null) => {
      activeUserIdRef.current = userId;

      // Remove unscoped legacy key so previous guest/user data cannot bleed across accounts
      try {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      } catch {
        // ignore storage errors
      }

      const userLocal = readLocalProfile(getUserStorageKey(userId));
      const base: StudentProfile = userLocal
        ? { ...DEFAULT_PROFILE, ...userLocal }
        : { ...DEFAULT_PROFILE };

      try {
        const supabase = createClient();
        const { data: row } = await supabase
          .from("profiles")
          .select("id, full_name, track, score, annual_budget, age_declared, is_minor, role")
          .eq("id", userId)
          .single<DbProfileRow>();

        if (cancelled || activeUserIdRef.current !== userId) return;

        if (row) {
          const dbStream = parseStream(row.track);
          const dbScore =
            row.score !== null && row.score !== undefined && Number.isFinite(Number(row.score))
              ? Number(row.score)
              : null;
          const dbBudget =
            row.annual_budget !== null &&
            row.annual_budget !== undefined &&
            Number.isFinite(Number(row.annual_budget))
              ? Number(row.annual_budget)
              : null;

          const hasCompleteDbAcademicData = Boolean(
            dbStream && dbScore !== null && dbScore >= 50
          );

          const merged: StudentProfile = {
            ...base,
            studentName:
              row.full_name && row.full_name.trim().length > 0
                ? row.full_name
                : base.studentName,
            stream: dbStream ?? base.stream,
            scorePercentage: dbScore ?? base.scorePercentage,
            annualBudgetEgp: dbBudget ?? base.annualBudgetEgp,
            hasCompletedOnboarding:
              Boolean(base.hasCompletedOnboarding) || hasCompleteDbAcademicData,
          };

          profileRef.current = merged;
          setProfile(merged);
          setAuthUser({
            id: userId,
            email,
            role: parseRole(row.role),
            ageDeclared: Boolean(row.age_declared),
            isMinor: Boolean(row.is_minor),
          });
          setHydrated(true);
          return;
        }
      } catch {
        // Fallback to user-scoped local profile if network fails
      }

      if (!cancelled && activeUserIdRef.current === userId) {
        profileRef.current = base;
        setProfile(base);
        setAuthUser({
          id: userId,
          email,
          role: "student",
          ageDeclared: false,
          isMinor: false,
        });
        setHydrated(true);
      }
    };

    if (!isSupabaseEnvConfigured()) {
      setTimeout(() => {
        loadGuestState();
      }, 0);
      return () => {
        cancelled = true;
      };
    }

    const supabase = createClient();

    async function hydrateFromAuth() {
      try {
        // Strictly verify active user with getUser()
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (cancelled) return;
        if (user) {
          await loadAuthenticatedState(user.id, user.email ?? null);
        } else {
          loadGuestState();
        }
      } catch {
        if (!cancelled) loadGuestState();
      }
    }

    void hydrateFromAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (cancelled) return;

      if (event === "SIGNED_OUT") {
        const previousUserId = activeUserIdRef.current;
        if (syncTimerRef.current) {
          clearTimeout(syncTimerRef.current);
          syncTimerRef.current = null;
        }
        activeUserIdRef.current = null;
        try {
          if (previousUserId) {
            localStorage.removeItem(getUserStorageKey(previousUserId));
          }
          localStorage.removeItem(LEGACY_STORAGE_KEY);
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.toLowerCase().includes("chooseu") && !k.toLowerCase().includes("admin")) {
          localStorage.removeItem(k);
        }
      }
        } catch {
          // ignore storage errors
        }
        profileRef.current = DEFAULT_PROFILE;
        setProfile(DEFAULT_PROFILE);
        setAuthUser(null);
        setSyncStatus("idle");
        setHydrated(true);
        return;
      }

      if (event === "SIGNED_IN" || event === "USER_UPDATED" || event === "TOKEN_REFRESHED") {
        void hydrateFromAuth();
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current);
        syncTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      const storageKey = getUserStorageKey(activeUserIdRef.current);
      localStorage.setItem(storageKey, JSON.stringify(profile));
    } catch {
      // quota exceeded or storage disabled
    }
  }, [profile, hydrated, authUser]);

  const signOut = useCallback(async () => {
    const previousUserId = activeUserIdRef.current;
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current);
      syncTimerRef.current = null;
    }

    if (isSupabaseEnvConfigured()) {
      try {
        const supabase = createClient();
        await supabase.auth.signOut();
      } catch {
        // Still clear local state even if network signOut fails
      }
    }

    activeUserIdRef.current = null;
    try {
      if (previousUserId) {
        localStorage.removeItem(getUserStorageKey(previousUserId));
      }
      localStorage.removeItem(LEGACY_STORAGE_KEY);
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const k = localStorage.key(i);
        if (k && k.toLowerCase().includes("chooseu") && !k.toLowerCase().includes("admin")) {
          localStorage.removeItem(k);
        }
      }
    } catch {
      // ignore storage errors
    }

    profileRef.current = DEFAULT_PROFILE;
    setProfile(DEFAULT_PROFILE);
    setAuthUser(null);
    setSyncStatus("idle");
  }, []);

  const value: StudentContextType = useMemo(
    () => ({
      ...profile,
      hydrated,
      authUser,
      syncStatus,
      setStudentName: (studentName: string) =>
        applyProfileChange((p) => ({ ...p, studentName }), { syncDb: true }),
      setStream: (stream: StreamType) =>
        applyProfileChange((p) => ({ ...p, stream }), { syncDb: true, immediate: true }),
      setScorePercentage: (scorePercentage: number) =>
        applyProfileChange((p) => ({ ...p, scorePercentage }), { syncDb: true }),
      setAnnualBudgetEgp: (annualBudgetEgp: number) =>
        applyProfileChange((p) => ({ ...p, annualBudgetEgp }), { syncDb: true }),
      setGovernorate: (governorate: string) =>
        applyProfileChange((p) => ({ ...p, governorate })),
      setLivingMode: (livingMode: LivingMode) =>
        applyProfileChange((p) => ({ ...p, livingMode })),
      setInflationScenario: (inflationScenario: number) =>
        applyProfileChange((p) => ({ ...p, inflationScenario })),
      setComparedIds: (comparedIds: string[]) =>
        applyProfileChange((p) => ({ ...p, comparedIds })),
      toggleComparedId: (id: string) =>
        applyProfileChange((p) => {
          const prev = p.comparedIds || [];
          const next = prev.includes(id)
            ? prev.filter((x) => x !== id)
            : prev.length < 4
            ? [...prev, id]
            : prev;
          return { ...p, comparedIds: next };
        }),
      setAssessmentAnswers: (
        answers:
          | Record<number, TrackKey>
          | ((prev: Record<number, TrackKey>) => Record<number, TrackKey>)
      ) =>
        applyProfileChange((p) => {
          const next =
            typeof answers === "function"
              ? answers(p.assessmentAnswers || {})
              : answers;
          return { ...p, assessmentAnswers: next };
        }),
      setHasCompletedOnboarding: (hasCompletedOnboarding: boolean) =>
        applyProfileChange((p) => ({ ...p, hasCompletedOnboarding })),
      updateStudent: (patch: Partial<StudentProfile>) => {
        const touchesDbFields =
          patch.studentName !== undefined ||
          patch.stream !== undefined ||
          patch.scorePercentage !== undefined ||
          patch.annualBudgetEgp !== undefined;
        applyProfileChange((p) => ({ ...p, ...patch }), {
          syncDb: touchesDbFields,
          immediate: true,
        });
      },
      resetStudent: () => {
        try {
          localStorage.removeItem(getUserStorageKey(activeUserIdRef.current));
        } catch {
          // ignore
        }
        applyProfileChange(() => DEFAULT_PROFILE);
      },
      signOut,
    }),
    [profile, hydrated, authUser, syncStatus, applyProfileChange, signOut]
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