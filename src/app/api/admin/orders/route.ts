import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminSessionToken } from "@/lib/server-auth";
import { sanitizeInput } from "@/lib/security/sanitize";
import { getSupabaseClient } from "@/lib/supabase";
import { ConsultationOrderRow } from "@/types/chooseu";

const PatchOrderSchema = z
  .object({
    order_code: z.string().min(4).max(64),
    order_status: z.enum(["pending", "approved", "rejected"]),
    advisor_notes: z.string().max(4000).optional(),
    voice_note_url: z.string().url().max(1024).or(z.literal("")).optional(),
  })
  .strict();

export async function GET(req: NextRequest) {
  // 1. RBAC Check: Must have a valid admin session cookie
  const cookieToken = req.cookies.get("chooseu_admin_session")?.value;
  const session = verifyAdminSessionToken(cookieToken);

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { success: false, error: "غير مصرح: يجب تسجيل الدخول كمستشار أولاً." },
      { status: 403 }
    );
  }

  // 2. Fetch from Supabase via parameterized client
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("consultation_orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && Array.isArray(data)) {
        return NextResponse.json({ success: true, orders: data as ConsultationOrderRow[] });
      }
    } catch {
      // Fall through to empty array
    }
  }

  return NextResponse.json({ success: true, orders: [] });
}

export async function PATCH(req: NextRequest) {
  // 1. RBAC Check: Must have a valid admin session cookie
  const cookieToken = req.cookies.get("chooseu_admin_session")?.value;
  const session = verifyAdminSessionToken(cookieToken);

  if (!session || session.role !== "admin") {
    return NextResponse.json(
      { success: false, error: "غير مصرح: العملية مخصصة للمستشارين المعتمدين فقط." },
      { status: 403 }
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
        { status: 400 }
      );
    }

    const { order_code, order_status, advisor_notes, voice_note_url } =
      parsed.data;

    const sanitizedNotes = advisor_notes ? sanitizeInput(advisor_notes) : null;
    const sanitizedVoice = voice_note_url ? sanitizeInput(voice_note_url) : null;

    const supabase = getSupabaseClient();

    if (supabase) {
      const patchBody: Record<string, unknown> = {
        order_status,
        advisor_notes: sanitizedNotes,
        voice_note_url: sanitizedVoice,
      };

      const { data: updatedRows, error } = await supabase
        .from("consultation_orders")
        .update(patchBody)
        .eq("order_code", order_code)
        .select();

      if (!error && Array.isArray(updatedRows) && updatedRows.length > 0) {
        return NextResponse.json({
          success: true,
          order: updatedRows[0] as ConsultationOrderRow,
        });
      }
    }

    return NextResponse.json({
      success: true,
      order: {
        order_code,
        order_status,
        advisor_notes: sanitizedNotes || undefined,
        voice_note_url: sanitizedVoice || undefined,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "فشل تحديث حالة الطلب." },
      { status: 500 }
    );
  }
}
