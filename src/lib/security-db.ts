import { ConsultationOrderRow } from "@/types/chooseu";

// ============================================================================
// 1. LIVE SUPABASE CONFIGURATION & STORAGE CONSTANTS
// ============================================================================

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mkrnrkdtvkcdymufehlg.supabase.co";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const LOCAL_ORDERS_STORAGE_KEY = "chooseu_orders_v2";
const ADMIN_LOCKOUT_STORAGE_KEY = "chooseu_admin_rate_limit_v2";

const MAX_ADMIN_ATTEMPTS = 5;

interface AdminRateLimitState {
  failedAttempts: number;
  lockoutUntil: number | null;
}

function isSupabaseConfigured(): boolean {
  return Boolean(
    SUPABASE_URL &&
      SUPABASE_URL.startsWith("https://") &&
      SUPABASE_ANON_KEY &&
      SUPABASE_ANON_KEY !== "PUT_YOUR_ANON_KEY_HERE"
  );
}

function getSupabaseHeaders(preferRepresentation = false): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  };
  if (preferRepresentation) {
    headers["Prefer"] = "return=representation";
  }
  return headers;
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
// 3. RESILIENT SUPABASE REST API + LOCALSTORAGE SERVICE (DataService)
// ============================================================================

const INITIAL_DEMO_ORDER: ConsultationOrderRow = {
  id: "demo-ord-710",
  order_code: "ORD-2026-710",
  student_name: "طالب تجريبي (نموذج افتراضي)",
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
    "1. الأولوية الأولى: كلية الذكاء الاصطناعي وكلية الحاسبات والمعلومات بجامعة المنوفية (حكومي انتظام) لتقارب المجموع الاسترشادي (83.0%) مع الحد الأدنى وانخفاض التكلفة الدراسية.\n2. البديل الاستراتيجي المباشر: برنامج الأمن السيبراني وعلوم البيانات بالساعات المعتمدة بجامعة المنوفية، أو كلية الحاسبات والذكاء الاصطناعي بجامعة المنوفية الأهلية بطوخ طنبشا مع الالتزام بتحقيق GPA >= 2.7 في السنة التأسيسية الأولى.",
  created_at: "2026-11-14T08:00:00.000Z",
};

