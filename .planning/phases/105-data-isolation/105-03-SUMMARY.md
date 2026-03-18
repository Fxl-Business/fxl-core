# 105-03 Summary — Service Layer Updates

**Status:** COMPLETE
**Wave:** 3 of 4
**Commit:** 5b97e56

## Tasks Completed

### Task 1: tasks-service.ts — org_id added
- `Task` interface now has `org_id: string`
- `CreateTaskParams` now requires `org_id: string`
- INSERT payload passes `org_id: params.org_id`

### Task 2: TaskForm.tsx — org_id passed on create
- Added `useActiveOrg` hook call at component top
- `createTask({...})` now passes `org_id: activeOrg?.id ?? ''`

### Task 3: tasks-service.test.ts — all call sites fixed
- `fakeTask` fixture: `org_id: 'org_test_123'` added
- All three `createTask({...})` call sites updated with `org_id: 'org_test_123'`

### Task 4: clients-service.ts — created
- `Client` interface (id, slug, name, description, org_id, timestamps)
- `listClients()` — fetches all clients ordered by name
- `getClient(slug)` — fetches single client by slug

### Task 5: ClientsIndex.tsx — dynamic Supabase query
- Removed hardcoded `CLIENTS` array
- Added `useState/useEffect` fetching via `listClients()`
- Loading spinner, error state, empty state, and cards grid

## TypeScript
- `npx tsc --noEmit` → 0 errors ✓
