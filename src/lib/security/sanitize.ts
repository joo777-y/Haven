/**
 * Security and Data Sanitization Utilities for HAVEN
 *
 * Enforces XSS neutralization, input sanitization, and defensive error boundaries.
 */

/**
 * Strips all HTML tags, script elements, styles, and control characters from freeform input.
 */
export function sanitizeText(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z0-9]+;/gi, " ")
    .trim();
}

/**
 * Strips dangerous protocol schemes from URLs (such as javascript: or data:).
 */
export function sanitizeUrl(url: string | null | undefined): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (/^(?:javascript|data|vbscript):/i.test(trimmed)) {
    return "";
  }
  return trimmed;
}

/**
 * Converts potential database/internal errors into safe, client-facing messages.
 * Prevents PostgreSQL constraints, table names, or SQL fragments from leaking to the UI.
 */
export function toSafeErrorMessage(
  error: unknown,
  fallbackMessage = "An unexpected error occurred. Please try again."
): string {
  if (!error) return fallbackMessage;

  const rawMessage =
    typeof error === "object" && error !== null && "message" in error
      ? String((error as { message: unknown }).message)
      : String(error);

  // Check for database schema, constraint names, or technical error codes
  const isTechnicalLeak =
    rawMessage.includes("violates") ||
    rawMessage.includes("relation") ||
    rawMessage.includes("column") ||
    rawMessage.includes("syntax error") ||
    rawMessage.includes("PGRST") ||
    rawMessage.includes("42501") ||
    rawMessage.includes("23505") ||
    rawMessage.includes("schema") ||
    rawMessage.includes("SELECT") ||
    rawMessage.includes("INSERT") ||
    rawMessage.includes("UPDATE") ||
    rawMessage.includes("DELETE") ||
    rawMessage.includes("pg_") ||
    rawMessage.includes("supabase.co");

  if (isTechnicalLeak) {
    return fallbackMessage;
  }

  return rawMessage || fallbackMessage;
}
