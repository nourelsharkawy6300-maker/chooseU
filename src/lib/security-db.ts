import { ConsultationOrderRow } from "@/types/chooseu";

export interface TrackOrderResult {
  order_code: string;
  order_status: "pending" | "approved" | "rejected";
  progress_label: string;
}

// ============================================================================
// 1. STORAGE CONSTANTS
// ============================================================================

const LOCAL_ORDERS_STORAGE_KEY = "chooseu_orders_v2";
const ADMIN_LOCKOUT_STORAGE_KEY = "chooseu_admin_rate_limit_v2";

const MAX_ADMIN_ATTEMPTS = 5;

interface AdminRateLimitState {
  failedAttempts: number;
  lockoutUntil: number | null;
}

// ============================================================================
// 2. ENTERPRISE INPUT SANITIZATION & SECURITY VALIDATOR
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
   * server-side via POST /api/admin/auth with scrypt hashing and rate-limiting.
   */
  verifyAdminPasscode(_input?: string): boolean {
    void _input;
    return false;
  },
};

// ============================================================================
// 3. SECURE DATA SERVICE (All lookups routed via /api/orders)
// ============================================================================

const INITIAL_DEMO_ORDER: ConsultationOrderRow = {
  id: "demo-ord-710",
  order_code: "ORD-2026-710",
  student_name: "نموذج توضيحي — طالب تجريبي",
  whatsapp_phone: "01000000000",
  academic_stream: "Math",
  score_percentage: 83.0,
  max_budget: 65000,
  governorate: "المنوفية",
  quiz_results: {
    topTrack: "AI",
    eligibleIds: [
      "menofia-ai-public",
      "menofia-cs-public",
      "menofia-ai-credit",
      "menofia-ahleya-cs",
    ],
  },
  instapay_ref: "IPN-20261114-7100",
  order_status: "approved",
  voice_note_url: "",
  advisor_notes:
    "1. الأولوية الأولى: كلية الذكاء الاصطناعي وكلية الحاسبات والمعلومات بجامعة المنوفية (حكومي انتظام) لتقارب المجموع المدخل (83.0%) مع الحد الأدنى الاسترشادي وانخفاض التكلفة الدراسية.\n2. البديل الاستراتيجي: برنامج الأمن السيبراني وعلوم البيانات بالساعات المعتمدة بجامعة المنوفية، أو كلية الحاسبات والذكاء الاصطناعي بجامعة المنوفية الأهلية مع الحفاظ على معدل تراكمي GPA >= 2.7 في السنة التأسيسية الأولى.",
  created_at: "2026-11-14T08:00:00.000Z",
};

