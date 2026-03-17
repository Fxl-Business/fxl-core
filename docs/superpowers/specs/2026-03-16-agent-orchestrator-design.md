# Agent Orchestrator — Design Spec

**Date:** 2026-03-16
**Status:** Approved
**Replaces:** `.claude/skills/gsd-multi-agent/` (deprecated after implementation)

---

## 1. Problem Statement

The GSD Multi-Agent skill defines a complete parallel execution system (boundary detection, wave orchestration, scope enforcement, contracts) but has zero integration with the GSD workflows that should consume it. The `plan-phase.md` and `execute-phase.md` workflows never load or reference the skill's rules. Additionally, the skill only works within GSD — there's no way to leverage parallel agents in ad-hoc Claude Code usage.

### Diagnosed Inconsistencies (pre-existing)

| # | Issue | Severity |
|---|-------|----------|
| 1 | GSD workflows don't reference the skill | Critical |
| 2 | `tools/wireframe-builder/` has no ownership mapping | High |
| 3 | Extra modules (ferramentas/, hooks/) not handled | Medium |
| 4 | Module CLAUDE.md template incomplete vs reality | Medium |
| 5 | Scope violation git diff logic fails in parallel | Medium |
| 6 | "Waves" concept collision (GSD plan waves vs orchestration waves) | Medium |
| 7 | Contracts predicted in plan vs actual types created | Medium |

This design addresses all seven issues.

---

## 2. Solution Overview

A single skill — `agent-orchestrator` — that replaces `gsd-multi-agent` and works in two contexts:

- **GSD context:** Integrates with plan-phase and execute-phase via 3 minimal references in workflows. The planner detects boundaries and generates multi-agent plans. The executor reads the plan and orchestrates waves.
- **Ad-hoc context:** Claude Code loads SKILL.md at conversation start. When the user's request involves work across multiple boundaries, the skill activates automatically based on confidence thresholds.

### Design Decisions

- **Automatic boundary detection** — adapts to any project structure (modules/, packages/, workspaces/, convention dirs). Does not require `src/modules/*/CLAUDE.md` as prerequisite.
- **Threshold-based autonomy** — acts automatically at high confidence (ratio >= 50%), asks at borderline (30-50%), stays silent below 30%.
- **Replaces gsd-multi-agent** — one system, one documentation set, zero duplication.
- **Contracts generated post-Wave-1** — real TypeScript extracted from code, not predicted in the plan.
- **Agent commit tracers** — `[agent:{name}]` in commit messages enables per-agent scope verification.

---

## 3. Skill Structure

```
.claude/skills/agent-orchestrator/
├── SKILL.md                    # Entry point — when to apply, rules index
├── rules/
│   ├── boundary-detection.md   # Detect modules, packages, workspaces, etc.
│   ├── task-analysis.md        # Evaluate if tasks are parallelizable
│   ├── orchestration.md        # Waves, contracts, spawn, scope enforcement
│   ├── scoped-agent.md         # Rules injected into each boundary agent
│   └── integration-check.md    # Post-execution verification
├── templates/
│   └── boundary-claude.md      # Template for boundary CLAUDE.md files
└── README.md                   # Portable operational guide
```

---

## 4. Boundary Detection

### 4.1 Detection Hierarchy (priority descending)

| Signal | Detection Method | Example |
|--------|-----------------|---------|
| **Explicit CLAUDE.md** | `ls */CLAUDE.md` recursive in src/ | `src/modules/wireframe/CLAUDE.md` |
| **Monorepo workspaces** | `package.json` → `workspaces` field | `packages/api/`, `packages/web/` |
| **Package boundaries** | Directories with own `package.json` | `apps/dashboard/package.json` |
| **Convention directories** | Known patterns: `modules/`, `services/`, `apps/`, `packages/` | `src/services/auth/` |
| **Size heuristic** | Dirs with 5+ .ts/.tsx files and clear exports | `src/features/billing/` |

Higher-priority signals take precedence. If a directory matches via CLAUDE.md, it won't be re-detected by convention.

### 4.2 Boundary Map Output

```yaml
boundaries:
  - name: wireframe
    path: src/modules/wireframe/
    source: claude-md
    has_manifest: true
    file_count: 12
    associated:
      - path: tools/wireframe-builder/
        access: read-write
        reason: "hybrid architecture - components shared across contexts"
  - name: clients
    path: src/modules/clients/
    source: claude-md
    has_manifest: true
    file_count: 18
  - name: api
    path: packages/api/
    source: workspace
    has_manifest: false
    file_count: 45

cross_cutting:
  - path: src/platform/
  - path: src/shared/

unmapped:
  - path: docs/
  - path: supabase/
```

