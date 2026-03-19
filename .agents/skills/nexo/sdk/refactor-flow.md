# Refactor Flow — Existing Project to FXL Compliance

## When to Use

When the user has an existing project (built with Lovable, another tool, or from scratch)
and wants to bring it into full FXL compliance as a spoke. This is the guided flow that
orchestrates audit → roadmap → execution for existing codebases.

For new projects created from scratch, use `scaffold-flow.md` instead.

---

## Overview

The refactor flow has 5 stages:

1. **Gather** — Collect information about the existing project
2. **Context** — Fetch MCP knowledge (standards, pitfalls, learnings)
3. **Audit** — Scan the project and produce `FXL-AUDIT.md`
4. **Roadmap** — Convert audit findings into an ordered GSD refactor plan
5. **Register** — Register the project in the MCP knowledge base

---

## Stage 1: Gather

Prompt the user for the following. Accept short answers — this is a discovery session, not a form.

### Required Inputs

| Input | Prompt |
|-------|--------|
| `project_slug` | "What is the project slug? (e.g., aluga-flow)" |
| `project_name` | "Full project name?" |
| `project_description` | "One-line description of what it does?" |
| `source` | "How was this project built? (Lovable / custom / other tool)" |

### Origin Assessment

If `source` is Lovable, automatically note these likely issues (do not ask the user — just register internally):
- TypeScript likely lenient (`strict: false`, `noImplicitAny: false`)
- Supabase Auth instead of Clerk
- `user_id`-based isolation instead of `org_id`
- Default exports scattered throughout
- No CLAUDE.md, no CI, no `vercel.json` security headers
- Public SELECT on all tables (RLS not enforced for reads)

### Auth Migration Decision

Ask explicitly:

> "This project uses {detected_auth}. Nexo SDK standard is Clerk. Do you want to migrate to Clerk, or keep the existing auth?"

| Choice | Implication |
|--------|-------------|
| Migrate to Clerk | Full auth swap — adds Step 4 (Security Hardening) as highest priority |
| Keep existing auth | Note as a deviation from SDK standard in `FXL-AUDIT.md` and `CLAUDE.md` |

### Preservation Decision

Ask:

> "What do you want to preserve from the existing codebase?"
> Options: (A) Full rewrite using existing project as visual reference
> (B) Surgical refactor — keep working logic, fix structure and compliance
> (C) Keep everything, only add FXL contract endpoints

| Choice | Refactor Depth |
|--------|---------------|
| A — Full rewrite | `refactor.md` Steps 1–8, likely rewriting most files |
| B — Surgical | `refactor.md` Steps 1–8, preserving business logic and UI markup |
| C — Contract only | `sdk/connect.md` only, minimal structural changes |

Store: `project_slug`, `project_name`, `project_description`, `source`, `auth_decision`, `preservation_mode`.

---

## Stage 2: Context (MCP Integration)

Before auditing or touching any file, gather context from the MCP knowledge base
AND from the platform MCPs (Clerk + Supabase).

### GSD Codebase Mapping

Before auditing files manually, run `gsd:map-codebase` inside the spoke project directory.
This produces structured analysis documents in `.planning/codebase/` covering architecture,
tech stack, quality, and concerns — which the audit stage uses as input.

### Platform MCP Context

Load Clerk patterns relevant to B2B/org refactor:

```
mcp__clerk__clerk_sdk_snippet(slug: "b2b-saas")
mcp__clerk__list_clerk_sdk_snippets(tag: "organizations")
```

Invoke **clerk-orgs** and **clerk-setup** skills — authoritative source for
Clerk JWT templates, org_id propagation, and React hooks.

Load Supabase schema from the live project (if credentials are available):

```
mcp__supabase__list_tables()
```

This gives the real schema to audit against, instead of relying on file inspection alone.

Follow `mcp-bridge/pre-operation.md` in full, then additionally:

```
mcp__fxl-sdk__get_standards(category: "stack")
mcp__fxl-sdk__get_standards(category: "security")
mcp__fxl-sdk__get_standards(category: "database")
mcp__fxl-sdk__get_checklist(name: "security")
mcp__fxl-sdk__get_checklist(name: "rls")
mcp__fxl-sdk__get_checklist(name: "typescript")
mcp__fxl-sdk__get_checklist(name: "structure")
mcp__fxl-sdk__get_checklist(name: "contract")
mcp__fxl-sdk__get_project_config(slug: "{project_slug}")
```

