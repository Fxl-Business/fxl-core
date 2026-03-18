import { useEffect, useRef, useState } from 'react'
import { useSession } from '@clerk/react'
import { useActiveOrg } from './useActiveOrg'
import { exchangeToken } from './token-exchange'
import { setOrgAccessToken, getOrgAccessToken } from '@platform/supabase'

export interface OrgTokenState {
  isReady: boolean
  error: string | null
}

export interface OrgTokenExchangeOptions {
  /** Called when the active org changes (after successful token exchange). Use this to invalidate module caches. */
  onOrgChange?: () => void
}

/**
 * Exchanges the current Clerk org session for a Supabase-compatible JWT.
 * Re-runs whenever the active org changes.
 * Sets the org token on the Supabase client via setOrgAccessToken().
 *
 * Pass `onOrgChange` to invalidate module-level caches (e.g., docs cache)
 * when the org switches — avoids direct platform → module import.
 *
 * MUST be called inside a component that is already inside ClerkProvider.
 */
export function useOrgTokenExchange(options?: OrgTokenExchangeOptions): OrgTokenState {
  const { session, isLoaded } = useSession()
  const { activeOrg } = useActiveOrg()
  const prevOrgIdRef = useRef<string | null>(null)
  // If token was already exchanged (e.g., navigating within SPA), start ready
  const [isReady, setIsReady] = useState(() => getOrgAccessToken() !== null)
  const [error, setError] = useState<string | null>(null)
  const onOrgChangeRef = useRef(options?.onOrgChange)
  onOrgChangeRef.current = options?.onOrgChange

  useEffect(() => {
    if (!isLoaded || !session || !activeOrg) {
      return
    }

    const orgChanged = prevOrgIdRef.current !== null && prevOrgIdRef.current !== activeOrg.id

    async function doExchange() {
      try {
        const clerkToken = await session!.getToken()
        if (!clerkToken) {
          setError('Clerk session token unavailable')
          setIsReady(false)
          setOrgAccessToken(null)
          return
        }

        const result = await exchangeToken(clerkToken, activeOrg!.id)
        setOrgAccessToken(result.access_token)
        setError(null)
        setIsReady(true)

        // Fire onOrgChange callback on org switch so callers can invalidate their caches
        if (orgChanged && onOrgChangeRef.current) {
          onOrgChangeRef.current()
        }

        prevOrgIdRef.current = activeOrg!.id
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Token exchange failed'
        setError(message)
        setIsReady(false)
        setOrgAccessToken(null)
        console.error('[useOrgTokenExchange]', message)
      }
    }

    void doExchange()
  }, [isLoaded, session, activeOrg?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return { isReady, error }
}
