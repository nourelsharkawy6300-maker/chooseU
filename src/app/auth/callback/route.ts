import { NextResponse, type NextRequest } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { safeNext } from "@/lib/security/url";

/**
 * OAuth & Email verification code exchange endpoint.
 * Exchanges the auth code for a user session and sets response cookies.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = safeNext(searchParams.get("next"));

  if (code) {
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

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return response;
    }

    console.error("[ChooseU Auth Callback] Code exchange error:", error.message);
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
