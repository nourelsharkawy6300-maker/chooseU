export type StreamType = "Science" | "Math" | "Arts" | "stem";
export type UserRole = "student" | "advisor" | "admin";

export interface UserProfileRow {
  id: string;
  full_name: string | null;
  track: StreamType | "Undecided" | null;
  score: number | null;
  annual_budget: number | null;
  is_minor: boolean;
  guardian_ack: boolean;
  guardian_ack_at: string | null;
  role: UserRole;
  created_at?: string;
  updated_at?: string;
}

export function formatStream(stream: StreamType | string): string {
  switch (stream) {
    case "Science":
      return "علمي علوم";
    case "Math":
      return "علمي رياضة";
    case "stem":
      return "STEM (متفوقين)";
    case "Arts":
    default:
      return "أدبي";
  }
}

/**
 * Formats a score percentage consistently across the entire application:
 * - 1 decimal place if there is a fraction (e.g. 89.4 -> "89.4%")
 * - 0 decimal places if it is an integer (e.g. 89.0 -> "89%")
 * - Returns "0%" if zero or invalid
 */
export function formatScore(score: number): string {
  if (isNaN(score) || score <= 0) return "0%";
  const hasFraction = score % 1 !== 0;
  return `${hasFraction ? score.toFixed(1) : Math.round(score)}%`;
}

export type InterestCluster =
  | "Medical_Bio"
  | "Eng_Tech"
  | "Media_Lang"
  | "Biz_Econ"
  | "Law_Edu_Social"
  | "Applied_Agri_Arts";

export type EnterpriseViewKey =
  | "landing"
  | "journey"
  | "auth"
  | "onboarding"
  | "dashboard"
  | "assessment"
  | "tansik-simulator"
  | "calculator"
  | "explore"
  | "compare"
  | "alternatives"
  | "careers"
  | "timeline"
  | "profile"
  | "admin";

export type PlatformView =
  | "landing"
  | "workspace"
  | "future_me"
  | "directory"
  | "sample_report"
  | "track_order"
  | EnterpriseViewKey;

export type WorkspaceSubTab = "quiz" | "scenarios" | "tco_table" | "compare";

export type UniversityCategory =
  | "حكومي انتظام"
  | "برامج خاصة وساعات معتمدة"
  | "جامعات أهلية"
  | "جامعات أهلية منبثقة"
  | "جامعات أهلية دولية"
  | "جامعات خاصة وتكنولوجية";

export type TrackKey =
  | "Med_Clinical"
  | "Pharma_Chem"
  | "Rehab_PT"
  | "Bio_Tech"
  | "AI"
  | "Cyber"
  | "SE"
  | "Hardware"
  | "Arch_Civil"
  | "Data"
  | "Biz_Fin"
  | "Econ_Pol"
  | "Lang_Trans"
  | "Media_Law"
  | "Edu_Human";

export type LivingMode = "commute" | "dorm";

export type AnalysisMode = "trial" | "tansik";

export interface RoadmapYearStep {
  year: string;
  focus: string;
  skills: string[];
}

export interface FutureCareerProfile {
  roles: string[];
  progression: string;
  market_demand: "مرتفع جداً" | "مرتفع" | "متوازن";
  salary_range_egp: string;
  roadmap_years: RoadmapYearStep[];
}

export interface Faculty {
  id: string;
  name: string;
  university: string;
  gov: string;
  stream: StreamType | "Both";
  type: UniversityCategory;
  cutoff_2026: number;
  y1_base_fee: number;
  admin_lab_fee: number;
  bylaw_notes: string;
  gpa_requirement: string;
  scholarship_rule: string;
  aptitude_test: boolean;
  duration_years?: number;
  credit_hour_bylaw?: boolean;
  tracks: TrackKey[];
  future_career: FutureCareerProfile;
}

export interface TcoMetrics {
  y1Base: number;
  adminFee: number;
  annualLiving: number;
  geoTierLabel: string;
  livingDesc: string;
  tuition4Yr: number;
  admin4Yr: number;
  living4Yr: number;
  total4Yr: number;
  basePct: number;
  adminPct: number;
  livingPct: number;
}

export interface RankedFaculty extends Faculty {
  shiftedCutoff: number;
  margin: number;
  matchScore: number;
  geoZone?: string;
  stemNote?: string;
  groupKey: "target" | "safe" | "fallback";
  safetyBadge: {
    label: string;
    style: string;
  };
  whyMatch: string;
}

export interface EvaluationResult {
  allRanked: RankedFaculty[];
  targetGroup: RankedFaculty[];
  safeGroup: RankedFaculty[];
  fallbackGroup: RankedFaculty[];
  minNeededBudget: number;
}

export interface ConsultationOrderRow {
  id?: string;
  order_code: string;
  student_name: string;
  whatsapp_phone: string;
  academic_stream: string;
  score_percentage: number;
  max_budget: number;
  governorate: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  quiz_results: any;
  instapay_ref: string;
  order_status: "pending" | "approved" | "rejected";
  voice_note_url?: string;
  advisor_notes?: string;
  created_at?: string;
}

export interface QuizQuestionOption {
  label: string;
  track: TrackKey;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: QuizQuestionOption[];
}