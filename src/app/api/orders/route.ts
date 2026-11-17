import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkStrictLimit, checkGlobalLimit, rateLimitExceededResponse } from "@/lib/security/ratelimit";
import { sanitizeInput } from "@/lib/security/sanitize";
import { getSupabaseServerClient } from "@/lib/supabase";
import { getClientIp } from "@/lib/server-auth";
import { ConsultationOrderRow } from "@/types/chooseu";
import { EGYPT_GOVERNORATES } from "@/data/faculties-db";

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
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Server-enforced Order Code & Official Pricing
    // Format: ORD-2026-NNNN-XXXXXXXXXXXXXXXX (sequential prefix + 16-char random hex suffix)
    const randomSuffix = crypto.randomUUID().replace(/-/g, "").slice(0, 16).toUpperCase();
    const orderCode = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}-${randomSuffix}`;
    const OFFICIAL_REPORT_PRICE_EGP = 150; // Strictly enforced server-side

    const sanitizedOrder: ConsultationOrderRow & { amount_egp: number } = {
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
      amount_egp: OFFICIAL_REPORT_PRICE_EGP,
      voice_note_url: "",
      advisor_notes: "",
      created_at: new Date().toISOString(),
    };

    // Forward to Supabase via server-only service-role client
    const supabase = getSupabaseServerClient();

    if (supabase) {
      const { data: insertedRows, error: insertError } = await supabase
        .from("consultation_orders")
        .insert({
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
        })
        .select();

      if (insertError) {
        console.error("Supabase service-role insert error:", insertError.message);
        return NextResponse.json(
          {
            success: false,
            error: "فشل حفظ الطلب في قاعدة البيانات. يرجى التحقق من صحة البيانات والمحاولة مجدداً.",
          },
          { status: 500 }
        );
      }

      if (Array.isArray(insertedRows) && insertedRows.length > 0) {
        return NextResponse.json({
          success: true,
          order: insertedRows[0],
        });
      }
    }

    return NextResponse.json({
      success: true,
      order: sanitizedOrder,
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "حدث خطأ في الخادم أثناء إنشاء الطلب." },
      { status: 500 }
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
    const rawParam = searchParams.get("code") || searchParams.get("q") || "";
    const cleanCode = sanitizeInput(rawParam).trim().toUpperCase();

    // Reject missing, non-code, or invalid format queries uniformly (no phone lookups allowed)
    if (!cleanCode || !/^ORD-[0-9A-Z\-]+$/i.test(cleanCode)) {
      return NextResponse.json(
        { error: "لم يتم العثور على الطلب." },
        { status: 404 }
      );
    }

    const supabase = getSupabaseServerClient();
    if (!supabase) {
      return NextResponse.json(
        { error: "لم يتم العثور على الطلب." },
        { status: 404 }
      );
    }

    // Query strictly order_code and order_status using parameterized SDK call
    const { data, error } = await supabase
      .from("consultation_orders")
      .select("order_code, order_status")
      .eq("order_code", cleanCode)
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json(
        { error: "لم يتم العثور على الطلب." },
        { status: 404 }
      );
    }

    // Derive progress label
    let progress_label = "قيد المراجعة وتأكيد التحويل";
    if (data.order_status === "approved") {
      progress_label = "مكتمل ومتاح للاستعراض";
    } else if (data.order_status === "rejected") {
      progress_label = "تم رفض الطلب";
    }

    // STRICT REQUIREMENT: Return ONLY { order_code, order_status, progress_label }. No other fields.
    return NextResponse.json({
      order_code: data.order_code,
      order_status: data.order_status,
      progress_label,
    });
  } catch {
    return NextResponse.json(
      { error: "لم يتم العثور على الطلب." },
      { status: 404 }
    );
  }
}
