# FXL Standards for Spoke Projects

## Stack

Every FXL spoke project uses this stack. Do not deviate without explicit approval.

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | React | 18.x |
| Language | TypeScript | 5.x (strict: true) |
| Styling | Tailwind CSS | 3.x |
| Components | shadcn/ui | latest |
| Build | Vite | 5.x |
| Backend | Hono | 4.x |
| Shared Types | TypeScript | 5.x |
| Database | Supabase | @supabase/supabase-js 2.x |
| Auth | Clerk | @clerk/react 6.x (frontend) / @clerk/backend 1.x (backend) |
| Icons | lucide-react | latest |
| Runtime / Package Manager | Bun | 1.x |
| Deploy (frontend) | Vercel | — |
| Deploy (backend) | Railway / Fly.io | — |
| CI | GitHub Actions | — |

## Architecture Rule

**The React frontend NEVER calls Supabase directly.**
All data access goes through the Hono backend. The backend is the single entry point
for all data and business logic.

```
Browser (React) → Hono Backend → Supabase
```

The frontend communicates with the backend via a typed HTTP client (`frontend/src/lib/api-client.ts`).
The backend holds the Supabase service role key — it is never exposed to the browser.

## Project Structure

```
spoke-project/                    ← monorepo root
  CLAUDE.md
  package.json                    ← workspace root (bun workspaces)
  .github/workflows/ci.yml
  .env.example                    ← documents ALL required vars (backend + frontend)
  frontend/                       ← React app
    package.json
    tsconfig.json
    vite.config.ts
    tailwind.config.ts
    vercel.json                   ← security headers + SPA rewrite
    src/
      main.tsx
      App.tsx
      components/
        ui/                       ← shadcn/ui
        layout/
        [domain]/
      pages/
      hooks/
      lib/
        api-client.ts             ← typed HTTP client calling backend
      types/                      ← frontend-only types
      styles/
        globals.css
  backend/                        ← Hono API server
    package.json
    tsconfig.json
    src/
      index.ts                    ← Hono app entry point
      server.ts                   ← Node.js server (for standalone deploy)
      routes/
        fxl/                      ← FXL contract endpoints (NOT in frontend)
          manifest.ts
          entities.ts
          widgets.ts
          search.ts
          health.ts
        [domain]/                 ← domain-specific routes
      middleware/
        auth.ts                   ← Clerk JWT validation
        fxl-api-key.ts            ← X-FXL-Api-Key validation for Hub
        logger.ts
      services/                   ← business logic + Supabase queries
      lib/
        supabase.ts               ← Supabase client (service role, server-side only)
        clerk.ts                  ← Clerk backend client
  shared/
    package.json
    tsconfig.json
    types/
      index.ts                    ← all shared interfaces exported here
      [domain].ts                 ← domain entity interfaces
      fxl-contract.ts             ← FXL contract types (NOT in frontend)
  supabase/
    migrations/
  fxl-doctor.sh                   ← CI health check (runs from root)
```

## Code Conventions

### TypeScript

- `strict: true` in tsconfig.json — no exceptions
- NEVER use `any` — use `unknown` and narrow with type guards
- NEVER use `@ts-ignore` or `@ts-nocheck` in application code
- Export types from dedicated `types/` files
- Use interface for object shapes, type for unions/intersections
- Prefer `const` assertions for literal types

### React

- Functional components only (no class components)
- Named exports (not default exports)
- Hooks follow `use` prefix convention
- Props interface named `{Component}Props`
- Colocate hooks and utils with their component when single-use
- Extract to `hooks/` or `lib/` when shared

### Backend

- Route files: kebab-case (`reservation-routes.ts`)
- Service files: kebab-case with -service suffix (`reservation-service.ts`)
- Middleware files: kebab-case (`auth.ts`, `logger.ts`)
- Every route handler delegates business logic to a service — no Supabase queries inline in routes
- Validate all inputs with Zod before passing to services
- Return consistent error shapes: `{ error: string, statusCode: number }`

