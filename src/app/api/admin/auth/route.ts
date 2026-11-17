import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createAdminSessionToken,
  getClientIp,
  verifyPasscode,
} from "@/lib/server-auth";
import { checkStrictLimit, rateLimitExceededResponse } from "@/lib/security/ratelimit";
import { getHardenedCookieOptions } from "@/lib/security/cookies";

const LoginSchema = z
  .object({
    passcode: z
      .string()
      .min(1, "رمز المرور مطلوب")
      .max(128, "رمز المرور أطول من المسموح"),
  })
  .strict();

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rateLimit = await checkStrictLimit(`admin_auth_${ip}`);

    if (!rateLimit.success) {
      return rateLimitExceededResponse(rateLimit.reset);
    }

    const body: unknown = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "مدخلات غير صالحة",
        },
        { status: 400 }
      );
    }

    const expectedHash = process.env.ADMIN_PASSCODE_HASH;

    if (!expectedHash) {
      console.error("[admin/auth] ADMIN_PASSCODE_HASH is not set.");
      return NextResponse.json(
        { success: false, error: "خطأ في إعداد الخادم. يرجى التواصل مع المسؤول." },
        { status: 500 }
      );
    }

    const isValid = verifyPasscode(parsed.data.passcode, expectedHash);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "رمز المرور غير صحيح. تأكد من إدخال رمز الدخول المصرح به للمستشار.",
          remainingAttempts: rateLimit.remaining,
        },
        { status: 401 }
      );
    }

    const sessionToken = createAdminSessionToken(7200); // 2 hours

    const response = NextResponse.json({
      success: true,
      message: "تم التحقق من هوية المستشار بنجاح.",
    });

    response.cookies.set({
      name: "chooseu_admin_session",
      value: sessionToken,
      ...getHardenedCookieOptions(7200),
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "حدث خطأ غير متوقع في معالجة الطلب." },
      { status: 500 }
    );
  }
}
