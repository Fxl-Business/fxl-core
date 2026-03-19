---
phase: quick
plan: 260319-mpw
subsystem: wireframe-builder
tags: [rls, supabase, share-tokens, multi-tenant]
dependency_graph:
  requires: []
  provides: [working-share-link-generation]
  affects: [share_tokens RLS policy]
tech_stack:
  added: []
  patterns: [prop-drilling orgId through component chain, useActiveOrg hook for org context]
key_files:
  created: []
  modified:
    - tools/wireframe-builder/lib/tokens.ts
    - tools/wireframe-builder/components/editor/ShareModal.tsx
    - tools/wireframe-builder/components/CommentManager.tsx
    - src/modules/projects/pages/WireframeViewer.tsx
decisions:
  - "Pass orgId as required 3rd parameter to createShareToken rather than reading from JWT server-side, keeping the fix entirely in the client call chain"
metrics:
  duration: "~5 minutes"
  completed_date: "2026-03-19"
  tasks_completed: 2
  files_changed: 4
---

# Quick Task 260319-mpw: Fix RLS Policy on share_tokens Table

**One-liner:** Thread real Clerk org_id from useActiveOrg through ShareModal and CommentManager into the Supabase insert payload so the RLS WITH CHECK policy passes.

## What Was Done

The `share_tokens` table RLS WITH CHECK policy compares `jwt.org_id` against the row's `org_id` column. The insert payload was omitting `org_id`, causing Supabase to default it to `'org_fxl_default'` while the JWT contained the real Clerk org id (e.g. `'org_2xxx'`). The mismatch blocked every insert.

Fix: propagate the authenticated user's active org id from the Clerk session down to the Supabase insert.

## Tasks Completed

| Task | Name | Commit |
|------|------|--------|
| 1 | Add orgId parameter to createShareToken and include org_id in insert payload | 893db26 |
| 2 | Update all callers (ShareModal, CommentManager, WireframeViewer) to pass orgId | 893db26 |

## Changes

### tools/wireframe-builder/lib/tokens.ts
- `createShareToken` now accepts `orgId: string` as 3rd parameter (required)
- `expiresInDays` shifted to 4th parameter (default 30 preserved)
- `org_id: orgId` added to the `.insert()` payload

### tools/wireframe-builder/components/editor/ShareModal.tsx
- `Props` type extended with `orgId: string`
- Component destructures and forwards `orgId` to `createShareToken(clientSlug, userId, orgId, 30)`

### tools/wireframe-builder/components/CommentManager.tsx
- Import `useActiveOrg` from `@platform/tenants/useActiveOrg`
- `const { activeOrg } = useActiveOrg()` added inside component
- `handleCreateToken` passes `activeOrg?.id ?? ''` as 3rd arg to `createShareToken`

### src/modules/projects/pages/WireframeViewer.tsx
- Import `useActiveOrg` from `@platform/tenants/useActiveOrg`
- `const { activeOrg } = useActiveOrg()` added inside `WireframeViewerInner`
- `<ShareModal>` JSX updated with `orgId={activeOrg?.id ?? ''}`

## Verification

- `npx tsc --noEmit` — zero errors
- `org_id` confirmed in insert payload at `tokens.ts:35`
- All callers confirmed passing orgId
- `useActiveOrg` imported in both consumer files

## Deviations from Plan

None — plan executed exactly as written.

## Self-Check: PASSED

- tools/wireframe-builder/lib/tokens.ts — FOUND
- tools/wireframe-builder/components/editor/ShareModal.tsx — FOUND
- tools/wireframe-builder/components/CommentManager.tsx — FOUND
- src/modules/projects/pages/WireframeViewer.tsx — FOUND
- Commit 893db26 — FOUND