### 4.3 Associated Paths

Boundaries can declare associated paths — directories outside the main boundary that logically belong to the same domain. Detected via:

1. CLAUDE.md "From tools/" or similar sections listing external imports
2. Import analysis — if 80%+ of a directory's consumers are in one boundary

This resolves the `tools/wireframe-builder/` ownership problem: the wireframe agent gets read-write access to its associated paths without restructuring the codebase.

### 4.4 Filtering Noise

Directories that match detection signals but shouldn't be boundaries:

- Dirs with < 3 files (likely scaffolding or stubs)
- Dirs containing only re-exports or index files
- Dirs already nested inside a detected boundary

This prevents `src/modules/ferramentas/` (1 file) and `src/modules/hooks/` (empty) from being treated as valid boundaries.

### 4.5 Boundary Overlap Resolution

When two boundaries claim the same associated path (e.g., both `billing` and `payments` import heavily from `src/shared/billing-utils/`):

1. **If one has 80%+ of imports:** that boundary gets read-write, the other gets read-only
2. **If roughly equal (no clear owner):** the path stays in `cross_cutting` — owned by the platform/lead agent, both boundary agents get read-only access
3. **If a CLAUDE.md explicitly declares the path:** that declaration wins over heuristic detection

Overlap is never silently ignored — the boundary map must resolve every path to exactly one owner (or cross_cutting).

### 4.6 Single Boundary = Valid Outcome

Detecting exactly 1 boundary is expected and common (small projects, flat structures). The skill stays inactive in this case — Section 5.1 decision matrix routes `any | 1` to `single-agent`. No warning, no suggestion to restructure. The skill simply doesn't apply.

---

## 5. Task Analysis

### 5.1 GSD Context (inside plan-phase)

After the planner generates tasks:

1. **Map each task** to a boundary via files it creates/modifies
2. **Calculate ratio:** `tasks in 2+ boundaries / total tasks`
3. **Decide:**

| Ratio | Boundaries | Decision | Action |
|-------|-----------|----------|--------|
| < 30% | any | `single-agent` | Standard execution, no overhead |
| 30-50% | 2+ | `multi-agent` with confirmation | Ask user: "Detected parallelization potential. Confirm?" |
| > 50% | 2+ | `multi-agent` automatic | Act directly |
| any | 1 | `single-agent` | Only 1 boundary, nothing to parallelize |

### 5.2 Ad-hoc Context (outside GSD)

When the user makes a direct request (no /gsd:), the skill evaluates the prompt:

1. **Detect parallel work signals:**
   - Multiple files in different boundaries mentioned
   - Conjunction separating independent tasks ("add X to module A **and** Y to module B")
   - Lists of tasks with no dependency between them

2. **Classify each sub-task** by boundary
3. **Calculate ratio after decomposition** — the threshold applies to the decomposed sub-tasks, not the original prompt. If decomposition is ambiguous (unclear if tasks are truly independent), treat as lower confidence and use the 30-50% confirmation path.
4. **If threshold met:** present orchestration plan before executing

### 5.3 Anti-Parallelization Signals

Even with high ratio, the skill backs off if it detects:

- **Chained tasks** — output of one is input of another
- **Schema migrations** — must run sequentially
- **Hot shared file** — 3+ tasks modify the same file
- **Global refactoring** — renames, moves crossing all boundaries

---

## 6. Orchestration

### 6.1 Three-Wave Architecture

```
Wave 1: Cross-cutting agent (platform/, shared/, configs, migrations)
         → Produces real contracts (TypeScript extracted from code)

Wave 2: Boundary agents in parallel (1 agent per boundary)
         → Each receives refreshed contracts + scope rules
         → Platform agent stays on standby for scope escalation

Wave 3: Integration verification (lead)
         → tsc, build, cross-boundary import audit, scope compliance
```

### 6.2 Sub-Waves (Intra-Wave Dependencies)

If boundary A produces something boundary B consumes within Wave 2:

```yaml
waves:
  2a: { agents: [producer-boundary], type: parallel-boundaries }
  2b: { agents: [consumer-boundary], type: parallel-boundaries, depends_on: 2a }
```

Detection: during task analysis, if a task in boundary B has `read_first` referencing a file that a task in boundary A creates, they cannot run in parallel. The planner splits Wave 2 into sub-waves.

If no inter-boundary dependencies exist: all boundaries in a single Wave 2.

### 6.3 Contracts — Post-Wave-1 Generation

The plan defines contract intent only:

