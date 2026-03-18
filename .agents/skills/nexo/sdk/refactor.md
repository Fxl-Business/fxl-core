# Refactoring Patterns for FXL Spoke Projects

## When to Use

After running an audit (`sdk/audit.md`), use these patterns to incrementally bring a project into FXL compliance. Designed for migrating Lovable-generated projects or other existing codebases.

## Principles

1. **Incremental, not big-bang** — refactor one system at a time, verify after each step
2. **Types first** — fix TypeScript config and types before changing logic
3. **Security before features** — RLS and auth before UI polish
4. **Keep it running** — `npm run dev` should work after every step

## Refactoring Order

Follow this order. Each step builds on the previous.

### Step 1: TypeScript Configuration

**Goal:** Enable strict mode and fix all type errors.

1. Copy `../templates/tsconfig.json.template` to `tsconfig.json`
2. Run `npx tsc --noEmit` — expect many errors
3. Fix errors in this order:
   a. Replace `any` with proper types (most common)
   b. Add missing type annotations to function parameters
   c. Fix null/undefined checks (strict null checks)
   d. Add missing interface properties
   e. Fix import paths (add aliases)

**Tips:**
- Use `unknown` + type guard instead of `any`
- Use optional chaining (`?.`) for nullable access
- Use nullish coalescing (`??`) for default values
- Create `src/types/` directory for shared type definitions

### Step 2: Project Structure

**Goal:** Reorganize files into FXL standard structure.

1. Create missing directories:
   ```bash
   mkdir -p src/{components/{ui,layout},pages,hooks,lib,types,styles}
   ```

2. Move files to correct locations:
   | From | To | Rule |
   |------|-----|------|
   | Inline styles / CSS modules | Tailwind classes | Replace with utilities |
   | Components in pages/ | components/{domain}/ | Extract reusable components |
   | Utils scattered in components | lib/ | Centralize utilities |
   | Types inline in components | types/ | Extract to dedicated files |
   | Hooks inline in components | hooks/ | Extract shared hooks |

3. Update all imports after moving
4. Run `npx tsc --noEmit` to verify

### Step 3: Config Files

**Goal:** Add all standard config files.

1. Copy and customize from templates:
   - `eslint.config.js` from `../templates/eslint.config.js.template`
   - `prettier.config.js` from `../templates/prettier.config.js.template`
   - `vercel.json` from `../templates/vercel.json.template`
   - `fxl-doctor.sh` from `../templates/fxl-doctor.sh.template`

2. Run formatters:
   ```bash
   npx prettier --write .
   npx eslint --fix .
   ```

3. Fix remaining lint errors manually

### Step 4: Security Hardening

**Goal:** Add auth, RLS, and security headers.

1. **Add Clerk auth** (if not present):
   - Install `@clerk/react`
   - Wrap app in `ClerkProvider`
   - Add `ProtectedRoute` component
   - Protect all routes except public ones

2. **Add org_id to all tables:**
   ```sql
   ALTER TABLE {table} ADD COLUMN org_id text NOT NULL DEFAULT 'org_fxl_default';
   UPDATE {table} SET org_id = 'org_fxl_default' WHERE org_id = 'org_fxl_default';
   ```

3. **Enable RLS on all tables:**
   ```sql
   ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "{table}_org_access" ON {table}
     FOR ALL USING (
       org_id = COALESCE(
         (current_setting('request.jwt.claims', true)::jsonb->>'org_id'),
         org_id
       )
     );
   ```

4. **Add security headers** in `vercel.json`

5. **Audit env vars:**
   - Move secrets to `.env.local`
   - Create `.env.example` with placeholders
   - Ensure `.gitignore` includes `.env.local`

### Step 5: Supabase Client Refactor

**Goal:** Ensure Supabase client is properly configured.

1. Centralize client creation in `src/lib/supabase.ts`
2. Use env vars (not hardcoded values)
3. Add error handling for missing env vars
4. If multiple Supabase clients exist, consolidate to one

### Step 6: Component Quality

**Goal:** Improve component patterns to FXL standards.

1. Convert default exports to named exports
2. Add proper Props interfaces to all components
3. Extract inline styles to Tailwind classes
4. Remove unused imports and dead code
5. Add loading and error states to data-fetching components

### Step 7: Add FXL Contract

**Goal:** Implement the contract endpoints.

Follow `sdk/connect.md` for detailed instructions.

### Step 8: Add CI/CD

**Goal:** Set up GitHub Actions and Vercel deploy.

Follow `sdk/ci-cd.md` and `sdk/deploy.md`.

## Common Lovable Refactoring Patterns

### Pattern: Replace `any` with proper types

**Before (Lovable):**
```typescript
const handleSubmit = (data: any) => {
  const result: any = await supabase.from('table').insert(data)
}
```

**After (FXL):**
```typescript
interface FormData {
  name: string
  email: string
}

const handleSubmit = async (data: FormData) => {
  const { data: result, error } = await supabase
    .from('table')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return result
}
```

### Pattern: Replace inline Supabase queries with services

**Before:**
```typescript
function ReservationList() {
  const [data, setData] = useState([])
  useEffect(() => {
    supabase.from('reservations').select('*').then(({ data }) => setData(data))
  }, [])
}
```

**After:**
```typescript
// src/lib/services/reservation-service.ts
export async function listReservations(orgId: string) {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

// src/hooks/useReservations.ts
export function useReservations(orgId: string) {
  const [data, setData] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    listReservations(orgId)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [orgId])

  return { data, loading, error }
}
```

### Pattern: Add error boundaries

Wrap major sections with error boundaries to prevent full-page crashes:

```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      <RouterProvider router={router} />
    </ErrorBoundary>
  )
}
```

## Verification After Each Step

After each refactoring step, run:
```bash
npx tsc --noEmit          # types
npx eslint .              # lint (after step 3)
npm run dev               # app still works
```

After all steps:
```bash
bash fxl-doctor.sh        # full compliance check
```
