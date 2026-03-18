# Structure Checklist

Verify project directory structure and organization against FXL standards.

## Root Files

- [ ] **[Important]** `CLAUDE.md` exists with project-specific rules
- [ ] **[Important]** `package.json` has `fxlContractVersion` field
- [ ] **[Important]** `package.json` has `fxlAppId` field
- [ ] **[Important]** `tsconfig.json` exists with `strict: true`
- [ ] **[Normal]** `eslint.config.js` exists (flat config format)
- [ ] **[Normal]** `prettier.config.js` exists
- [ ] **[Normal]** `vercel.json` exists
- [ ] **[Normal]** `fxl-doctor.sh` exists and is executable
- [ ] **[Normal]** `.env.example` exists
- [ ] **[Normal]** `.gitignore` includes `.env.local`

## Directory Layout

- [ ] **[Important]** `src/` is the source root
- [ ] **[Important]** `src/components/ui/` contains shadcn/ui components
- [ ] **[Important]** `src/components/layout/` contains shell components (header, sidebar, etc.)
- [ ] **[Important]** `src/types/` contains shared type definitions
- [ ] **[Important]** `src/types/fxl-contract.ts` contains contract types
- [ ] **[Normal]** `src/pages/` contains route page components
- [ ] **[Normal]** `src/hooks/` contains shared custom hooks
- [ ] **[Normal]** `src/lib/` contains utilities and service modules
- [ ] **[Normal]** `src/styles/` contains global styles
- [ ] **[Normal]** `supabase/migrations/` contains SQL migration files

## Contract API Structure

- [ ] **[Important]** `src/api/fxl/` directory exists (or `api/fxl/` for Vercel serverless)
- [ ] **[Important]** Manifest endpoint implemented
- [ ] **[Important]** Entity list endpoint implemented
- [ ] **[Important]** Entity detail endpoint implemented
- [ ] **[Important]** Widget data endpoint implemented
- [ ] **[Important]** Search endpoint implemented
- [ ] **[Important]** Health endpoint implemented

## CI/CD

- [ ] **[Important]** `.github/workflows/ci.yml` exists
- [ ] **[Normal]** CI workflow runs on push to main and PRs
- [ ] **[Normal]** CI workflow runs `fxl-doctor.sh`
- [ ] **[Normal]** CI workflow runs `bun run build`

## Naming Conventions

- [ ] **[Normal]** Components use PascalCase filenames (e.g., `ReservationCard.tsx`)
- [ ] **[Normal]** Hooks use camelCase with `use` prefix (e.g., `useReservations.ts`)
- [ ] **[Normal]** Services use camelCase with `-service` suffix (e.g., `reservation-service.ts`)
- [ ] **[Normal]** Type files use PascalCase (e.g., `Reservation.ts`)
- [ ] **[Normal]** No default exports (named exports only)

## Import Patterns

- [ ] **[Normal]** Path aliases configured (`@/` maps to `src/`)
- [ ] **[Normal]** Path aliases used consistently (no relative `../../../` imports)
- [ ] **[Normal]** Type imports use `import type` syntax
- [ ] **[Info]** No circular imports detected

## Scoring

| Severity | Weight |
|----------|--------|
| Important | 5 |
| Normal | 2 |
| Info | 0 |
