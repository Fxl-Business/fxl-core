import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { useOrgToken } from '@platform/tenants/OrgTokenContext'
import { getImpersonationToken, setAdminClerkTokenGetter } from '@platform/services/admin-service'
import { setAuditImpersonatorId } from '@platform/services/audit-service'
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
  const { setTokenOverride, clearTokenOverride } = useOrgToken()
  const [isImpersonating, setIsImpersonating] = useState(false)
  const [impersonatedOrgId, setImpersonatedOrgId] = useState<string | null>(null)
  const [impersonatedOrgName, setImpersonatedOrgName] = useState<string | null>(null)
  const [impersonationError, setImpersonationError] = useState<string | null>(null)

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

        // Get impersonation token from edge function
        const result = await getImpersonationToken(orgId)

        // Override Supabase client to use impersonated org token via context
        setTokenOverride(result.access_token)

        // Set impersonation org ID so useModuleEnabled queries the target org
        setImpersonationOrgId(orgId)

        // Invalidate modules and docs so queries re-fetch with the new tenant context
        invalidateModules()
        invalidateDocsCache()

        setImpersonatedOrgId(orgId)
        setImpersonatedOrgName(orgName)
        setIsImpersonating(true)

        // Tag audit logs with impersonator's admin user ID
        setAuditImpersonatorId(session.user.id)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Impersonation failed'
        setImpersonationError(message)
        console.error('[ImpersonationContext] enterImpersonation failed:', message)
      }
    },
    [session, setTokenOverride],
  )

  const exitImpersonation = useCallback(() => {
    // Restore the original org token via context
    clearTokenOverride()

    // Clear impersonation org ID so useModuleEnabled reverts to admin's own org
    setImpersonationOrgId(null)

    // Invalidate modules and docs so queries re-fetch with the admin's own tenant context
    invalidateModules()
    invalidateDocsCache()

    setIsImpersonating(false)
    setImpersonatedOrgId(null)
    setImpersonatedOrgName(null)
    setImpersonationError(null)

    // Clear impersonator tag from audit logs
    setAuditImpersonatorId(null)
  }, [clearTokenOverride])

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
