# Scaffold New FXL Spoke Project

## When to Use

User asks to create a new spoke project from scratch (no blueprint export). For scaffold from Wireframe Builder export, use `new-project-from-blueprint.md` instead.

## Prerequisites

- Node.js 18+
- GitHub account with access to FXL org
- Clerk publishable key (same as Hub)
- Supabase project created

## Step-by-Step

### 1. Initialize Project

```bash
npm create vite@latest {project-slug} -- --template react-ts
cd {project-slug}
```

### 2. Install Dependencies

```bash
# Core
npm install @supabase/supabase-js@2 @clerk/react@6 lucide-react zod

# UI
npm install tailwindcss@3 postcss autoprefixer
npm install -D @types/node
npx tailwindcss init -p

# shadcn/ui setup
npx shadcn@latest init
```

Configure shadcn/ui when prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes

### 3. Apply Config Templates

Copy these templates from the SDK and customize:

1. **tsconfig.json** — from `templates/tsconfig.json.template`
   - Update `paths` aliases for project structure

2. **eslint.config.js** — from `templates/eslint.config.js.template`

3. **prettier.config.js** — from `templates/prettier.config.js.template`

4. **tailwind.config.ts** — extend from `templates/tailwind.preset.js.template`
   - Add project-specific colors from client branding

5. **vercel.json** — from `templates/vercel.json.template`

6. **fxl-doctor.sh** — from `templates/fxl-doctor.sh.template`
   - `chmod +x fxl-doctor.sh`

7. **.github/workflows/ci.yml** — from `templates/ci.yml.template`

### 4. Create Directory Structure

```bash
mkdir -p src/{api/fxl,components/{ui,layout},pages,hooks,lib,types,styles}
mkdir -p supabase/migrations
```

### 5. Generate CLAUDE.md

Copy `templates/CLAUDE.md.template` and customize:
- Replace `{{PROJECT_NAME}}` with project name
- Replace `{{PROJECT_SLUG}}` with project slug
- Replace `{{ENTITIES}}` with entity list
- Add domain-specific rules

### 6. Set Up Environment

Create `.env.example`:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
```

Create `.env.local` (NEVER commit):
```
VITE_SUPABASE_URL=<actual url>
VITE_SUPABASE_ANON_KEY=<actual key>
VITE_CLERK_PUBLISHABLE_KEY=<actual key>
```

Update `.gitignore`:
```
.env.local
.env.*.local
```

### 7. Set Up Supabase Client

Create `src/lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 8. Set Up Clerk Auth

Create `src/lib/auth.ts`:
```typescript
import { useAuth } from '@clerk/react'

export function useClerkToken() {
  const { getToken } = useAuth()

  async function getSessionToken(): Promise<string | null> {
    return getToken()
  }

  return { getSessionToken }
}
```

Wrap app in `ClerkProvider`:
```typescript
import { ClerkProvider } from '@clerk/react'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

export function App() {
  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      {/* router and app content */}
    </ClerkProvider>
  )
}
```

### 9. Copy Contract Types

Copy `contract/types.ts` from this SDK to `src/types/fxl-contract.ts`.

### 10. Implement Contract Endpoints

Create API route handlers for all required endpoints. See `rules/connect.md` for detailed endpoint implementation.

Minimum endpoints:
- `GET /api/fxl/manifest` — returns FxlAppManifest
- `GET /api/fxl/entities/:type` — returns paginated entity list
- `GET /api/fxl/entities/:type/:id` — returns single entity
- `GET /api/fxl/widgets/:id/data` — returns widget data
- `GET /api/fxl/search?q=` — returns cross-entity search results
- `GET /api/fxl/health` — returns health status + contract version

### 11. Add package.json Fields

Add to `package.json`:
```json
{
  "fxlContractVersion": "1.0",
  "fxlAppId": "{project-slug}"
}
```

### 12. Create First Migration

Create `supabase/migrations/001_initial_schema.sql` with:
- All domain tables with `org_id text NOT NULL` column
- RLS enabled on every table
- RLS policies filtering by `org_id` from JWT claims
- Indexes on `org_id` for every table

### 13. Set Up CI/CD

See `rules/ci-cd.md` for GitHub Actions setup.

### 14. Set Up Deploy

See `rules/deploy.md` for Vercel configuration.

### 15. Verify

Run all quality gates:
```bash
npx tsc --noEmit
npx eslint .
npx prettier --check .
bash fxl-doctor.sh
```

## Checklist After Scaffold

- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts without errors
- [ ] CLAUDE.md exists with project-specific rules
- [ ] .env.example committed, .env.local NOT committed
- [ ] All 6 contract endpoints return valid responses
- [ ] fxl-doctor.sh passes
- [ ] GitHub Actions CI runs on push
- [ ] Vercel deploy preview works

## Common Pitfalls

- Forgetting `fxlContractVersion` in package.json (fxl-doctor will catch this)
- Using `any` to "get it working" (fix properly with types)
- Not enabling RLS on new tables (security vulnerability)
- Committing .env.local (rotate secrets immediately if this happens)
- Using default export instead of named export