```yaml
contracts:
  - from: platform
    to: [wireframe, clients]
    description: "Tenant context and config types"
    files: [src/platform/types/tenant.ts]
```

After Wave 1 completes, the lead:

1. Reads actual files created/modified by the platform agent
2. Extracts concrete TypeScript exports and type definitions
3. Injects into boundary agent prompts as `<contracts_you_consume>`

This eliminates the predicted-vs-actual types inconsistency.

### 6.4 Scope Enforcement via Commit Tracers

Each agent includes `[agent:{name}]` in every commit message:

```bash
# Agent commits: "feat(wireframe): add component X [agent:wireframe]"

# Lead verifies per-agent scope:
git log --format="%H" --grep="\[agent:${AGENT}\]" ${START_COMMIT}..HEAD | \
  xargs -I{} git diff-tree --no-commit-id --name-only -r {} | \
  grep -v "${OWNERSHIP_PATTERN}" | grep -v "${ASSOCIATED_PATTERN}"
```

This replaces the broken global `git diff` approach that produced false positives in parallel execution.

### 6.5 Spawn Pattern

```
Agent(
  subagent_type="gsd-executor",   # or omitted for ad-hoc
  name="{boundary-name}",
  prompt="
    <role>You are the {boundary-name} agent.</role>
    <ownership>{boundary paths + associated paths}</ownership>
    <scope_rules>
    Read: .claude/skills/agent-orchestrator/rules/scoped-agent.md
    </scope_rules>
    <contracts>{refreshed contracts from Wave 1}</contracts>
    <tasks>{tasks assigned to this boundary}</tasks>
  "
)
```

### 6.6 Fallback Without tmux

If tmux is not available:
- Waves execute sequentially (Wave 1 → Wave 2a → Wave 2b → Wave 3)
- Same contract and scope logic, no parallelism
- Zero interface change — the plan is identical, only execution is serial
- `SendMessage` between agents is NOT available without tmux — all communication goes through the lead's sequential orchestration

### 6.7 API Surface Requirements

| Feature | Requires tmux | Requires Agent tool | Notes |
|---------|:---:|:---:|-------|
| Wave-based execution | No | Yes | Sequential fallback without tmux |
| Parallel Wave 2 spawn | Yes | Yes | Multiple agents in tmux panes |
| `SendMessage` between agents | Yes | — | Hub-and-spoke communication |
| Scope enforcement | No | — | Git-based, works anywhere |
| Integration check | No | — | Lead runs checks directly |

To enable full parallel mode, users need `teammateMode: "tmux"` in Claude Code settings (`.claude/settings.json` or global).

### 6.8 Communication Protocol

- **Via lead (mandatory):** contract deviations, scope escalation, blockers, design decisions
- **Direct between agents (informational only):** dependency ready signals, status broadcasts
- **Never:** contract negotiation between agents without lead mediation

---

## 7. Scoped Agent Rules

Rules injected into every boundary agent prompt. Universal across GSD and ad-hoc contexts.

### 7.1 Core Rules

1. WRITE only in declared paths (ownership + associated)
2. READ any file in the codebase
3. Do NOT run `tsc --noEmit` or `npm run build` (other agents writing simultaneously = inconsistent results)
4. Before every file write, verify target path is within ownership
5. Commit messages include `[agent:{name}]` as tracer
6. If need to write outside scope → `SendMessage(to="lead")` and continue other tasks
7. If consumed contract is wrong → report to lead, do NOT work around it
8. If producing contract → ensure exports match exactly

### 7.2 Scope Verification Before Done

```bash
# List files this agent touched (via tracer)
git log --format="%H" --grep="\[agent:{name}\]" {start_commit}..HEAD | \
  xargs -I{} git diff-tree --no-commit-id --name-only -r {}

# Filter outside ownership
| grep -v "{ownership_pattern}" | grep -v "{associated_pattern}"

# If anything remains → revert + report to lead
```

### 7.3 Context Differences

| Aspect | GSD | Ad-hoc |
|--------|-----|--------|
| Tasks come from | PLAN.md with XML tasks | Lead decomposes user prompt |
| Commit convention | Project CLAUDE.md + `[agent:name]` | Project CLAUDE.md + `[agent:name]` |
| Summary output | SUMMARY.md in phase dir | Consolidated response to user |
| State tracking | STATE.md, ROADMAP.md | None (conversation is state) |
| Recovery on interruption | Re-run execute-phase, skips completed plans | No recovery — must restart |

Core rules are identical in both contexts.

