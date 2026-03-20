/**
 * Client-side token exchange service.
 *
 * Calls the Supabase Edge Function `/auth/token-exchange` with a Clerk session
 * token and receives a Supabase-compatible JWT containing org_id claims.
 */

const FUNCTIONS_URL = import.meta.env.VITE_SUPABASE_FUNCTIONS_URL ?? ''

export interface TokenExchangeResult {
  /** Supabase-compatible JWT with org_id, sub, role claims */
  access_token: string
  /** Token expiry in seconds */
  expires_in: number
}

export interface TokenExchangeError {
  error: string
  status: number
}

/**
 * Exchange a Clerk session token for a Supabase JWT via Edge Function.
 *
 * @param clerkToken - The Clerk session token (from session.getToken())
 * @param orgId - The active Clerk organization ID
 * @param signal - Optional AbortSignal for cancelling the request on org switch
 * @returns Supabase JWT with org_id claims
 * @throws Error if the exchange fails or the token is invalid
 */
export async function exchangeToken(
  clerkToken: string,
  orgId: string,
  signal?: AbortSignal,
): Promise<TokenExchangeResult> {
  if (!FUNCTIONS_URL) {
    throw new Error(
      'VITE_SUPABASE_FUNCTIONS_URL is not set. ' +
      'Set it to your Supabase project functions URL (e.g., https://<project>.supabase.co/functions/v1).',
    )
  }

  const url = `${FUNCTIONS_URL}/auth-token-exchange`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${clerkToken}`,
    },
    body: JSON.stringify({ org_id: orgId }),
    signal,
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({ error: 'Unknown error' })) as TokenExchangeError
    throw new Error(
      `Token exchange failed (${response.status}): ${body.error ?? 'Unknown error'}`,
    )
  }

  const data = (await response.json()) as TokenExchangeResult
  return data
}