export const DataService = {
  /**
   * Reads mirrored orders from localStorage (`chooseu_orders_v2`).
   * No automatic demo seeding in production.
   */
  getLocalOrders(): ConsultationOrderRow[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(LOCAL_ORDERS_STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as ConsultationOrderRow[];
      if (!Array.isArray(parsed) || parsed.length === 0) return [];

      // One-time cleanup: remove any legacy demo order ORD-2026-710 associated with demo name
      const cleaned = parsed.filter(
        (o) =>
          !(
            o.order_code === "ORD-2026-710" &&
            (o.student_name === "عمر خالد محمود" || o.student_name.includes("عمر"))
          )
      );
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(LOCAL_ORDERS_STORAGE_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
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
   * Creates a new consultation order in Supabase (`public.consultation_orders`)
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

    // 1. Attempt secure server-side API endpoint
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
      // Fall through to direct Supabase or local mirror
    }

    // Attempt live Supabase REST API insert
    if (isSupabaseConfigured()) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/consultation_orders`,
          {
            method: "POST",
            headers: getSupabaseHeaders(true),
            body: JSON.stringify({
              order_code: sanitizedOrder.order_code,
              student_name: sanitizedOrder.student_name,
              whatsapp_phone: sanitizedOrder.whatsapp_phone,
              academic_stream: sanitizedOrder.academic_stream,
              score_percentage: sanitizedOrder.score_percentage,
              max_budget: sanitizedOrder.max_budget,
              governorate: sanitizedOrder.governorate,
              quiz_results: sanitizedOrder.quiz_results,
              instapay_ref: sanitizedOrder.instapay_ref,
              order_status: sanitizedOrder.order_status,
              voice_note_url: sanitizedOrder.voice_note_url || null,
              advisor_notes: sanitizedOrder.advisor_notes || null,
            }),
          }
        );

        if (response.ok) {
          const rows = (await response.json()) as ConsultationOrderRow[];
          if (Array.isArray(rows) && rows.length > 0) {
            const createdRemote = rows[0];
            const existing = this.getLocalOrders().filter(
              (o) => o.order_code !== createdRemote.order_code
            );
            this.saveLocalOrders([createdRemote, ...existing]);
            return createdRemote;
          }
        }
      } catch {
        // Fall through to resilient local mirror
      }
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
   * Queries an order by `order_code` (e.g., ORD-2026-710), `whatsapp_phone`, or `instapay_ref`
   * from Supabase REST API with automatic fallback to `localStorage`.
   */
  async getOrderByCodeOrPhone(
    queryInput: string
  ): Promise<ConsultationOrderRow | null> {
    const cleanQuery = SecurityValidator.sanitizeText(queryInput);
    if (!cleanQuery) return null;

    const normalizedPhone =
      SecurityValidator.normalizeEgyptianPhone(cleanQuery);
    const upperCode = cleanQuery.toUpperCase();

    // 1. Attempt secure server-side API query
    try {
      const apiResponse = await fetch(
        `/api/orders?q=${encodeURIComponent(cleanQuery)}`
      );
      if (apiResponse.ok) {
        const result = await apiResponse.json();
        if (result.success && result.order) {
          return result.order;
        }
      }
    } catch {
      // Fall through to direct Supabase or local mirror
    }

    if (isSupabaseConfigured()) {
      try {
        const filterParam = upperCode.startsWith("ORD-")
          ? `order_code=ilike.${encodeURIComponent(upperCode)}`
          : `or=(order_code.ilike.${encodeURIComponent(
              upperCode
            )},whatsapp_phone.eq.${encodeURIComponent(
              normalizedPhone || cleanQuery
            )},instapay_ref.ilike.${encodeURIComponent(cleanQuery)})`;

        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/consultation_orders?${filterParam}&order=created_at.desc&limit=1`,
          {
            method: "GET",
            headers: getSupabaseHeaders(false),
          }
        );

        if (response.ok) {
          const rows = (await response.json()) as ConsultationOrderRow[];
          if (Array.isArray(rows) && rows.length > 0) {
            const remoteMatch = rows[0];
            // Sync found record into local mirror
            const localList = this.getLocalOrders();
            const exists = localList.some(
              (o) => o.order_code === remoteMatch.order_code
            );
            this.saveLocalOrders(
              exists
                ? localList.map((o) =>
                    o.order_code === remoteMatch.order_code ? remoteMatch : o
                  )
                : [remoteMatch, ...localList]
            );
            return remoteMatch;
          }
        }
      } catch {
        // Fall through to local mirror lookup
      }
    }

    const localOrders = this.getLocalOrders();
    return (
      localOrders.find(
        (o) =>
          o.order_code.toUpperCase() === upperCode ||
          o.whatsapp_phone === normalizedPhone ||
          o.whatsapp_phone === cleanQuery ||
          o.instapay_ref.toUpperCase() === upperCode
      ) || null
    );
  },

  /**
   * Fetches all consultation orders ordered by `created_at desc` for the Staff Admin Dashboard.
   */
  async fetchAllOrdersForAdmin(): Promise<ConsultationOrderRow[]> {
    const localOrders = this.getLocalOrders();

    if (isSupabaseConfigured()) {
      try {
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/consultation_orders?select=*&order=created_at.desc`,
          {
            method: "GET",
            headers: getSupabaseHeaders(false),
          }
        );

        if (response.ok) {
          const remoteRows = (await response.json()) as ConsultationOrderRow[];
          if (Array.isArray(remoteRows)) {
            // Merge remote rows with any offline-only local orders
            const remoteCodes = new Set(remoteRows.map((r) => r.order_code));
            const unsyncedLocal = localOrders.filter(
              (l) => !remoteCodes.has(l.order_code)
            );
            const merged = [...remoteRows, ...unsyncedLocal];
            this.saveLocalOrders(merged);
            return merged;
          }
        }
      } catch {
        // Fall through to local mirror
      }
    }

    return localOrders;
  },

  /**
   * Updates an order's status (`approved` or `rejected`), `advisor_notes`, and `voice_note_url`
   * in Supabase REST API and synchronizes `localStorage`.
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

    // Update localStorage mirror first for instant UI responsiveness
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

    // Sync update to live Supabase table
    if (isSupabaseConfigured()) {
      try {
        const patchBody: Record<string, unknown> = {
          order_status: newStatus,
        };
        if (cleanNotes !== undefined) {
          patchBody.advisor_notes = cleanNotes || null;
        }
        if (cleanVoiceUrl !== undefined) {
          patchBody.voice_note_url = cleanVoiceUrl || null;
        }

        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/consultation_orders?order_code=eq.${encodeURIComponent(
            cleanCode
          )}`,
          {
            method: "PATCH",
            headers: getSupabaseHeaders(true),
            body: JSON.stringify(patchBody),
          }
        );

        if (response.ok) {
          const rows = (await response.json()) as ConsultationOrderRow[];
          if (Array.isArray(rows) && rows.length > 0) {
            const remoteUpdated = rows[0];
            const syncedList = this.getLocalOrders().map((o) =>
              o.order_code.toUpperCase() === cleanCode ? remoteUpdated : o
            );
            this.saveLocalOrders(syncedList);
            return remoteUpdated;
          }
        }
      } catch {
        // Return updated local order if offline
      }
    }

    return updatedLocalOrder;
  },
};