# Scaffold Flow — Complete Spoke Project Creation

## When to Use

When the user says "create a new spoke project", "scaffold a new FXL project", or equivalent.
This is the unified scaffold command that replaces the step-by-step `new-project.md` with a
fully automated flow that integrates MCP, methodology, and all FXL conventions.

For scaffold from Wireframe Builder export, use `new-project-from-blueprint.md` instead
(which builds on top of this flow).

---

## Overview

The scaffold flow has 4 stages:

1. **Gather** — Prompt for project details and choices
2. **Context** — Fetch MCP knowledge (standards, pitfalls, learnings)
3. **Generate** — Create the complete project directory
4. **Register** — Register the project in the MCP knowledge base

---

## Stage 1: Gather

Prompt the user for the following inputs. Present defaults and accept overrides.

### Required Inputs

| Input | Prompt | Default |
|-------|--------|---------|
| `project_name` | "What is the project name?" | (required, no default) |
| `project_slug` | "Project slug?" | kebab-case of project_name |
| `project_description` | "One-line description?" | (required, no default) |

### Platform & Framework Selection

| Input | Prompt | Options | Default |
|-------|--------|---------|---------|
| `platform` | "Platform?" | `web`, `mobile` | `web` |
| `framework` | "Framework?" | `vite` (web), `next` (web), `expo` (mobile) | `vite` |

**Note:** Mobile (Expo) and Next.js are documented as future options but not yet supported
by the templates. If the user selects them, inform that only `web + vite` is currently
scaffoldable and offer to proceed with that.

### Module Selection

Present available modules. The user selects which to include.

| Module | Description | Default |
|--------|-------------|---------|
| `auth` | Clerk authentication | Included (always) |
| `database` | Supabase client + RLS setup | Included (always) |
| `contract` | FXL contract API endpoints | Included (always) |
| `ci` | GitHub Actions + fxl-doctor.sh | Included (always) |
| `deploy` | Vercel config | Included (always) |

All modules are included by default. The user can deselect optional modules, but
`auth`, `database`, and `contract` are mandatory for an FXL spoke.

### Entity Definition (Optional)

If the user knows the domain entities, capture them now:

```
"What are the main entities? (e.g., reservation, property, guest)"
```

For each entity, capture:
- `type` — singular name (e.g., "reservation")
- `label` — display name singular (e.g., "Reserva")
- `labelPlural` — display name plural (e.g., "Reservas")
- `icon` — lucide-react icon name (e.g., "calendar")
- `fields` — list of { key, label, type: string|number|date|boolean }

If the user does not provide entities, scaffold with a placeholder entity and instruct
them to replace it later.

---

## Stage 2: Context (MCP Integration)

Before generating any files, gather context from the MCP knowledge base.
Follow `mcp-bridge/spoke-planning.md` in full.

### Step 2.0: Platform MCP Snippets (Clerk + Supabase)

Before generating any files, load implementation patterns from the platform MCPs:

```
mcp__clerk__clerk_sdk_snippet(slug: "b2b-saas")
mcp__clerk__list_clerk_sdk_snippets(tag: "organizations")
```

Also invoke the **clerk-orgs** and **clerk-setup** skills — these provide authoritative
patterns for B2B auth, org_id propagation, and JWT templates.

### Step 2.1: Pre-Operation Context

```
mcp__fxl-sdk__get_learnings()
mcp__fxl-sdk__get_pitfalls()
```

### Step 2.2: Standards Retrieval

```
mcp__fxl-sdk__get_standards()
mcp__fxl-sdk__get_standards(category: "stack")
mcp__fxl-sdk__get_standards(category: "security")
mcp__fxl-sdk__get_standards(category: "database")
```

### Step 2.3: Check for Existing Project

```
mcp__fxl-sdk__get_project_config(slug: "{project_slug}")
```

If the project already exists in MCP, warn the user and offer to update or abort.

### Step 2.4: Checklists

```
mcp__fxl-sdk__get_checklist(name: "structure")
mcp__fxl-sdk__get_checklist(name: "typescript")
mcp__fxl-sdk__get_checklist(name: "security")
mcp__fxl-sdk__get_checklist(name: "rls")
mcp__fxl-sdk__get_checklist(name: "contract")
```

Store all retrieved context. Use it to inform file generation and post-scaffold verification.

---

## Stage 3: Generate

Create the complete project directory. The target directory is `../{project_slug}/`
relative to the FXL Core Hub repo (sibling directory).

