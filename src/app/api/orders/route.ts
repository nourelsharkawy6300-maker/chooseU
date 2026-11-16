import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getClientIp } from "@/lib/server-auth";
import { ConsultationOrderRow } from "@/types/chooseu";
import { EGYPT_GOVERNORATES } from "@/data/faculties-db";

// Server-side strict validation schema
const CreateOrderSchema = z.object({
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
});

function sanitizeText(str: string): string {
  return str
    .replace(/<[^>]*>?/gm, "")
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .trim();
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    // Rate limit: Max 10 orders per hour per IP to prevent spam
    const rateLimit = checkRateLimit(`order_create_${ip}`, 10, 3600);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "تم تجاوز الحد المسموح من الطلبات لهذا الجهاز. يرجى المحاولة لاحقاً.",
        },
        { status: 429 }
      );
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
    const orderCode = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const OFFICIAL_REPORT_PRICE_EGP = 150; // Strictly enforced server-side

    const sanitizedOrder: ConsultationOrderRow & { amount_egp: number } = {
      order_code: orderCode,
      student_name: sanitizeText(data.student_name),
      whatsapp_phone: data.whatsapp_phone,
      academic_stream: data.academic_stream,
      score_percentage: Number(data.score_percentage),
      max_budget: Number(data.max_budget),
      governorate: sanitizeText(data.governorate),
      quiz_results: data.quiz_results || {},
      instapay_ref: sanitizeText(data.instapay_ref),
      order_status: "pending",
      amount_egp: OFFICIAL_REPORT_PRICE_EGP,
      voice_note_url: "",
      advisor_notes: "",
      created_at: new Date().toISOString(),
    };

    // Forward to Supabase via server-side call
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const response = await fetch(
          `${supabaseUrl}/rest/v1/consultation_orders`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
              Prefer: "return=representation",
            },
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
            }),
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          console.error("Supabase order insert error:", errText);
          return NextResponse.json(
            { success: false, error: "فشل حفظ الطلب في قاعدة البيانات. يرجى التحقق من صحة البيانات والمحاولة مجدداً." },
            { status: 500 }
          );
        }

        const rows = (await response.json()) as ConsultationOrderRow[];
        if (Array.isArray(rows) && rows.length > 0) {
          return NextResponse.json({
            success: true,
            order: rows[0],
          });
        }
      } catch (err) {
        console.error("Supabase order fetch exception:", err);
        return NextResponse.json(
          { success: false, error: "حدث خطأ في الاتصال بقاعدة البيانات لتسجيل الطلب." },
          { status: 500 }
        );
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
    // Rate limit search: Max 30 requests per 5 minutes per IP
    const rateLimit = checkRateLimit(`order_query_${ip}`, 30, 300);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: "طلبات بحث متكررة، يرجى الانتظار دقيقة." },
        { status: 429 }
      );
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim() || "";

    if (!query || query.length < 3) {
      return NextResponse.json(
        { success: false, error: "يرجى إدخال كود الطلب أو رقم الهاتف." },
        { status: 400 }
      );
    }

    const cleanQuery = sanitizeText(query);
    const upperCode = cleanQuery.toUpperCase();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const filterParam = upperCode.startsWith("ORD-")
          ? `order_code=ilike.${encodeURIComponent(upperCode)}`
          : `or=(order_code.ilike.${encodeURIComponent(
              upperCode
            )},whatsapp_phone.eq.${encodeURIComponent(cleanQuery)})`;

        const response = await fetch(
          `${supabaseUrl}/rest/v1/consultation_orders?${filterParam}&order=created_at.desc&limit=1`,
          {
            headers: {
              "Content-Type": "application/json",
              apikey: supabaseKey,
              Authorization: `Bearer ${supabaseKey}`,
            },
            cache: "no-store",
          }
        );

        if (response.ok) {
          const rows = (await response.json()) as ConsultationOrderRow[];
          if (Array.isArray(rows) && rows.length > 0) {
            return NextResponse.json({ success: true, order: rows[0] });
          }
        }
      } catch {
        // Fall through
      }
    }

    return NextResponse.json(
      { success: false, error: "لم يتم العثور على الطلب." },
      { status: 404 }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "خطأ في البحث عن الطلب." },
      { status: 500 }
    );
  }
}
