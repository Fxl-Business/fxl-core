---
phase: 123-modules-org-lifecycle
status: passed
verified_at: "2026-03-19T18:20:00Z"
---

## Phase 123: Modules & Org Lifecycle — Verification

### Goal
Modulos funcionam com opt-out por padrao, impersonation retorna dados reais, troca de org recarrega tudo sem reload manual

### Requirements Verification

| Req ID | Description | Status | Evidence |
|--------|-------------|--------|----------|
| MORG-01 | Org sem tenant_modules = todos modulos habilitados | PASS | useModuleEnabled.tsx L66-71: `data.length === 0` → `new Set(ALL_MODULE_IDS)` |
| MORG-02 | Admin impersonando org ve dados daquela org | PASS | useModuleEnabled.tsx L57: `getImpersonationOrgId() ?? activeOrg.id`; ImpersonationContext calls `setImpersonationOrgId(orgId)` + `invalidateModules()` |
| MORG-03 | Trocar org recarrega dados sem reload manual | PASS | useDocsNav.ts subscribes to `onDocsCacheInvalidated` via refetchTick; useModuleEnabled subscribes to `onModulesInvalidated` via refetchTick |
| MORG-04 | Org sem dados mostra empty state claro | PASS | Sidebar.tsx DynamicNavContent shows "Nenhum documento encontrado para esta organização" with admin hint |
| TEST-03 | Tests validando dados mudam ao trocar de org | PASS | docs-rls.test.ts: pub/sub notify + unsubscribe tests; all 9 tests pass |

### Success Criteria Check

1. **Org sem tenant_modules rows tem todos modulos visiveis** — PASS
   - `useModuleEnabled.tsx` line 66-71: when `data.length === 0`, sets `new Set(ALL_MODULE_IDS)`
   - Opt-out model: lines 82-87 — modules NOT in DB are also added to enabledSet

2. **Admin impersonando org FXL ve docs/modules daquela org** — PASS
   - `ImpersonationContext.tsx`: calls `setImpersonationOrgId(orgId)` before invalidating
   - `useModuleEnabled.tsx`: uses `getImpersonationOrgId() ?? activeOrg.id` as effectiveOrgId
   - `invalidateModules()` fires refetchTick so useEffect re-runs with new org_id

3. **Trocar org recarrega tudo sem reload manual** — PASS
   - docs-service.ts: `invalidateDocsCache()` notifies listeners via `_cacheListeners.forEach(cb => cb())`
   - useDocsNav.ts: subscribes via `onDocsCacheInvalidated`, increments `refetchTick`
   - useModuleEnabled.tsx: subscribes via `onModulesInvalidated`, increments `refetchTick`
   - No polling — event-driven pub/sub pattern

4. **Org sem docs mostra empty state** — PASS
   - Sidebar.tsx DynamicNavContent: two-line contextual message when `items.length === 0` after `isLoading=false`

5. **npx tsc --noEmit = zero errors** — PASS
   - Verified: no output (clean)

6. **All unit tests pass** — PASS
   - 9/9 tests pass in docs-rls.test.ts (pub/sub + cache + RLS)
   - 407/407 non-blueprint tests pass across full suite

### Automated Checks
- `npx tsc --noEmit` — PASS (zero errors)
- `npx vitest run src/modules/docs/services/__tests__/docs-rls.test.ts` — 9/9 PASS

### Human Verification Required
1. Start dev server, log in, switch between orgs — sidebar should update reactively
2. Impersonate FXL org — should show FXL modules/docs
3. Impersonate empty org — should show empty state message
4. Exit impersonation — should revert to admin's own org state
