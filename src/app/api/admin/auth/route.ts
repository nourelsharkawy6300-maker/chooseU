import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  createAdminSessionToken,
  getClientIp,
  verifyPasscode,
  checkAdminLoginRateLimit,
  recordFailedAdminLogin,
  resetAdminLoginRateLimit,
} from "@/lib/server-auth";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

const LoginSchema = z
  .object({
    passcode: z
      .string()
      .min(1, "رمز المرور مطلوب")
      .max(128, "رمز المرور أطول من المسموح"),
  })
  .strict();

// Short-duration session lifetime: 1 hour (3600 seconds)
const SESSION_DURATION_SECONDS = 3600;

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);

    // 1. Enforce Rate Limiting (5 failed attempts per 15 minutes per IP)
    const rateLimit = checkAdminLoginRateLimit(ip);
    if (!rateLimit.allowed) {
      const minutesRemaining = Math.ceil(rateLimit.retryAfterSeconds / 60);
      return NextResponse.json(
        {
          success: false,
          error: `تم تجاوز الحد المسموح من محاولات الدخول (5 محاولات فاشلة). يرجى المحاولة بعد ${minutesRemaining} دقيقة.`,
          remainingAttempts: 0,
          retryAfter: rateLimit.retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            ...NO_STORE_HEADERS,
            "Retry-After": String(rateLimit.retryAfterSeconds),
          },
        }
      );
    }

    // 2. Validate input schema
    const body: unknown = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message || "مدخلات غير صالحة",
        },
        { status: 400, headers: NO_STORE_HEADERS }
      );
    }

    // 3. Read passcode STRICTLY from server-side environment variable ADMIN_PASSCODE
    const expectedPasscode = process.env.ADMIN_PASSCODE;

    if (!expectedPasscode || expectedPasscode.trim() === "") {
      console.error("[admin/auth] ADMIN_PASSCODE environment variable is not configured on the server.");
      return NextResponse.json(
        {
          success: false,
          error: "خدمة المصادقة غير مهيأة على الخادم. يرجى التواصل مع المسؤول.",
        },
        { status: 500, headers: NO_STORE_HEADERS }
      );
    }

    // 4. Verify passcode using constant-time comparison (crypto.timingSafeEqual)
    const isValid = verifyPasscode(parsed.data.passcode, expectedPasscode);

    if (!isValid) {
      const failure = recordFailedAdminLogin(ip);
      const remainingMsg = failure.isLockedOut
        ? "تم استنفاد المحاولات وتجميد الدخول مؤقتاً لمدة 15 دقيقة."
        : `المحاولات المتبقية: ${failure.remainingAttempts}`;

      return NextResponse.json(
        {
          success: false,
          error: `رمز المرور غير صحيح. ${remainingMsg}`,
          remainingAttempts: failure.remainingAttempts,
        },
        { status: 401, headers: NO_STORE_HEADERS }
      );
    }

    // 5. Successful login: Reset failed attempts for this IP
    resetAdminLoginRateLimit(ip);

    // 6. Generate signed HMAC-SHA256 session token (1 hour duration)
    const sessionToken = createAdminSessionToken(SESSION_DURATION_SECONDS);

    const response = NextResponse.json(
      {
        success: true,
        message: "تم التحقق من هوية المستشار بنجاح.",
      },
      { headers: NO_STORE_HEADERS }
    );

    // 7. Issue hardened cookie: httpOnly, secure, sameSite=strict, short duration
    const isProduction = process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);
    response.cookies.set({
      name: "chooseu_admin_session",
      value: sessionToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_DURATION_SECONDS,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "حدث خطأ غير متوقع في معالجة الطلب." },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}