If `get_project_config` returns an existing record, warn the user:
> "This project is already registered in the Nexo SDK knowledge base. Proceeding will update its config."

Store all retrieved context. Use it throughout the audit and roadmap generation.

---

## Stage 3: Audit

Run the full audit procedure from `sdk/audit.md`. This produces `FXL-AUDIT.md` at project root.

### Audit Scope by Preservation Mode

| Mode | Audit Depth |
|------|------------|
| A — Full rewrite | Focus on schema (keep) + UI inventory (reference). Code quality less relevant. |
| B — Surgical | Full audit across all 5 checklists. Every gap is a refactor task. |
| C — Contract only | Focus on contract checklist + security headers only. |

### Additional Checks for Lovable Projects

Beyond the standard checklists, also verify:

- [ ] Auth provider: Supabase Auth vs Clerk
- [ ] Multi-tenancy column: `user_id` vs `org_id` on all tables
- [ ] RLS SELECT policies: `USING (true)` or open read = critical issue
- [ ] Default exports: grep for `export default` in `src/`
- [ ] Hardcoded credentials: check `.env` committed to repo (not just `.env.local`)
- [ ] `fxlContractVersion` and `fxlAppId` absent from `package.json`

### Audit Output

`FXL-AUDIT.md` following the format in `sdk/audit.md`, plus an additional section:

```markdown
## Migration Notes

**Auth:** {current auth} → {target: Clerk / keep current}
**Multi-tenancy:** {current: user_id / org_id} → {target: org_id}
**Preservation mode:** {A / B / C}
**Estimated refactor effort:** {small / medium / large}

## What to Keep

{Explicit list of files/components worth preserving verbatim or with minor changes}

## What to Rewrite

{Explicit list of files/components that should be rewritten from scratch}
```

---

## Stage 4: Roadmap

Convert `FXL-AUDIT.md` findings into an ordered, GSD-ready refactor plan.

### Ordering Rules

The roadmap must follow `sdk/refactor.md` step order. Do not reorder for convenience — the steps have dependencies:

| GSD Phase | Refactor Step | When Required |
|-----------|--------------|---------------|
| Phase 1 | TypeScript config + strict mode | Always |
| Phase 2 | Project structure + imports | Always |
| Phase 3 | Config files (eslint, prettier, vercel, fxl-doctor) | Always |
| Phase 4 | Security hardening (auth migration + RLS + org_id) | Always — auth migration first if Clerk |
| Phase 4b | Add Hono backend (if no backend exists) | When project has no dedicated backend |
| Phase 5 | Supabase client refactor | Always |
| Phase 6 | Component quality (exports, props, dead code) | Mode B or A |
| Phase 7 | FXL contract endpoints | Always — follow `sdk/connect.md` |
| Phase 8 | CI/CD setup | Always — follow `sdk/ci-cd.md` and `sdk/deploy.md` |

**For Mode C (contract only):** Only Phases 3, 4b, 7, 8 are required.

### Phase 4b: Add Hono Backend (if no backend exists)

If the existing project has no dedicated backend (React frontend calling Supabase directly):

1. Scaffold `backend/` directory with Hono following `scaffold-flow.md` Steps 3.3–3.5
2. Scaffold `shared/` directory following `scaffold-flow.md` Steps 3.4 and 3.7
3. Create `frontend/src/lib/api-client.ts` (see `scaffold-flow.md` Step 3.6)
4. Move FXL contract endpoints from `frontend/src/api/fxl/` to `backend/src/routes/fxl/`
5. Migrate Supabase queries from React components/hooks → `backend/src/services/`
6. Update frontend to call backend via `apiClient` instead of Supabase directly
7. Remove `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from frontend env
   (keep only if the frontend uses Supabase Realtime subscriptions)
8. Update root `package.json` to use bun workspaces (`frontend`, `backend`, `shared`)
9. Update `.env.example` to document both backend and frontend vars
10. Update `CLAUDE.md` to reflect new monorepo structure

**Verification after Phase 4b:**
```bash
bun run type-check        # zero errors in all packages
# Confirm: no `import { supabase }` or `createClient` calls in frontend/src/
# Confirm: SUPABASE_SERVICE_ROLE_KEY is not prefixed with VITE_
```

### GSD Integration

After generating the roadmap, initialize the GSD project structure inside the spoke:

1. Run `gsd:new-project` inside the spoke directory — this creates `.planning/PROJECT.md`,
   `STATE.md`, and `ROADMAP.md` using the audit findings as context
2. Each refactor step from `sdk/refactor.md` maps to one GSD phase in `ROADMAP.md`
3. From this point, all execution follows the GSD workflow:
   `/gsd:discuss-phase N → /gsd:plan-phase N → /gsd:execute-phase N`

If the user prefers not to use GSD:
- Save the roadmap as `REFACTOR-PLAN.md` at project root and continue manually

### Roadmap Output

```markdown
# Refactor Roadmap — {project_name}

