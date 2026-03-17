# Task Analysis — Rules for Orchestrator

Evaluate parallelization potential and decide execution mode.
Consumes the boundary map from boundary-detection.md.

Works in two contexts:
- **GSD:** Called by gsd-planner after generating tasks for a phase
- **Ad-hoc:** Called by lead agent when evaluating a complex user request

---

## Step 1: Map Tasks to Boundaries

For each task, identify files it will create or modify and map to boundary owners
using the boundary map from boundary-detection.md.

### Mapping Rules

| File path | Owner | Classification |
|-----------|-------|---------------|
| Inside a boundary's `path` | That boundary | `boundary-specific({name})` |
| Inside a boundary's `associated` path | That boundary | `boundary-specific({name})` |
| Inside `cross_cutting` path (`src/platform/**`, `src/shared/**`) | Platform/lead agent | `cross-cutting` |
| Inside `unmapped` path (`docs/**`, `clients/**`, `tools/**`, `supabase/**`, root configs) | Lead agent | `unmapped` |
| Not in boundary map at all | Lead agent | `unmapped` |

### Output Per Task

```yaml
- task: "Add tenant filtering to wireframe queries"
  files: [src/modules/wireframe/hooks/useWireframes.ts, src/modules/wireframe/types/index.ts]
  boundary: wireframe
  classification: boundary-specific(wireframe)

- task: "Create shared TenantContext provider"
  files: [src/platform/contexts/TenantContext.tsx]
  boundary: null
  classification: cross-cutting
```

### Ad-hoc Context: Task Decomposition

When tasks come from a user prompt (not a GSD plan), decompose the prompt first:

1. Identify distinct sub-tasks from the request
2. Look for conjunction separating independent work ("add X to module A **and** Y to module B")
3. Look for task lists with no dependency between items
4. Map each sub-task to boundaries using the same rules above

**If decomposition is ambiguous** (unclear if tasks are truly independent), note this
for the decision step — it forces the 30-50% confirmation path regardless of ratio.

---

## Step 2: Calculate Parallelization Ratio

```
boundary_tasks = count of tasks classified as boundary-specific in 2+ distinct boundaries
total_tasks = count of all tasks

ratio = boundary_tasks / total_tasks
```

### Counting Rules

- A task touching files in **one boundary only** counts toward that boundary
- A task touching files in **two+ boundaries** is a dependency signal (see Step 3)
- Cross-cutting tasks do NOT count toward the ratio (they always go to platform agent)
- Unmapped tasks do NOT count toward the ratio (they always go to lead)

### Examples

| Scenario | Calculation | Ratio |
|----------|------------|-------|
| 5 cross-cutting + 2 tasks in wireframe only | 2 in 1 boundary = 0/7 | 0% → single-agent |
| 3 cross-cutting + 4 wireframe + 4 clients | 8 in 2 boundaries = 8/11 | 72% → multi-agent |
| 2 cross-cutting + 6 wireframe + 1 clients | 7 in 2 boundaries = 7/9 | 77% → multi-agent |
| 10 tasks all in wireframe | 10 in 1 boundary = 0/10 | 0% → single-agent |
| 2 wireframe + 1 shared refactor | 2 in 1 boundary = 0/3 | 0% → single-agent |

---

## Step 3: Check Anti-Parallelization Signals

Even with a high ratio, check for these signals that override the multi-agent decision:

### Signal: Chained Tasks

Output of one task is input of another. Look for:
- Task B references a file that Task A creates (not modifies — creates)
- Task descriptions using "after", "then", "using the output of"
- Explicit `depends_on` in task definitions

### Signal: Schema Migrations

Database migrations must run sequentially. If any task involves:
- `supabase/migrations/` files
- SQL schema changes
- Database table creation/modification

→ Those tasks must be sequential. Other tasks may still parallelize.

### Signal: Hot Shared File

Three or more tasks modify the same file. Check:

```bash
# Collect all files across all tasks, count occurrences
sort all_task_files.txt | uniq -c | sort -rn | head -5
# If any file appears 3+ times → hot shared file
```

### Signal: Global Refactoring

Renames, moves, or transformations that cross all boundaries:
- Renaming a type used across 3+ boundaries
- Moving a shared utility
- Changing an import path used project-wide

### Override Rule

| Ratio | Anti-signals present? | Final decision |
|-------|----------------------|----------------|
| Any | Chained tasks detected | single-agent (override) |
| Any | Schema migrations | single-agent for migration tasks, multi-agent for rest (if applicable) |
| Any | Hot shared file (3+ tasks on same file) | single-agent (override) |
| Any | Global refactoring | single-agent (override) |

