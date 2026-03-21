/**
 * Fire-and-forget auth event logging service.
 * Sends auth events to the audit-auth edge function.
 * NEVER blocks the auth flow — errors are silently swallowed.
 */

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ?? ''

/**
 * Log an auth event (sign_in or sign_out) to the audit system.
 * This function is fire-and-forget: it does NOT return a promise that callers
 * should await. Errors are silently caught to never block auth flows.
 *
 * @param event - 'sign_in' or 'sign_out'
 * @param token - Clerk session token (Bearer token for the edge function)
 */
export function logAuthEvent(event: 'sign_in' | 'sign_out', token: string): void {
  if (!FUNCTIONS_URL || !token) return

  fetch(`${FUNCTIONS_URL}/audit-auth`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ event }),
  }).catch(() => {
    // Silently swallow — audit must never block auth
  })
}