**Ad-hoc limitation:** If the lead conversation is interrupted during ad-hoc orchestration (terminal closed, network drop), there is no recovery path. Agents may have committed partial work. The user must inspect `git log` and decide whether to continue or reset. This is an accepted trade-off — adding state files for ad-hoc mode would add complexity disproportionate to the use case.

---

## 8. Integration Check

### 8.1 Automatic Checks (always)

```bash
# 1. Global type check
npx tsc --noEmit

# 2. Build
npm run build

# 3. Cross-boundary import audit (flag INTERNAL imports only)
# Legitimate: importing from boundary's public API (manifest, types/index)
# Violation: importing from boundary's internals (components/internal/, services/private/)
for BOUNDARY in {boundaries}; do
  # Find all imports FROM this boundary in OTHER boundaries
  grep -r "from.*${BOUNDARY}/" src/ --include="*.ts" --include="*.tsx" \
    | grep -v "${BOUNDARY_PATH}/"           \  # exclude self-imports
    | grep -v "/manifest"                   \  # manifests are public API
    | grep -v "${BOUNDARY}/types/index"     \  # type re-exports are public
    | grep -v "${BOUNDARY}/hooks/use"          # exported hooks are public
  # Remaining matches = internal imports = violations
done

# 4. Scope compliance via commit tracers
# (per-agent verification from Section 7.2)
```

### 8.2 Conditional Checks

| Condition | Additional check |
|-----------|-----------------|
| Project has tests | `npm test` or `npx vitest run` |
| Boundary has CLAUDE.md | Verify new exports documented in Public API |
| Contracts defined | Verify declared exports exist in specified files |
| Project has lint | `npm run lint` |

### 8.3 Failure Recovery

```
tsc failed    → identify which boundary caused → re-spawn agent with specific error
build failed  → same approach
import audit  → lead fixes (usually 1 wrong import)
scope violation → revert + re-spawn
```

Limit: 2 fix attempts per agent. If fails 2x, lead executes remaining tasks manually.

### 8.4 Output

**GSD context:** Creates section in VERIFICATION.md with cross-boundary check results.

**Ad-hoc context:** Reports to user:
```
Parallel execution complete (3 agents, 2 waves).
✓ TypeScript: 0 errors
✓ Build: OK
✓ Cross-boundary imports: clean
✓ Scope compliance: all agents in-bounds
```

---

## 9. GSD Bridge

### 9.1 Integration Points (3 references)

**Reference 1 — In `plan-phase.md`**

**Anchor:** Inside `<step name="8">` (Spawn gsd-planner Agent), append to the planner prompt's `<planning_context>` block, after the `<downstream_consumer>` section:

```markdown
<parallel_execution>
Read .claude/skills/agent-orchestrator/rules/boundary-detection.md
and .claude/skills/agent-orchestrator/rules/task-analysis.md

After generating tasks, run boundary detection and task analysis.
If execution_mode resolves to multi-agent, add to PLAN.md frontmatter:
  execution_mode, agents[], contracts[]
If single-agent, omit (standard behavior).
</parallel_execution>
```

**Reference 2 — In `execute-phase.md`**

**Anchor:** Inside `<step name="execute_waves">`, before item 2 ("Spawn executor agents"), add:

```markdown
<parallel_execution_check>
Read first incomplete plan's frontmatter. If `execution_mode: multi-agent`:
  Read .claude/skills/agent-orchestrator/rules/orchestration.md
  Follow wave-based orchestration instead of standard sequential spawn.
  STOP reading the rest of execute_waves — orchestration.md takes over.

If execution_mode absent or single-agent:
  Continue with standard execution below (no change).
</parallel_execution_check>
```

**Reference 3 — In `verify-phase.md` (gsd-verifier workflow)**

**Anchor:** After the standard verification checks, before writing VERIFICATION.md:

```markdown
<cross_boundary_check>
If phase plan has `execution_mode: multi-agent`:
  Read .claude/skills/agent-orchestrator/rules/integration-check.md
  Run cross-boundary verification in addition to standard checks.
  Append results to VERIFICATION.md under "## Cross-Boundary Verification".
</cross_boundary_check>
```

### 9.2 What Does NOT Change in Workflows

- Research, context, Nyquist validation — untouched
- Plans without `execution_mode: multi-agent` — identical flow
- Quick tasks — always single-agent, no evaluation
- Checkpoint handling — works the same within waves

### 9.3 Portability

**Project without GSD:**
1. Copy `.claude/skills/agent-orchestrator/` to project
2. Skill works via SKILL.md — Claude Code reads and applies the "instinct"
3. Only ad-hoc mode available (detection by prompt analysis)

