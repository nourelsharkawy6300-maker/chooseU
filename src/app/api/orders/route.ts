import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  checkStrictLimit,
  checkGlobalLimit,
  rateLimitExceededResponse,
} from "@/lib/security/ratelimit";
import { sanitizeInput } from "@/lib/security/sanitize";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { getClientIp } from "@/lib/server-auth";
import { EGYPT_GOVERNORATES } from "@/data/faculties-db";

// Minimal non-sensitive fields allowed on unauthenticated status lookup.
// Full order details, grades, budget, and advisor notes require user_id auth (Step 2).
const PUBLIC_STATUS_FIELDS = "order_code,order_status,created_at";
const ORDER_CODE_REGEX = /^ORD-\d{4}-[0-9A-F]{4}-[0-9A-F]{16}$/;

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

// Server-side strict validation schema (Hard-fail on unknown fields)
const CreateOrderSchema = z
  .object({
    student_name: z
      .string()
      .min(6, "اسم الطالب يجب أن يكون ثلاثياً واضحاً")
      .max(100, "اسم الطالب طويل جداً")
      .refine(
        (val) => val.trim().split(/\s+/).length >= 3,
        "يرجى إدخال اسم الطالب ثلاثياً على الأقل"
      ),
    whatsapp_phone: z
      .string()
      .regex(/^01[0125][0-9]{8}$/, "رقم هاتف مصري غير صحيح (01XXXXXXXXX)"),
    academic_stream: z.enum(["Science", "Math", "Arts", "stem", "Undecided"]),
    score_percentage: z.number().min(50).max(100),
    max_budget: z.number().min(0).max(5000000),
    governorate: z.string().refine((g) => EGYPT_GOVERNORATES.includes(g), {
      message: "محافظة غير صالحة",
    }),
    instapay_ref: z
      .string()
      .min(6, "رقم مرجع التحويل يجب أن يكون 6 خانات على الأقل")
      .max(64, "رقم مرجع التحويل طويل جداً")
      .regex(/^[A-Za-z0-9\-_#]+$/, "مرجع تحويل غير صالح"),
    quiz_results: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

function generateSecureOrderCode(): string {
  const segment = randomBytes(2).toString("hex").toUpperCase();
  const suffix = randomBytes(8).toString("hex").toUpperCase();
  return `ORD-2026-${segment}-${suffix}`;
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    // Strict rate limit check: 5 requests per minute
    const rateLimit = await checkStrictLimit(`order_create_${ip}`);
    if (!rateLimit.success) {
      return rateLimitExceededResponse(rateLimit.reset);
    }

    const body: unknown = await req.json();
    const parsed = CreateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "بيانات الإدخال غير صالحة",
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    const data = parsed.data;
    const orderCode = generateSecureOrderCode();

    const supabase = getSupabaseAdmin();

    const { data: insertedRow, error: insertError } = await supabase
      .from("consultation_orders")
      .insert({
        order_code: orderCode,
        student_name: sanitizeInput(data.student_name),
        whatsapp_phone: sanitizeInput(data.whatsapp_phone),
        academic_stream: data.academic_stream,
        score_percentage: Number(data.score_percentage),
        max_budget: Number(data.max_budget),
        governorate: sanitizeInput(data.governorate),
        quiz_results: data.quiz_results || {},
        instapay_ref: sanitizeInput(data.instapay_ref),
        order_status: "pending",
      })
      .select(PUBLIC_STATUS_FIELDS)
      .single();

    if (insertError || !insertedRow) {
      console.error("Supabase order insert error:", insertError?.message);
      return NextResponse.json(
        {
          success: false,
          error:
            "فشل حفظ الطلب في قاعدة البيانات. يرجى التحقق من صحة البيانات والمحاولة مجدداً.",
        },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order: insertedRow,
      },
      { status: 201, headers: NO_STORE_HEADERS }
    );
  } catch (err) {
    console.error("Order POST handler error:", err);
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم أثناء إنشاء الطلب." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    // Global rate limit: 50 requests per 10 seconds
    const rateLimit = await checkGlobalLimit(`order_query_${ip}`);
    if (!rateLimit.success) {
      return rateLimitExceededResponse(rateLimit.reset);
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    const upperCode = sanitizeInput(query).toUpperCase();

    // Strictly require full high-entropy order code; phone lookup is disabled.
    if (!ORDER_CODE_REGEX.test(upperCode)) {
      return NextResponse.json(
        { success: false, error: "لم يتم العثور على الطلب." },
        { status: 404, headers: NO_STORE_HEADERS }
      );
    }

    const supabase = getSupabaseAdmin();
    const { data: row, error } = await supabase
      .from("consultation_orders")
      .select(PUBLIC_STATUS_FIELDS)
      .eq("order_code", upperCode)
      .maybeSingle();

    if (!error && row) {
      return NextResponse.json(
        { success: true, order: row },
        { status: 200, headers: NO_STORE_HEADERS }
      );
    }

    return NextResponse.json(
      { success: false, error: "لم يتم العثور على الطلب." },
      { status: 404, headers: NO_STORE_HEADERS }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "لم يتم العثور على الطلب." },
      { status: 404, headers: NO_STORE_HEADERS }
    );
  }
}