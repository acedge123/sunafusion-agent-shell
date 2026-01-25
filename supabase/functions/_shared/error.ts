/**
 * Safely extracts error message from unknown error type.
 * Handles TypeScript strict mode where catch errors are 'unknown'.
 */
export function errMsg(error: unknown, fallback = "Unknown error"): string {
  return error instanceof Error ? error.message : fallback;
}
