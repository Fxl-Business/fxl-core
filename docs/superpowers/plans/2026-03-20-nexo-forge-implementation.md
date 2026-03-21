# Nexo Forge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the Nexo Forge package as an independent repository, migrate all knowledge from Supabase and existing Nexo Skill, build installer + commands + hooks following GSD's proven model, and clean up the MCP from the Nexo app.

**Architecture:** Nexo Forge is an npm-like package distributed via GitHub that installs globally in `~/.claude/nexo-forge/` with commands in `~/.claude/commands/nexo/`. Each project gets a `.nexo/` directory for local state (knowledge snapshot, config, audits). The installer follows GSD's pattern: file copy + path templating + manifest generation + hook registration.

**Tech Stack:** Node.js (installer), Markdown (knowledge/commands/workflows), JavaScript (hooks), HTML (dashboard generator)

**Spec:** `docs/superpowers/specs/2026-03-20-nexo-forge-design.md`

---

## Phase 1: Repository Scaffolding

### Task 1.1: Create repo structure and package.json

**Files:**
- Create: `/Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/package.json`
- Create: `/Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/VERSION`
- Create: `/Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/CHANGELOG.md`
- Create: `/Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/.gitignore`

- [ ] **Step 1: Create the nexo-forge directory**

```bash
mkdir -p /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git init
```

- [ ] **Step 2: Create package.json**

```json
{
  "name": "nexo-forge",
  "version": "1.0.0",
  "description": "FXL operational toolkit — standards, knowledge, and orchestration for all FXL projects",
  "bin": {
    "nexo-forge": "bin/install.cjs"
  },
  "files": [
    "bin",
    "commands",
    "nexo-forge",
    "agents",
    "hooks"
  ],
  "engines": {
    "node": ">=20.0.0"
  },
  "repository": {
    "type": "git",
    "url": "git+https://github.com/fxl-br/nexo-forge.git"
  },
  "author": "Cauet Pinciara <cauet@fxl.com.br>",
  "license": "PROPRIETARY",
  "private": true
}
```

- [ ] **Step 3: Create VERSION and CHANGELOG**

VERSION: `1.0.0`

CHANGELOG.md:
```markdown
# Changelog

## 1.0.0 (2026-03-20)

### Initial Release
- Knowledge base migrated from FXL-SDK MCP (101 standards, 30 pitfalls)
- Organized by domain: stack, security, database, frontend, api, infrastructure, testing
- Commands: setup, audit, plan-all, auto-run, scaffold, update, status, learn, add
- Installer with manifest integrity and hook registration
- Dashboard HTML generator
- GSD integration as required dependency
```

- [ ] **Step 4: Create .gitignore**

```
node_modules/
.DS_Store
*.log
nexo-forge-patches/
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: initialize nexo-forge repository"
```

### Task 1.2: Create directory skeleton

**Files:**
- Create: `nexo-forge/knowledge/stack/.gitkeep`
- Create: `nexo-forge/knowledge/security/.gitkeep`
- Create: `nexo-forge/knowledge/database/.gitkeep`
- Create: `nexo-forge/knowledge/frontend/.gitkeep`
- Create: `nexo-forge/knowledge/api/.gitkeep`
- Create: `nexo-forge/knowledge/infrastructure/.gitkeep`
- Create: `nexo-forge/knowledge/testing/.gitkeep`
- Create: `nexo-forge/checklists/.gitkeep`
- Create: `nexo-forge/commands/nexo/.gitkeep`
- Create: `nexo-forge/workflows/.gitkeep`
- Create: `nexo-forge/agents/.gitkeep`
- Create: `nexo-forge/hooks/.gitkeep`
- Create: `nexo-forge/templates/.gitkeep`
- Create: `nexo-forge/deps/manifest.json`

Note: all paths in this task are relative to `/Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/`

