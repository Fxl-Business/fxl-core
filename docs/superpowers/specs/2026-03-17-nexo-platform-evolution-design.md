# Nexo Platform Evolution — Design Spec

**Date:** 2026-03-17
**Author:** Cauet + Claude
**Status:** Draft
**Scope:** Rebrand to Nexo, super admin panel, docs separation, tenant onboarding

---

## 1. Context

The platform currently called "FXL Core" / "Nucleo FXL" needs to become a standalone product
independent of the FXL brand. FXL is the company that uses this product — not the product itself.

Additionally, three structural gaps need addressing:
- Documentation of the company (FXL process) is mixed with documentation of the product
- There is no super admin layer for managing tenants, global configs, and product docs
- Tenant onboarding is hardcoded (`org_fxl_default`) rather than a real self-service flow

## 2. Decisions Made

| Decision | Value |
|----------|-------|
| Product name | **Nexo** |
| FXL SDK name | Unchanged (FXL is the company name, not the product) |
| Super admin model | Single user (Cauet), Clerk custom claim `super_admin: true` |
| Admin access pattern | Same app, `/admin/*` routes, toggle between admin and operator mode |
| Docs separation | `scope: 'tenant' | 'product'` column on `documents` table |
| Tenant onboarding | Clerk Organizations with real org_id, no more `org_fxl_default` |
| MCP integrations | Supabase MCP + Clerk MCP configured for Claude Code super admin ops |