### Naming

| What | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `ReservationCard.tsx` |
| Hooks | camelCase with use- prefix | `useReservations.ts` |
| Utilities | camelCase | `formatCurrency.ts` |
| Types | PascalCase | `Reservation.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |
| CSS classes | Tailwind utilities | `className="flex items-center"` |
| Route files | kebab-case | `reservation-routes.ts` |
| Service files | kebab-case + -service suffix | `reservation-service.ts` |
| API routes | kebab-case | `/api/fxl/entities` |
| Database tables | snake_case | `reservations` |
| Database columns | snake_case | `check_in_date` |

### Imports

- Use path aliases: `@/components/`, `@/lib/`, `@/types/` (frontend and backend)
- Use `@shared/*` alias in backend to reference `shared/` types
- Group imports: React -> external libs -> internal modules -> types
- No circular imports
- No barrel exports (index.ts re-exports) unless intentional

### Commit Convention

- `feat: [description]` — new feature
- `fix: [description]` — bug fix
- `refactor: [description]` — code cleanup
- `chore: [description]` — config, tooling
- `docs: [description]` — documentation

## Security Rules

### Environment Variables

- ALL secrets in `.env.local` (NEVER committed)
- `.env.example` committed with placeholder values for ALL vars (backend + frontend)
- Frontend vars MUST be prefixed with `VITE_` (Vite exposes these to the browser)
- Backend vars have NO `VITE_` prefix — they are server-side only
- `SUPABASE_SERVICE_ROLE_KEY` is a backend-only secret — NEVER prefix with `VITE_`

Required env vars:

```
# Backend (server-side only — never expose to browser)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...    ← server-side only, NEVER in frontend
CLERK_SECRET_KEY=sk_live_...        ← server-side only
FXL_API_KEY=<generated-key>         ← Hub authentication
FRONTEND_URL=http://localhost:5173
PORT=3000

# Frontend (VITE_ prefix — safe for browser)
VITE_BACKEND_URL=https://api.{slug}.fxl.app
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_SUPABASE_URL=https://xxx.supabase.co  ← only if Realtime subscriptions needed
VITE_SUPABASE_ANON_KEY=eyJ...              ← only if Realtime subscriptions needed
```

### Auth

- Clerk is the auth provider for the spoke's own UI (independent from Hub)
- Backend validates Clerk JWT on every authenticated request via `auth.ts` middleware
- Hub authenticates to spoke via API key in `X-FXL-Api-Key` header
- Spoke generates API key (`openssl rand -base64 32`) and stores it as `FXL_API_KEY` env var
- `fxl-api-key.ts` middleware validates `X-FXL-Api-Key` header on all `/api/fxl/*` data endpoints
- Hub stores the spoke's API key in connector config (Supabase `tenant_modules` table)
- Hub sends `org_id` as query parameter; spoke trusts it only after validating the API key
- Manifest and health endpoints are public (no API key required)

### Supabase Access

- Frontend NEVER uses Supabase service role key (backend-only)
- All Supabase queries from backend use service role key for full access
- Frontend uses Clerk publishable key only (no secret key in browser)
- Backend is the only service that reads/writes Supabase
- RLS is still ENABLED on every table — defense in depth
- Every table has `org_id text NOT NULL` column
- RLS policy filters by `org_id` from JWT claims
- See `../checklists/rls-checklist.md` for verification steps

### Security Headers

Set in `frontend/vercel.json`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Input Validation

- Validate all user input on the server side (backend)
- Use Zod for schema validation in backend routes
- Sanitize output (React handles XSS by default, but be careful with `dangerouslySetInnerHTML`)
- Paginate all list endpoints (max 100 items per page)

## Quality Gates

Before considering any task complete, run from monorepo root:

```bash
bunx tsc --noEmit     # zero errors
bunx eslint .         # zero errors
bunx prettier --check . # zero errors
bash fxl-doctor.sh    # all checks pass
```

Zero TypeScript errors is the primary acceptance criterion.
