# Audit Existing Project Against FXL Standards

## When to Use

User opens Claude Code in an existing project (e.g., built with Lovable, another tool, or from scratch) and wants to know how well it conforms to FXL standards. Generates an `FXL-AUDIT.md` report.

## Audit Process

### 1. Scan Project

Read these files/directories to understand the project:
- `package.json` — deps, scripts, fxlContractVersion
- `tsconfig.json` — strict mode, paths
- `.eslintrc*` or `eslint.config.*` — lint config
- `.prettierrc*` or `prettier.config.*` — formatting
- `tailwind.config.*` — styling
- `vercel.json` — deploy config
- `CLAUDE.md` — project rules (if exists)
- `.env.example` — env vars
- `.gitignore` — what is excluded
- `src/` — project structure
- `supabase/migrations/` — database schema

### 2. Run Checklists

Apply each checklist from `checklists/`:

1. **Security Checklist** (`checklists/security-checklist.md`)
2. **Structure Checklist** (`checklists/structure-checklist.md`)
3. **TypeScript Checklist** (`checklists/typescript-checklist.md`)
4. **RLS Checklist** (`checklists/rls-checklist.md`)
5. **Contract Checklist** (`checklists/contract-checklist.md`)

### 3. Scoring

Each checklist item has a severity:

| Severity | Weight | Description |
|----------|--------|-------------|
| Critical | 10 | Security vulnerabilities, data leaks, auth bypasses |
| Important | 5 | Missing types, no RLS, no CI, structural issues |
| Normal | 2 | Naming conventions, import order, formatting |
| Info | 0 | Recommendations, not counted in score |

**Score calculation:**
```
max_score = sum(all item weights)
earned_score = sum(passing item weights)
compliance_percent = (earned_score / max_score) * 100
```

**Rating:**
| Score | Rating | Meaning |
|-------|--------|---------|
| 90-100% | A | Production-ready, FXL compliant |
| 70-89% | B | Good, minor issues |
| 50-69% | C | Needs work, significant gaps |
| 30-49% | D | Major issues, substantial refactoring needed |
| 0-29% | F | Not FXL compliant, full refactoring required |

### 4. Generate FXL-AUDIT.md

Create `FXL-AUDIT.md` at project root with this format:

```markdown
# FXL Audit Report

**Project:** {project name}
**Date:** {audit date}
**Score:** {score}% — Rating: {A/B/C/D/F}
**Audited by:** Claude Code with FXL SDK skill

## Summary

{2-3 sentence summary of overall compliance}

## Critical Issues

{Items that must be fixed before production. Security vulnerabilities, auth bypasses, data leaks.}

### {Issue title}
- **Severity:** Critical
- **Category:** {Security/Auth/RLS/Structure}
- **Found in:** {file path}
- **Issue:** {description}
- **Fix:** {how to fix}
- **Effort:** {small/medium/large}

## Important Issues

{Items that should be fixed. Missing types, no CI, structural problems.}

### {Issue title}
- **Severity:** Important
- **Category:** {TypeScript/Structure/CI/Deploy}
- **Found in:** {file path}
- **Issue:** {description}
- **Fix:** {how to fix}
- **Effort:** {small/medium/large}

## Normal Issues

{Nice-to-haves. Naming, formatting, conventions.}

### {Issue title}
- **Severity:** Normal
- **Category:** {Convention/Formatting/Naming}
- **Found in:** {file path}
- **Issue:** {description}
- **Fix:** {how to fix}

## Checklist Results

| Checklist | Pass | Fail | Score |
|-----------|------|------|-------|
| Security | X/Y | Z | N% |
| Structure | X/Y | Z | N% |
| TypeScript | X/Y | Z | N% |
| RLS | X/Y | Z | N% |
| Contract | X/Y | Z | N% |

## Refactoring Plan

{Ordered list of recommended changes, grouped by priority}

### Phase 1: Critical Fixes (do first)
1. {fix description} — {effort estimate}
2. {fix description} — {effort estimate}

### Phase 2: Important Improvements
1. {fix description} — {effort estimate}
2. {fix description} — {effort estimate}

### Phase 3: Polish
1. {fix description} — {effort estimate}
2. {fix description} — {effort estimate}

## Contract Status

| Endpoint | Status | Notes |
|----------|--------|-------|
| GET /api/fxl/manifest | {exists/missing/invalid} | {notes} |
| GET /api/fxl/entities/:type | {exists/missing/invalid} | {notes} |
| GET /api/fxl/entities/:type/:id | {exists/missing/invalid} | {notes} |
| GET /api/fxl/widgets/:id/data | {exists/missing/invalid} | {notes} |
| GET /api/fxl/search?q= | {exists/missing/invalid} | {notes} |
| GET /api/fxl/health | {exists/missing/invalid} | {notes} |
```

### 5. Optional: Generate GSD Roadmap

If the user wants, offer to create a GSD milestone + roadmap for the refactoring plan. Use `/gsd:new-milestone` with the audit findings as input.

## Common Findings in Lovable Projects

Lovable-generated projects typically have these issues:

1. **No TypeScript strict mode** — `strict: false` or missing
2. **Heavy use of `any`** — auto-generated code uses `any` liberally
3. **No RLS** — Supabase tables without Row Level Security
4. **No org_id** — no multi-tenant isolation
5. **No CLAUDE.md** — no project rules for AI
6. **Default Vite config** — no path aliases, no strict settings
7. **No CI/CD** — no GitHub Actions, no health checks
8. **No security headers** — missing vercel.json or no headers configured
9. **Mixed exports** — default and named exports inconsistently
10. **No contract endpoints** — no FXL API routes

## Tips

- Run `npx tsc --noEmit` first — if it fails with hundreds of errors, the project likely needs full config replacement before detailed audit
- Check `package.json` for outdated or unnecessary dependencies
- Look for hardcoded URLs, API keys, or secrets in source code
- Check if `.env.local` is in `.gitignore`
- Verify Supabase client creation uses env vars (not hardcoded values)
