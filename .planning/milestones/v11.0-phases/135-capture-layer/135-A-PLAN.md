# Plan 135-A: Audit Event Capture Service

```yaml
phase: 135
plan: A
title: Audit Event Capture Service
wave: 1
depends_on: []
files_modified:
  - src/platform/types/audit.ts
  - src/platform/services/audit-service.ts
requirements_addressed: [CAPT-01, CAPT-04]
autonomous: true
```

## Objective

Create the `logAuditEvent()` function in `src/platform/services/audit-service.ts` that:
1. Inserts audit log records into the `audit_logs` table via the Supabase client
2. Never throws — entire body wrapped in try/catch, errors reported to Sentry
3. Automatically detects impersonation context and includes `impersonator_id` in metadata
4. Provides fully typed interfaces for audit event payloads

## Background

- The Supabase client lives at `src/platform/supabase.ts` and exports `supabase` (SupabaseClient)
- Sentry is initialized in `src/main.tsx` via `@sentry/react` — use `Sentry.captureException()` for error reporting
- ImpersonationContext lives at `src/platform/auth/ImpersonationContext.tsx` — it's a React context, so the service cannot use `useImpersonation()` directly. Instead, the service must expose a module-level setter for the impersonator ID (same pattern as `_setTokenGetter` in supabase.ts and `setAdminClerkTokenGetter` in admin-service.ts)
- The `audit_logs` table schema (from Phase 134): `id`, `org_id`, `actor_id`, `actor_email`, `actor_type`, `action`, `resource_type`, `resource_id`, `resource_label`, `ip_address`, `user_agent`, `metadata` (JSONB), `created_at`

## Tasks

### Task 1: Create audit types

<read_first>
- src/platform/types/admin.ts (existing type patterns)
- src/platform/supabase.ts (Supabase client pattern)
</read_first>

<action>
Create `src/platform/types/audit.ts` with the following types:

```typescript
/** Possible actor types for audit events */
export type AuditActorType = 'user' | 'admin' | 'system'

/** Standard audit actions */
export type AuditAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'archive'
  | 'restore'
  | 'sign_in'
  | 'sign_out'
  | 'impersonate_start'
  | 'impersonate_end'
  | 'add_member'
  | 'remove_member'
  | 'enable_module'
  | 'disable_module'

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
```
</action>

<acceptance_criteria>
- `src/platform/types/audit.ts` exists
- File contains `export type AuditActorType =`
- File contains `export type AuditAction =`
- File contains `export type AuditResourceType =`
- File contains `export interface AuditEventPayload`
- File contains `export interface AuditLogRow`
- AuditEventPayload has fields: `org_id`, `actor_id`, `actor_email`, `actor_type`, `action`, `resource_type`, `resource_id`, `resource_label?`, `ip_address?`, `user_agent?`, `metadata?`
- `npx tsc --noEmit` passes with zero errors
</acceptance_criteria>

### Task 2: Create audit-service.ts with logAuditEvent()

<read_first>
- src/platform/supabase.ts (Supabase client singleton and _setTokenGetter pattern)
- src/platform/services/admin-service.ts (module-level getter pattern with setAdminClerkTokenGetter)
- src/platform/auth/ImpersonationContext.tsx (ImpersonationState interface, isImpersonating + impersonatedOrgId fields)
- src/platform/layout/ModuleErrorBoundary.tsx (Sentry.captureException usage pattern)
- src/platform/types/audit.ts (types created in Task 1)
</read_first>

<action>
Create `src/platform/services/audit-service.ts` with the following implementation:

```typescript
import * as Sentry from '@sentry/react'
import { supabase } from '@platform/supabase'
import type { AuditEventPayload } from '@platform/types/audit'

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
```

Key implementation details:
- The function signature is `async function logAuditEvent(payload: AuditEventPayload): Promise<void>`
- The ENTIRE function body (from first line to last) is inside a single try/catch
- The catch block calls `Sentry.captureException(err, { tags: { service: 'audit', action: payload.action } })`
- `_impersonatorId` is checked with `!== null` (not falsy check) to properly handle the string "0" edge case
- When `_impersonatorId` is null, the `impersonator_id` key does NOT appear in metadata at all
- Empty metadata (no caller metadata + no impersonation) is stored as `null`, not `{}`
</action>

<acceptance_criteria>
- `src/platform/services/audit-service.ts` exists
- File contains `export async function logAuditEvent(payload: AuditEventPayload): Promise<void>`
- File contains `export function setAuditImpersonatorId(id: string | null): void`
- File contains `import * as Sentry from '@sentry/react'`
- File contains `Sentry.captureException` (at least 2 occurrences — one for Supabase error, one for catch block)
- File contains `_impersonatorId !== null` (impersonation check)
- File contains `metadata = { ...metadata, impersonator_id: _impersonatorId }` (impersonation tagging)
- File contains `supabase.from('audit_logs').insert(`
- The try block wraps the entire function body (no code before try or after catch)
- `npx tsc --noEmit` passes with zero errors
</acceptance_criteria>

### Task 3: Wire impersonation context to audit service

<read_first>
- src/platform/auth/ImpersonationContext.tsx (current enterImpersonation and exitImpersonation implementations)
- src/platform/services/audit-service.ts (setAuditImpersonatorId export created in Task 2)
</read_first>

<action>
Edit `src/platform/auth/ImpersonationContext.tsx` to call `setAuditImpersonatorId` when impersonation starts and stops.

1. Add import at top of file:
   ```typescript
   import { setAuditImpersonatorId } from '@platform/services/audit-service'
   ```

2. In `enterImpersonation` callback, after the line `setIsImpersonating(true)` (around line 63), add:
   ```typescript
   // Tag audit logs with impersonator's admin user ID
   setAuditImpersonatorId(session.user.id)
   ```
   Note: `session.user.id` is the Clerk user ID of the admin doing the impersonation.

3. In `exitImpersonation` callback, after the line `setImpersonationError(null)` (around line 88), add:
   ```typescript
   // Clear impersonator tag from audit logs
   setAuditImpersonatorId(null)
   ```
</action>

<acceptance_criteria>
- `src/platform/auth/ImpersonationContext.tsx` contains `import { setAuditImpersonatorId } from '@platform/services/audit-service'`
- `enterImpersonation` callback contains `setAuditImpersonatorId(session.user.id)`
- `exitImpersonation` callback contains `setAuditImpersonatorId(null)`
- `npx tsc --noEmit` passes with zero errors
</acceptance_criteria>

## Verification

After all tasks complete:

1. **Type check:** `npx tsc --noEmit` exits 0
2. **CAPT-01 (never throws):** `audit-service.ts` has exactly one try/catch wrapping the entire function body, Sentry.captureException in both the error-response path and the catch block
3. **CAPT-04 (impersonation tagging):** `ImpersonationContext.tsx` calls `setAuditImpersonatorId(session.user.id)` on enter, `setAuditImpersonatorId(null)` on exit; `audit-service.ts` checks `_impersonatorId !== null` and merges `impersonator_id` into metadata only when non-null

## Must-Haves (Goal-Backward)

Phase goal: "O service layer tem uma funcao de captura de eventos que nunca interrompe a operacao principal e taga automaticamente sessoes de impersonation"

- [x] `logAuditEvent()` exists as an exported async function
- [x] Function never throws — entire body in try/catch
- [x] Sentry receives errors when logging fails
- [x] Impersonation sessions automatically tagged via `setAuditImpersonatorId` / `_impersonatorId`
- [x] Outside impersonation, no `impersonator_id` pollution in metadata
- [x] TypeScript types are strict (no `any`)
