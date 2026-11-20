import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminSessionToken } from "@/lib/server-auth";
import { sanitizeInput } from "@/lib/security/sanitize";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { ConsultationOrderRow } from "@/types/chooseu";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

const HttpsUrlOrEmptySchema = z
  .string()
  .max(1024)
  .refine((val) => {
    if (val === "") return true;
    try {
      const parsed = new URL(val);
      return parsed.protocol === "https:";
    } catch {
      return false;
    }
  }, "رابط المذكرة الصوتية يجب أن يبدأ بـ https://");

const PatchOrderSchema = z
  .object({
    order_code: z.string().min(4).max(64),
    order_status: z.enum(["pending", "approved", "rejected"]),
    advisor_notes: z.string().max(4000).optional(),
    voice_note_url: HttpsUrlOrEmptySchema.optional(),
  })
  .strict();

export async function GET(req: NextRequest) {
  // 1. RBAC Check: Must have a valid admin session cookie
  const cookieToken = req.cookies.get("chooseu_admin_session")?.value;
  const session = verifyAdminSessionToken(cookieToken);

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { success: false, error: "غير مصرح: يجب تسجيل الدخول كمستشار أولاً." },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("consultation_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Admin orders fetch error:", error.message);
      return NextResponse.json(
        { success: false, error: "فشل تحميل الطلبات من قاعدة البيانات." },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: true, orders: (data ?? []) as ConsultationOrderRow[] },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("Admin orders GET handler error:", err);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم أثناء تحميل الطلبات." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function PATCH(req: NextRequest) {
  // 1. RBAC Check: Must have a valid admin session cookie
  const cookieToken = req.cookies.get("chooseu_admin_session")?.value;
  const session = verifyAdminSessionToken(cookieToken);

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      {
        success: false,
        error: "غير مصرح: العملية مخصصة للمستشارين المعتمدين فقط.",
      },
      { status: 403, headers: NO_STORE_HEADERS }
    );
  }

  try {
    const body: unknown = await req.json();
    const parsed = PatchOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "بيانات غير صالحة",
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const { order_code, order_status, advisor_notes, voice_note_url } =
      parsed.data;

    const patchBody: Record<string, unknown> = {
      order_status,
    };

    if (advisor_notes !== undefined) {
      patchBody.advisor_notes = advisor_notes
        ? sanitizeInput(advisor_notes)
        : null;
    }

    if (voice_note_url !== undefined) {
      patchBody.voice_note_url = voice_note_url
        ? sanitizeInput(voice_note_url)
        : null;
    }

    const supabase = getSupabaseAdmin();
    const { data: updatedRows, error } = await supabase
      .from("consultation_orders")
      .update(patchBody)
      .eq("order_code", order_code)
      .select();

    if (error) {
      console.error("Admin order update error:", error.message);
      return NextResponse.json(
        { success: false, error: "فشل تحديث حالة الطلب في قاعدة البيانات." },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    if (!Array.isArray(updatedRows) || updatedRows.length === 0) {
      return NextResponse.json(
        { success: false, error: "لم يتم العثور على الطلب المطلوب تحديثه." },
        { status: 404, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order: updatedRows[0] as ConsultationOrderRow,
      },
      { status: 200, headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("Admin orders PATCH handler error:", err);
    return NextResponse.json(
      { success: false, error: "فشل تحديث حالة الطلب." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}