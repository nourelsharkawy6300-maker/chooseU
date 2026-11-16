import DOMPurify from "dompurify";

/**
 * Aggressive XSS input sterilization using DOMPurify.
 * Strips script tags, malformed HTML, event handlers, and javascript: pseudo-protocols.
 */
export function sanitizeInput(dirty: string): string {
  if (!dirty || typeof dirty !== "string") return "";

  // Browser environment: Use DOMPurify directly
  if (typeof window !== "undefined") {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    }).trim();
  }

  // Server-side environment: Robust regex sanitization
  return dirty
    .replace(/<[^>]*>?/gm, "")
    .replace(/[<>'"&]/g, "")
    .replace(/javascript:/gi, "")
    .trim();
}
