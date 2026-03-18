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

### 0. Onboarding

Orient Claude at the start of every session in a spoke project.

| Task | Rule |
|------|------|
| **Start of any session in a spoke** | `sdk/onboarding.md` |

**Always run first.** Reads CLAUDE.md, loads MCP context, assesses project state,
and provides ready signal before any work begins.

---

### 1. Scaffold

Create new spoke projects from scratch or from Wireframe Builder exports.

| Task | Rule |
|------|------|
| **Scaffold new spoke project (recommended)** | `sdk/scaffold-flow.md` |
| Scaffold from wireframe export | `sdk/new-project-from-blueprint.md` |
| Manual scaffold steps (reference) | `sdk/new-project.md` |

**Preferred:** Use `sdk/scaffold-flow.md` for all new projects. It integrates MCP context
retrieval, prompts for platform/framework/module selection, generates all files, and
registers the project in the knowledge base automatically.

### 2. Audit

Evaluate existing projects against FXL standards.

| Task | Rule |
|------|------|
| Audit existing project | `sdk/audit.md` |
| Understand FXL standards | `sdk/standards.md` |

### 3. Connect

Add FXL contract endpoints and refactor existing projects to compliance.

| Task | Rule |
|------|------|
| **Refactor existing project to FXL (recommended)** | `sdk/refactor-flow.md` |
| Add FXL contract to project | `sdk/connect.md` |
| Refactor patterns reference | `sdk/refactor.md` |
| Set up CI/CD | `sdk/ci-cd.md` |
| Deploy to Vercel | `sdk/deploy.md` |

**Preferred:** Use `sdk/refactor-flow.md` for all existing projects. It integrates audit,
roadmap generation, guided execution, and MCP registration in a single orchestrated flow.

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

#### Autorun (Wave Execution)

| Task | Rule |
|------|------|
| **Execute milestone em waves paralelas** | `orchestrator/autorun.md` |

Analisa dependencias entre fases, agrupa em waves e lanca agentes paralelos.
Diferente do `/gsd:autonomous` (sequencial), o autorun maximiza paralelismo.
Flags: `--from N`, `--plan-only`, `--execute-only`.

### 5. Methodology

FXL-customized discuss/plan/execute workflow leveraging MCP for context.

| Task | Rule |
|------|------|
| FXL project workflow | `methodology/workflow.md` |
| Pre-planning MCP context retrieval | `methodology/pre-planning.md` |
| Post-execution learning capture | `methodology/post-execution.md` |

### 6. Learn

Persistent knowledge via MCP Server integration. The MCP bridge activates automatically
as part of other capabilities — it is not invoked standalone.

| Context | Load These Rules |
|---------|-----------------|
| Before any SDK operation | `mcp-bridge/pre-operation.md` |
| Before planning/scaffolding a spoke | `mcp-bridge/spoke-planning.md` (includes pre-operation) |
| After completing any SDK operation | `mcp-bridge/post-operation.md` |

**Automatic Integration:**
- Scaffold (`sdk/scaffold-flow.md`) → load `mcp-bridge/spoke-planning.md` before, `mcp-bridge/post-operation.md` after, call `register_project` after generation
- Audit (`sdk/audit.md`) → load `mcp-bridge/pre-operation.md` before, `mcp-bridge/post-operation.md` after
- Connect (`sdk/connect.md`) → load `mcp-bridge/pre-operation.md` before, `mcp-bridge/post-operation.md` after
- Refactor (`sdk/refactor.md`) → load `mcp-bridge/pre-operation.md` before, `mcp-bridge/post-operation.md` after
- CI/CD (`sdk/ci-cd.md`) → load `mcp-bridge/pre-operation.md` before, `mcp-bridge/post-operation.md` after
- Deploy (`sdk/deploy.md`) → load `mcp-bridge/pre-operation.md` before, `mcp-bridge/post-operation.md` after

## Stack (Spoke Projects)

**Monorepo structure — frontend + backend + shared in one repo, deployed separately.**

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript 5 (strict) + Tailwind 3 + shadcn/ui + Vite 5 |
| Backend | Hono 4.x (Node.js) — deployed to Railway/Fly.io |
| Shared types | TypeScript 5 — `shared/types/` |
| Database | Supabase (server-side only via service role key) |
| Auth | Clerk (frontend: publishable key / backend: secret key + JWT validation) |
| Frontend deploy | Vercel |
| Backend deploy | Railway / Fly.io |
| CI | GitHub Actions |

**Architecture rule:** Frontend never calls Supabase directly. All data flows through the Hono backend.

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
- `mcp.json.template` - .mcp.json pointing to Nexo SDK MCP Server
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
- `/nexo/sdk/onboarding` - **Start every session here**
- `/nexo/sdk/scaffold-flow` - **Scaffold new project (recommended)**
- `/nexo/sdk/refactor-flow` - **Refactor existing project (recommended)**
- `/nexo/sdk/standards` - Code standards
- `/nexo/sdk/new-project` - Manual scaffold steps (reference)
- `/nexo/sdk/new-project-from-blueprint` - Scaffold from wireframe
- `/nexo/sdk/audit` - Audit existing project
- `/nexo/sdk/connect` - Add FXL contract
- `/nexo/sdk/refactor` - Refactoring patterns reference
- `/nexo/sdk/ci-cd` - GitHub Actions setup
- `/nexo/sdk/deploy` - Vercel deploy

**Orchestrator:**
- `/nexo/orchestrator/rules/boundary-detection` - Detect project boundaries
- `/nexo/orchestrator/rules/task-analysis` - Evaluate parallelization
- `/nexo/orchestrator/rules/orchestration` - Wave-based execution
- `/nexo/orchestrator/rules/scoped-agent` - Agent scope rules
- `/nexo/orchestrator/rules/integration-check` - Post-execution verification

**Methodology:**
- `/nexo/methodology/workflow` - FXL discuss/plan/execute flow
- `/nexo/methodology/pre-planning` - MCP context retrieval before planning
- `/nexo/methodology/post-execution` - Learning capture after execution

**MCP Bridge:**
- `/nexo/mcp-bridge/pre-operation` - Context enrichment before any operation
- `/nexo/mcp-bridge/spoke-planning` - Extended context for scaffold/planning
- `/nexo/mcp-bridge/post-operation` - Knowledge capture after operations

Or describe what you need and the right rule will be selected.