**Project with GSD:**
1. Copy the skill
2. Add 3 references to workflows (2-3 lines each)
3. Both modes available (GSD + ad-hoc)

README documents both scenarios with copy-paste instructions.

---

## 10. Migration from gsd-multi-agent

### 10.1 What Transfers

| From gsd-multi-agent | To agent-orchestrator |
|---------------------|----------------------|
| `rules/module-detection.md` | `rules/boundary-detection.md` (generalized) |
| `rules/multi-agent-execution.md` | `rules/orchestration.md` (contracts fix, tracer fix) |
| `rules/module-scoped-executor.md` | `rules/scoped-agent.md` (simplified) |
| `rules/cross-module-verification.md` | `rules/integration-check.md` (expanded) |
| `rules/brainstorming-milestone.md` | Migrates to `.claude/get-shit-done/workflows/brainstorming-milestone.md` (not an orchestration concern — belongs in GSD workflow layer) |
| `templates/module-claude.md` | `templates/boundary-claude.md` (expanded sections) |

### 10.2 What Gets Deprecated

- `.claude/skills/gsd-multi-agent/` — entire directory (replaced by agent-orchestrator)

### 10.3 What Coexists

- `.claude/skills/build-with-agent-team/` — **NOT deprecated.** Serves a different use case: greenfield project builds from a plan document with explicit team definition, lead-authored contracts before spawning, and cross-review patterns (frontend reviews backend API). Agent-orchestrator handles boundary-based parallelization within an existing codebase; build-with-agent-team handles full-stack builds from scratch. They complement each other.

### 10.4 Migration Prerequisites

Before deprecating `gsd-multi-agent/`:
1. Move `rules/brainstorming-milestone.md` to `.claude/get-shit-done/workflows/brainstorming-milestone.md`
2. Update `new-milestone` workflow to reference new path
3. Create `agent-orchestrator/` with all rules
4. Add 3 integration references to GSD workflows
5. Verify one phase end-to-end with new skill
6. Delete `gsd-multi-agent/` directory

### 10.5 Boundary CLAUDE.md Template Updates

The template expands to match what phases 60-63 actually created:

```markdown
# Boundary: {{name}}

## Purpose
{{one-line description}}

## Ownership
- {{primary path}}

## Associated Paths
- {{external paths with read-write access, if any}}

## Public API

### Types
### Hooks
### Components
### Services
### Pages
### Extensions

## Dependencies

### From shared/
### From platform/
### From other boundaries
### From external packages
### From tools/

## Validation

## Agent Rules
- **Write:** Only files under ownership and associated paths
- **Read:** Entire codebase
- **Shared writes:** Request via lead
- **Cross-boundary writes:** Never — report to lead
- **Do NOT run** `tsc --noEmit` individually (lead runs full-project check)
```

---

## 11. SKILL.md Specification

The entry point that enables the "instinct" behavior:

```markdown
---
name: agent-orchestrator
description: Automatic parallel agent orchestration. Detects project boundaries, evaluates parallelization potential, and spawns scoped agents when beneficial. Works with GSD workflows and ad-hoc Claude Code usage.
---

# Agent Orchestrator

## When This Skill Applies

This skill is relevant in ANY conversation where:
- The task involves files in 2+ detected boundaries
- The user's request contains independent sub-tasks
- A GSD phase plan has `execution_mode: multi-agent`

## Automatic Activation

At conversation start or when receiving a complex task:
1. Run boundary detection (rules/boundary-detection.md)
2. If 2+ boundaries exist, keep awareness active
3. When tasks are identified, run task analysis (rules/task-analysis.md)
4. If threshold met → orchestrate (rules/orchestration.md)
5. If threshold not met → standard single-agent execution

## Rules Index

| Context | Load These Rules |
|---------|-----------------|
| Any task evaluation | boundary-detection.md, task-analysis.md |
| Parallel execution | orchestration.md |
| Each spawned agent | scoped-agent.md (injected in prompt) |
| After all agents done | integration-check.md |
| GSD planner | boundary-detection.md, task-analysis.md |
| GSD executor | orchestration.md (if plan has execution_mode: multi-agent) |
| GSD verifier | integration-check.md (if plan has execution_mode: multi-agent) |

## Confidence Thresholds

| Ratio | Action |
|-------|--------|
| < 30% | Silent — single-agent |
| 30-50% | Ask user for confirmation |
| > 50% | Act automatically |

## Fallback

If tmux not available: sequential execution (same logic, no parallelism).
If no boundaries detected: skill stays inactive.
This skill adds capabilities — never removes or overrides existing behavior.
```
