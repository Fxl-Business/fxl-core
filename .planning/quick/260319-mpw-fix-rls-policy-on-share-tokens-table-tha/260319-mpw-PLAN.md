---
phase: quick
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - tools/wireframe-builder/lib/tokens.ts
  - tools/wireframe-builder/components/editor/ShareModal.tsx
  - tools/wireframe-builder/components/CommentManager.tsx
  - src/modules/projects/pages/WireframeViewer.tsx
autonomous: true
requirements: [RLS-FIX-01]
must_haves:
  truths:
    - "Share link generation succeeds for authenticated users with any org_id"
    - "Inserted share_tokens rows contain the real org_id from the user's JWT"
  artifacts:
    - path: "tools/wireframe-builder/lib/tokens.ts"
      provides: "createShareToken with orgId parameter"
      contains: "org_id"
    - path: "tools/wireframe-builder/components/editor/ShareModal.tsx"
      provides: "ShareModal passes orgId to createShareToken"
      contains: "orgId"
    - path: "tools/wireframe-builder/components/CommentManager.tsx"
      provides: "CommentManager passes orgId to createShareToken"
      contains: "orgId"
    - path: "src/modules/projects/pages/WireframeViewer.tsx"
      provides: "WireframeViewer passes orgId to ShareModal"
      contains: "useActiveOrg"
  key_links:
    - from: "WireframeViewer.tsx"
      to: "ShareModal.tsx"
      via: "orgId prop"
      pattern: "orgId=\\{activeOrg"
    - from: "ShareModal.tsx"
      to: "tokens.ts"
      via: "createShareToken call with orgId"
      pattern: "createShareToken\\(clientSlug.*orgId"
    - from: "CommentManager.tsx"
      to: "tokens.ts"
      via: "createShareToken call with orgId"
      pattern: "createShareToken\\(clientSlug.*orgId"
---

<objective>
Fix RLS policy violation on share_tokens table that blocks insert for wireframe share link generation.

Purpose: The share_tokens RLS WITH CHECK policy compares jwt.org_id against the row's org_id. The row defaults to 'org_fxl_default' but the JWT contains the real Clerk org_id (e.g. 'org_2xxx'). The mismatch causes every insert to fail. Fix by passing the real org_id from the authenticated user's active organization through the entire call chain.

Output: Working share link generation that includes the correct org_id in the insert payload.
</objective>

<execution_context>
@/Users/cauetpinciara/Documents/fxl/Projetos/fxl-core/.claude/get-shit-done/workflows/execute-plan.md
@/Users/cauetpinciara/Documents/fxl/Projetos/fxl-core/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@tools/wireframe-builder/lib/tokens.ts
@tools/wireframe-builder/components/editor/ShareModal.tsx
@tools/wireframe-builder/components/CommentManager.tsx
@src/modules/projects/pages/WireframeViewer.tsx
@src/platform/tenants/useActiveOrg.ts

<interfaces>
From src/platform/tenants/useActiveOrg.ts:
```typescript
export function useActiveOrg(): ActiveOrgState
// Returns { activeOrg: { id, name, slug, imageUrl } | null, orgs, switchOrg, isLoading }
```

From tools/wireframe-builder/lib/tokens.ts (current):
```typescript
export async function createShareToken(
  clientSlug: string,
  createdBy: string,
  expiresInDays = 30
): Promise<ShareToken>
```

From tools/wireframe-builder/components/editor/ShareModal.tsx (current):
```typescript
type Props = {
  open: boolean
  onClose: () => void
  clientSlug: string
  userId: string
}
```

From tools/wireframe-builder/components/CommentManager.tsx (current):
```typescript
type Props = {
  clientSlug: string
  open: boolean
  onClose: () => void
}
// Uses useUser() from @clerk/react internally
// Calls createShareToken(clientSlug, user.id) at line 102
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add orgId parameter to createShareToken and pass it in the insert payload</name>
  <files>tools/wireframe-builder/lib/tokens.ts</files>
  <action>
  Update `createShareToken` signature to accept `orgId` as the third parameter (required string), shifting `expiresInDays` to fourth position:

  ```typescript
  export async function createShareToken(
    clientSlug: string,
    createdBy: string,
    orgId: string,
    expiresInDays = 30
  ): Promise<ShareToken>
  ```

  In the `.insert()` payload, add `org_id: orgId` alongside the existing fields:

  ```typescript
  .insert({
    client_slug: clientSlug,
    created_by: createdBy,
    org_id: orgId,
    expires_at: expiresAt.toISOString(),
    ...(projectId ? { project_id: projectId } : {}),
  })
  ```

  This ensures the row's org_id matches the JWT's org_id, satisfying the RLS WITH CHECK policy.
  </action>
  <verify>
    <automated>npx tsc --noEmit 2>&1 | head -30</automated>
  </verify>
  <done>createShareToken accepts orgId and includes org_id in the insert payload. TypeScript compiles without errors (after all callers are updated in Task 2).</done>
</task>

<task type="auto">
  <name>Task 2: Update all callers to pass orgId through the chain</name>
  <files>
    tools/wireframe-builder/components/editor/ShareModal.tsx
    tools/wireframe-builder/components/CommentManager.tsx
    src/modules/projects/pages/WireframeViewer.tsx
  </files>
  <action>
  Three files need updates to thread orgId from Clerk through to createShareToken:

  **ShareModal.tsx:**
  1. Add `orgId: string` to the Props type.
  2. Destructure `orgId` from props in the function signature.
  3. Update the `handleGenerate` call from `createShareToken(clientSlug, userId, 30)` to `createShareToken(clientSlug, userId, orgId, 30)`.

  **WireframeViewer.tsx:**
  1. Add import: `import { useActiveOrg } from '@platform/tenants/useActiveOrg'`
  2. Inside the component, call: `const { activeOrg } = useActiveOrg()`
  3. Update the ShareModal JSX to include: `orgId={activeOrg?.id ?? ''}`

  **CommentManager.tsx:**
  1. Add import: `import { useActiveOrg } from '@platform/tenants/useActiveOrg'`
  2. Inside the component, call: `const { activeOrg } = useActiveOrg()`
  3. Update the createShareToken call (line ~102) from `createShareToken(clientSlug, user.id)` to `createShareToken(clientSlug, user.id, activeOrg?.id ?? '')`.

  Do NOT use `any` types. All values are strings.
  </action>
  <verify>
    <automated>npx tsc --noEmit</automated>
  </verify>
  <done>All three callers pass orgId. TypeScript compiles with zero errors. Share link generation will now insert rows with the correct org_id matching the JWT, passing the RLS WITH CHECK policy.</done>
</task>

</tasks>

<verification>
1. `npx tsc --noEmit` passes with zero errors
2. Grep confirms org_id in insert payload: `grep -n 'org_id' tools/wireframe-builder/lib/tokens.ts`
3. Grep confirms all callers pass orgId: `grep -rn 'createShareToken' tools/wireframe-builder/`
4. Grep confirms useActiveOrg imported in both consumer files: `grep -rn 'useActiveOrg' tools/wireframe-builder/components/CommentManager.tsx src/modules/projects/pages/WireframeViewer.tsx`
</verification>

<success_criteria>
- createShareToken includes org_id in the Supabase insert payload
- All callers (ShareModal, CommentManager) pass the real org_id from useActiveOrg
- WireframeViewer passes orgId prop to ShareModal
- Zero TypeScript errors
</success_criteria>

<output>
After completion, create `.planning/quick/260319-mpw-fix-rls-policy-on-share-tokens-table-tha/260319-mpw-SUMMARY.md`
</output>