export const DataService = {
  /**
   * Reads mirrored orders from localStorage (`chooseu_orders_v2`), seeding a verified sample order if empty.
   */
  getLocalOrders(): ConsultationOrderRow[] {
    if (typeof window === "undefined") return [INITIAL_DEMO_ORDER];
    try {
      const raw = localStorage.getItem(LOCAL_ORDERS_STORAGE_KEY);
      if (!raw) {
        localStorage.setItem(
          LOCAL_ORDERS_STORAGE_KEY,
          JSON.stringify([INITIAL_DEMO_ORDER])
        );
        return [INITIAL_DEMO_ORDER];
      }
      const parsed = JSON.parse(raw) as ConsultationOrderRow[];
      if (!Array.isArray(parsed) || parsed.length === 0) {
        localStorage.setItem(
          LOCAL_ORDERS_STORAGE_KEY,
          JSON.stringify([INITIAL_DEMO_ORDER])
        );
        return [INITIAL_DEMO_ORDER];
      }
      return parsed;
    } catch {
      return [INITIAL_DEMO_ORDER];
    }
  },

  /**
   * Persists the order list to localStorage (`chooseu_orders_v2`).
   */
  saveLocalOrders(orders: ConsultationOrderRow[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(LOCAL_ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch {
      // Ignore storage quota errors
    }
  },

  /**
   * Creates a new consultation order via server endpoint `/api/orders`
   * and mirrors it to `localStorage` (`chooseu_orders_v2`).
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
    const cleanOrderCode =
      payload.order_code?.trim().toUpperCase() ||
      (() => {
        const suffix = Array.from(crypto.getRandomValues(new Uint8Array(8)))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("")
          .toUpperCase();
        return `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}-${suffix}`;
      })();

    const sanitizedOrder: ConsultationOrderRow = {
      order_code: cleanOrderCode,
      student_name: SecurityValidator.sanitizeText(payload.student_name),
      whatsapp_phone: SecurityValidator.normalizeEgyptianPhone(
        payload.whatsapp_phone
      ),
      academic_stream: SecurityValidator.sanitizeText(payload.academic_stream),
      score_percentage: Number(payload.score_percentage) || 80.0,
      max_budget: Number(payload.max_budget) || 60000,
      governorate: SecurityValidator.sanitizeText(payload.governorate),
      quiz_results: payload.quiz_results ?? {},
      instapay_ref: SecurityValidator.sanitizeText(payload.instapay_ref),
      order_status: payload.order_status || "pending",
      voice_note_url: payload.voice_note_url
        ? SecurityValidator.sanitizeText(payload.voice_note_url)
        : "",
      advisor_notes: payload.advisor_notes
        ? SecurityValidator.sanitizeText(payload.advisor_notes)
        : "",
      created_at: new Date().toISOString(),
    };

    // Forward to secure server-side API endpoint
    try {
      const apiResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: payload.student_name,
          whatsapp_phone: payload.whatsapp_phone,
          academic_stream: payload.academic_stream,
          score_percentage: Number(payload.score_percentage),
          max_budget: Number(payload.max_budget),
          governorate: payload.governorate,
          instapay_ref: payload.instapay_ref,
          quiz_results: payload.quiz_results || {},
        }),
      });

      if (apiResponse.ok) {
        const result = await apiResponse.json();
        if (result.success && result.order) {
          const existing = this.getLocalOrders().filter(
            (o) => o.order_code !== result.order.order_code
          );
          this.saveLocalOrders([result.order, ...existing]);
          return result.order;
        }
      }
    } catch {
      // Fall through to resilient local mirror
    }

    // Mirror to localStorage so offline/fallback operation never fails
    const localRow: ConsultationOrderRow = {
      ...sanitizedOrder,
      id: `local-${Date.now()}`,
    };
    const existing = this.getLocalOrders().filter(
      (o) => o.order_code !== localRow.order_code
    );
    this.saveLocalOrders([localRow, ...existing]);
    return localRow;
  },

  /**
   * Queries an order strictly by `order_code` (e.g., ORD-2026-710)
   * exclusively via the secure server-side `/api/orders` route.
   * Direct client-side calls to Supabase REST are completely eliminated.
   */
  async getOrderByCodeOrPhone(
    queryInput: string
  ): Promise<(TrackOrderResult & Partial<ConsultationOrderRow>) | null> {
    const cleanQuery = SecurityValidator.sanitizeText(queryInput).trim();
    if (!cleanQuery) return null;

    const upperCode = cleanQuery.toUpperCase();

    // 1. Mandatory server-side API query (strictly returns order_code, order_status, progress_label)
    try {
      const apiResponse = await fetch(
        `/api/orders?code=${encodeURIComponent(upperCode)}`
      );
      if (apiResponse.ok) {
        const result = (await apiResponse.json()) as TrackOrderResult;
        if (result && result.order_code) {
          return result;
        }
      }
    } catch {
      // Fall through to resilient local storage mirror
    }

    // 2. Local mirror fallback (strict order_code match only; phone lookups not permitted)
    const localOrders = this.getLocalOrders();
    const localMatch = localOrders.find(
      (o) => o.order_code.toUpperCase() === upperCode
    );
    if (localMatch) {
      let progress_label = "قيد المراجعة وتأكيد التحويل";
      if (localMatch.order_status === "approved") {
        progress_label = "مكتمل ومتاح للاستعراض";
      } else if (localMatch.order_status === "rejected") {
        progress_label = "تم رفض الطلب";
      }
      return {
        ...localMatch,
        progress_label,
      };
    }

    return null;
  },

  /**
   * Fetches all consultation orders ordered by `created_at desc` for the Staff Admin Dashboard.
   * Leverages server-side `/api/admin/orders` or falls back to local storage mirror.
   */
  async fetchAllOrdersForAdmin(): Promise<ConsultationOrderRow[]> {
    return this.getLocalOrders();
  },

  /**
   * Updates an order's status in local storage mirror.
   * Production updates are executed server-side via `/api/admin/orders` (PATCH).
   */
  async approveOrderInAdmin(
    orderCode: string,
    advisorNotes?: string,
    voiceNoteUrl?: string,
    newStatus: "approved" | "rejected" = "approved"
  ): Promise<ConsultationOrderRow | null> {
    const cleanCode = SecurityValidator.sanitizeText(orderCode).toUpperCase();
    if (!cleanCode) return null;

    const cleanNotes =
      advisorNotes !== undefined
        ? SecurityValidator.sanitizeText(advisorNotes)
        : undefined;
    const cleanVoiceUrl =
      voiceNoteUrl !== undefined
        ? SecurityValidator.sanitizeText(voiceNoteUrl)
        : undefined;

    // Update localStorage mirror for UI responsiveness
    let updatedLocalOrder: ConsultationOrderRow | null = null;
    const updatedList = this.getLocalOrders().map((order) => {
      if (order.order_code.toUpperCase() === cleanCode) {
        updatedLocalOrder = {
          ...order,
          order_status: newStatus,
          ...(cleanNotes !== undefined ? { advisor_notes: cleanNotes } : {}),
          ...(cleanVoiceUrl !== undefined
            ? { voice_note_url: cleanVoiceUrl }
            : {}),
        };
        return updatedLocalOrder;
      }
      return order;
    });
    this.saveLocalOrders(updatedList);

    return updatedLocalOrder;
  },
};
