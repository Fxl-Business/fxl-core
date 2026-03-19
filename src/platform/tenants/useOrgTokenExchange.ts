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
  const sessionRef = useRef(session)
  sessionRef.current = session
  // If token was already exchanged (e.g., navigating within SPA), start ready
  const [isReady, setIsReady] = useState(() => getOrgAccessToken() !== null)
  const [error, setError] = useState<string | null>(null)
  const onOrgChangeRef = useRef(options?.onOrgChange)
  onOrgChangeRef.current = options?.onOrgChange

  // Stable session ID — avoids re-running effect on every Clerk token refresh
  const sessionId = session?.id ?? null

  useEffect(() => {
    if (!isLoaded || !sessionId || !activeOrg) {
      return
    }

    const orgChanged = prevOrgIdRef.current !== null && prevOrgIdRef.current !== activeOrg.id

    async function doExchange() {
      // Immediately invalidate current token so no queries fire with stale org token
      setIsReady(false)
      setOrgAccessToken(null)
      setError(null)

      try {
        const currentSession = sessionRef.current
        if (!currentSession) {
          setError('Clerk session unavailable')
          return
        }
        const clerkToken = await currentSession.getToken()
        if (!clerkToken) {
          setError('Clerk session token unavailable')
          return
        }

        const result = await exchangeToken(clerkToken, activeOrg!.id)
        setOrgAccessToken(result.access_token)
        setIsReady(true)

        // Fire onOrgChange callback on org switch OR first exchange so callers
        // can invalidate stale caches (e.g., docs cache populated before JWT was set)
        if (onOrgChangeRef.current && (orgChanged || prevOrgIdRef.current === null)) {
          onOrgChangeRef.current()
        }

        prevOrgIdRef.current = activeOrg!.id
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Token exchange failed'
        setError(message)
        console.error('[useOrgTokenExchange]', message)
      }
    }

    void doExchange()
  }, [isLoaded, sessionId, activeOrg?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return { isReady, error }
}