### Step 3.1: Initialize Monorepo Root

```bash
mkdir {project_slug}
cd {project_slug}
git init
```

Create root `package.json` with bun workspaces:

```json
{
  "name": "{project_slug}",
  "private": true,
  "workspaces": ["frontend", "backend", "shared"],
  "scripts": {
    "dev": "concurrently \"bun run dev --cwd frontend\" \"bun run dev --cwd backend\"",
    "type-check": "bun run type-check --cwd frontend && bun run type-check --cwd backend && bun run type-check --cwd shared",
    "lint": "bun run lint --cwd frontend && bun run lint --cwd backend",
    "build": "bun run build --cwd frontend && bun run build --cwd backend"
  }
}
```

Create root `.gitignore`:
```
node_modules/
.env.local
.env.*.local
dist/
```

Create `supabase/migrations/` and `.github/workflows/` directories:
```bash
mkdir -p supabase/migrations
mkdir -p .github/workflows
```

### Step 3.2: Scaffold Frontend

```bash
cd frontend
bunx create-vite@latest . -- --template react-ts
bun install @clerk/react@6 lucide-react zod
bun install tailwindcss@3 postcss autoprefixer
bun install -D @types/node
bunx tailwindcss init -p
bunx shadcn@latest init -d
```

Create frontend directory structure:
```bash
mkdir -p src/{components/{ui,layout},pages,hooks,lib,types,styles}
```

Apply config templates from `../templates/` in the Nexo Skill:

| Template | Target | Customization |
|----------|--------|---------------|
| `tsconfig.json.template` | `frontend/tsconfig.json` | None needed |
| `eslint.config.js.template` | `frontend/eslint.config.js` | None needed |
| `prettier.config.js.template` | `frontend/prettier.config.js` | None needed |
| `tailwind.preset.js.template` | `frontend/tailwind.preset.js` | None needed |
| `vercel.json.template` | `frontend/vercel.json` | None needed |

Create `frontend/tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'
import fxlPreset from './tailwind.preset'

export default {
  presets: [fxlPreset],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config
```

Create `frontend/src/lib/auth.ts`:
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

Create `frontend/src/main.tsx`:
```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './styles/globals.css'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

Create `frontend/src/App.tsx`:
```typescript
import { ClerkProvider } from '@clerk/react'

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

export function App() {
  if (!clerkPubKey) {
    throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY')
  }

  return (
    <ClerkProvider publishableKey={clerkPubKey}>
      <div className="min-h-screen bg-background text-foreground">
        <h1 className="p-8 text-2xl font-bold">{project_name}</h1>
        <p className="px-8 text-muted-foreground">Spoke project scaffolded. Start building!</p>
      </div>
    </ClerkProvider>
  )
}
```

Create `frontend/src/styles/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Step 3.3: Scaffold Backend

```bash
cd ../backend
bun init -y
bun install hono @hono/node-server @supabase/supabase-js @clerk/backend zod
bun install -D @types/bun typescript
```

Apply `backend-package.json.template` from `../templates/` and replace `{{PROJECT_SLUG}}`.

Create `backend/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "outDir": "dist",
    "rootDir": "src",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@shared/*": ["../shared/*"]
    }
  },
  "include": ["src"]
}
```

Create backend directory structure:
```bash
mkdir -p src/{routes/fxl,middleware,services,lib}
```

### Step 3.4: Scaffold Shared

```bash
cd ../shared
bun init -y
```

Create `shared/tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "declaration": true,
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["types"]
}
```

Create `shared/package.json` with scripts:
```json
{
  "name": "@{project_slug}/shared",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "type-check": "tsc --noEmit"
  }
}
```

```bash
mkdir -p types
```

### Step 3.5: Create Backend Core Files

#### `backend/src/index.ts`
```typescript
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { fxlRoutes } from '@/routes/fxl'
import { authMiddleware } from '@/middleware/auth'

export const app = new Hono()

app.use('*', logger())
app.use('*', cors({
  origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  credentials: true,
}))

// Public routes
app.route('/api/fxl', fxlRoutes)

// Authenticated routes
app.use('/api/*', authMiddleware)
// app.route('/api/reservations', reservationRoutes)

export default app
```

#### `backend/src/server.ts`
```typescript
import { serve } from '@hono/node-server'
import { app } from './index'

const port = parseInt(process.env.PORT ?? '3000')

serve({ fetch: app.fetch, port }, () => {
  console.log(`Backend running on port ${port}`)
})
```

