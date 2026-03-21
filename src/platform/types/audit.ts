/** Possible actor types — MUST match CHECK constraint in 025_audit_logs.sql */
export type AuditActorType = 'user' | 'system' | 'trigger'

/** Standard audit actions — MUST match CHECK constraint in 027_audit_action_expand.sql */
export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'archive'
  | 'restore'
  | 'sign_in'
  | 'sign_out'
  | 'impersonate'
  | 'add_member'
  | 'remove_member'

/** Resource types that can be audited */
export type AuditResourceType =
  | 'tenant'
  | 'user'
  | 'task'
  | 'tenant_module'
  | 'session'
  | 'org_member'

/** Payload for logAuditEvent() — all fields the caller must provide */
export interface AuditEventPayload {
  org_id: string
  actor_id: string
  actor_email: string
  actor_type: AuditActorType
  action: AuditAction
  resource_type: AuditResourceType
  resource_id: string
  resource_label?: string
  ip_address?: string
  user_agent?: string
  metadata?: Record<string, unknown>
}

/** Row shape returned from audit_logs table */
export interface AuditLogRow {
  id: string
  org_id: string
  actor_id: string
  actor_email: string
  actor_type: AuditActorType
  action: AuditAction
  resource_type: AuditResourceType
  resource_id: string
  resource_label: string | null
  ip_address: string | null
  user_agent: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

/** Parameters for querying audit logs via the audit-logs edge function */
export interface AuditQueryParams {
  limit?: number
  offset?: number
  org_id?: string
  actor_id?: string
  action?: AuditAction
  resource_type?: AuditResourceType
  date_from?: string
  date_to?: string
}

/** Response shape from the audit-logs edge function */
export interface AuditQueryResponse {
  data: AuditLogRow[]
  total: number
  limit: number
  offset: number
}
