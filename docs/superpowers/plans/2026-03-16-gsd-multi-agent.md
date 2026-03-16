# GSD Multi-Agent Skill — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a self-contained skill at `.claude/skills/gsd-multi-agent/` that gives GSD automatic multi-module detection and parallel agent execution via tmux — without patching any GSD internal files.

**Architecture:** The skill provides rules files that GSD agents (planner, executor, verifier) read automatically via the existing skill discovery mechanism. Each rule file instructs the corresponding agent on multi-agent behavior. A SKILL.md index tells agents when and how to apply the rules.

**Tech Stack:** Claude Code skill system (SKILL.md + rules/*.md), tmux teammate mode, git

**Spec:** `docs/superpowers/specs/2026-03-16-gsd-multi-agent-design.md`

---

## Chunk 1: Skill Skeleton + SKILL.md

### Task 1: Create Skill Directory and SKILL.md

**Files:**
- Create: `.claude/skills/gsd-multi-agent/SKILL.md`

- [ ] **Step 1: Create skill directory**

```bash
mkdir -p .claude/skills/gsd-multi-agent/rules
mkdir -p .claude/skills/gsd-multi-agent/templates
```

- [ ] **Step 2: Write SKILL.md**

```markdown
---
name: gsd-multi-agent
description: Module-aware parallel execution for GSD. Automatically detects when a phase affects multiple modules and orchestrates parallel agents via tmux with hub-and-spoke communication.
---

# GSD Multi-Agent

Extends GSD with automatic multi-module detection and parallel agent execution.

## When This Skill Applies

This skill is relevant when:
- A GSD phase affects files in 2+ modules under `src/modules/`
- Each module has a `CLAUDE.md` declaring its boundaries and public API
- The project uses a modular monolith structure (modules/, platform/, shared/)

## Rules Index

Load rules based on your role:

| Your Role | Load This Rule | When |
|-----------|---------------|------|
| **gsd-planner** | `rules/module-detection.md` | Always during plan generation |
| **execute-phase orchestrator** | `rules/multi-agent-execution.md` | When plan has `execution_mode: multi-agent` |
| **gsd-executor** (spawned as module agent) | `rules/module-scoped-executor.md` | When spawned with `<agent_rules>` containing ownership |
| **gsd-verifier** | `rules/cross-module-verification.md` | When verifying a phase with `execution_mode: multi-agent` |
| **new-milestone orchestrator** | `rules/brainstorming-milestone.md` | Always during milestone creation |

## Key Concepts

- **Module Registry:** Each `src/modules/[name]/CLAUDE.md` declares ownership, public API, dependencies
- **Waves:** Wave 1 (platform/cross-cutting) → Wave 2 (parallel modules) → Wave 3 (integration verification)
- **Contracts:** TypeScript interfaces derived from plan delta — what changes in this phase
- **Hub-and-spoke:** Decisions/changes go through lead; simple signals (dependency ready) can be direct
- **Soft isolation:** Agents can read everything, write only in their owned scope

## Templates

- `templates/module-claude.md` — Template for module CLAUDE.md files

## Fallback

If tmux is not available or `execution_mode` is not `multi-agent`, all GSD behavior remains unchanged.
This skill adds capabilities — it never removes or overrides existing GSD behavior.
```

- [ ] **Step 3: Verify directory structure**

```bash
find .claude/skills/gsd-multi-agent -type f -o -type d | sort
```
Expected: SKILL.md, rules/, templates/

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/gsd-multi-agent/SKILL.md
git commit -m "infra: create gsd-multi-agent skill skeleton with SKILL.md"
```

---

## Chunk 2: Module Detection Rule (Planner)

### Task 2: Create module-detection.md Rule

**Files:**
- Create: `.claude/skills/gsd-multi-agent/rules/module-detection.md`

- [ ] **Step 1: Write module detection rule**

This rule is read by `gsd-planner` after it generates tasks. It instructs the planner to detect modules, classify tasks, and generate multi-agent plan structure.

```markdown
# Module Detection — Rules for gsd-planner

After generating tasks for a phase, perform these additional steps.

## Step 1: Discover Modules

```bash
ls -d src/modules/*/CLAUDE.md 2>/dev/null
```

Read each module's CLAUDE.md to understand ownership boundaries and public APIs.

**If a module directory exists but has NO CLAUDE.md:**
- Auto-generate a scaffold by analyzing exports:
  ```bash
  grep -r "^export" src/modules/{name}/ --include="*.ts" --include="*.tsx" | head -20
  ```
- Write scaffold using `.claude/skills/gsd-multi-agent/templates/module-claude.md`
- Log: "⚠ Auto-generated CLAUDE.md for module {name} — review recommended"

## Step 2: Map Tasks to Modules

For each task, identify files it will create/modify and map to owners:
- `src/modules/[name]/**` → module `[name]` (dynamic — any dir with CLAUDE.md)
- `src/platform/**` → platform (cross-cutting)
- `src/shared/**` → platform (cross-cutting)
- `docs/**`, `clients/**`, `tools/**`, `supabase/**`, root configs → lead agent (unmapped)

Classify each task as: `module-specific([name])`, `cross-cutting`, or `unmapped`.

## Step 3: Decide Execution Mode

Count tasks by category and calculate parallelization ratio:
- `ratio = module-scoped tasks in 2+ modules / total tasks`
- If ratio < 0.30 → `execution_mode: single-agent` (not worth parallelizing). STOP here.
- If ratio >= 0.30 → `execution_mode: multi-agent`. Continue to Step 4.

**Decision matrix:**
- Only 1 module affected → single-agent
- 2+ modules affected with ratio >= 0.30 → multi-agent
- Only cross-cutting (platform/shared) → single-agent
- Only unmapped (docs/, clients/, tools/) → single-agent
- Mix of modules + unmapped → multi-agent, unmapped tasks go to lead

**Examples:**
- 5 cross-cutting + 2 module-scoped = 2/7 = 28% → single-agent
- 3 cross-cutting + 8 module-scoped in 3 modules = 8/11 = 72% → multi-agent

## Step 4: Generate Multi-Agent Plan Structure

Add to PLAN.md frontmatter:
```yaml
execution_mode: multi-agent
agents:
  - name: platform
    ownership: ["src/platform/**", "src/shared/**"]
    tasks: [task-ids]
  - name: {module1}
    ownership: ["src/modules/{module1}/**"]
    tasks: [task-ids]
  - name: {module2}
    ownership: ["src/modules/{module2}/**"]
    tasks: [task-ids]
waves:
  1: { agent: platform, type: cross-cutting }
  2: { agents: [{module1}, {module2}], type: parallel-modules }
  3: { type: integration-verification }
```

Add `## Contracts` section to plan body with TypeScript interfaces:
```markdown
## Contracts

### platform → {module1}
- Exports: {exact TypeScript interface} (e.g., `TenantConfig { id: string, slug: string }`)
- Location: {exact file path}

### platform → {module2}
- Exports: {same or different interfaces}
- Location: {exact file path}
```

**Contract rules:**
- Derive from task descriptions — what each task creates/modifies that others need
- Use exact TypeScript interface definitions, NOT prose descriptions
- Include file paths for every export
- Only include contracts for the delta (what changes in this phase)

## Step 5: Detect Intra-Wave Dependencies (Sub-Waves)

If module A produces something module B consumes within Wave 2:
```yaml
waves:
  2a: { agents: [{producer}], type: parallel-modules }
  2b: { agents: [{consumer}], type: parallel-modules, depends_on: 2a }
```

If no inter-module dependencies: all modules in single Wave 2.

## Step 6: Self-Check

Before returning the plan:
- [ ] Every task assigned to exactly one agent
- [ ] No two agents own overlapping file paths
- [ ] Cross-cutting tasks assigned to platform agent
- [ ] Contracts include TypeScript interfaces (not prose)
- [ ] Sub-waves correctly ordered if inter-module dependencies exist
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/gsd-multi-agent/rules/module-detection.md
git commit -m "infra: add module-detection rule for gsd-planner"
```

---

## Chunk 3: Multi-Agent Execution Rule (Orchestrator)

### Task 3: Create multi-agent-execution.md Rule

**Files:**
- Create: `.claude/skills/gsd-multi-agent/rules/multi-agent-execution.md`

- [ ] **Step 1: Write multi-agent execution rule**

This rule is read by the execute-phase orchestrator when it detects `execution_mode: multi-agent` in a plan's frontmatter.

```markdown
# Multi-Agent Execution — Rules for execute-phase orchestrator

When a plan has `execution_mode: multi-agent` in frontmatter, follow this orchestration
instead of the standard single-agent execution.

## Prerequisites Check

```bash
# Verify tmux is available and teammate mode is configured
TMUX_INSTALLED=$(command -v tmux &>/dev/null && echo "true" || echo "false")
```

If tmux not available:
```
⚠ Multi-agent plan detected but tmux not available.
Falling back to sequential execution (waves in order, single agent).
```
→ Execute waves sequentially with standard gsd-executor. STOP reading this rule.

## Capture Baseline Commit

Before starting any wave:
```bash
BASELINE_COMMIT=$(git rev-parse HEAD)
```

## CHECKPOINT 1: Show Execution Plan

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► MULTI-AGENT EXECUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase {X}: {Name}
Execution Mode: multi-agent ({N} agents)

| Wave | Agent(s) | Tasks | What it builds |
|------|----------|-------|----------------|
| 1    | platform | {ids} | {description}  |
| 2    | {modules}| {ids} | {description}  |
| 3    | lead     | —     | Integration verification |

Contracts:
{contract summary from plan}

Proceed? (yes / adjust)
```

Wait for user confirmation.

## Wave 1: Platform Agent

Spawn platform agent:

```
Task(
  subagent_type="gsd-executor",
  model="{executor_model}",
  name="platform",
  prompt="
    <objective>
    Execute cross-cutting tasks for phase {phase_number}.
    You are the PLATFORM agent.
    </objective>

    <agent_rules>
    - Write: src/platform/**, src/shared/** ONLY
    - Read: entire codebase
    - Do NOT modify any src/modules/ directories
    - Report completion with exact list of exports created/modified
    </agent_rules>

    <contracts_you_produce>
    {contracts from plan where source is platform}
    </contracts_you_produce>

    <execution_context>
    @execute-plan.md @summary.md
    </execution_context>

    <files_to_read>
    - {phase_dir}/{plan_file}
    - .planning/STATE.md
    - ./CLAUDE.md
    </files_to_read>
  "
)
```

Wait for completion. Capture post-Wave-1 commit:
```bash
POST_WAVE1_COMMIT=$(git rev-parse HEAD)
```

## CHECKPOINT 2: Contract Refresh

After platform agent completes:

1. Read platform agent's SUMMARY.md
2. Read actual TypeScript files created/modified by platform agent
3. **Extract real type definitions** from code (not plan predictions)
4. Update contracts with concrete types for module agents
5. Log: `✓ Contracts refreshed from platform agent output`

If platform agent failed → see Error Recovery below.

## Wave 2: Module Agents (Parallel)

Check for sub-waves in plan frontmatter:
- If `waves.2a` and `waves.2b`: spawn 2a first, wait, then spawn 2b
- If single Wave 2: spawn all module agents in parallel

For each module agent:

```
Task(
  subagent_type="gsd-executor",
  model="{executor_model}",
  name="{module-name}",
  prompt="
    <objective>
    Execute {module-name} module tasks for phase {phase_number}.
    </objective>

    <agent_rules>
    Read rules from: .claude/skills/gsd-multi-agent/rules/module-scoped-executor.md
    Module: {module-name}
    Ownership: src/modules/{module-name}/**
    </agent_rules>

    <module_context>
    {contents of src/modules/{module-name}/CLAUDE.md}
    </module_context>

    <contracts_you_consume>
    {REFRESHED contracts with real TypeScript types from Checkpoint 2}
    </contracts_you_consume>

    <contracts_you_produce>
    {contracts where this module is source, if any}
    </contracts_you_produce>

    <execution_context>
    @execute-plan.md @summary.md
    </execution_context>

    <files_to_read>
    - {phase_dir}/{plan_file}
    - src/modules/{module-name}/CLAUDE.md
    - .claude/skills/gsd-multi-agent/rules/module-scoped-executor.md
    - .planning/STATE.md
    - ./CLAUDE.md
    </files_to_read>
  "
)
```

Platform agent stays active during Wave 2 for scope escalation:
```
SendMessage(to="platform", "Standby for Wave 2. Module agents may request
  changes to shared/ or platform/. Wait for lead instructions.")
```

**Lead responsibilities during Wave 2:**
- Monitor incoming messages from module agents via SendMessage
- If scope escalation → delegate to platform agent or authorize
- If contract deviation → evaluate, update contracts, notify affected agents
- If blocker → coordinate resolution between agents

Wait for all module agents to complete.

## Scope Violation Check

After Wave 2:
```bash
for AGENT in {module-names}; do
  OUT_OF_SCOPE=$(git diff --name-only $POST_WAVE1_COMMIT -- | grep -v "src/modules/${AGENT}/" | head -5)
  if [[ -n "$OUT_OF_SCOPE" ]]; then
    echo "⚠ Agent ${AGENT} modified files outside scope: ${OUT_OF_SCOPE}"
    # Revert out-of-scope changes
    git checkout $POST_WAVE1_COMMIT -- $OUT_OF_SCOPE
  fi
done
```

## CHECKPOINT 3: Integration Verification

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► INTEGRATION VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```bash
npx tsc --noEmit
npm run build
```

Check cross-module imports — verify no module imports internals from another.
If verification fails → identify which agent's domain → re-spawn with fix.
If passes → continue to standard GSD aggregate_results.

## Error Recovery

If an agent fails (crash, rate limit, unrecoverable error):

1. **Other agents continue** — no global abort
2. **Evaluate git diff** of failed agent:
   ```bash
   git diff --name-only $POST_WAVE1_COMMIT -- src/modules/{failed-agent}/
   ```
3. **Commit good work** (completed tasks):
   ```bash
   git add {completed-files}
   git commit -m "partial: {agent-name} completed tasks before failure"
   ```
4. **Revert incomplete** changes
5. **Re-spawn with remaining tasks only** — fresh agent, no state restoration
6. **If dependents exist** → pause signal until re-spawn completes
7. **If re-spawn fails 2x** → lead executes remaining tasks (break glass)
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/gsd-multi-agent/rules/multi-agent-execution.md
git commit -m "infra: add multi-agent execution rule for execute-phase orchestrator"
```

---

## Chunk 4: Module-Scoped Executor + Cross-Module Verification Rules

### Task 4: Create module-scoped-executor.md Rule

**Files:**
- Create: `.claude/skills/gsd-multi-agent/rules/module-scoped-executor.md`

- [ ] **Step 1: Write module-scoped executor rule**

```markdown
# Module-Scoped Executor — Rules for gsd-executor spawned as module agent

When you are spawned with `<agent_rules>` containing ownership boundaries,
follow these rules in addition to standard gsd-executor behavior.

## Scope Enforcement

- **Do NOT run** `tsc --noEmit` or `npm run build` — other agents may be writing
  simultaneously, results would be inconsistent. Full-project checks run at lead level only.
- Before every file write, verify the target path is within your declared ownership.
- If a task requires modifying a file outside your scope:
  1. Do NOT modify it
  2. SendMessage to lead: "Task {N} needs change in {file} outside my scope: {what change}"
  3. Continue with other tasks that don't require out-of-scope changes
  4. Wait for lead response before completing the blocked task

## Communication Protocol (Hub-and-Spoke)

**Via lead (mandatory for decisions/changes):**
- Contract deviations → SendMessage(to="lead", ...)
- Scope escalation (need to write outside ownership) → SendMessage(to="lead", ...)
- Blockers (waiting on another agent's output) → SendMessage(to="lead", ...)

**Direct to other agents (informational signals only):**
- Dependency ready → SendMessage(to="{agent-name}", "{thing} exported. You can use it.")
- Status broadcast → SendMessage(to="{agent-name}", "Completed task {N}")

**NEVER** negotiate contract changes directly with other agents.

## Scope Verification Before Done

Before creating SUMMARY.md:
```bash
git diff --name-only {start-commit} | grep -v "{my-ownership-pattern}"
```
If any files outside scope were modified:
- Revert them: `git checkout {start-commit} -- {out-of-scope-files}`
- Report to lead what was reverted and why it was needed

## Contract Compliance

- Consume contracts exactly as provided (TypeScript types, file paths)
- If a consumed contract is wrong or insufficient, report to lead — do NOT work around it
- If you produce contracts, ensure your exports match exactly
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/gsd-multi-agent/rules/module-scoped-executor.md
git commit -m "infra: add module-scoped executor rule for soft isolation"
```

---

### Task 5: Create cross-module-verification.md Rule

**Files:**
- Create: `.claude/skills/gsd-multi-agent/rules/cross-module-verification.md`

- [ ] **Step 1: Write cross-module verification rule**

```markdown
# Cross-Module Verification — Rules for gsd-verifier

When verifying a phase whose plan has `execution_mode: multi-agent`, perform
these additional checks after the standard verification.

## 1. Public API Boundary Check

For each module with a CLAUDE.md under `src/modules/`:
- Read the module's `## Public API` section
- Search for imports FROM this module in OTHER modules:
  ```bash
  grep -r "from.*modules/{name}" src/modules/ --include="*.ts" --include="*.tsx" \
    | grep -v "src/modules/{name}/"
  ```
- Verify all cross-module imports use only declared public API exports
- **Flag** any import reaching into module internals (e.g., `modules/wireframe/components/internal/`)

## 2. Contract Implementation Check

Read the plan's `## Contracts` section:
- For each contract, verify declared exports exist in specified files
- Verify TypeScript types match contract shapes (read the actual .ts files)
- **Flag** missing or mismatched exports as gaps

## 3. Module CLAUDE.md Freshness

For each module affected by this phase:
- Check if new exports created during the phase are listed in the module's CLAUDE.md Public API
- If not: add to gaps as "CLAUDE.md needs update for [new export]"

## 4. Scope Compliance

```bash
# Verify no module agent committed files outside its declared ownership
git log --format="%H %s" -- "src/modules/{module}/" | head -20
```
Flag any commits that modified files outside the declared module ownership.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/gsd-multi-agent/rules/cross-module-verification.md
git commit -m "infra: add cross-module verification rule for gsd-verifier"
```

---

## Chunk 5: Brainstorming Rule + Module Template

### Task 6: Create brainstorming-milestone.md Rule

**Files:**
- Create: `.claude/skills/gsd-multi-agent/rules/brainstorming-milestone.md`

- [ ] **Step 1: Write brainstorming milestone rule**

```markdown
# Brainstorming in Milestones — Rules for new-milestone orchestrator

Before defining requirements (Step 9 in the new-milestone workflow),
invoke the brainstorming skill to explore the milestone scope.

## When to Apply

Always apply when running `/gsd:new-milestone`, unless user passes `--skip-brainstorm`.

## Process

After gathering milestone goals (Step 2) and before defining requirements:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► BRAINSTORMING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Exploring milestone scope before requirements...
```

Invoke `superpowers:brainstorming` skill with context:
- Project context: from PROJECT.md
- Previous milestones: from MILESTONES.md
- User's stated goals: from Step 2

The brainstorming process:
1. Asks clarifying questions (one at a time)
2. Proposes 2-3 approaches with trade-offs
3. Presents design by sections for approval
4. Writes spec to `docs/superpowers/specs/YYYY-MM-DD-<milestone-name>-design.md`

## After Brainstorming

- Use the approved spec as primary input for requirements definition
- Reference spec path in PROJECT.md under Current Milestone
- The spec becomes the source of truth for what the milestone should build

## Why

Guarantees every milestone goes through structured exploration of requirements,
alternatives, and trade-offs before becoming phases in the roadmap.
Prevents the "I already know what to do, let me code" anti-pattern.
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/gsd-multi-agent/rules/brainstorming-milestone.md
git commit -m "infra: add brainstorming-milestone rule for new-milestone workflow"
```

---

### Task 7: Create Module CLAUDE.md Template

**Files:**
- Create: `.claude/skills/gsd-multi-agent/templates/module-claude.md`

- [ ] **Step 1: Write template**

```markdown
# Module: {{module-name}}

## Purpose
{{one-line description}}

## Ownership
- src/modules/{{module-name}}/**

## Public API

### Types
- {{TypeName}}: {{brief description}} (src/modules/{{module-name}}/types/{{file}})

### Hooks
- {{useHookName}}: {{brief description}} (src/modules/{{module-name}}/hooks/{{file}})

### Components
- {{ComponentName}}: {{brief description}} (src/modules/{{module-name}}/components/{{file}})

## Dependencies

### From shared/
- {{imports from shared/}}

### From platform/
- {{imports from platform/}}

### From other modules
- modules/{{other}}: {{what it reads, always read-only}}

## Validation
- {{module-specific checks}}

## Agent Rules
- **Write:** Only files under `src/modules/{{module-name}}/`
- **Read:** Entire codebase
- **Shared writes:** Request via lead → platform agent
- **Cross-module writes:** Never — report to lead
- **Do NOT run** `tsc --noEmit` individually (lead runs full-project check)
```

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/gsd-multi-agent/templates/module-claude.md
git commit -m "infra: add module CLAUDE.md template"
```

---

## Chunk 6: README + Module CLAUDE.md Generation + Final Verification

### Task 8: Create Operational README

**Files:**
- Create: `.claude/skills/gsd-multi-agent/README.md`

- [ ] **Step 1: Write README**

Move the content from `docs/superpowers/specs/README-multi-agent.md` into the skill directory.
The README should contain the full operational guide: tmux setup, flow steps, tmux layout diagrams,
communication examples, decision table, ownership rules, verification levels, troubleshooting.

Use the approved content from `docs/superpowers/specs/README-multi-agent.md` as the source.

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/gsd-multi-agent/README.md
git commit -m "infra: add operational README to gsd-multi-agent skill"
```

---

### Task 9: Generate Module CLAUDE.md Files

**Files:**
- Create: `src/modules/docs/CLAUDE.md`
- Create: `src/modules/clients/CLAUDE.md`
- Create: `src/modules/wireframe/CLAUDE.md`
- Create: `src/modules/tasks/CLAUDE.md`

For each module, discover actual exports/imports and generate CLAUDE.md.
Skip `ferramentas`, `hooks`, `knowledge-base` (being removed/reorganized per v3.0).

- [ ] **Step 1: Discover exports for each module**

```bash
# For each module, list exports and cross-module imports
for mod in docs clients wireframe tasks; do
  echo "=== $mod EXPORTS ==="
  grep -r "^export" "src/modules/$mod/" --include="*.ts" --include="*.tsx" 2>/dev/null | head -15
  echo "=== $mod IMPORTS FROM OUTSIDE ==="
  grep -r "from.*shared\|from.*platform\|from.*modules/" "src/modules/$mod/" --include="*.ts" --include="*.tsx" 2>/dev/null | head -15
  echo ""
done
```

- [ ] **Step 2: Write CLAUDE.md for docs module**

Based on discovery. Key contents: useDoc, useDocsNav hooks; MarkdownRenderer, DocBreadcrumb,
Callout, Operational, PageHeader, PhaseCard, PromptBlock, DocTableOfContents, InfoBlock components;
docs-parser, docs-service, search-index services; DocRenderer page.

- [ ] **Step 3: Write CLAUDE.md for clients module**

Key contents: BriefingForm, BlueprintTextView, WireframeViewer, ClientsIndex pages;
imports from wireframe module (read-only).

- [ ] **Step 4: Write CLAUDE.md for wireframe module**

Key contents: ComponentGallery, SharedWireframeView pages; manifest.tsx;
chart components; blueprint types; wireframe builder integration.

- [ ] **Step 5: Write CLAUDE.md for tasks module**

Key contents: tasks-service.ts; task types; Supabase integration.

- [ ] **Step 6: Verify all CLAUDE.md files exist and are valid**

```bash
ls src/modules/*/CLAUDE.md
for mod in docs clients wireframe tasks; do
  echo "=== $mod ==="
  head -3 "src/modules/$mod/CLAUDE.md"
done
```

- [ ] **Step 7: Commit**

```bash
git add src/modules/docs/CLAUDE.md src/modules/clients/CLAUDE.md \
  src/modules/wireframe/CLAUDE.md src/modules/tasks/CLAUDE.md
git commit -m "infra: generate module CLAUDE.md files for multi-agent boundaries"
```

---

### Task 10: Final Verification

**Files:**
- Read: All skill files

- [ ] **Step 1: Verify complete skill structure**

```bash
find .claude/skills/gsd-multi-agent -type f | sort
```

Expected:
```
.claude/skills/gsd-multi-agent/README.md
.claude/skills/gsd-multi-agent/SKILL.md
.claude/skills/gsd-multi-agent/rules/brainstorming-milestone.md
.claude/skills/gsd-multi-agent/rules/cross-module-verification.md
.claude/skills/gsd-multi-agent/rules/module-detection.md
.claude/skills/gsd-multi-agent/rules/module-scoped-executor.md
.claude/skills/gsd-multi-agent/rules/multi-agent-execution.md
.claude/skills/gsd-multi-agent/templates/module-claude.md
```

- [ ] **Step 2: Verify all module CLAUDE.md files exist**

```bash
ls src/modules/docs/CLAUDE.md src/modules/clients/CLAUDE.md \
  src/modules/wireframe/CLAUDE.md src/modules/tasks/CLAUDE.md
```

- [ ] **Step 3: Verify TypeScript still passes (no code changes)**

```bash
npx tsc --noEmit
```
Expected: No errors (only markdown files created)

- [ ] **Step 4: Verify skill is discoverable by GSD**

```bash
ls .claude/skills/*/SKILL.md
```
Expected: includes `.claude/skills/gsd-multi-agent/SKILL.md`

- [ ] **Step 5: Final commit if needed**

```bash
git status
git diff --cached --quiet || git commit -m "infra: finalize gsd-multi-agent skill"
```