Anti-parallelization signals **always win** over ratio. The cost of a bad parallel
execution (merge conflicts, inconsistent state) exceeds the time saved.

---

## Step 4: Decide Execution Mode

### Decision Matrix

| Ratio | Boundaries | Anti-signals | Decision | Action |
|-------|-----------|-------------|----------|--------|
| < 30% | any | any | `single-agent` | Standard execution, no overhead |
| 30-50% | 2+ | none | `multi-agent` with confirmation | Ask user: "Detected parallelization potential (X%). Confirm multi-agent?" |
| > 50% | 2+ | none | `multi-agent` automatic | Act directly — high confidence |
| any | 1 | any | `single-agent` | Only 1 boundary, nothing to parallelize |
| any | 2+ | present | `single-agent` (override) | Anti-signals block parallelization |

### GSD Context

- `single-agent`: Omit `execution_mode` from PLAN.md frontmatter (standard behavior)
- `multi-agent`: Add frontmatter fields and contracts section (see Step 5)
- `multi-agent with confirmation`: Add frontmatter with `confirm: true` flag

### Ad-hoc Context

- `single-agent`: Execute normally, skill stays inactive
- `multi-agent`: Present orchestration plan before executing
- `multi-agent with confirmation`: Always present plan and wait for user approval
- **If decomposition was ambiguous** (from Step 1): force 30-50% confirmation path
  regardless of calculated ratio

---

## Step 5: Generate Multi-Agent Plan Structure

Only when decision is `multi-agent` (automatic or confirmed).

### PLAN.md Frontmatter Addition

```yaml
execution_mode: multi-agent
agents:
  - name: platform
    ownership: ["src/platform/**", "src/shared/**"]
    tasks: [1, 2, 3]
  - name: wireframe
    ownership: ["src/modules/wireframe/**"]
    associated: ["tools/wireframe-builder/**"]
    tasks: [4, 5]
  - name: clients
    ownership: ["src/modules/clients/**"]
    tasks: [6, 7]
contracts:
  - from: platform
    to: [wireframe, clients]
    description: "Tenant context and config types"
    files: [src/platform/types/tenant.ts]
waves:
  1: { agent: platform, type: cross-cutting }
  2: { agents: [wireframe, clients], type: parallel-boundaries }
  3: { type: integration-verification }
```

### Sub-Wave Detection

Check for inter-boundary dependencies within Wave 2:

If boundary A produces something boundary B consumes (detected via `read_first`
references or task file dependencies):

```yaml
waves:
  1: { agent: platform, type: cross-cutting }
  2a: { agents: [producer-boundary], type: parallel-boundaries }
  2b: { agents: [consumer-boundary], type: parallel-boundaries, depends_on: 2a }
  3: { type: integration-verification }
```

If no inter-boundary dependencies exist: all boundaries in a single Wave 2.

### Contracts Section

Add `## Contracts` section to plan body:

```markdown
## Contracts

### platform → wireframe
- Exports: `TenantConfig { id: string, slug: string, plan: PlanType }`
- Location: `src/platform/types/tenant.ts`

### platform → clients
- Exports: `TenantConfig` (same as above)
- Location: `src/platform/types/tenant.ts`
```

**Contract rules:**
- Derive from task descriptions — what each task creates/modifies that others need
- Use exact TypeScript interface definitions, NOT prose descriptions
- Include file paths for every export
- Only include contracts for the delta (what changes in this phase)
- These are **intent contracts** — real types are extracted post-Wave-1 (see orchestration.md)

### Self-Check Before Returning Plan

Before finalizing the plan:

- [ ] Every task assigned to exactly one agent
- [ ] No two agents own overlapping file paths
- [ ] Cross-cutting tasks assigned to platform agent
- [ ] Unmapped tasks assigned to lead agent (or folded into platform)
- [ ] Contracts use TypeScript interface definitions (not prose)
- [ ] Sub-waves correctly ordered if inter-boundary dependencies exist
- [ ] If decomposition was ambiguous, `confirm: true` is set

---

## Ad-hoc Variant Summary

The same 5 steps apply in ad-hoc context, with these differences:

| Aspect | GSD | Ad-hoc |
|--------|-----|--------|
| Task source | PLAN.md tasks | Decomposed from user prompt |
| Ambiguity handling | Tasks are well-defined | Force confirmation if decomposition unclear |
| Output | PLAN.md frontmatter + contracts | Orchestration plan presented to user |
| Confirmation | Only at 30-50% | At 30-50% OR when decomposition ambiguous |
| State tracking | STATE.md, ROADMAP.md | None (conversation is state) |

The threshold logic, boundary mapping, anti-parallelization signals, and wave
structure are identical in both contexts.
