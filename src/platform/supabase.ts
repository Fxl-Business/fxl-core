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
 * Token getter function — set by OrgTokenProvider on mount.
 * The custom fetch wrapper reads the token from this getter
 * instead of a module-level mutable variable.
 * @internal Only OrgTokenProvider should call _setTokenGetter.
 */
let _tokenGetter: () => string | null = () => null

/**
 * AbortSignal getter function — set by OrgTokenProvider on mount.
 * The custom fetch wrapper injects the signal from this getter
 * so all Supabase requests are automatically cancellable on org switch.
 * @internal Only OrgTokenProvider should call _setSignalGetter.
 */
let _signalGetter: () => AbortSignal | undefined = () => undefined

/**
 * Register the token getter (called by OrgTokenProvider on mount).
 * @internal
 */
export function _setTokenGetter(getter: () => string | null): void {
  _tokenGetter = getter
}

/**
 * Register the AbortSignal getter (called by OrgTokenProvider on mount).
 * @internal
 */
export function _setSignalGetter(getter: () => AbortSignal | undefined): void {
  _signalGetter = getter
}

/**
 * Get the current org access token (for checking if token exchange has happened).
 * Reads from the provider-controlled getter.
 */
export function getOrgAccessToken(): string | null {
  return _tokenGetter()
}

/**
 * The Supabase client. Uses org-scoped JWT from token exchange for all requests.
 * AbortSignal is automatically injected by the provider for request cancellation.
 */
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {},
    fetch: (input, init) => {
      const token = _tokenGetter()
      const signal = _signalGetter()
      const headers = new Headers(init?.headers)
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
        headers.set('apikey', supabaseKey)
      }
      return fetch(input, { ...init, headers, signal: init?.signal ?? signal })
    },
  },
})