#### `backend/src/middleware/auth.ts`
```typescript
import { createMiddleware } from 'hono/factory'
import { createClerkClient } from '@clerk/backend'

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
})

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized', statusCode: 401 }, 401)
  }

  const token = authHeader.slice(7)
  try {
    const payload = await clerk.verifyToken(token)
    c.set('orgId', payload.org_id as string)
    c.set('userId', payload.sub)
    await next()
  } catch {
    return c.json({ error: 'Invalid token', statusCode: 401 }, 401)
  }
})
```

#### `backend/src/middleware/fxl-api-key.ts`
```typescript
import { createMiddleware } from 'hono/factory'

export const fxlApiKeyMiddleware = createMiddleware(async (c, next) => {
  const apiKey = c.req.header('X-FXL-Api-Key')
  if (apiKey !== process.env.FXL_API_KEY) {
    return c.json({ error: 'Unauthorized', statusCode: 401 }, 401)
  }
  await next()
})
```

#### `backend/src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js'

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)
```

### Step 3.6: Update Frontend — API Client

The frontend NEVER calls Supabase directly. It calls the backend via a typed API client.

Create `frontend/src/lib/api-client.ts`:
```typescript
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:3000'

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {}
): Promise<T> {
  const { token, ...init } = options
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${BACKEND_URL}${path}`, { ...init, headers })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(error.error ?? res.statusText)
  }
  return res.json() as Promise<T>
}

export const apiClient = {
  get: <T>(path: string, token?: string) =>
    request<T>(path, { method: 'GET', token }),
  post: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), token }),
  put: <T>(path: string, body: unknown, token?: string) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body), token }),
  delete: <T>(path: string, token?: string) =>
    request<T>(path, { method: 'DELETE', token }),
}
```

### Step 3.7: Create Shared Types

Create `shared/types/fxl-contract.ts` — move FXL contract types here (not in frontend).
Copy the full contents of `contract/types.ts` from the Nexo Skill into this file.

Create `shared/types/index.ts` — re-export all shared types:
```typescript
export * from './fxl-contract'
export * from './{entity}'
```

For each entity from Stage 1, create `shared/types/{entity}.ts`:
```typescript
export interface {EntityName} {
  id: string
  org_id: string
  // ... fields from entity definition
  created_at: string
  updated_at: string
}
```

### Step 3.8: Update .env.example

Create `.env.example` at monorepo root:
```
# Backend (server-side only — never expose to browser)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
CLERK_SECRET_KEY=sk_live_...
FXL_API_KEY=<openssl rand -base64 32>
FRONTEND_URL=http://localhost:5173
PORT=3000

# Frontend (VITE_ prefix — safe for browser)
VITE_BACKEND_URL=http://localhost:3000
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
```

Note: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are no longer required
unless the frontend uses Supabase Realtime subscriptions.

### Step 3.9: Create CI Workflow

Apply `ci.yml.template` from `../templates/` to `.github/workflows/ci.yml`.
Ensure the workflow includes checks for all packages:

```yaml
- name: Type check all packages
  run: bun run type-check
- name: Lint all packages
  run: bun run lint
- name: Build frontend
  run: bun run build --cwd frontend
- name: Build backend
  run: bun run build --cwd backend
- name: Run fxl-doctor
  run: bash fxl-doctor.sh
```

Apply `fxl-doctor.sh.template` to `fxl-doctor.sh` at monorepo root and `chmod +x`.

### Step 3.10: FXL Contract Endpoints

FXL contract endpoints live in `backend/src/routes/fxl/` (NOT in frontend).
Generate stub implementations for all 6 required endpoints.
`manifest` and `health` are public; the rest use `fxlApiKeyMiddleware`.

Create `backend/src/routes/fxl/index.ts` to wire all FXL routes:
```typescript
import { Hono } from 'hono'
import { fxlApiKeyMiddleware } from '@/middleware/fxl-api-key'
import { getManifest } from './manifest'
import { getHealth } from './health'

export const fxlRoutes = new Hono()

// Public
fxlRoutes.get('/manifest', (c) => c.json(getManifest()))
fxlRoutes.get('/health', (c) => c.json(getHealth()))

// Protected — require Hub API key
fxlRoutes.use('/*', fxlApiKeyMiddleware)
fxlRoutes.get('/entities/:type', /* stub */)
fxlRoutes.get('/entities/:type/:id', /* stub */)
fxlRoutes.get('/widgets/:id/data', /* stub */)
fxlRoutes.get('/search', /* stub */)
```

### Step 3.10b: Apply Migrations via Supabase MCP

After creating migration files, apply them directly using the Supabase MCP:

```
mcp__supabase__apply_migration(name: "001_{entity_type_plural}", query: "<migration SQL>")
```

Then generate TypeScript types from the live schema:

```
mcp__supabase__generate_typescript_types()
```

Save the output to `shared/types/database.ts` — this is the source of truth for DB types.

### Step 3.11: Create Database Migrations

For each entity from Stage 1, create a migration:

```sql
-- supabase/migrations/001_{entity_type_plural}.sql
CREATE TABLE {entity_type_plural} (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id text NOT NULL,
  -- fields from entity definition
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE {entity_type_plural} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "{entity_type_plural}_org_access" ON {entity_type_plural}
  FOR ALL USING (
    org_id = COALESCE(
      (current_setting('request.jwt.claims', true)::jsonb->>'org_id'),
      org_id
    )
  );

CREATE INDEX idx_{entity_type_plural}_org_id ON {entity_type_plural}(org_id);
```

### Step 3.12: Apply CLAUDE.md Template

Apply `CLAUDE.md.template` from `../templates/` and replace placeholders:

| Placeholder | Value |
|-------------|-------|
| `{{PROJECT_NAME}}` | `project_name` from Stage 1 |
| `{{PROJECT_SLUG}}` | `project_slug` from Stage 1 |
| `{{DOMAIN}}` | Primary entity type, or `domain` if none provided |
| `{{ENTITIES}}` | Formatted entity list, or placeholder text |

Apply `mcp.json.template` to `.mcp.json` and replace `{{FXL_MCP_TOKEN}}`.
Instruct the user to update it with their actual MCP token.

### Step 3.13: Update root package.json FXL Fields

Add FXL-specific fields to the root `package.json`:

```json
{
  "fxlContractVersion": "1.0",
  "fxlAppId": "{project_slug}"
}
```

### Step 3.14: Initialize GSD Project Structure

Inside the spoke directory, run `gsd:new-project` to set up the planning structure.
Use the project name, description, and entities from Stage 1 as context.

This creates `.planning/PROJECT.md`, `STATE.md`, and `ROADMAP.md` — enabling
`/gsd:plan-phase` and `/gsd:execute-phase` for all future development in the spoke.

### Step 3.16: Initialize Git

```bash
git add -A
git commit -m "chore: scaffold FXL spoke project via Nexo Skill"
```

---

## Stage 4: Register (MCP Integration)

After the project is generated successfully, register it in the MCP knowledge base.

### Step 4.1: Register Project

```
mcp__fxl-sdk__register_project(
  slug: "{project_slug}",
  name: "{project_name}",
  stack_choices: {
    "platform": "{platform}",
    "framework": "{framework}",
    "auth": "clerk",
    "database": "supabase",
    "backend": "hono",
    "deploy_frontend": "vercel",
    "deploy_backend": "railway",
    "ci": "github-actions",
    "contract_version": "1.0"
  }
)
```

### Step 4.2: Post-Operation Knowledge Capture

Follow `mcp-bridge/post-operation.md` — evaluate if the scaffold produced
any new learnings or pitfalls worth recording.

---

## Post-Scaffold Verification

After generation, verify against all checklists retrieved in Stage 2.

### Automated Checks

```bash
cd {project_slug}
bun run type-check         # zero errors (all packages)
bun run lint               # zero errors (all packages)
bash fxl-doctor.sh         # all checks pass
```

### Manual Verification Checklist

- [ ] Monorepo root exists at `../{project_slug}/` with `frontend/`, `backend/`, `shared/`
- [ ] `CLAUDE.md` exists with project-specific values (no unresolved placeholders)
- [ ] `.mcp.json` exists pointing to Nexo SDK MCP Server
- [ ] `.env.example` committed with placeholder values for ALL vars (backend + frontend)
- [ ] `.env.local` NOT committed (check `.gitignore`)
- [ ] Root `package.json` contains `fxlContractVersion`, `fxlAppId`, and bun workspaces config
- [ ] `backend/src/index.ts` exists with Hono app
- [ ] `backend/src/middleware/auth.ts` validates Clerk JWT
- [ ] `backend/src/middleware/fxl-api-key.ts` validates Hub API key
- [ ] `backend/src/lib/supabase.ts` uses service role key
- [ ] All 6 contract endpoint stubs exist in `backend/src/routes/fxl/`
- [ ] `shared/types/fxl-contract.ts` contains FXL contract types
- [ ] `shared/types/index.ts` re-exports all types
- [ ] `frontend/src/lib/api-client.ts` exists (no direct Supabase calls from frontend)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is NOT prefixed with `VITE_`
- [ ] Database migrations exist for all entities (if entities provided)
- [ ] RLS enabled on all tables in migrations
- [ ] `fxl-doctor.sh` is executable (at monorepo root)
- [ ] `.github/workflows/ci.yml` exists
- [ ] `frontend/vercel.json` has security headers
- [ ] Project registered in MCP knowledge base (via `register_project`)

---

## Output

Report to the user:

```
Spoke project "{project_name}" scaffolded at ../{project_slug}/

Stack:
- Platform: {platform}
- Framework: {framework}
- Frontend: React 18 + Vite + Tailwind + shadcn/ui → Vercel
- Backend: Hono (Node.js) → Railway / Fly.io
- Shared types: shared/types/
- Auth: Clerk
- Database: Supabase (backend-only access)
- CI: GitHub Actions

Architecture: React → Hono → Supabase
(Frontend never calls Supabase directly)

Generated structure:
- frontend/          (React app, Vite, Tailwind, shadcn/ui)
- backend/           (Hono server, auth middleware, FXL contract routes)
- shared/types/      (FXL contract types + entity types)
- supabase/migrations/ (entity schemas with RLS)
- CLAUDE.md          (project rules for Claude Code)
- .mcp.json          (Nexo SDK MCP Server connection)
- .env.example       (all required vars documented)
- fxl-doctor.sh      (CI health check)
- .github/workflows/ci.yml

Next steps:
1. Create Supabase project and add vars to .env.local
2. Create Clerk application and add vars to .env.local
3. Generate FXL_API_KEY: openssl rand -base64 32
4. Update .mcp.json with your MCP token
5. Run `bun run dev` to start frontend + backend concurrently
6. Implement entity services in backend/src/services/
7. Deploy frontend to Vercel, backend to Railway/Fly.io

Project registered in Nexo SDK knowledge base.
```

---

## Error Handling

| Error | Recovery |
|-------|----------|
| MCP unavailable in Stage 2 | Continue with local templates. Log warning. |
| MCP unavailable in Stage 4 | Complete scaffold. Note that manual registration is needed. |
| `bunx create-vite` fails | Check Bun version (1.x required). |
| TypeScript errors after scaffold | Fix before continuing. Zero errors is acceptance criteria. |
| Project slug already exists in filesystem | Ask user to confirm overwrite or choose new slug. |
| Project slug already exists in MCP | Ask user to confirm update or choose new slug. |
| `bun workspaces` not resolving `@shared/*` | Verify `backend/tsconfig.json` paths alias points to `../shared/*`. |
| Backend fails to start | Check `.env.local` has `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `CLERK_SECRET_KEY`. |

---

## Integration Points

| Integration | How |
|-------------|-----|
| Methodology (Stage 1) | Gather stage follows discuss pattern from `methodology/workflow.md` |
| MCP Bridge (Stage 2) | Follows `mcp-bridge/spoke-planning.md` for context retrieval |
| Templates (Stage 3) | Uses all templates from `templates/` directory |
| Contract (Stage 3) | Copies `contract/types.ts` into the project |
| Standards (Stage 3) | Every file satisfies standards retrieved from MCP |
| MCP Bridge (Stage 4) | Calls `register_project` and follows `mcp-bridge/post-operation.md` |

---

## Relationship to Other Rules

- **`sdk/new-project.md`** — The original step-by-step scaffold rule. `scaffold-flow.md`
  supersedes it with a fully automated, MCP-integrated flow. `new-project.md` remains
  as a reference for manual scaffold steps.
- **`sdk/new-project-from-blueprint.md`** — Extends this flow with Wireframe Builder
  export data. Runs `scaffold-flow.md` first, then applies blueprint-specific generation.
- **`mcp-bridge/spoke-planning.md`** — Stage 2 follows this rule for MCP context.
- **`mcp-bridge/post-operation.md`** — Stage 4 follows this rule for knowledge capture.
- **`methodology/workflow.md`** — The scaffold flow embodies the discuss/plan/execute
  methodology within a single command.
