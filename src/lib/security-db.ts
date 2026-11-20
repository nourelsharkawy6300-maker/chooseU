import { ConsultationOrderRow } from "@/types/chooseu";

const LEGACY_LOCAL_ORDERS_KEY = "chooseu_orders_v2";
const ADMIN_LOCKOUT_STORAGE_KEY = "chooseu_admin_rate_limit_v2";
const MAX_ADMIN_ATTEMPTS = 5;

interface AdminRateLimitState {
  failedAttempts: number;
  lockoutUntil: number | null;
}

function purgeLegacyLocalOrders(): void {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(LEGACY_LOCAL_ORDERS_KEY) !== null) {
      localStorage.removeItem(LEGACY_LOCAL_ORDERS_KEY);
    }
  } catch {
    // Ignore storage access errors
  }
}

// ============================================================================
// 1. INPUT SANITIZATION & SECURITY VALIDATOR
// ============================================================================

export const SecurityValidator = {
  /**
   * Strips HTML tags, inline script vectors, angle brackets, and dangerous protocols.
   */
  sanitizeText(input: string): string {
    if (!input || typeof input !== "string") return "";
    return input
      .replace(/<[^>]*>?/gm, "")
      .replace(/[<>]/g, "")
      .replace(/javascript:/gi, "")
      .replace(/data:/gi, "")
      .replace(/vbscript:/gi, "")
      .replace(/on\w+\s*=/gi, "")
      .trim();
  },

  /**
   * Validates standard Egyptian mobile numbers (010, 011, 012, 015 followed by 8 digits).
   */
  validateEgyptianPhone(phone: string): boolean {
    if (!phone || typeof phone !== "string") return false;
    const normalized = phone
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
      .replace(/[\s\-()]/g, "")
      .trim();
    return /^01[0125][0-9]{8}$/.test(normalized);
  },

  /**
   * Normalizes an Egyptian mobile number to a clean 11-digit string.
   */
  normalizeEgyptianPhone(phone: string): string {
    if (!phone || typeof phone !== "string") return "";
    return phone
      .replace(/[٠-٩]/g, (d) => String("٠١٢٣٤٥٦٧٨٩".indexOf(d)))
      .replace(/[\s\-()]/g, "")
      .trim();
  },

  /**
   * Validates InstaPay or mobile wallet transaction reference IDs (>= 6 alphanumeric/dash chars).
   */
  validateInstaPayRef(ref: string): boolean {
    if (!ref || typeof ref !== "string") return false;
    const cleaned = this.sanitizeText(ref).replace(/\s+/g, "");
    if (cleaned.length < 6 || cleaned.length > 64) return false;
    return /^[A-Za-z0-9\-_#]+$/.test(cleaned);
  },

  /**
   * Reads current client-side rate-limit state for the Staff Admin passcode gate.
   */
  getRateLimitState(): AdminRateLimitState {
    if (typeof window === "undefined") {
      return { failedAttempts: 0, lockoutUntil: null };
    }
    try {
      const raw = localStorage.getItem(ADMIN_LOCKOUT_STORAGE_KEY);
      if (!raw) return { failedAttempts: 0, lockoutUntil: null };
      const parsed = JSON.parse(raw) as AdminRateLimitState;
      if (parsed.lockoutUntil && Date.now() > parsed.lockoutUntil) {
        const resetState: AdminRateLimitState = {
          failedAttempts: 0,
          lockoutUntil: null,
        };
        localStorage.setItem(
          ADMIN_LOCKOUT_STORAGE_KEY,
          JSON.stringify(resetState)
        );
        return resetState;
      }
      return parsed;
    } catch {
      return { failedAttempts: 0, lockoutUntil: null };
    }
  },

  isLockedOut(): boolean {
    const state = this.getRateLimitState();
    return Boolean(state.lockoutUntil && Date.now() < state.lockoutUntil);
  },

  getLockoutRemainingSeconds(): number {
    const state = this.getRateLimitState();
    if (!state.lockoutUntil || Date.now() >= state.lockoutUntil) return 0;
    return Math.ceil((state.lockoutUntil - Date.now()) / 1000);
  },

  getRemainingAttempts(): number {
    const state = this.getRateLimitState();
    if (state.lockoutUntil && Date.now() < state.lockoutUntil) return 0;
    return Math.max(0, MAX_ADMIN_ATTEMPTS - state.failedAttempts);
  },

  /**
   * Client-side placeholder. Actual passcode verification is strictly enforced
   * server-side via POST /api/admin/auth.
   */
  verifyAdminPasscode(_input?: string): boolean {
    void _input;
    return false;
  },
};

// ============================================================================
// 2. SERVER-MEDIATED API SERVICE (DataService)
//    Zero direct browser-to-Supabase DB calls, zero localStorage PII caching.
// ============================================================================

export const DataService = {
  /**
   * Creates a new consultation order strictly through POST /api/orders.
   * Throws an Error with a localized message if the server rejects or fails.
   */
  async createOrder(
    payload: Omit<
      ConsultationOrderRow,
      "id" | "created_at" | "order_code" | "order_status"
    > & {
      order_code?: string;
      order_status?: "pending" | "approved" | "rejected";
    }
  ): Promise<ConsultationOrderRow> {
    purgeLegacyLocalOrders();

    const apiResponse = await fetch("/api/orders", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        student_name: payload.student_name,
        whatsapp_phone: SecurityValidator.normalizeEgyptianPhone(
          payload.whatsapp_phone
        ),
        academic_stream: payload.academic_stream,
        score_percentage: Number(payload.score_percentage),
        max_budget: Number(payload.max_budget),
        governorate: payload.governorate,
        instapay_ref: payload.instapay_ref,
        quiz_results: payload.quiz_results || {},
      }),
    });

    const result = (await apiResponse.json().catch(() => null)) as {
      success?: boolean;
      order?: Partial<ConsultationOrderRow>;
      error?: string;
    } | null;

    if (!apiResponse.ok || !result?.success || !result.order?.order_code) {
      throw new Error(
        result?.error || "تعذر حفظ الطلب حالياً. يرجى المحاولة مرة أخرى."
      );
    }

    // Keep submitted fields in-memory only for the confirmation screen (never persisted in localStorage)
    return {
      order_code: result.order.order_code,
      order_status: result.order.order_status || "pending",
      created_at: result.order.created_at || new Date().toISOString(),
      student_name: SecurityValidator.sanitizeText(payload.student_name),
      whatsapp_phone: SecurityValidator.normalizeEgyptianPhone(
        payload.whatsapp_phone
      ),
      academic_stream: payload.academic_stream,
      score_percentage: Number(payload.score_percentage),
      max_budget: Number(payload.max_budget),
      governorate: SecurityValidator.sanitizeText(payload.governorate),
      quiz_results: payload.quiz_results ?? {},
      instapay_ref: SecurityValidator.sanitizeText(payload.instapay_ref),
      voice_note_url: "",
      advisor_notes: "",
    };
  },

  /**
   * Fetches all consultation orders owned by the currently authenticated student.
   */
  async getMyOrders(): Promise<ConsultationOrderRow[]> {
    purgeLegacyLocalOrders();

    try {
      const apiResponse = await fetch("/api/orders", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!apiResponse.ok) return [];

      const result = (await apiResponse.json().catch(() => null)) as {
        success?: boolean;
        orders?: ConsultationOrderRow[];
      } | null;

      if (!result?.success || !Array.isArray(result.orders)) {
        return [];
      }

      return result.orders;
    } catch {
      return [];
    }
  },

  /**
   * Queries an order owned by the authenticated student by full order_code through GET /api/orders.
   */
  async getOrderByCodeOrPhone(
    queryInput: string
  ): Promise<ConsultationOrderRow | null> {
    purgeLegacyLocalOrders();

    const cleanQuery = SecurityValidator.sanitizeText(queryInput);
    if (!cleanQuery) return null;

    try {
      const apiResponse = await fetch(
        `/api/orders?q=${encodeURIComponent(cleanQuery)}`,
        { credentials: "same-origin", cache: "no-store" }
      );
      if (!apiResponse.ok) return null;

      const result = (await apiResponse.json().catch(() => null)) as {
        success?: boolean;
        order?: Partial<ConsultationOrderRow>;
      } | null;

      if (!result?.success || !result.order?.order_code) {
        return null;
      }

      return {
        id: result.order.id,
        user_id: result.order.user_id ?? null,
        order_code: result.order.order_code,
        order_status: result.order.order_status || "pending",
        created_at: result.order.created_at || "",
        student_name: result.order.student_name || "",
        whatsapp_phone: result.order.whatsapp_phone || "",
        academic_stream: result.order.academic_stream || "",
        score_percentage: Number(result.order.score_percentage) || 0,
        max_budget: Number(result.order.max_budget) || 0,
        governorate: result.order.governorate || "",
        quiz_results: result.order.quiz_results ?? {},
        instapay_ref: result.order.instapay_ref || "",
        voice_note_url: result.order.voice_note_url || "",
        advisor_notes: result.order.advisor_notes || "",
      };
    } catch {
      return null;
    }
  },
};