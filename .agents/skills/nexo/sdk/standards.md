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
| Database | Supabase | @supabase/supabase-js 2.x |
| Auth | Clerk | @clerk/react 6.x (independent from Hub) |
| Icons | lucide-react | latest |
| Deploy | Vercel | — |
| CI | GitHub Actions | — |

## Project Structure

```
spoke-project/
  CLAUDE.md                    <- generated from template, project-specific rules
  package.json                 <- includes fxlContractVersion field
  tsconfig.json                <- strict: true, paths aliases
  eslint.config.js             <- flat config
  prettier.config.js
  tailwind.config.ts
  vercel.json                  <- security headers
  fxl-doctor.sh                <- CI health check
  .github/
    workflows/
      ci.yml                   <- runs fxl-doctor.sh on push/PR
  .env.local                   <- NEVER committed
  .env.example                 <- committed, documents required vars
  src/
    main.tsx                   <- app entry
    App.tsx                    <- router + providers
    api/                       <- FXL contract endpoints
      fxl/
        manifest.ts            <- GET /api/fxl/manifest
        entities.ts            <- GET /api/fxl/entities/:type
        widgets.ts             <- GET /api/fxl/widgets/:id/data
        search.ts              <- GET /api/fxl/search?q=
        health.ts              <- GET /api/fxl/health
    components/
      ui/                      <- shadcn/ui components
      layout/                  <- shell: header, sidebar, footer
      [domain]/                <- domain-specific components
    pages/                     <- route pages
    hooks/                     <- custom hooks
    lib/                       <- utilities, supabase client, auth helpers
    types/                     <- shared TypeScript types
      fxl-contract.ts          <- copied from SDK contract/types.ts
    styles/
      globals.css              <- Tailwind directives + custom styles
  supabase/
    migrations/                <- SQL migrations
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

### Naming

| What | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `ReservationCard.tsx` |
| Hooks | camelCase with use- prefix | `useReservations.ts` |
| Utilities | camelCase | `formatCurrency.ts` |
| Types | PascalCase | `Reservation.ts` |
| Constants | UPPER_SNAKE_CASE | `MAX_PAGE_SIZE` |
| CSS classes | Tailwind utilities | `className="flex items-center"` |
| API routes | kebab-case | `/api/fxl/entities` |
| Database tables | snake_case | `reservations` |
| Database columns | snake_case | `check_in_date` |

### Imports

- Use path aliases: `@/components/`, `@/lib/`, `@/types/`
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
- `.env.example` committed with placeholder values
- Prefix client-side vars with `VITE_` (Vite exposes these to browser)
- Server-side secrets (Supabase service key, Clerk secret) NEVER prefixed with `VITE_`

Required env vars for every spoke:
```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
FXL_API_KEY=<generated-key>            # server-side only, NO VITE_ prefix
```

### Auth

- Clerk is the auth provider for the spoke's own UI (independent from Hub — NOT shared)
- Hub authenticates to spoke via API key in `X-FXL-API-Key` header
- Spoke generates API key (`openssl rand -base64 32`) and stores it as `FXL_API_KEY` env var
- Spoke middleware validates `X-FXL-API-Key` header on all `/api/fxl/*` data endpoints
- Hub stores the spoke's API key in connector config (Supabase `tenant_modules` table)
- Hub sends `org_id` as query parameter; spoke trusts it only after validating the API key
- `FXL_API_KEY` is a server-side secret — NEVER prefix with `VITE_`
- Manifest and health endpoints are public (no API key required)

### Supabase RLS

- RLS ENABLED on every table — no exceptions
- Every table has `org_id text NOT NULL` column
- RLS policy filters by `org_id` from JWT claims
- Test RLS by querying as different orgs
- See `../checklists/rls-checklist.md` for verification steps

### Security Headers

Set in `vercel.json`:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### Input Validation

- Validate all user input on the server side
- Use Zod for schema validation
- Sanitize output (React handles XSS by default, but be careful with `dangerouslySetInnerHTML`)
- Paginate all list endpoints (max 100 items per page)

## Quality Gates

Before considering any task complete:

```bash
npx tsc --noEmit          # zero errors
npx eslint .              # zero errors
npx prettier --check .    # zero errors
bash fxl-doctor.sh        # all checks pass
```

Zero TypeScript errors is the primary acceptance criterion.
