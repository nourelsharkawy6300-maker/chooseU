import { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";

/**
 * Standard enterprise-hardened cookie configuration:
 * HttpOnly, Secure, SameSite=Strict, and scoped path.
 */
export function getHardenedCookieOptions(maxAgeSeconds = 7200): Partial<ResponseCookie> {
  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    path: "/",
    maxAge: maxAgeSeconds,
  };
}
