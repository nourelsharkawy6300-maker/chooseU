"use client";

import { createClient } from "@/lib/supabase/client";

export interface ExtendedStudentProfile {
  country: string;
  educationalSystem:
    | "ثانوية عامة مصرية"
    | "أزهر"
    | "STEM"
    | "IGCSE"
    | "American Diploma"
    | "أخرى";
  currentGrade:
    | "الصف الثالث الثانوي"
    | "الصف الثاني الثانوي"
    | "خريج / إعادة تنسيق";
  schoolType:
    | "حكومي"
    | "تجريبي / رسمي لغات"
    | "خاص عربي"
    | "خاص لغات / دولي"
    | "STEM";
  age: number | null;
  interestsText: string;
  goalsText: string;
  learningStyle:
    | "عملي وتطبيقي"
    | "تحليلي وبحثي"
    | "تواصلي وقيادي"
    | "إبداعي وتصميمي";
}

export interface ParentFeedbackEntry {
  id: string;
  parentName: string;
  stance: "supportive" | "needs_discussion" | "concerned";
  preferredOption: string;
  opinion: string;
  concerns: string;
  suggestions: string;
  updatedAt: string;
}

export type ApplicationStatus =
  | "not_started"
  | "preparing_docs"
  | "applied"
  | "accepted";

export interface ShortlistItem {
  id: string;
  kind: "faculty" | "scholarship";
  title: string;
  subtitle: string;
  deadline: string;
  status: ApplicationStatus;
  notes?: string;
  addedAt: string;
}

export interface ConsultationBooking {
  id: string;
  consultantId: string;
  consultantName: string;
  consultantRole: string;
  meetingFormat: "جلسة فيديو أونلاين" | "مكالمة صوتية" | "مراجعة مكتوبة + فويس نوت";
  preferredSlot: string;
  studentQuestion: string;
  status: "requested" | "confirmed";
  createdAt: string;
}

export interface MvpUserState {
  extendedProfile: ExtendedStudentProfile;
  parentModeEnabled: boolean;
  parentFeedback: ParentFeedbackEntry | null;
  shortlist: ShortlistItem[];
  completedDocIds: string[];
  savedAiInsights: string[];
  consultationBookings: ConsultationBooking[];
}

export const DEFAULT_MVP_STATE: MvpUserState = {
  extendedProfile: {
    country: "مصر",
    educationalSystem: "ثانوية عامة مصرية",
    currentGrade: "الصف الثالث الثانوي",
    schoolType: "حكومي",
    age: 17,
    interestsText: "",
    goalsText: "",
    learningStyle: "عملي وتطبيقي",
  },
  parentModeEnabled: false,
  parentFeedback: null,
  shortlist: [],
  completedDocIds: [],
  savedAiInsights: [],
  consultationBookings: [],
};

function getStorageKey(userId: string | null): string {
  return userId ? `chooseu_mvp_v1_${userId}` : "chooseu_mvp_v1_guest";
}

export function readLocalMvpState(userId: string | null): MvpUserState {
  if (typeof window === "undefined") return DEFAULT_MVP_STATE;
  try {
    const raw = window.localStorage.getItem(getStorageKey(userId));
    if (!raw) return DEFAULT_MVP_STATE;
    const parsed = JSON.parse(raw) as Partial<MvpUserState>;
    return {
      ...DEFAULT_MVP_STATE,
      ...parsed,
      extendedProfile: {
        ...DEFAULT_MVP_STATE.extendedProfile,
        ...(parsed.extendedProfile || {}),
      },
      shortlist: Array.isArray(parsed.shortlist) ? parsed.shortlist : [],
      completedDocIds: Array.isArray(parsed.completedDocIds)
        ? parsed.completedDocIds
        : [],
      savedAiInsights: Array.isArray(parsed.savedAiInsights)
        ? parsed.savedAiInsights
        : [],
      consultationBookings: Array.isArray(parsed.consultationBookings)
        ? parsed.consultationBookings
        : [],
    };
  } catch {
    return DEFAULT_MVP_STATE;
  }
}

export async function loadMvpState(userId: string | null): Promise<MvpUserState> {
  const local = readLocalMvpState(userId);
  if (!userId) return local;
  try {
    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const remote = data.user?.user_metadata?.chooseu_mvp as
      | Partial<MvpUserState>
      | undefined;
    if (!remote) return local;
    const merged: MvpUserState = {
      ...DEFAULT_MVP_STATE,
      ...local,
      ...remote,
      extendedProfile: {
        ...DEFAULT_MVP_STATE.extendedProfile,
        ...(local.extendedProfile || {}),
        ...(remote.extendedProfile || {}),
      },
      shortlist: Array.isArray(remote.shortlist)
        ? remote.shortlist
        : local.shortlist,
      completedDocIds: Array.isArray(remote.completedDocIds)
        ? remote.completedDocIds
        : local.completedDocIds,
      savedAiInsights: Array.isArray(remote.savedAiInsights)
        ? remote.savedAiInsights
        : local.savedAiInsights,
      consultationBookings: Array.isArray(remote.consultationBookings)
        ? remote.consultationBookings
        : local.consultationBookings,
    };
    if (typeof window !== "undefined") {
      window.localStorage.setItem(getStorageKey(userId), JSON.stringify(merged));
    }
    return merged;
  } catch {
    return local;
  }
}

export async function saveMvpState(
  userId: string | null,
  next: MvpUserState
): Promise<boolean> {
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(getStorageKey(userId), JSON.stringify(next));
    } catch {
      // ignore storage quota errors
    }
  }
  if (!userId) return true;
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      data: { chooseu_mvp: next },
    });
    return !error;
  } catch {
    return false;
  }
}