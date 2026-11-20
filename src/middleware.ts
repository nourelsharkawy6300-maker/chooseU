import { NextRequest, NextResponse } from "next/server";
import {
  checkGlobalLimit,
  checkStrictLimit,
  rateLimitExceededResponse,
} from "@/lib/security/ratelimit";

// ============================================================================
// ZERO-TRUST CORS CONFIGURATION
// ============================================================================

const isProd = process.env.NODE_ENV === "production";

const ALLOWED_ORIGINS = new Set(
  [
    "https://choose-u.vercel.app",
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    ...(!isProd ? ["http://localhost:3000", "http://127.0.0.1:3000"] : []),
  ].filter(Boolean) as string[]
);

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const origin = req.headers.get("origin");

  // ==========================================================================
  // 1. CORS LOCKDOWN FOR API ROUTES
  // ==========================================================================
  if (pathname.startsWith("/api/")) {
    if (origin && !ALLOWED_ORIGINS.has(origin)) {
      return new NextResponse(
        JSON.stringify({
          error: "Forbidden",
          message: "CORS origin rejected by Zero-Trust policy.",
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (req.method === "OPTIONS") {
      const preflightHeaders = new Headers();
      if (origin && ALLOWED_ORIGINS.has(origin)) {
        preflightHeaders.set("Access-Control-Allow-Origin", origin);
        preflightHeaders.set("Access-Control-Allow-Credentials", "true");
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

    // ========================================================================
    // 2. EDGE RATE LIMITING (ANTI-DDOS)
    // ========================================================================
    const clientIp = getClientIp(req);
    const isSensitiveRoute =
      pathname.startsWith("/api/admin/") || pathname === "/api/orders";

    if (isSensitiveRoute) {
      const { success, reset } = await checkStrictLimit(`strict_${clientIp}`);
      if (!success) {
        return rateLimitExceededResponse(reset);
      }
    } else {
      const { success, reset } = await checkGlobalLimit(`global_${clientIp}`);
      if (!success) {
        return rateLimitExceededResponse(reset);
      }
    }
  }

  // ==========================================================================
  // 3. CONTENT SECURITY POLICY (ALIGNED WITH STATIC APP ROUTER BUILD)
  // ==========================================================================
  const isDev = process.env.NODE_ENV === "development";

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com data:;
    img-src 'self' blob: data: https:;
    connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.upstash.io;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `
    .replace(/\s{2,}/g, " ")
    .trim();

  const response = NextResponse.next();

  // ==========================================================================
  // 4. SECURITY HEADERS
  // ==========================================================================
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

  if (pathname.startsWith("/api/") && origin && ALLOWED_ORIGINS.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};