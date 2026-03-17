import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { isOrgMode } from '@platform/auth/auth-config'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY. ' +
    'See .env.local.example for reference.'
  )
}

/**
 * Anon-mode Supabase client (default).
 * Uses the publishable anon key — no org scoping.
 */
const anonClient: SupabaseClient = createClient(supabaseUrl, supabaseKey)

/**
 * Org-mode Supabase client.
 * Created with the anon key initially, but accessToken is overridden
 * dynamically via setOrgAccessToken() after token exchange.
 *
 * Uses the global fetch + accessToken pattern from @supabase/supabase-js:
 * we create a client whose auth header is controlled by a mutable token ref.
 */
let orgAccessToken: string | null = null

const orgClient: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {},
    fetch: (input, init) => {
      if (orgAccessToken) {
        const headers = new Headers(init?.headers)
        headers.set('Authorization', `Bearer ${orgAccessToken}`)
        headers.set('apikey', supabaseKey)
        return fetch(input, { ...init, headers })
      }
      return fetch(input, init)
    },
  },
})

/**
 * Set the org-scoped access token from the Edge Function token exchange.
 * This updates the Authorization header used by the org Supabase client.
 */
export function setOrgAccessToken(token: string | null): void {
  orgAccessToken = token
}

/**
 * Get the current org access token (for checking if token exchange has happened).
 */
export function getOrgAccessToken(): string | null {
  return orgAccessToken
}

/**
 * The Supabase client to use throughout the application.
 *
 * - In anon mode: standard client with anon key (current behavior, no org scoping)
 * - In org mode: client that injects the org-scoped JWT from token exchange
 */
export const supabase: SupabaseClient = isOrgMode() ? orgClient : anonClient
