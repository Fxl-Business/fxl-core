---
name: fxl-sdk
description: FXL SDK skill for spoke projects. Use when scaffolding new projects, auditing existing ones, adding the FXL contract, refactoring to FXL standards, or setting up CI/CD and deploy. Routes to specific rules based on the task.
---

# FXL SDK Skill

## What This Is

A Claude Code skill that defines standards, templates, contract types, and checklists for FXL spoke projects. Spokes are external applications (per-client systems, dashboards) that connect to the FXL Core hub via a standardized API contract.

**This is NOT an npm package.** Configs are generated as files in the project. Types are copied, not imported. CI runs a generated bash script (`fxl-doctor.sh`).

## Stack (Spoke Projects)

- React 18 + TypeScript 5 (strict: true)
- Tailwind CSS 3 + shadcn/ui
- Vite 5
- Supabase (database + auth RLS)
- Clerk (independent from Hub — Hub connects via API key)
- Vercel (deploy)
- GitHub Actions (CI)

## By Task

**Scaffolding a new spoke project** -> Use `rules/new-project.md`
- Full project scaffold from scratch
- Directory structure, configs, CLAUDE.md, contract endpoints
- Includes CI/CD and deploy setup

**Scaffolding from a Wireframe Builder export** -> Use `rules/new-project-from-blueprint.md`
- Reads `blueprint-export.json` from Wireframe Builder
- Generates pages, components, entities, contract endpoints
- Builds on top of `rules/new-project.md`

**Auditing an existing project** -> Use `rules/audit.md`
- Generates `FXL-AUDIT.md` with compliance score
- Categories: critical, important, normal
- Suggests refactoring plan

**Adding FXL contract to a project** -> Use `rules/connect.md`
- Adds required API endpoints
- Copies contract types
- Configures API key validation middleware

**Refactoring to FXL standards** -> Use `rules/refactor.md`
- Migration patterns for Lovable/existing projects
- Incremental approach (no big-bang rewrite)
- Structure, types, security, RLS

**Setting up CI/CD** -> Use `rules/ci-cd.md`
- GitHub Actions workflow
- `fxl-doctor.sh` health check script
- Branch protection rules

**Deploying to Vercel** -> Use `rules/deploy.md`
- Vercel configuration
- Environment variables
- Security headers, preview deploys

**Understanding FXL code standards** -> Use `rules/standards.md`
- Code conventions, security rules, project structure
- The foundation all other rules reference

## Contract Reference

**Contract types:** `contract/types.ts`
- FxlAppManifest, EntityDefinition, FieldDefinition, WidgetDefinition
- Response types for all endpoints
- v1: read-only, field types: string, number, date, boolean

**Required endpoints (v1, GET only):**
- `/api/fxl/manifest` - App metadata and entity definitions
- `/api/fxl/entities/:type` - Paginated entity list
- `/api/fxl/entities/:type/:id` - Single entity
- `/api/fxl/widgets/:id/data` - Widget data (KPI, chart, table, list)
- `/api/fxl/search?q=` - Cross-entity search
- `/api/fxl/health` - Health check with contract version

## Templates

Config templates in `templates/` are copied into the spoke project (not extended/imported):
- `CLAUDE.md.template` - Project CLAUDE.md for Claude Code
- `tsconfig.json.template` - Strict TypeScript config
- `eslint.config.js.template` - ESLint flat config
- `prettier.config.js.template` - Prettier config
- `tailwind.preset.js.template` - Tailwind preset with FXL defaults
- `vercel.json.template` - Vercel deploy config with security headers
- `ci.yml.template` - GitHub Actions CI workflow
- `fxl-doctor.sh.template` - CI health check script

## Checklists

Use checklists in `checklists/` for verification:
- `security-checklist.md` - Auth, headers, env vars, RLS
- `structure-checklist.md` - Directory layout, naming, imports
- `typescript-checklist.md` - Strict mode, no any, proper typing
- `rls-checklist.md` - Supabase RLS policies per table
- `contract-checklist.md` - All required endpoints, response formats

## Quick Navigation

- `/fxl-sdk/rules/standards` - Code standards
- `/fxl-sdk/rules/new-project` - Scaffold new project
- `/fxl-sdk/rules/new-project-from-blueprint` - Scaffold from wireframe
- `/fxl-sdk/rules/audit` - Audit existing project
- `/fxl-sdk/rules/connect` - Add FXL contract
- `/fxl-sdk/rules/refactor` - Refactoring patterns
- `/fxl-sdk/rules/ci-cd` - GitHub Actions setup
- `/fxl-sdk/rules/deploy` - Vercel deploy

Or describe what you need and the right rule will be selected.
