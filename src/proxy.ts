import { NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { safeNext } from "@/lib/security/url";
import {
  checkGlobalLimit,
  checkStrictLimit,
  rateLimitExceededResponse,
} from "@/lib/security/ratelimit";

// ============================================================================
// ZERO-TRUST CORS CONFIGURATION
// ============================================================================

const isProd =
  process.env.NODE_ENV === "production" || Boolean(process.env.VERCEL);

function toOrigin(value?: string): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

const ALLOWED_ORIGINS = new Set(
  [
    "https://choose-u.vercel.app",
    toOrigin(process.env.NEXT_PUBLIC_APP_URL),
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? toOrigin(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
      : null,
    process.env.VERCEL_URL
      ? toOrigin(`https://${process.env.VERCEL_URL}`)
      : null,
    ...(!isProd ? ["http://localhost:3000", "http://127.0.0.1:3000"] : []),
  ].filter(Boolean) as string[]
);

const MUTATING_METHODS = new Set(["POST", "PATCH", "PUT", "DELETE"]);

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

// Protected routes requiring active authentication AND declared age
const PROTECTED_ROUTES = [
  "/workspace",
  "/tco-matrix",
  "/universities",
  "/future-me",
  "/track-order",
];

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

// Authentication & Onboarding bypass routes that must never trigger auth redirect loops
const AUTH_BYPASS_ROUTES = [
  "/login",
  "/signup",
  "/auth/callback",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/onboarding/age",
];

function isAuthBypassPath(pathname: string): boolean {
  return AUTH_BYPASS_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

function copyCookies(from: NextResponse, to: NextResponse): NextResponse {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value, cookie);
  });
  return to;
}

function applySecurityHeaders(
  response: NextResponse,
  pathname: string,
  origin: string | null
): NextResponse {
  const isDev = process.env.NODE_ENV === "development";

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline';
    font-src 'self' data:;
    img-src 'self' blob: data: https:;
    media-src 'self' https: blob:;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.upstash.io;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  response.headers.set("Content-Security-Policy", cspHeader);
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), browsing-topics=()"
  );

  if (
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname.startsWith("/api/")
  ) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  if (pathname.startsWith("/api/") && origin && ALLOWED_ORIGINS.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.append("Vary", "Origin");
  }

  return response;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin");
  const secFetchSite = req.headers.get("sec-fetch-site");

  // ==========================================================================
  // 1. CORS LOCKDOWN, CSRF DEFENSE & RATE LIMITING FOR API ROUTES
  // ==========================================================================
  if (pathname.startsWith("/api/")) {
    const isRejectedOrigin = Boolean(origin && !ALLOWED_ORIGINS.has(origin));
    const isCrossSiteMutation =
      MUTATING_METHODS.has(req.method) && secFetchSite === "cross-site";

    if (isRejectedOrigin || isCrossSiteMutation) {
      return applySecurityHeaders(
        new NextResponse(
          JSON.stringify({
            error: "Forbidden",
            message: "CORS origin rejected by Zero-Trust policy.",
          }),
          {
            status: 403,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "no-store, max-age=0",
            },
          }
        ),
        pathname,
        null
      );
    }

    if (req.method === "OPTIONS") {
      const preflightHeaders = new Headers();
      if (origin && ALLOWED_ORIGINS.has(origin)) {
        preflightHeaders.set("Access-Control-Allow-Origin", origin);
        preflightHeaders.set("Access-Control-Allow-Credentials", "true");
        preflightHeaders.set("Vary", "Origin");
        preflightHeaders.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PATCH, PUT, DELETE, OPTIONS"
        );
        preflightHeaders.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization, X-Requested-With, apikey"
        );
        preflightHeaders.set("Access-Control-Max-Age", "86400");
      }
      return new NextResponse(null, { status: 204, headers: preflightHeaders });
    }

    const clientIp = getClientIp(req);
    const isSensitiveRoute =
      (pathname.startsWith("/api/admin/") && pathname !== "/api/admin/session") ||
      (pathname === "/api/orders" && req.method !== "GET");

    if (isSensitiveRoute) {
      const { success, reset } = await checkStrictLimit(`strict_${clientIp}`);
      if (!success) {
        return applySecurityHeaders(
          rateLimitExceededResponse(reset),
          pathname,
          origin
        );
      }
    } else {
      const { success, reset } = await checkGlobalLimit(`global_${clientIp}`);
      if (!success) {
        return applySecurityHeaders(
          rateLimitExceededResponse(reset),
          pathname,
          origin
        );
      }
    }

    // Admin APIs authenticate via HMAC cookie; skip redundant Supabase Auth round-trip
    if (pathname.startsWith("/api/admin/")) {
      return applySecurityHeaders(NextResponse.next(), pathname, origin);
    }
  }

  let response = NextResponse.next();

  // ==========================================================================
  // 2. SUPABASE SESSION REFRESH & ROUTE GUARDING
  // ==========================================================================
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isSupabaseConfigured = Boolean(
    supabaseUrl &&
      supabaseUrl.startsWith("https://") &&
      supabaseAnonKey &&
      supabaseAnonKey.length > 20
  );

  const isProtected = isProtectedPath(pathname);

  if (!isSupabaseConfigured) {
    if (isProd && isProtected) {
      console.error(
        `[ChooseU Auth] Production error: Supabase environment variables missing. Protected route "${pathname}" is closed.`
      );
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("error", "auth_unavailable");
      return applySecurityHeaders(
        copyCookies(response, NextResponse.redirect(redirectUrl)),
        pathname,
        origin
      );
    }
    return applySecurityHeaders(response, pathname, origin);
  }

  const hasSupabaseAuthCookie = req.cookies
    .getAll()
    .some((cookie) => cookie.name.startsWith("sb-"));

  // Fast-path: avoid Supabase client & auth round-trip when no session cookie exists
  if (!hasSupabaseAuthCookie) {
    if (isProtected) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", safeNext(pathname));
      return applySecurityHeaders(
        NextResponse.redirect(redirectUrl),
        pathname,
        origin
      );
    }
    return applySecurityHeaders(response, pathname, origin);
  }

  const supabase = createServerClient(
    supabaseUrl as string,
    supabaseAnonKey as string,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options?: CookieOptions;
          }>
        ) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Verify user strictly using getUser() (NEVER getSession())
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Loop prevention: Never redirect auth entry points or onboarding
  if (isAuthBypassPath(pathname)) {
    if (user && pathname === "/onboarding/age") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("age_declared")
        .eq("id", user.id)
        .single();

      if (profile?.age_declared) {
        return applySecurityHeaders(
          copyCookies(response, NextResponse.redirect(new URL("/", req.url))),
          pathname,
          origin
        );
      }
    }
    return applySecurityHeaders(response, pathname, origin);
  }

  // Protected routes: require authenticated user AND declared age
  if (isProtected) {
    if (!user) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("next", safeNext(pathname));
      return applySecurityHeaders(
        copyCookies(response, NextResponse.redirect(redirectUrl)),
        pathname,
        origin
      );
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("age_declared")
      .eq("id", user.id)
      .single();

    if (!profile?.age_declared) {
      const redirectUrl = req.nextUrl.clone();
      redirectUrl.pathname = "/onboarding/age";
      redirectUrl.searchParams.set("next", safeNext(pathname));
      return applySecurityHeaders(
        copyCookies(response, NextResponse.redirect(redirectUrl)),
        pathname,
        origin
      );
    }
  }

  return applySecurityHeaders(response, pathname, origin);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|manifest.webmanifest|opengraph-image|twitter-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)",
  ],
};