- [ ] **Step 1: Create all directories**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
mkdir -p knowledge/{stack,security,database,frontend,api,infrastructure,testing}
mkdir -p checklists commands/nexo workflows agents hooks templates deps bin
```

- [ ] **Step 2: Create deps/manifest.json**

```json
{
  "required": {
    "skills": [
      {
        "name": "get-shit-done-cc",
        "install": "npx -y get-shit-done-cc@latest --claude",
        "check": "~/.claude/get-shit-done/VERSION",
        "validated_version": "1.27.0"
      }
    ],
    "mcps": []
  },
  "recommended": {
    "skills": [
      {
        "name": "shadcn",
        "description": "Componentes shadcn/ui — necessario para projetos frontend",
        "when": "modules.frontend.enabled"
      }
    ],
    "mcps": [
      {
        "name": "supabase",
        "description": "MCP do Supabase — necessario para projetos com banco de dados",
        "when": "modules.backend.enabled",
        "validated_version": "1.0.0"
      },
      {
        "name": "clerk",
        "description": "MCP do Clerk — necessario para projetos com autenticacao",
        "when": "modules.backend.enabled || modules.frontend.enabled",
        "validated_version": "1.0.0"
      }
    ]
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: create directory skeleton and deps manifest"
```

---

## Phase 2: Knowledge Migration from Supabase

### Task 2.1: Extract standards from Supabase

**Files:**
- Create: `knowledge/stack/standards.md`
- Create: `knowledge/security/standards.md`
- Create: `knowledge/database/standards.md`
- Create: `knowledge/frontend/standards.md`
- Create: `knowledge/api/standards.md`
- Create: `knowledge/infrastructure/standards.md`
- Create: `knowledge/testing/standards.md`

Note: all paths relative to `/Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/`

- [ ] **Step 1: Query all standards from Supabase**

Run from the Nexo project directory (which has the Supabase MCP configured):

```
mcp__supabase__execute_sql: SELECT id, rule, context, category, tags FROM sdk_standards ORDER BY category, id
```

- [ ] **Step 2: Group standards by category and create markdown files**

For each category (stack, security, database, frontend, api, infrastructure, testing), create a `standards.md` file following this format:

```markdown
# Standards: [Domain]

## STD-001: [rule text]
**Categoria:** [category]
**Severidade:** [infer from context: critical/high/medium]

[context text]

---
```

Number standards sequentially within each domain file (STD-001, STD-002, etc.).

- [ ] **Step 3: Verify all 101 standards are accounted for**

Count total standards across all files. Must equal 101.

- [ ] **Step 4: Commit**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git add knowledge/*/standards.md
git commit -m "feat: migrate 101 standards from Supabase organized by domain"
```

### Task 2.2: Extract pitfalls from Supabase

**Files:**
- Create: `knowledge/stack/pitfalls.md`
- Create: `knowledge/security/pitfalls.md`
- Create: `knowledge/database/pitfalls.md`
- Create: `knowledge/frontend/pitfalls.md`
- Create: `knowledge/api/pitfalls.md`
- Create: `knowledge/infrastructure/pitfalls.md`
- Create: `knowledge/testing/pitfalls.md`

Note: all paths relative to `/Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/`

- [ ] **Step 1: Query all pitfalls from Supabase**

```
mcp__supabase__execute_sql: SELECT id, rule, context, category, severity, tags FROM sdk_pitfalls ORDER BY category, severity, id
```

- [ ] **Step 2: Group pitfalls by category and create markdown files**

Format:
```markdown
# Pitfalls: [Domain]

## PIT-001: [rule text]
**Severidade:** [severity]
**Contexto:** [context first line]

[context details]

### Como evitar
- [extract from context]

---
```

- [ ] **Step 3: Verify all 30 pitfalls are accounted for**

- [ ] **Step 4: Commit**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git add knowledge/*/pitfalls.md
git commit -m "feat: migrate 30 pitfalls from Supabase organized by domain"
```

---

## Phase 3: Content Migration from Existing Nexo Skill

### Task 3.1: Migrate checklists

**Files:**
- Copy: `.agents/skills/nexo/checklists/*.md` → `nexo-forge/checklists/`

Source: `/Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/checklists/`
Dest: `/Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/checklists/`

- [ ] **Step 1: Copy all checklist files**

```bash
cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/checklists/*.md \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/checklists/
```

- [ ] **Step 2: Add project-setup.md and deploy-ready.md checklists**

These don't exist in the current skill. Create them based on the standards knowledge:

`checklists/project-setup.md` — checklist for `/nexo:setup` verification
`checklists/deploy-ready.md` — checklist for pre-deploy validation

- [ ] **Step 3: Commit**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git add checklists/
git commit -m "feat: migrate checklists from Nexo Skill + add setup and deploy checklists"
```

### Task 3.2: Migrate templates

**Files:**
- Copy: `.agents/skills/nexo/templates/*` → `nexo-forge/templates/`

Source: `/Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/templates/`
Dest: `/Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/templates/`

- [ ] **Step 1: Copy all template files**

```bash
cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/templates/* \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/templates/
```

- [ ] **Step 2: Review and update CLAUDE.md.template**

The template should reference Nexo Forge (not Nexo Skill) and include the module-based config structure. Update any references to the MCP.

- [ ] **Step 3: Commit**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git add templates/
git commit -m "feat: migrate config templates from Nexo Skill"
```

### Task 3.3: Migrate contract types

**Files:**
- Copy: `.agents/skills/nexo/contract/types.ts` → `nexo-forge/templates/contract-types.ts.template`

- [ ] **Step 1: Copy contract types as template**

```bash
cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/contract/types.ts \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/templates/contract-types.ts.template
```

- [ ] **Step 2: Commit**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git add templates/contract-types.ts.template
git commit -m "feat: migrate FXL contract types as template"
```

### Task 3.4: Migrate and adapt SDK workflows

**Files:**
- Adapt: `.agents/skills/nexo/sdk/*.md` → `nexo-forge/workflows/`
- Adapt: `.agents/skills/nexo/methodology/*.md` → `nexo-forge/workflows/`

Source SDK: `/Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/sdk/`
Source Methodology: `/Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/methodology/`
Dest: `/Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/`

- [ ] **Step 1: Copy SDK workflow files**

```bash
cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/sdk/scaffold-flow.md \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/scaffold.md

cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/sdk/audit.md \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/audit.md

cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/sdk/standards.md \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/standards-reference.md

cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/sdk/connect.md \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/connect.md

cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/sdk/deploy.md \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/deploy.md

cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/sdk/ci-cd.md \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/ci-cd.md

cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/sdk/onboarding.md \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/onboarding.md

cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/sdk/refactor-flow.md \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/refactor.md

cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/sdk/new-project-from-blueprint.md \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/scaffold-from-blueprint.md

cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/sdk/new-project.md \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/scaffold-manual.md

cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/sdk/refactor.md \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/refactor-patterns.md
```

- [ ] **Step 2: Copy methodology files**

```bash
cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/methodology/workflow.md \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/methodology.md

cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/methodology/pre-planning.md \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/pre-planning.md

cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/methodology/post-execution.md \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/post-execution.md
```

- [ ] **Step 3: Adapt all workflow files — remove MCP references**

In each workflow file, replace MCP tool calls with local file reads:

**Replace pattern:**
```
mcp__fxl-sdk__get_standards(category: "X")
```
**With:**
```
Read file: .nexo/knowledge/X/standards.md
```

**Replace pattern:**
```
mcp__fxl-sdk__get_pitfalls(category: "X")
```
**With:**
```
Read file: .nexo/knowledge/X/pitfalls.md
```

**Replace pattern:**
```
mcp__fxl-sdk__get_checklist(name: "X")
```
**With:**
```
Read file: .nexo/checklists/X.md
```

**Remove entirely:**
- `mcp__fxl-sdk__register_project()` calls — replaced by `.nexo/config.json`
- `mcp__fxl-sdk__add_learning()` calls — replaced by `/nexo:learn` command
- `mcp__fxl-sdk__add_pitfall()` calls — replaced by `/nexo:learn` command
- `mcp__fxl-sdk__search_knowledge()` calls — replaced by Grep on `.nexo/knowledge/`

- [ ] **Step 4: Adapt scaffold workflow for module-based config**

Update `workflows/scaffold.md` to generate `.nexo/config.json` with the module structure instead of calling `register_project()`.

- [ ] **Step 5: Commit**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git add workflows/
git commit -m "feat: migrate and adapt workflows — replace MCP with local file reads"
```

### Task 3.5: Migrate orchestrator rules

**Files:**
- Copy: `.agents/skills/nexo/orchestrator/rules/*.md` → `nexo-forge/workflows/orchestrator/`
- Copy: `.agents/skills/nexo/orchestrator/autorun.md` → `nexo-forge/workflows/auto-run.md`

Source: `/Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/orchestrator/`
Dest: `/Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/orchestrator/`

- [ ] **Step 1: Copy orchestrator files**

```bash
mkdir -p /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/orchestrator
cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/orchestrator/rules/*.md \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/orchestrator/

cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/orchestrator/autorun.md \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/auto-run-rules.md

cp /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/orchestrator/README.md \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/orchestrator/README.md

# Copy orchestrator templates if they exist
cp -r /Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/orchestrator/templates/ \
   /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/workflows/orchestrator/templates/ 2>/dev/null || true
```

- [ ] **Step 2: Commit**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git add workflows/orchestrator/
git commit -m "feat: migrate orchestrator rules from Nexo Skill"
```

---

## Phase 4: Commands

### Task 4.1: Create command entry points

**Files:**
- Create: `commands/nexo/setup.md`
- Create: `commands/nexo/audit.md`
- Create: `commands/nexo/plan-all.md`
- Create: `commands/nexo/auto-run.md`
- Create: `commands/nexo/scaffold.md`
- Create: `commands/nexo/update.md`
- Create: `commands/nexo/status.md`
- Create: `commands/nexo/learn.md`
- Create: `commands/nexo/add.md`

Note: all paths relative to `/Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/`

Each command file is a thin routing layer that loads the corresponding workflow. Follow GSD's pattern where the command `.md` has frontmatter with allowed tools and routes to the workflow file.

- [ ] **Step 1: Create `/nexo:setup` command**

```markdown
---
description: Bootstrap project with FXL standards — installs deps, copies knowledge, generates config
allowed-tools: Read, Write, Edit, Bash, Glob, Grep, Agent, AskUserQuestion
---

# /nexo:setup

Load and execute the workflow at `~/.claude/nexo-forge/workflows/setup.md`.

Allowed tools: Read, Write, Edit, Bash, Glob, Grep, Agent, AskUserQuestion
```

- [ ] **Step 2: Create all other command files following the same pattern**

Each command routes to its workflow in `~/.claude/nexo-forge/workflows/[name].md`.

Commands to create:
- `audit.md` → `workflows/audit.md`
- `plan-all.md` → `workflows/plan-all.md`
- `auto-run.md` → `workflows/auto-run.md`
- `scaffold.md` → `workflows/scaffold.md`
- `update.md` → `workflows/update.md`
- `status.md` → `workflows/status.md`
- `learn.md` → `workflows/learn.md`
- `add.md` → `workflows/add.md`

- [ ] **Step 3: Commit**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git add commands/
git commit -m "feat: create all /nexo:* command entry points"
```

### Task 4.2: Create setup workflow

**Files:**
- Create: `workflows/setup.md` (new, purpose-built — not migrated from old skill)

Note: path relative to `/Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/`

- [ ] **Step 1: Write the setup workflow**

The setup workflow must:
1. Check if `.nexo/` already exists (re-setup vs first setup)
2. Detect project type (monorepo, single app, etc.)
3. Detect existing modules (scan for `apps/`, `packages/`, `src/`)
4. Check GSD is installed (`~/.claude/get-shit-done/VERSION`)
5. If GSD missing: run `npx -y get-shit-done-cc@latest --claude`
6. Read `~/.claude/nexo-forge/deps/manifest.json` for recommended deps
7. Suggest MCPs/skills based on detected modules
8. Copy `~/.claude/nexo-forge/knowledge/` → `.nexo/knowledge/`
9. Copy `~/.claude/nexo-forge/checklists/` → `.nexo/checklists/`
10. Generate `.nexo/config.json` with detected modules
11. Generate `.nexo/manifest.json` with SHA256 of copied files
12. If GSD new-project not done: delegate to `gsd:new-project`
13. Run `gsd:map-codebase`
14. Show summary of what was configured

Write the full workflow markdown with these steps as instructions for the Claude agent.

- [ ] **Step 2: Commit**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git add workflows/setup.md
git commit -m "feat: create /nexo:setup workflow"
```

### Task 4.3: Create plan-all workflow

**Files:**
- Create: `workflows/plan-all.md`

- [ ] **Step 1: Write the plan-all workflow**

Instructions for the Claude agent:
1. Read `.planning/ROADMAP.md` to get all phases
2. Identify phases without a `PLAN.md` file
3. If no unplanned phases: report and exit
4. For each unplanned phase, spawn an Agent with:
   - `subagent_type: "general-purpose"`
   - Prompt that runs `gsd:discuss-phase --auto` then `gsd:plan-phase` for that phase number
5. Run all agents in parallel (use Agent tool with multiple invocations in one message)
6. Wait for all to complete
7. Report summary: X planned, X failed, X skipped

- [ ] **Step 2: Commit**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git add workflows/plan-all.md
git commit -m "feat: create /nexo:plan-all workflow — parallel phase planning"
```

### Task 4.4: Create auto-run workflow

**Files:**
- Create: `workflows/auto-run.md`

- [ ] **Step 1: Write the auto-run workflow**

Instructions for the Claude agent:
1. Read `.planning/ROADMAP.md` to get all phases
2. Check each phase has a `PLAN.md` — if any missing, ask user if should run `/nexo:plan-all` first
3. Analyze phase dependencies (sequential by default based on numbering)
4. Group into waves (phases that can run in parallel)
5. For each wave:
   a. Spawn agents for each phase in the wave
   b. Each agent runs `gsd:execute-phase` for its phase
   c. Wait for wave to complete
   d. Run `npx tsc --noEmit` to verify integrity
   e. If errors: stop and report
6. After all waves: show summary

- [ ] **Step 2: Commit**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git add workflows/auto-run.md
git commit -m "feat: create /nexo:auto-run workflow — wave-based parallel execution"
```

### Task 4.5: Create status workflow with HTML dashboard

**Files:**
- Create: `workflows/status.md`
- Create: `workflows/dashboard-template.html`

- [ ] **Step 1: Write the status workflow**

Instructions for the Claude agent:
1. Read `.nexo/config.json` — show modules, deps versions
2. Read `.planning/STATE.md` if exists — show GSD progress
3. Check forge version: compare `.nexo/config.json` forge_version with `~/.claude/nexo-forge/VERSION`
4. Check deps versions: compare installed vs validated
5. Show last audit date from `.nexo/audits/`
6. If `--html` flag passed: generate `.nexo/dashboard.html` and open it

- [ ] **Step 2: Create HTML dashboard template**

Create `workflows/dashboard-template.html` — a self-contained HTML file with:
- CSS inline (modern, clean design with dark/light mode)
- Sections for: modules, dependencies, audit scores, GSD progress
- Placeholder tokens: `{{PROJECT_NAME}}`, `{{MODULES_HTML}}`, `{{DEPS_HTML}}`, `{{AUDIT_HTML}}`, `{{PROGRESS_HTML}}`, `{{GENERATED_AT}}`
- The status workflow replaces these tokens when generating

- [ ] **Step 3: Commit**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git add workflows/status.md workflows/dashboard-template.html
git commit -m "feat: create /nexo:status workflow with HTML dashboard"
```

### Task 4.6: Create update workflow

**Files:**
- Create: `workflows/update.md`

- [ ] **Step 1: Write the update workflow**

Follow GSD's update.md pattern:
1. Read `~/.claude/nexo-forge/VERSION` for installed version
2. Run `git ls-remote --tags https://github.com/fxl-br/nexo-forge.git` for latest tag
3. Compare versions — exit if up to date
4. Show changelog between versions (fetch from GitHub)
5. Check manifest for locally modified files → backup to `nexo-forge-patches/`
6. Re-run installer: `npx github:fxl-br/nexo-forge --claude`
7. Clear update cache (`~/.claude/cache/nexo-forge-update.json`)
8. If project has `.nexo/`: suggest running `/nexo:setup` to update local knowledge

- [ ] **Step 2: Commit**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git add workflows/update.md
git commit -m "feat: create /nexo:update workflow"
```

### Task 4.7: Create learn workflow

**Files:**
- Create: `workflows/learn.md`

- [ ] **Step 1: Write the learn workflow**

Instructions:
1. Ask what was learned (or accept inline description)
2. Classify: new standard, new pitfall, or improvement to existing
3. Identify domain (stack, security, database, etc.)
4. Generate formatted `.md` content following the knowledge format
5. Clone nexo-forge repo to temp directory
6. Add content to appropriate `knowledge/[domain]/standards.md` or `pitfalls.md`
7. Create branch `learn/short-description`
8. Commit the change
9. Show diff and ask if user wants to open PR
10. If yes: `gh pr create` with formatted description

- [ ] **Step 2: Commit**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git add workflows/learn.md
git commit -m "feat: create /nexo:learn workflow — knowledge feedback loop"
```

### Task 4.8: Create add workflow

**Files:**
- Create: `workflows/add.md`

- [ ] **Step 1: Write the add workflow**

Instructions:
1. Receive module name (frontend, backend, mobile, shared, or custom)
2. Validate module is known (or accept custom with path)
3. Scaffold directory structure for the module:
   - `mobile` → `apps/mobile/` with React Native/Expo skeleton
   - `frontend` → `apps/web/` with React/Vite skeleton
   - `backend` → `apps/api/` with Hono skeleton
   - `shared` → `packages/shared/` with TypeScript skeleton
4. Update `.nexo/config.json` — set `modules.[name].enabled = true`
5. Suggest relevant dependencies (MCPs, skills)
6. Show what was added

- [ ] **Step 2: Commit**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git add workflows/add.md
git commit -m "feat: create /nexo:add workflow — dynamic module management"
```

---

## Phase 5: Agents

### Task 5.1: Create agent definitions

**Files:**
- Create: `agents/nexo-planner.md`
- Create: `agents/nexo-auditor.md`
- Create: `agents/nexo-scaffolder.md`

Note: all paths relative to `/Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/`

- [ ] **Step 1: Create nexo-planner agent**

Agent for parallel phase planning. Used by `/nexo:plan-all`.

```markdown
---
name: nexo-planner
description: Plans a single GSD phase with discuss + plan. Spawned by /nexo:plan-all.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

You are a phase planner for an FXL project. Your job is to plan a single phase.

## Instructions

1. Read the phase description from `.planning/ROADMAP.md`
2. Run the equivalent of `gsd:discuss-phase --auto` for this phase
3. Run the equivalent of `gsd:plan-phase` for this phase
4. Report completion status
```

- [ ] **Step 2: Create nexo-auditor agent**

Agent for auditing project against standards. Used by `/nexo:audit`.

- [ ] **Step 3: Create nexo-scaffolder agent**

Agent for scaffolding new projects. Used by `/nexo:scaffold`.

- [ ] **Step 4: Commit**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git add agents/
git commit -m "feat: create agent definitions for planner, auditor, scaffolder"
```

---

## Phase 6: Installer

### Task 6.1: Create the installer script

**Files:**
- Create: `bin/install.cjs`

Note: path relative to `/Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/`

This is the most complex file. Follow GSD's `bin/install.js` pattern but simplified for Claude Code only (v1 — multi-runtime support can come later).

- [ ] **Step 1: Write the installer**

The installer must:
1. Parse args: `--claude`, `--global`, `--local`, `--uninstall`
2. Resolve target directory: `~/.claude/` (global) or `./.claude/` (local)
3. If existing installation: check manifest for modified files, backup to `nexo-forge-patches/`
4. Copy directories:
   - `commands/nexo/` → `{target}/commands/nexo/`
   - `nexo-forge/` content (workflows, knowledge, checklists, agents, deps, templates) → `{target}/nexo-forge/`
   - `agents/*.md` → `{target}/agents/nexo-*.md`
   - `hooks/*.js` → `{target}/hooks/nexo-*.js`
5. Write VERSION to `{target}/nexo-forge/VERSION`
6. Generate `nexo-forge-manifest.json` with SHA256 of all installed files
7. Register hooks in `settings.json`:
   - SessionStart: `nexo-check-update.js`
   - Statusline: `nexo-statusline.js`
8. Create `{target}/package.json` with `{"type": "commonjs"}` if not exists (for Node.js hooks)
9. Check GSD installed — warn if not
10. Print success banner with version

- [ ] **Step 2: Test the installer locally**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
node bin/install.cjs --claude --global
```

Verify:
- Files copied to `~/.claude/nexo-forge/`
- Commands in `~/.claude/commands/nexo/`
- Hooks registered in `~/.claude/settings.json`
- Manifest generated

- [ ] **Step 3: Commit**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git add bin/install.cjs
git commit -m "feat: create installer script for Claude Code"
```

---

## Phase 7: Hooks

### Task 7.1: Create update check hook

**Files:**
- Create: `hooks/nexo-check-update.js`

Note: path relative to `/Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge/`

- [ ] **Step 1: Write the SessionStart hook**

```javascript
#!/usr/bin/env node
// Nexo Forge update check — runs on SessionStart
// Spawns background process to avoid blocking

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const CACHE_FILE = path.join(process.env.HOME, '.claude', 'cache', 'nexo-forge-update.json');
const VERSION_FILE = path.join(process.env.HOME, '.claude', 'nexo-forge', 'VERSION');
const REPO = 'https://github.com/fxl-br/nexo-forge.git';

// Spawn detached background check
const child = spawn(process.execPath, ['-e', `
  const { execSync } = require('child_process');
  const fs = require('fs');
  const path = require('path');

  try {
    const installed = fs.readFileSync('${VERSION_FILE}', 'utf8').trim();
    const output = execSync('git ls-remote --tags ${REPO}', { timeout: 10000 }).toString();
    const tags = output.match(/refs\\/tags\\/v(\\d+\\.\\d+\\.\\d+)/g) || [];
    const versions = tags.map(t => t.replace('refs/tags/v', '')).sort();
    const latest = versions[versions.length - 1] || installed;

    const cacheDir = path.dirname('${CACHE_FILE}');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });

    fs.writeFileSync('${CACHE_FILE}', JSON.stringify({
      update_available: latest !== installed,
      installed,
      latest,
      checked: Date.now()
    }));
  } catch (e) {
    // Silently fail — don't block session
  }
`], { detached: true, stdio: 'ignore' });

child.unref();
```

- [ ] **Step 2: Commit**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git add hooks/nexo-check-update.js
git commit -m "feat: create SessionStart hook for update detection"
```

### Task 7.2: Create statusline hook

**Files:**
- Create: `hooks/nexo-statusline.js`

- [ ] **Step 1: Write the statusline hook**

```javascript
#!/usr/bin/env node
// Nexo Forge statusline — shows update indicator

const fs = require('fs');
const path = require('path');

const CACHE_FILE = path.join(process.env.HOME, '.claude', 'cache', 'nexo-forge-update.json');

try {
  if (fs.existsSync(CACHE_FILE)) {
    const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    if (cache.update_available) {
      process.stdout.write('\x1b[33m⬆ /nexo:update\x1b[0m │ ');
    }
  }
} catch (e) {
  // Silently fail
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git add hooks/nexo-statusline.js
git commit -m "feat: create statusline hook for update indicator"
```

---

## Phase 8: Cleanup MCP from App Nexo

### Task 8.1: Remove FXL-SDK MCP configuration

**Files:**
- Modify: `/Users/cauetpinciara/Documents/fxl/Projetos/nexo/.mcp.json` — remove `fxl-sdk` entry
- Modify: `/Users/cauetpinciara/Documents/fxl/Projetos/nexo/.claude/settings.json` — remove `fxl-sdk` MCP config
- Modify: `/Users/cauetpinciara/Documents/fxl/Projetos/nexo/.claude/settings.local.json` — remove `fxl-sdk` tool permissions

- [ ] **Step 1: Remove fxl-sdk from .mcp.json**

Read `.mcp.json`, remove the `fxl-sdk` server entry, keep any other MCP servers (like supabase).

- [ ] **Step 2: Remove fxl-sdk from settings.json**

Read `.claude/settings.json`, remove the `fxl-sdk` MCP server configuration.

- [ ] **Step 3: Remove fxl-sdk tool permissions from settings.local.json**

Read `.claude/settings.local.json`, remove any `mcp__fxl-sdk__*` tool permissions.

- [ ] **Step 4: Commit in Nexo repo**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo
git add .mcp.json .claude/settings.json .claude/settings.local.json
git commit -m "infra: remove FXL-SDK MCP configuration — replaced by Nexo Forge"
```

### Task 8.2: Archive MCP source code

**Files:**
- Delete or archive: `/Users/cauetpinciara/Documents/fxl/Projetos/nexo/mcp/fxl-sdk/`

- [ ] **Step 1: Verify knowledge migration is complete**

Before deleting, confirm all 101 standards and 30 pitfalls are in the nexo-forge repo.

- [ ] **Step 2: Remove the MCP directory**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo
rm -rf mcp/fxl-sdk/
```

- [ ] **Step 3: Commit in Nexo repo**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo
git add -A
git commit -m "infra: remove FXL-SDK MCP source code — migrated to Nexo Forge"
```

### Task 8.3: Remove old Nexo Skill from app

**Files:**
- Delete: `/Users/cauetpinciara/Documents/fxl/Projetos/nexo/.agents/skills/nexo/`

- [ ] **Step 1: Verify all content is migrated to nexo-forge repo**

Check that checklists, templates, workflows, and orchestrator rules all exist in the nexo-forge repo.

- [ ] **Step 2: Remove the old skill directory**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo
rm -rf .agents/skills/nexo/
```

- [ ] **Step 3: Commit in Nexo repo**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo
git add -A
git commit -m "infra: remove old Nexo Skill — replaced by Nexo Forge package"
```

---

## Phase 9: First Install and Validation

### Task 9.1: Tag v1.0.0 and install

- [ ] **Step 1: Tag the first release**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
git tag v1.0.0
```

- [ ] **Step 2: Run the installer**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo-forge
node bin/install.cjs --claude --global
```

- [ ] **Step 3: Verify installation**

Check:
- `~/.claude/nexo-forge/VERSION` exists and contains `1.0.0`
- `~/.claude/commands/nexo/` has all 9 command files
- `~/.claude/nexo-forge/workflows/` has all workflow files
- `~/.claude/nexo-forge/knowledge/` has all domain directories with content
- Hooks registered in `~/.claude/settings.json`
- `~/.claude/nexo-forge-manifest.json` exists with SHA256 hashes

### Task 9.2: Run setup on app Nexo as first consumer

- [ ] **Step 1: Run `/nexo:setup` in the Nexo app project**

```bash
cd /Users/cauetpinciara/Documents/fxl/Projetos/nexo
# Then in Claude Code: /nexo:setup
```

- [ ] **Step 2: Verify `.nexo/` was created**

Check:
- `.nexo/config.json` exists with correct modules
- `.nexo/knowledge/` has all standards and pitfalls
- `.nexo/checklists/` has all checklist files
- `.nexo/manifest.json` exists

- [ ] **Step 3: Run `/nexo:status` to verify everything is connected**

Verify it shows modules, deps, GSD state, and knowledge health.

---

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| 1 | 1.1-1.2 | Repo scaffolding |
| 2 | 2.1-2.2 | Knowledge migration from Supabase |
| 3 | 3.1-3.5 | Content migration from Nexo Skill |
| 4 | 4.1-4.8 | Commands and workflows |
| 5 | 5.1 | Agent definitions |
| 6 | 6.1 | Installer script |
| 7 | 7.1-7.2 | Hooks (update check + statusline) |
| 8 | 8.1-8.3 | Cleanup MCP + old skill from Nexo app |
| 9 | 9.1-9.2 | First install and validation |
