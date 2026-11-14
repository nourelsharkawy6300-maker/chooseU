import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminSessionToken } from "@/lib/server-auth";
import { ConsultationOrderRow } from "@/types/chooseu";

const PatchOrderSchema = z.object({
  order_code: z.string().min(4).max(64),
  order_status: z.enum(["pending", "approved", "rejected"]),
  advisor_notes: z.string().max(4000).optional(),
  voice_note_url: z.string().url().max(1024).or(z.literal("")).optional(),
});

function sanitizeHtml(input: string): string {
  return input
    .replace(/<[^>]*>?/gm, "")
    .replace(/[<>]/g, "")
    .replace(/javascript:/gi, "")
    .trim();
}

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

  // 2. Fetch from Supabase REST API server-side
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    try {
      const response = await fetch(
        `${supabaseUrl}/rest/v1/consultation_orders?select=*&order=created_at.desc`,
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
        return NextResponse.json({ success: true, orders: rows });
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

    const sanitizedNotes = advisor_notes ? sanitizeHtml(advisor_notes) : null;
    const sanitizedVoice = voice_note_url ? sanitizeHtml(voice_note_url) : null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      const patchBody: Record<string, unknown> = {
        order_status,
        advisor_notes: sanitizedNotes,
        voice_note_url: sanitizedVoice,
      };

      const response = await fetch(
        `${supabaseUrl}/rest/v1/consultation_orders?order_code=eq.${encodeURIComponent(
          order_code
        )}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            Prefer: "return=representation",
          },
          body: JSON.stringify(patchBody),
        }
      );

      if (response.ok) {
        const updatedRows = (await response.json()) as ConsultationOrderRow[];
        return NextResponse.json({
          success: true,
          order: updatedRows[0] || null,
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