**Generated from:** FXL-AUDIT.md ({date})
**Audit score:** {score}% ({rating})
**Preservation mode:** {A/B/C}
**Estimated total effort:** {small/medium/large}

## Phase 1: TypeScript Strict Mode
...

## Phase 2: Project Structure
...

## Phase N: ...
```

---

## Stage 5: Execute

Guide the user through each refactor phase in order. For each phase:

1. **Announce** the phase goal and what will change
2. **Execute** the corresponding step from `sdk/refactor.md`
3. **Verify** before moving to the next phase:
   ```bash
   bunx tsc --noEmit    # after Phase 1
   bun run dev          # after every phase
   bunx eslint .        # after Phase 3
   bash fxl-doctor.sh   # after Phase 8
   ```
4. **Capture** any unexpected issues as potential pitfalls for MCP

### Phase 4 Special Case: Auth Migration to Clerk

Before starting, load Clerk patterns from the MCP:

```
mcp__clerk__clerk_sdk_snippet(slug: "b2b-saas")
mcp__clerk__list_clerk_sdk_snippets(tag: "auth")
```

Invoke the **clerk-setup** and **clerk-orgs** skills for authoritative implementation guidance.

If the user chose to migrate to Clerk, Phase 4 requires extra steps beyond `sdk/refactor.md`:

1. **Install Clerk:**
   ```bash
   bun install @clerk/react@6
   bun remove {old-auth-package}
   ```

2. **Wrap app in ClerkProvider** (replace existing auth provider)

3. **Replace auth hooks** — map existing auth calls to Clerk equivalents:
   | Supabase Auth | Clerk |
   |---------------|-------|
   | `supabase.auth.getUser()` | `useUser()` from `@clerk/react` |
   | `supabase.auth.getSession()` | `useAuth()` → `getToken()` |
   | `supabase.auth.signOut()` | `useClerk()` → `signOut()` |
   | `supabase.auth.onAuthStateChange()` | `useAuth()` → `isLoaded`, `isSignedIn` |

4. **Set up Clerk JWT template** to pass `org_id` claim to Supabase RLS:
   - In Clerk Dashboard → JWT Templates → Supabase
   - Add claim: `{ "org_id": "{{org.id}}" }`

5. **Update Supabase client** to pass Clerk token:
   ```typescript
   // src/lib/supabase.ts
   import { createClient } from '@supabase/supabase-js'
   import { useAuth } from '@clerk/react'

   export function useSupabaseClient() {
     const { getToken } = useAuth()

     return createClient(
       import.meta.env.VITE_SUPABASE_URL,
       import.meta.env.VITE_SUPABASE_ANON_KEY,
       {
         global: {
           fetch: async (url, options = {}) => {
             const clerkToken = await getToken({ template: 'supabase' })
             const headers = new Headers(options?.headers)
             if (clerkToken) headers.set('Authorization', `Bearer ${clerkToken}`)
             return fetch(url, { ...options, headers })
           },
         },
       }
     )
   }
   ```

6. **Migrate `user_id` → `org_id`** in all tables:
   - Follow `sdk/refactor.md` Step 4 for the migration SQL
   - Update RLS policies to use JWT `org_id` claim
   - Update all Supabase queries to filter by `org_id` instead of `user_id`

### Phase 5 Special Case: Supabase Types

After migrating the Supabase client, generate TypeScript types from the live schema:

```
mcp__supabase__generate_typescript_types()
```

Save to `shared/types/database.ts`. Use these types throughout backend services
instead of declaring table types manually.

### Verification Gate

After all phases are complete, run the full compliance check:

```bash
bunx tsc --noEmit      # zero TypeScript errors
bunx eslint .          # zero lint errors
bunx prettier --check . # zero formatting issues
bash fxl-doctor.sh     # all checks pass
bun run build          # successful production build
```

If any check fails, do not proceed to Stage 6.

---

## Stage 6: Register (MCP Integration)

After all phases pass verification, register the project in the MCP knowledge base.

### Step 6.1: Register Project

```
mcp__fxl-sdk__register_project(
  slug: "{project_slug}",
  name: "{project_name}",
  stack_choices: {
    "platform": "web",
    "framework": "vite",
    "auth": "{clerk | supabase-auth}",
    "database": "supabase",
    "deploy": "vercel",
    "ci": "github-actions",
    "contract_version": "1.0",
    "origin": "{source}",
    "preservation_mode": "{A | B | C}"
  }
)
```

### Step 6.2: Post-Operation Knowledge Capture

Follow `mcp-bridge/post-operation.md` — evaluate if the refactor produced new learnings
or pitfalls worth recording in the MCP knowledge base.

Pay special attention to:
- Auth migration quirks (Supabase Auth → Clerk edge cases)
- Lovable-specific patterns that needed refactoring
- `org_id` migration issues
- TypeScript errors that required non-obvious fixes

---

## Post-Refactor Output

Report to the user:

```
Refactor of "{project_name}" complete.

