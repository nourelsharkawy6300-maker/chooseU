import crypto from "crypto";

// ============================================================================
// 1. TIMING-SAFE PASSCODE VERIFICATION (CRYPTO.TIMINGSAFEQUAL)
// ============================================================================

/**
 * Constant-time comparison between input passcode and expected passcode
 * using SHA-256 digest normalization and crypto.timingSafeEqual.
 * Prevents timing attacks and length leakage.
 */
export function verifyPasscode(
  inputPasscode: string,
  expectedPasscode: string
): boolean {
  if (
    typeof inputPasscode !== "string" ||
    typeof expectedPasscode !== "string" ||
    inputPasscode.length === 0 ||
    expectedPasscode.length === 0
  ) {
    return false;
  }
  try {
    // crypto.timingSafeEqual requires buffers of identical length. Direct comparison
    // throws RangeError if lengths differ, and checking buffer length first leaks length timing.
    // Pre-hashing with SHA-256 produces fixed 32-byte buffers, guaranteeing timing safety
    // with zero length leakage and no RangeErrors.
    const inputHash = crypto
      .createHash("sha256")
      .update(inputPasscode)
      .digest();
    const expectedHash = crypto
      .createHash("sha256")
      .update(expectedPasscode)
      .digest();

    return crypto.timingSafeEqual(inputHash, expectedHash);
  } catch {
    return false;
  }
}

// ============================================================================
// 2. CRYPTOGRAPHIC HMAC SESSION TOKENS (ROLE-BASED ACCESS CONTROL)
// ============================================================================

// In production, ADMIN_SESSION_SECRET MUST be set. The app fails closed if it is missing.
// In development (NODE_ENV !== "production"), a warning is printed and a placeholder is used
// only so the dev server can start — never deploy without setting this variable.
const _rawSecret = process.env.ADMIN_SESSION_SECRET;
if (!_rawSecret) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[server-auth] ADMIN_SESSION_SECRET is not set. The application cannot start in production without it."
    );
  } else {
    console.warn(
      "[server-auth] WARNING: ADMIN_SESSION_SECRET is not set. Using an insecure placeholder for development only. DO NOT deploy without this variable."
    );
  }
}
const SESSION_SECRET = _rawSecret || "dev-only-insecure-placeholder";

export interface AdminSessionPayload {
  role: "admin";
  issuedAt: number;
  expiresAt: number;
}

/**
 * Creates an HMAC-SHA256 signed session token for verified administrators.
 */
export function createAdminSessionToken(durationSeconds = 3600): string {
  const now = Date.now();
  const payload: AdminSessionPayload = {
    role: "admin",
    issuedAt: now,
    expiresAt: now + durationSeconds * 1000,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payloadB64)
    .digest("base64url");

  return `${payloadB64}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 session token and enforces expiration.
 */
export function verifyAdminSessionToken(token: string | undefined): AdminSessionPayload | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;

  try {
    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payloadB64)
      .digest("base64url");

    const sigA = Buffer.from(signature);
    const sigB = Buffer.from(expectedSignature);

    if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf-8")
    ) as AdminSessionPayload;

    if (payload.role !== "admin" || Date.now() > payload.expiresAt) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

// ============================================================================
// 3. IN-MEMORY SERVER-SIDE RATE LIMITER (SLIDING WINDOW)
// ============================================================================

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Enforces rate limiting per IP / key.
 * Returns { allowed: boolean, remaining: number, resetSeconds: number }.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): { allowed: boolean; remaining: number; resetSeconds: number } {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return {
      allowed: true,
      remaining: limit - 1,
      resetSeconds: windowSeconds,
    };
  }

  if (record.count >= limit) {
    const resetSeconds = Math.ceil((record.resetAt - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetSeconds: Math.max(1, resetSeconds),
    };
  }

  record.count += 1;
  const resetSeconds = Math.ceil((record.resetAt - now) / 1000);
  return {
    allowed: true,
    remaining: limit - record.count,
    resetSeconds: Math.max(1, resetSeconds),
  };
}

/**
 * Extracts client IP address from Next.js request headers.
 */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }
  return "127.0.0.1";
}

// ============================================================================
// 4. IN-MEMORY FAILED LOGIN ATTEMPTS RATE LIMITER
// Limits failed login attempts to 5 per 15 minutes per IP address.
// ============================================================================

interface LoginRateLimitEntry {
  failedAttempts: number;
  firstFailedAt: number;
  lockedUntil: number | null;
}

const loginRateLimitMap = new Map<string, LoginRateLimitEntry>();

const MAX_LOGIN_FAILURES = 5;
const LOGIN_LOCKOUT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes in milliseconds

/**
 * Checks if the given IP address is currently locked out from admin login.
 */
export function checkAdminLoginRateLimit(ip: string): {
  allowed: boolean;
  remainingAttempts: number;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const entry = loginRateLimitMap.get(ip);

  if (!entry) {
    return {
      allowed: true,
      remainingAttempts: MAX_LOGIN_FAILURES,
      retryAfterSeconds: 0,
    };
  }

  // Check if active lockout exists
  if (entry.lockedUntil) {
    if (now >= entry.lockedUntil) {
      loginRateLimitMap.delete(ip);
      return {
        allowed: true,
        remainingAttempts: MAX_LOGIN_FAILURES,
        retryAfterSeconds: 0,
      };
    }
    const retryAfter = Math.max(1, Math.ceil((entry.lockedUntil - now) / 1000));
    return {
      allowed: false,
      remainingAttempts: 0,
      retryAfterSeconds: retryAfter,
    };
  }

  // Check if the 15-minute sliding window has elapsed since first failure
  if (now - entry.firstFailedAt > LOGIN_LOCKOUT_WINDOW_MS) {
    loginRateLimitMap.delete(ip);
    return {
      allowed: true,
      remainingAttempts: MAX_LOGIN_FAILURES,
      retryAfterSeconds: 0,
    };
  }

  return {
    allowed: true,
    remainingAttempts: Math.max(0, MAX_LOGIN_FAILURES - entry.failedAttempts),
    retryAfterSeconds: 0,
  };
}

/**
 * Records a failed login attempt for the given IP address.
 * If 5 failed attempts are reached within 15 minutes, locks out the IP for 15 minutes.
 */
export function recordFailedAdminLogin(ip: string): {
  remainingAttempts: number;
  isLockedOut: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  let entry = loginRateLimitMap.get(ip);

  if (!entry || now - entry.firstFailedAt > LOGIN_LOCKOUT_WINDOW_MS) {
    entry = {
      failedAttempts: 1,
      firstFailedAt: now,
      lockedUntil: null,
    };
    loginRateLimitMap.set(ip, entry);
    return {
      remainingAttempts: MAX_LOGIN_FAILURES - 1,
      isLockedOut: false,
      retryAfterSeconds: 0,
    };
  }

  entry.failedAttempts += 1;

  if (entry.failedAttempts >= MAX_LOGIN_FAILURES) {
    entry.lockedUntil = now + LOGIN_LOCKOUT_WINDOW_MS;
    const retryAfter = Math.ceil(LOGIN_LOCKOUT_WINDOW_MS / 1000);
    return {
      remainingAttempts: 0,
      isLockedOut: true,
      retryAfterSeconds: retryAfter,
    };
  }

  return {
    remainingAttempts: MAX_LOGIN_FAILURES - entry.failedAttempts,
    isLockedOut: false,
    retryAfterSeconds: 0,
  };
}

/**
 * Resets the failed login counter for an IP address upon successful login.
 */
export function resetAdminLoginRateLimit(ip: string): void {
  loginRateLimitMap.delete(ip);
}
