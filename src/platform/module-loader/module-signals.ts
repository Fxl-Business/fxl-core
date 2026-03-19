/**
 * Module invalidation pub/sub.
 *
 * Used by ImpersonationContext to notify useModuleEnabled when impersonation
 * starts or ends, so it can re-fetch tenant_modules for the effective org.
 *
 * Also tracks the impersonated org ID so useModuleEnabled knows which org to query.
 */

const _moduleListeners = new Set<() => void>()

/** The org_id to use for tenant_modules queries during impersonation (null = use own org). */
let _impersonatedOrgId: string | null = null

/**
 * Subscribe to module invalidation events.
 * Returns an unsubscribe function.
 */
export function onModulesInvalidated(cb: () => void): () => void {
  _moduleListeners.add(cb)
  return () => { _moduleListeners.delete(cb) }
}

/**
 * Notify all listeners that modules should be re-fetched.
 * Called by ImpersonationContext on enter/exit.
 */
export function invalidateModules(): void {
  _moduleListeners.forEach((cb) => { cb() })
}

/**
 * Set the org_id override for impersonation mode.
 * Pass null to revert to the user's own active org.
 */
export function setImpersonationOrgId(orgId: string | null): void {
  _impersonatedOrgId = orgId
}

/**
 * Get the current impersonated org_id, or null if not impersonating.
 */
export function getImpersonationOrgId(): string | null {
  return _impersonatedOrgId
}
