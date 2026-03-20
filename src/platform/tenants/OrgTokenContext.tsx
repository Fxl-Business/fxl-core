import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { useSession } from '@clerk/react'
import { useActiveOrg } from './useActiveOrg'
import { exchangeToken } from './token-exchange'
import { withRetry } from '@platform/lib/retry'
import { _setTokenGetter, _setSignalGetter } from '@platform/supabase'

export interface OrgTokenState {
  /** Current org access token (null before exchange completes) */
  orgToken: string | null
  /** True when token exchange has completed and token is ready */
  isReady: boolean
  /** Error message if token exchange failed */
  error: string | null
  /** Get the current AbortSignal for passing to custom fetch calls */
  getAbortSignal: () => AbortSignal
  /** Override the token (used by ImpersonationContext) */
  setTokenOverride: (token: string) => void
  /** Clear the token override (used by ImpersonationContext) */
  clearTokenOverride: () => void
}

const OrgTokenContext = createContext<OrgTokenState | null>(null)

/**
 * Hook to access the org token state from OrgTokenContext.
 * Must be used inside OrgTokenProvider.
 */
export function useOrgToken(): OrgTokenState {
  const ctx = useContext(OrgTokenContext)
  if (!ctx) {
    throw new Error('useOrgToken must be used inside OrgTokenProvider')
  }
  return ctx
}

export interface OrgTokenProviderProps {
  children: ReactNode
  /** Called after org switch + successful token exchange. Use to invalidate module caches. */
  onOrgChange?: () => void
}

/**
 * Provider that manages the org-scoped access token lifecycle:
 * - Exchanges Clerk session token for Supabase JWT on mount and org switch
 * - Aborts in-flight requests via AbortController when org changes
 * - Registers token/signal getters on the Supabase client singleton
 * - Exposes override methods for admin impersonation
 */
export function OrgTokenProvider({ children, onOrgChange }: OrgTokenProviderProps) {
  const { session, isLoaded } = useSession()
  const { activeOrg } = useActiveOrg()
  const prevOrgIdRef = useRef<string | null>(null)
  const sessionRef = useRef(session)
  sessionRef.current = session
  const onOrgChangeRef = useRef(onOrgChange)
  onOrgChangeRef.current = onOrgChange

  const [orgToken, setOrgToken] = useState<string | null>(null)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // AbortController ref — new controller created on each org switch
  const abortControllerRef = useRef<AbortController>(new AbortController())

  // Token override refs for impersonation
  const isOverriddenRef = useRef(false)
  const savedTokenRef = useRef<string | null>(null)

  // Token ref that the supabase.ts _tokenGetter reads
  const tokenRef = useRef<string | null>(null)

  // Register getters on mount so supabase.ts custom fetch reads from this provider
  useEffect(() => {
    _setTokenGetter(() => tokenRef.current)
    _setSignalGetter(() => {
      // Don't inject signal during impersonation override
      if (isOverriddenRef.current) return undefined
      return abortControllerRef.current.signal
    })
    return () => {
      _setTokenGetter(() => null)
      _setSignalGetter(() => undefined)
    }
  }, [])

  const getAbortSignal = useCallback((): AbortSignal => {
    return abortControllerRef.current.signal
  }, [])

  const setTokenOverride = useCallback((token: string) => {
    savedTokenRef.current = tokenRef.current
    tokenRef.current = token
    isOverriddenRef.current = true
    setOrgToken(token)
  }, [])

  const clearTokenOverride = useCallback(() => {
    tokenRef.current = savedTokenRef.current
    savedTokenRef.current = null
    isOverriddenRef.current = false
    setOrgToken(tokenRef.current)
  }, [])

  // Stable session ID — avoids re-running effect on every Clerk token refresh
  const sessionId = session?.id ?? null

  useEffect(() => {
    if (!isLoaded || !sessionId || !activeOrg) {
      return
    }

    // Skip exchange if we are in impersonation override mode
    if (isOverriddenRef.current) return

    const orgChanged = prevOrgIdRef.current !== null && prevOrgIdRef.current !== activeOrg.id

    // Abort previous in-flight requests on org switch
    if (orgChanged) {
      abortControllerRef.current.abort()
      abortControllerRef.current = new AbortController()
    }

    async function doExchange() {
      // Immediately invalidate current token so no queries fire with stale org token
      setIsReady(false)
      tokenRef.current = null
      setOrgToken(null)
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

        const result = await withRetry(
          () => exchangeToken(clerkToken, activeOrg!.id, abortControllerRef.current.signal),
          { maxRetries: 3, baseDelay: 1000, backoffFactor: 2 },
        )
        tokenRef.current = result.access_token
        setOrgToken(result.access_token)
        setIsReady(true)

        // Fire onOrgChange callback on org switch OR first exchange
        if (onOrgChangeRef.current && (orgChanged || prevOrgIdRef.current === null)) {
          onOrgChangeRef.current()
        }

        prevOrgIdRef.current = activeOrg!.id
      } catch (err) {
        // Silently ignore abort errors — they are expected during org switch
        // Check .name directly (not instanceof) to handle cross-realm DOMException
        const errName = (err as { name?: string })?.name
        if (errName === 'AbortError') {
          return
        }
        const message = err instanceof Error ? err.message : 'Token exchange failed'
        setError(message)
        console.error('[OrgTokenProvider]', message)
      }
    }

    void doExchange()
  }, [isLoaded, sessionId, activeOrg?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <OrgTokenContext.Provider
      value={{
        orgToken,
        isReady,
        error,
        getAbortSignal,
        setTokenOverride,
        clearTokenOverride,
      }}
    >
      {children}
    </OrgTokenContext.Provider>
  )
}
