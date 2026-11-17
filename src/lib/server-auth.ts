import crypto from "crypto";

// ============================================================================
// 1. SECURE PASSWORD HASHING (SCRYPT + SALT)
// ============================================================================

const DEFAULT_SALT = "chooseu_enterprise_salt_2026";

/**
 * Hashes a plaintext password or passcode using scrypt with a unique/fixed salt.
 * Produces a 64-byte hex string.
 */
export function hashPasscode(passcode: string, salt: string = DEFAULT_SALT): string {
  const derivedKey = crypto.scryptSync(passcode.trim(), salt, 64, {
    N: 16384,
    r: 8,
    p: 1,
  });
  return derivedKey.toString("hex");
}

/**
 * Constant-time comparison between input passcode and expected hash.
 * Prevents timing attacks.
 */
export function verifyPasscode(
  inputPasscode: string,
  expectedHash: string,
  salt: string = DEFAULT_SALT
): boolean {
  try {
    const inputHash = hashPasscode(inputPasscode, salt);
    const inputBuffer = Buffer.from(inputHash, "hex");
    const expectedBuffer = Buffer.from(expectedHash, "hex");

    if (inputBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(inputBuffer, expectedBuffer);
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
export function createAdminSessionToken(durationSeconds = 7200): string {
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