Audit score before: {initial_score}%
Audit score after:  100% (A — FXL compliant)

Phases completed:
✓ Phase 1: TypeScript strict mode
✓ Phase 2: Project structure
✓ Phase 3: Config files
✓ Phase 4: Security hardening {+ Clerk migration if applicable}
✓ Phase 5: Supabase client
✓ Phase 6: Component quality
✓ Phase 7: FXL contract endpoints
✓ Phase 8: CI/CD

Files generated:
- FXL-AUDIT.md (audit report)
- CLAUDE.md (project rules for Claude Code)
- .mcp.json (Nexo SDK MCP Server connection)
- vercel.json (security headers + SPA rewrite)
- fxl-doctor.sh (CI health check)
- .github/workflows/ci.yml
- src/api/fxl/ (6 contract endpoints)

Next steps:
1. {If Clerk migration} Create Clerk application and update .env.local
2. Push to GitHub and connect to Vercel
3. Apply migrations to Supabase production instance
4. Run /gsd:new-milestone to plan feature development

Project registered in Nexo SDK knowledge base.
```

---

## Error Handling

| Error | Recovery |
|-------|----------|
| Audit reveals score < 30% (F rating) | Recommend Mode A (full rewrite). Present what's worth keeping. |
| TypeScript errors exceed 50 after strict mode | Fix in batches: `any` first, then null checks, then missing types |
| Clerk migration breaks auth flow | Keep Supabase Auth as fallback, migrate incrementally behind feature flag |
| `org_id` migration causes data loss | Always run backup first: `pg_dump` or Supabase Dashboard export |
| MCP unavailable in Stage 2 | Continue with local standards from `sdk/standards.md` |
| MCP unavailable in Stage 6 | Complete refactor, note manual registration is needed |
| `fxl-doctor.sh` fails after all phases | Debug each failing check individually before proceeding |

---

## Integration Points

| Integration | How |
|-------------|-----|
| MCP Bridge (Stage 2) | Follows `mcp-bridge/pre-operation.md` + spoke-specific standards |
| Audit (Stage 3) | Follows `sdk/audit.md` fully, extends with Lovable-specific checks |
| Refactor Patterns (Stage 5) | Follows `sdk/refactor.md` steps in order |
| Auth Migration (Stage 5, Phase 4) | Extends `sdk/refactor.md` with Clerk-specific migration steps |
| Contract (Stage 5, Phase 7) | Follows `sdk/connect.md` for endpoint implementation |
| CI/CD (Stage 5, Phase 8) | Follows `sdk/ci-cd.md` and `sdk/deploy.md` |
| MCP Bridge (Stage 6) | Calls `register_project` and follows `mcp-bridge/post-operation.md` |

---

## Relationship to Other Rules

- **`sdk/scaffold-flow.md`** — The equivalent flow for new projects. Use when starting from scratch.
- **`sdk/audit.md`** — Stage 3 runs this rule in full. Do not skip it.
- **`sdk/refactor.md`** — Stage 5 follows these patterns. `refactor-flow.md` is the orchestrator; `refactor.md` has the implementation detail.
- **`sdk/connect.md`** — Stage 5, Phase 7 delegates to this rule for contract endpoint implementation.
- **`mcp-bridge/pre-operation.md`** — Stage 2 runs this rule as its first step.
- **`mcp-bridge/post-operation.md`** — Stage 6 runs this rule after registration.
- **`methodology/workflow.md`** — The refactor flow is the "Discuss + Plan + Execute" methodology applied to existing projects. Stage 1 = Discuss, Stages 3–4 = Plan, Stage 5 = Execute.
