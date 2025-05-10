/**
 * Helper to redact sensitive info from logs
 * Client-safe utility
 */
export function redactSensitive(obj: Record<string, unknown>): Record<string, unknown> {
  const sensitiveKeys = ['password', 'token', 'email']
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [
      key,
      sensitiveKeys.includes(key) ? '[REDACTED]' : value
    ])
  )
}
