/**
 * Validates and sanitizes internal redirection paths to prevent Open Redirect attacks.
 *
 * Rules:
 * - Must start with a single leading slash: '/'
 * - Rejects protocol-relative URLs: '//'
 * - Rejects backslash bypasses: '/\', '\', or containing any '\'
 * - Rejects any scheme/protocol prefix (http:, https:, javascript:, etc.)
 * - Fallback default: '/'
 */
export function safeNext(path: string | null | undefined): string {
  if (!path || typeof path !== "string") {
    return "/";
  }

  const trimmed = path.trim();

  // Must start with '/' and must NOT start with '//' or '/\'
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.startsWith("/\\")
  ) {
    return "/";
  }

  // Reject any backslashes anywhere in the path (e.g. /\evil.com or /path\evil)
  if (trimmed.includes("\\")) {
    return "/";
  }

  // Reject any protocol indicators or scheme prefixes
  if (trimmed.includes("://") || /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return "/";
  }

  return trimmed;
}