## 3. Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Nexo (app unica)                  │
│                                                      │
│  ┌──────────────┐   ┌────────────────────────────┐  │
│  │  /admin/*     │   │  / (operador logado)        │  │
│  │  Super Admin  │   │  Tenant-scoped              │  │
│  │               │   │                              │  │
│  │  - Tenants    │   │  - Home (modulos ativos)    │  │
│  │  - Modulos    │   │  - Docs da empresa          │  │
│  │  - Metricas   │   │  - Tarefas                  │  │
│  │  - Docs prod  │   │  - Clients/Wireframe        │  │
│  │  - Connectors │   │  - Connectors               │  │
│  │  - Feat flags │   │  - Docs do produto (read)   │  │
│  └──────┬───────┘   └──────────┬─────────────────┘  │
│         │                       │                     │
│         ▼                       ▼                     │
│  ┌─────────────────────────────────────────────────┐ │
│  │         Supabase (RLS por org_id)               │ │
│  │  tenant_modules │ documents │ tasks │ connectors│ │
│  └─────────────────────────────────────────────────┘ │
│         │                                            │
│         ▼                                            │
│  ┌─────────────┐                                     │
│  │ Clerk Auth   │  role: super_admin | admin | member│
│  └─────────────┘                                     │
└─────────────────────────────────────────────────────┘
```

### Roles

| Role | Scope | Can do |
|------|-------|--------|
| `super_admin` | Global | All `/admin/*` routes, manage all tenants, product docs CRUD, feature flags |
| `admin` | Tenant | Manage own org's users, see own modules, create enterprise docs |
| `member` | Tenant | Use enabled modules, read product docs, read enterprise docs |

### Docs — Two Layers

| Layer | Scope | Managed by | Stored as |
|-------|-------|------------|-----------|
| Product docs | Global | Super admin via `/admin/product-docs` | `documents` with `scope = 'product'`, no `org_id` filter |
| Enterprise docs | Per tenant | Tenant admin via normal docs UI | `documents` with `scope = 'tenant'`, filtered by `org_id` |

## 4. Milestones

### v4.0 — Rebrand Nexo

**Goal:** Rename the product from "FXL Core" / "Nucleo FXL" to "Nexo" across the entire codebase.
Zero functional change.

**What changes:**
- `package.json` name field
- UI: titles, headers, auth pages, login/signup branding
- `CLAUDE.md` — product references
- `.planning/PROJECT.md` — "What This Is" section
- Tab title / meta tags
- Any hardcoded "FXL Core" or "Nucleo FXL" strings in components

**What does NOT change:**
- Folder names on filesystem (repo stays `fxl-core/`)
- MODULE_IDS, registry internal names
- FXL SDK skill name (FXL is the company)
- GitHub repo name

**Estimated phases:** 1-2

---

### v4.1 — Super Admin

**Goal:** Global admin panel for Cauet to manage the entire platform.

**Role check:**
- Clerk custom claim `super_admin: true` on user metadata
- `<SuperAdminRoute>` component checks claim (like `<ProtectedRoute>`)
- All `/admin/*` routes protected

**Admin panel routes:**

| Route | Purpose |
|-------|---------|
| `/admin` | Dashboard — aggregate metrics (tenants, users, active modules) |
| `/admin/tenants` | Tenant list — Clerk orgs CRUD (create, deactivate, details) |
| `/admin/tenants/:orgId` | Tenant detail — enabled modules, metrics, connectors |
| `/admin/modules` | Global module catalog (existing, evolves) |
| `/admin/connectors` | Global connector management (existing, migrates here) |
| `/admin/product-docs` | Product docs CRUD (placeholder for v4.2) |
| `/admin/settings` | Feature flags, global configs |

**Supabase migrations:**
- `platform_settings` table — key/value for global configs and feature flags

**Module management evolution:**
- Currently: localStorage toggle in `/admin/modules` (per-browser, local)
- After: super admin configures via `tenant_modules` in Supabase (persistent, per-org)
- Tenant operators cannot change — they only see modules the super admin enabled

**Admin/Operator toggle:**
- Topbar shows icon/button when user has `super_admin` claim
- Toggle between "Admin" mode (global) and "Operator" mode (tenant-scoped, e.g., FXL)

**MCP integrations:**
- Supabase MCP server configured in `.claude/settings.json` — query data, manage tenants
- Clerk MCP server configured — manage users, orgs, claims directly from Claude Code
- Documented in CLAUDE.md and/or `docs/processo/`
- Complementary to web UI, not a replacement

**Estimated phases:** 4-5

---

### v4.2 — Docs do Sistema (Product Docs)

**Goal:** Separate enterprise docs (tenant-scoped) from product docs (global).

**Data model change:**
- Add `scope` column to `documents` table: `'tenant'` (default) or `'product'`
- `scope = 'product'` → visible to all tenants, read-only, no `org_id` filter
- `scope = 'tenant'` → existing behavior, filtered by `org_id` via RLS

**Management:**
- Product docs: super admin creates/edits via `/admin/product-docs`
- Enterprise docs: tenant admin creates/edits via normal docs interface

**Sidebar for operators:**
```
Nexo
├── Home
├── Docs da Empresa        ← tenant-scoped
│   ├── Processo
│   ├── Padroes
│   └── Ferramentas
├── Docs do Produto        ← global, read-only
│   ├── Como usar o SDK
│   ├── Spoke Onboarding
│   └── Connectors
├── Tarefas
├── Clientes
├── Conectores
└── ...
```

**Migration of existing docs:**
- `docs/processo/`, `docs/ferramentas/`, `docs/padroes/` (FXL process content) → enterprise docs for tenant FXL
- `docs/processo/spoke-onboarding.md`, SDK documentation → product docs (global)

**Estimated phases:** 2-3

---

### v4.3 — Tenant Onboarding

**Goal:** Real self-service flow for new companies to create accounts.

**User flow:**
1. Access Nexo → Clerk login/signup
2. Create account → Clerk creates user
3. First login, no org → "Criar Empresa" screen
4. Fill company name → Clerk creates Organization, user becomes admin
5. Super admin (Cauet) enables modules for the tenant (via panel or MCP)
6. User returns → sees Home with active modules

**FXL as real tenant:**
- Migrate from hardcoded `org_fxl_default` to real Clerk Organization
- Existing data (documents, tasks, etc.) receives new `org_id`
- `VITE_AUTH_MODE=anon` flag removed — everything runs with real org

**What's included:**
- "Criar Empresa" screen (org creation via Clerk)
- "Sem modulos" screen (when tenant exists but super admin hasn't enabled anything)
- Migration to move data from `org_fxl_default` to real org
- Remove `VITE_AUTH_MODE` flag and anon fallbacks

**Estimated phases:** 2-3

## 5. Dependency Graph

```
v4.0 (Rebrand Nexo) ──► v4.1 (Super Admin) ──► v4.2 (Product Docs)
                                             └──► v4.3 (Tenant Onboarding)
```

- v4.0 is prerequisite for all (everything starts with the right name)
- v4.1 is prerequisite for v4.2 (super admin manages product docs) and v4.3 (super admin enables modules)
- v4.2 and v4.3 are independent of each other — can run in parallel

## 6. Out of Scope

| Feature | Reason |
|---------|--------|
| Billing / payments | Future — no revenue model yet |
| Self-service module marketplace | Future — super admin controls modules manually |
| Custom domains per tenant | Future — single domain for now |
| Tenant-level branding/theming | Future — Nexo has one visual identity |
| Spoke work (Sitio Santa Cruz) | Separate repo, guided by FXL SDK skill |
| Mobile app | Web-first |
| Real-time collaboration (CRDT) | Future |

## 7. Technical Details — Auth & RLS

### 7.1 Super Admin Claim Delivery

The `super_admin` flag uses Clerk's `publicMetadata` (readable client-side via `useUser()`):

```json
// Clerk user publicMetadata
{ "super_admin": true }
```

For Supabase RLS to see it, the Clerk JWT template must include it as a custom claim:
```json
// Clerk JWT template for Supabase
{
  "sub": "{{user.id}}",
  "org_id": "{{org.id}}",
  "role": "{{org_membership.role}}",
  "super_admin": "{{user.public_metadata.super_admin}}"
}
```

Frontend reads via `useUser().publicMetadata.super_admin`.

### 7.2 Super Admin RLS Bypass

The super admin needs to query across all orgs (e.g., list all tenants' modules, metrics).
Strategy: **add `super_admin` check to RLS policies**.

Updated RLS expression (all tables):
```sql
-- Allow access if: user's org matches row's org, OR user is super_admin, OR anon fallback
CREATE POLICY "table_org_access" ON public.table_name
  FOR ALL TO anon, authenticated
  USING (
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );
```

This means: if JWT has `super_admin = true`, allow all rows. Otherwise, filter by `org_id`.
No service-role key needed. No Edge Function proxy. Pure RLS.

### 7.3 Product Docs RLS

Product docs (`scope = 'product'`) are visible to everyone regardless of `org_id`.

Updated RLS for `documents` table:
```sql
CREATE POLICY "documents_access" ON public.documents
  FOR SELECT TO anon, authenticated
  USING (
    -- Product docs: visible to all
    scope = 'product'
    OR
    -- Super admin: sees everything
    COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin',
      'false'
    ) = 'true'
    OR
    -- Tenant docs: filtered by org_id
    org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id',
      org_id
    )
  );

-- Only super admin can INSERT/UPDATE/DELETE product docs
-- Tenant admins can only manage their own org's docs
CREATE POLICY "documents_write" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK (
    (scope = 'product' AND COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'super_admin', 'false'
    ) = 'true')
    OR
    (scope = 'tenant' AND org_id = COALESCE(
      nullif(current_setting('request.jwt.claims', true), '')::jsonb->>'org_id', org_id
    ))
  );
```

### 7.4 Connector Scoping

Connectors are tenant-scoped via `tenant_modules` (which already has `org_id` and RLS).
Each tenant configures its own connectors. The super admin can see all connectors across orgs
via the RLS bypass (section 7.2).

Operator view (`/apps/*`) shows only their org's connectors.
Admin view (`/admin/connectors`) shows all connectors across all orgs.

### 7.5 v4.3 Migration Strategy

Migrating from `org_fxl_default` to a real Clerk org is a sequential process:

1. **Create real Clerk org** for FXL (via MCP or Dashboard) → get `org_id` (e.g., `org_abc123`)
2. **Run SQL migration** — `UPDATE ... SET org_id = 'org_abc123' WHERE org_id = 'org_fxl_default'` on all tables
3. **Verify** — all data accessible under new org
4. **Remove anon fallback** — update RLS policies to remove COALESCE fallback, remove `VITE_AUTH_MODE`

Rollback: if step 2 fails, re-run with `SET org_id = 'org_fxl_default'`. The COALESCE fallback
in RLS ensures anon access still works until step 4, so there's no data-loss window.

## 8. Acceptance Criteria per Milestone

### v4.0 — Rebrand Nexo
- Zero grep results for `"FXL Core"` or `"Nucleo FXL"` in `src/` (excluding SDK references)
- Login/signup pages show "Nexo" branding
- Browser tab shows "Nexo"
- `CLAUDE.md` references "Nexo" as product name
- `npx tsc --noEmit` zero errors

### v4.1 — Super Admin
- User with `publicMetadata.super_admin = true` can access `/admin/*`
- User without the claim gets redirected from `/admin/*`
- `/admin/tenants` lists all Clerk orgs
- `/admin/tenants/:orgId` shows modules enabled for that org
- Module toggles in admin panel persist to `tenant_modules` in Supabase
- Supabase MCP and Clerk MCP configured and documented
- `npx tsc --noEmit` zero errors

### v4.2 — Docs do Sistema
- `documents` table has `scope` column with default `'tenant'`
- Product docs visible to all tenants in sidebar (read-only)
- Super admin can CRUD product docs via `/admin/product-docs`
- Existing FXL process docs migrated to tenant scope
- Existing SDK/onboarding docs migrated to product scope
- `npx tsc --noEmit` zero errors

### v4.3 — Tenant Onboarding
- New user without org sees "Criar Empresa" screen
- Creating empresa creates Clerk org and assigns user as admin
- Tenant without enabled modules sees "Sem modulos" screen
- FXL data migrated from `org_fxl_default` to real Clerk org
- `VITE_AUTH_MODE` flag removed
- COALESCE anon fallback removed from RLS
- `npx tsc --noEmit` zero errors

## 9. Open Questions

None — all decisions made during brainstorming.

---

*This spec supersedes the v3.4/v3.5 milestones from the previous design spec
(`2026-03-16-fxl-platform-evolution-design.md`). Spoke onboarding is now a process doc,
not a milestone. The platform evolution continues with v4.0-v4.3.*
