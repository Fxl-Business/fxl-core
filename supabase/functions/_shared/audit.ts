// Shared audit logging helper for Supabase Edge Functions (Deno runtime).
// Mirrors the never-throw contract from src/platform/services/audit-service.ts.

import { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

export interface AuditEventInput {
  org_id: string | null
  actor_id: string
  actor_email: string
  actor_type: 'user' | 'system' | 'trigger'
  action: string
  resource_type: string
  resource_id: string
  resource_label: string
  ip_address: string
  user_agent: string
  metadata?: Record<string, unknown> | null
}

/**
 * Log an audit event to audit_logs table. NEVER throws.
 * On failure, logs to console.error and returns silently.
 * Callers do NOT need try/catch around this call.
 */
export async function logAuditEvent(
  supabase: SupabaseClient,
  event: AuditEventInput,
): Promise<void> {
  try {
    const metadata = event.metadata && Object.keys(event.metadata).length > 0
      ? event.metadata
      : null
    const { error } = await supabase.from('audit_logs').insert({
      org_id: event.org_id,
      actor_id: event.actor_id,
      actor_email: event.actor_email,
      actor_type: event.actor_type,
      action: event.action,
      resource_type: event.resource_type,
      resource_id: event.resource_id,
      resource_label: event.resource_label,
      ip_address: event.ip_address,
      user_agent: event.user_agent,
      metadata,
    })
    if (error) {
      console.error('[audit] Insert error:', error.message)
    }
  } catch (err) {
    console.error('[audit] Failed to log event:', err)
    // Never throw — audit logging must not break the main operation
  }
}

/**
 * Extract common audit fields from a request and JWT payload.
 * Convenience helper to avoid repeating header extraction in every handler.
 */
export function extractAuditContext(req: Request, payload: Record<string, unknown>): {
  actor_id: string
  actor_email: string
  ip_address: string
  user_agent: string
} {
  return {
    actor_id: (payload.sub as string) ?? 'unknown',
    actor_email: (payload.email as string) ?? ((payload.unsafe_metadata as Record<string, unknown>)?.email as string) ?? '',
    ip_address: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? '',
    user_agent: req.headers.get('user-agent') ?? '',
  }
}
