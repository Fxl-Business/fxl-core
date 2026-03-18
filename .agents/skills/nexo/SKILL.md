---
name: nexo
description: Unified Nexo Skill for FXL spoke projects and agent orchestration. Routes to 6 capabilities — scaffold, audit, connect, orchestrate, methodology, learn — with MCP Server integration for persistent knowledge.
---

# Nexo Skill

## What This Is

A unified Claude Code skill that consolidates all FXL operational capabilities:
- **SDK rules** for spoke project development (scaffold, audit, connect, refactor, CI/CD, deploy)
- **Agent orchestration** for parallel multi-agent execution
- **Methodology** for FXL-customized discuss/plan/execute workflow
- **Learning** integration with the MCP Server for persistent knowledge

**This is NOT an npm package.** Configs are generated as files in the project. Types are copied, not imported. CI runs a generated bash script (`fxl-doctor.sh`).

## Capabilities

### 1. Scaffold

Create new spoke projects from scratch or from Wireframe Builder exports.

| Task | Rule |
|------|------|
| Scaffold new spoke project | `sdk/new-project.md` |
| Scaffold from wireframe export | `sdk/new-project-from-blueprint.md` |

### 2. Audit

Evaluate existing projects against FXL standards.

| Task | Rule |
|------|------|
| Audit existing project | `sdk/audit.md` |
| Understand FXL standards | `sdk/standards.md` |

### 3. Connect

Add FXL contract endpoints and refactor to compliance.

| Task | Rule |
|------|------|
| Add FXL contract to project | `sdk/connect.md` |
| Refactor to FXL standards | `sdk/refactor.md` |
| Set up CI/CD | `sdk/ci-cd.md` |
| Deploy to Vercel | `sdk/deploy.md` |

### 4. Orchestrate

Parallel multi-agent execution with boundary detection and wave architecture.

| Context | Load These Rules |
|---------|-----------------|
| Any task evaluation | `orchestrator/rules/boundary-detection.md`, `orchestrator/rules/task-analysis.md` |
| Parallel execution | `orchestrator/rules/orchestration.md` |
| Each spawned agent | `orchestrator/rules/scoped-agent.md` (injected in prompt) |
| After all agents done | `orchestrator/rules/integration-check.md` |
| GSD planner | `orchestrator/rules/boundary-detection.md`, `orchestrator/rules/task-analysis.md` |
| GSD executor | `orchestrator/rules/orchestration.md` (if plan has execution_mode: multi-agent) |
| GSD verifier | `orchestrator/rules/integration-check.md` (if plan has execution_mode: multi-agent) |

**Confidence Thresholds:**

| Ratio | Action |
|-------|--------|
| < 30% | Silent -- single-agent |
| 30-50% | Ask user for confirmation |
| > 50% | Act automatically |

**Fallback:** If tmux not available: sequential execution (same logic, no parallelism).

### 5. Methodology

FXL-customized discuss/plan/execute workflow leveraging MCP for context.

| Task | Rule |
|------|------|
| FXL project workflow | `methodology/workflow.md` (planned -- Phase 100) |

### 6. Learn

Persistent knowledge via MCP Server integration.

| Task | Rule |
|------|------|
| MCP bridge operations | `methodology/mcp-bridge.md` (planned -- Phase 101) |

## Stack (Spoke Projects)

- React 18 + TypeScript 5 (strict: true)
- Tailwind CSS 3 + shadcn/ui
- Vite 5
- Supabase (database + auth RLS)
- Clerk (independent from Hub -- Hub connects via API key)
- Vercel (deploy)
- GitHub Actions (CI)

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

## Orchestrator Reference

The orchestrator detects project boundaries, evaluates parallelization potential,
and spawns scoped agents when beneficial. See `orchestrator/README.md` for the
full operational guide.

**Automatic Activation (orchestrate capability):**
1. Run boundary detection (`orchestrator/rules/boundary-detection.md`)
2. If 2+ boundaries exist, keep awareness active
3. When tasks are identified, run task analysis (`orchestrator/rules/task-analysis.md`)
4. If threshold met -> orchestrate (`orchestrator/rules/orchestration.md`)
5. If threshold not met -> standard single-agent execution

## Quick Navigation

**SDK Rules:**
- `/nexo/sdk/standards` - Code standards
- `/nexo/sdk/new-project` - Scaffold new project
- `/nexo/sdk/new-project-from-blueprint` - Scaffold from wireframe
- `/nexo/sdk/audit` - Audit existing project
- `/nexo/sdk/connect` - Add FXL contract
- `/nexo/sdk/refactor` - Refactoring patterns
- `/nexo/sdk/ci-cd` - GitHub Actions setup
- `/nexo/sdk/deploy` - Vercel deploy

**Orchestrator:**
- `/nexo/orchestrator/rules/boundary-detection` - Detect project boundaries
- `/nexo/orchestrator/rules/task-analysis` - Evaluate parallelization
- `/nexo/orchestrator/rules/orchestration` - Wave-based execution
- `/nexo/orchestrator/rules/scoped-agent` - Agent scope rules
- `/nexo/orchestrator/rules/integration-check` - Post-execution verification

Or describe what you need and the right rule will be selected.
