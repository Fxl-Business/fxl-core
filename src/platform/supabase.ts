import { createClient, SupabaseClient } from '@supabase/supabase-js'

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
 * Org-scoped access token from the Edge Function token exchange.
 * Set after Clerk -> Supabase JWT swap completes.
 */
let orgAccessToken: string | null = null

/**
 * Set the org-scoped access token from the Edge Function token exchange.
 * This updates the Authorization header used by the Supabase client.
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
 * The Supabase client. Uses org-scoped JWT from token exchange for all requests.
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
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
