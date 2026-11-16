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

    const expectedHash =
      process.env.ADMIN_PASSCODE_HASH ||
      "9c283d99c379b04d37eb5387bb610f26ff9a49ceb44eb7db29838c30e6d6229cfa4a558450428cd0c9d37434c60f739713da3cd550770da53506c0cd1594b9e7";

    const isValid = verifyPasscode(parsed.data.passcode, expectedHash);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "رمز المرور غير صحيح. تأكد من إدخال الرمز المعتمد للمستشار.",
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
