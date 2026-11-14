import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  checkRateLimit,
  createAdminSessionToken,
  getClientIp,
  verifyPasscode,
} from "@/lib/server-auth";

const LoginSchema = z.object({
  passcode: z
    .string()
    .min(1, "رمز المرور مطلوب")
    .max(128, "رمز المرور أطول من المسموح"),
});

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req.headers);
    const rateLimit = checkRateLimit(`admin_auth_${ip}`, 5, 900); // 5 attempts per 15 min

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "تم تجاوز الحد المسموح من المحاولات. يرجى المحاولة بعد قليل.",
          resetSeconds: rateLimit.resetSeconds,
        },
        { status: 429 }
      );
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
    const isProduction = process.env.NODE_ENV === "production";

    const response = NextResponse.json({
      success: true,
      message: "تم التحقق من هوية المستشار بنجاح.",
    });

    response.cookies.set({
      name: "chooseu_admin_session",
      value: sessionToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: "strict",
      path: "/",
      maxAge: 7200,
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, error: "حدث خطأ غير متوقع في معالجة الطلب." },
      { status: 500 }
    );
  }
}
