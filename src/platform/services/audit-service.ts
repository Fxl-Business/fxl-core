import * as Sentry from '@sentry/react'
import { supabase } from '@platform/supabase'
import type { AuditEventPayload, AuditQueryParams, AuditQueryResponse, AuditLogRow } from '@platform/types/audit'

/**
 * Module-level impersonator state — set by ImpersonationProvider.
 * Same pattern as _setTokenGetter in supabase.ts.
 */
let _impersonatorId: string | null = null

/**
 * Register the current impersonator's user ID.
 * Call with the admin's Clerk user ID when entering impersonation.
 * Call with null when exiting impersonation.
 *
 * Called from ImpersonationContext.tsx enterImpersonation/exitImpersonation.
 */
export function setAuditImpersonatorId(id: string | null): void {
  _impersonatorId = id
}

/**
 * Log an audit event to the audit_logs table.
 *
 * **NEVER THROWS.** The entire function body is wrapped in try/catch.
 * On failure, the error is reported to Sentry and the function returns silently.
 * Callers do NOT need try/catch around this call.
 *
 * If an impersonation session is active (setAuditImpersonatorId was called with
 * a non-null value), the impersonator_id is automatically injected into the
 * metadata field. Outside impersonation, impersonator_id does not appear.
 */
export async function logAuditEvent(payload: AuditEventPayload): Promise<void> {
  try {
    // Build metadata: merge caller-provided metadata with impersonation context
    let metadata: Record<string, unknown> = payload.metadata ? { ...payload.metadata } : {}

    // Only add impersonator_id when actively impersonating
    if (_impersonatorId !== null) {
      metadata = { ...metadata, impersonator_id: _impersonatorId }
    }

    // If metadata is empty object and no impersonator, pass null to avoid empty JSONB
    const finalMetadata = Object.keys(metadata).length > 0 ? metadata : null

    const { error } = await supabase.from('audit_logs').insert({
      org_id: payload.org_id,
      actor_id: payload.actor_id,
      actor_email: payload.actor_email,
      actor_type: payload.actor_type,
      action: payload.action,
      resource_type: payload.resource_type,
      resource_id: payload.resource_id,
      resource_label: payload.resource_label ?? null,
      ip_address: payload.ip_address ?? null,
      user_agent: payload.user_agent ?? null,
      metadata: finalMetadata,
    })

    if (error) {
      Sentry.captureException(error, {
        tags: { service: 'audit', action: payload.action },
        extra: {
          resource_type: payload.resource_type,
          resource_id: payload.resource_id,
          org_id: payload.org_id,
        },
      })
    }
  } catch (err) {
    // Catch ANY unexpected error — network failures, serialization issues, etc.
    Sentry.captureException(err, {
      tags: { service: 'audit', action: payload.action },
      extra: {
        resource_type: payload.resource_type,
        resource_id: payload.resource_id,
        org_id: payload.org_id,
      },
    })
  }
}

/**
 * Query audit logs from the audit-logs edge function.
 * Returns typed, paginated results with total count.
 *
 * Unlike logAuditEvent(), this function DOES throw on errors —
 * callers should handle errors (the UI will show error states).
 */
export async function queryAuditLogs(
  params: AuditQueryParams = {}
): Promise<AuditQueryResponse> {
  // Build query string from non-undefined params
  const searchParams = new URLSearchParams()

  if (params.limit !== undefined) searchParams.set('limit', String(params.limit))
  if (params.offset !== undefined) searchParams.set('offset', String(params.offset))
  if (params.org_id) searchParams.set('org_id', params.org_id)
  if (params.actor_id) searchParams.set('actor_id', params.actor_id)
  if (params.action) searchParams.set('action', params.action)
  if (params.resource_type) searchParams.set('resource_type', params.resource_type)
  if (params.date_from) searchParams.set('date_from', params.date_from)
  if (params.date_to) searchParams.set('date_to', params.date_to)

  const queryString = searchParams.toString()
  const functionName = queryString ? `audit-logs?${queryString}` : 'audit-logs'

  const { data, error } = await supabase.functions.invoke(functionName, {
    method: 'GET',
  })

  if (error) {
    throw new Error(`Failed to query audit logs: ${error.message}`)
  }

  // Validate response shape with fallbacks (per CLAUDE.md: never access without fallback)
  const response = data as Record<string, unknown>
  return {
    data: (response.data as AuditLogRow[]) ?? [],
    total: (response.total as number) ?? 0,
    limit: (response.limit as number) ?? 50,
    offset: (response.offset as number) ?? 0,
  }
}
