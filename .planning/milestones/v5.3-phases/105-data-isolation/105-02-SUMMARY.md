---
plan: 105-02
status: complete
completed: 2026-03-18
---

# Summary: Plan 105-02 — Supabase Migration: clients table

## What was built

Created `clients` table in Supabase with `org_id TEXT NOT NULL`, unique constraint on `(slug, org_id)`, RLS enabled, and 4 operation-specific policies (select/insert/update/delete) following the strict pattern from migration 013 (super_admin bypass + strict JWT org_id match, no anon fallback). Added index on `org_id`. Seeded `financeiro-conta-azul` with `org_id = 'org_fxl_default'` (idempotent — ON CONFLICT DO NOTHING). Phase 106 will re-associate to the real org_id.

## Key files

### Created
- `supabase/migrations/016_clients_table.sql` — full DDL with RLS and seed

### Applied to Supabase
- Migration applied successfully via MCP
- Table `public.clients` visible in table listing with `rls_enabled: true`, `rows: 1`

## Deviations

None.

## Self-Check: PASSED

- `clients` table exists in Supabase with RLS enabled
- Seed row for `financeiro-conta-azul` present (1 row count confirmed)
- Migration file at `supabase/migrations/016_clients_table.sql`
