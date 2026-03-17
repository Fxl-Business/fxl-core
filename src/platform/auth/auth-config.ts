/**
 * Auth mode configuration.
 *
 * VITE_AUTH_MODE controls how the Supabase client authenticates:
 * - "anon" (default): uses the anon key, no org scoping (current behavior)
 * - "org": uses Clerk Organizations + Edge Function token exchange for org-scoped JWT
 */

export type AuthMode = 'anon' | 'org'

function readAuthMode(): AuthMode {
  const raw = import.meta.env.VITE_AUTH_MODE
  if (raw === 'org') return 'org'
  return 'anon' // default — preserves backward compatibility
}

export const AUTH_MODE: AuthMode = readAuthMode()

export function isOrgMode(): boolean {
  return AUTH_MODE === 'org'
}
