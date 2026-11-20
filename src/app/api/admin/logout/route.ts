import { NextResponse } from "next/server";

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
};

export async function POST() {
  const response = NextResponse.json(
    {
      success: true,
      message: "تم تسجيل الخروج من بوابة المستشارين بنجاح.",
    },
    { headers: NO_STORE_HEADERS }
  );

  const isProduction =
    process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

  response.cookies.set({
    name: "chooseu_admin_session",
    value: "",
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  return response;
}