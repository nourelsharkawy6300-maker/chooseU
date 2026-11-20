import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { safeNext } from "@/lib/security/url";

const ALLOWED_OTP_TYPES = [
  "recovery",
  "signup",
  "email",
  "magiclink",
  "email_change",
] as const;

type AllowedOtpType = (typeof ALLOWED_OTP_TYPES)[number];

function isAllowedOtpType(value: string | null): value is AllowedOtpType {
  return Boolean(value && (ALLOWED_OTP_TYPES as readonly string[]).includes(value));
}

/**
 * OAuth, Email verification, and Password Recovery callback endpoint.
 * Exchanges PKCE code or verifies OTP token_hash and sets response cookies.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const rawNext = searchParams.get("next");
  const next = safeNext(rawNext ?? (type === "recovery" ? "/auth/reset-password" : "/"));

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
      "[ChooseU Auth Callback] Supabase environment variables not configured."
    );
    return NextResponse.redirect(`${origin}/login?error=auth_unavailable`);
  }

  const response = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options?: CookieOptions;
        }>
      ) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }
    console.error("[ChooseU Auth Callback] Code exchange error:", error.message);
  } else if (tokenHash && isAllowedOtpType(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    if (!error) {
      return response;
    }
    console.error("[ChooseU Auth Callback] OTP verify error:", error.message);
  }

  if (next === "/auth/reset-password") {
    return NextResponse.redirect(`${origin}/auth/forgot-password?error=link_expired`);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}