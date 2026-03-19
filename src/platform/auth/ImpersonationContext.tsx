import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { setOrgAccessToken, getOrgAccessToken } from '@platform/supabase'
import { getImpersonationToken, setAdminClerkTokenGetter } from '@platform/services/admin-service'
import { invalidateDocsCache } from '@modules/docs/services/docs-service'
import { invalidateModules, setImpersonationOrgId } from '@platform/module-loader/module-signals'
import { useSession } from '@clerk/react'

export interface ImpersonationState {
  isImpersonating: boolean
  impersonatedOrgId: string | null
  impersonatedOrgName: string | null
  enterImpersonation: (orgId: string, orgName: string) => Promise<void>
  exitImpersonation: () => void
  impersonationError: string | null
}

const ImpersonationContext = createContext<ImpersonationState | null>(null)

export function useImpersonation(): ImpersonationState {
  const ctx = useContext(ImpersonationContext)
  if (!ctx) {
    throw new Error('useImpersonation must be used inside ImpersonationProvider')
  }
  return ctx
}

export function ImpersonationProvider({ children }: { children: ReactNode }) {
  const { session } = useSession()
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [impersonatedOrgId, setImpersonatedOrgId] = useState<string | null>(null)
  const [impersonatedOrgName, setImpersonatedOrgName] = useState<string | null>(null)
  const [impersonationError, setImpersonationError] = useState<string | null>(null)

  // Store original token in a ref — does not trigger re-renders
  const originalTokenRef = useRef<string | null>(null)

  const enterImpersonation = useCallback(
    async (orgId: string, orgName: string) => {
      if (!session) {
        setImpersonationError('No active session')
        return
      }

      try {
        setImpersonationError(null)

        // Register token getter so admin-service can authenticate
        setAdminClerkTokenGetter(() => session.getToken({ template: 'supabase' }))

        // Save the current org token BEFORE overriding it
        originalTokenRef.current = getOrgAccessToken()

        // Get impersonation token from edge function
        const result = await getImpersonationToken(orgId)

        // Override Supabase client to use impersonated org token
        setOrgAccessToken(result.access_token)

        // Set impersonation org ID so useModuleEnabled queries the target org
        setImpersonationOrgId(orgId)

        // Invalidate modules and docs so queries re-fetch with the new tenant context
        invalidateModules()
        invalidateDocsCache()

        setImpersonatedOrgId(orgId)
        setImpersonatedOrgName(orgName)
        setIsImpersonating(true)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Impersonation failed'
        setImpersonationError(message)
        console.error('[ImpersonationContext] enterImpersonation failed:', message)
      }
    },
    [session],
  )

  const exitImpersonation = useCallback(() => {
    // Restore the original org token
    setOrgAccessToken(originalTokenRef.current)
    originalTokenRef.current = null

    // Clear impersonation org ID so useModuleEnabled reverts to admin's own org
    setImpersonationOrgId(null)

    // Invalidate modules and docs so queries re-fetch with the admin's own tenant context
    invalidateModules()
    invalidateDocsCache()

    setIsImpersonating(false)
    setImpersonatedOrgId(null)
    setImpersonatedOrgName(null)
    setImpersonationError(null)
  }, [])

  return (
    <ImpersonationContext.Provider
      value={{
        isImpersonating,
        impersonatedOrgId,
        impersonatedOrgName,
        enterImpersonation,
        exitImpersonation,
        impersonationError,
      }}
    >
      {children}
    </ImpersonationContext.Provider>
  )
}
