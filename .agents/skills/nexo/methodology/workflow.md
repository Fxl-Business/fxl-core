# FXL Project Methodology — Discuss / Plan / Execute

## Overview

Every FXL project follows a three-stage workflow: **Discuss**, **Plan**, **Execute**.
This methodology is bundled inside the FXL SDK — GSD commands (`/gsd:*`) are part of
the same installation package, not a separate dependency. Updates to GSD only arrive
via SDK updates.

The workflow integrates **XP practices** (spikes, TDD, simple design, refactoring)
at precise points where they add value, not universally. Each XP practice has explicit
trigger criteria — Claude evaluates the criteria automatically and activates the practice
only when warranted.

The MCP Server stores standards, learnings, and pitfalls persistently across projects.
This workflow defines **when** and **how** to consult and feed the MCP Server at each stage.

---

## Stage 1: Discuss

**SDK command:** `/gsd:discuss-phase N`

**Purpose:** Capture implementation decisions before planning begins. Surface unknowns
early. Validate technical viability of risky approaches before committing to a plan.

### MCP Integration (Pre-Discussion)

Before identifying gray areas, retrieve context from MCP:

```
1. get_standards()                          — current FXL conventions
2. get_pitfalls()                           — what to avoid
3. get_learnings(category: "{domain}")      — domain-specific insights
```

Use retrieved knowledge to:
- **Inform gray area identification** — if MCP has a pitfall about a pattern, flag it
- **Pre-fill answers** — if a standard already defines the convention, present it as default
- **Annotate options** — when presenting choices, note if MCP has relevant learnings

### Spike Detection (XP)

After surfacing gray areas but **before** closing the discuss stage, evaluate whether
a spike is needed for the upcoming plan.

**A spike is warranted when:**

| Condition | Example |
|-----------|---------|
| Integration with a lib/API never used in this project | "Does Clerk JWT work with Supabase RLS on this schema?" |
| Two systems connecting without a known contract | "Will Clerk's `org_id` claim reach `current_setting` in PostgreSQL?" |
| Multiple approaches with significantly different architectural implications | "Edge function vs. Vercel serverless — which fits this case?" |
| MCP has no learnings or standards covering the exact pattern | search_knowledge returns no relevant results |
| Previous attempt at this pattern failed (MCP has a pitfall about it) | Pitfall exists → verify the fix works before planning |

**A spike is NOT needed when:**

| Condition | Example |
|-----------|---------|
| CRUD on a known entity following established patterns | Add reservation service |
| UI component following an existing pattern in the project | Add a new stats card |
| Config file change with known outcome | Update vercel.json headers |
| Pattern covered by MCP standard or learning | RLS policy — standard exists |
| Same integration done in another spoke (MCP has learning) | Clerk setup — learning exists from previous project |

**Spike protocol when warranted:**

1. State the specific question the spike must answer (yes/no or specific decision)
2. Define the time-box (default: 30 minutes)
3. Create a minimal isolated test (not production code)
4. Answer the question with evidence
5. Discard the spike code — record the answer as a learning in MCP
6. Use the answer to inform discuss decisions and plan design

```
Spike: "Does Clerk JWT org_id claim work with Supabase RLS COALESCE pattern?"
Time-box: 30min
Output: yes/no + why → add_learning() → use in plan
Code: discarded
```

### Discussion Rules for FXL Projects

| Rule | Rationale |
|------|-----------|
| Never ask about stack choices | Stack is fixed (see `sdk/standards.md`) |
| Never ask about directory structure | Structure is fixed (see `sdk/standards.md`) |
| Never suggest adding dependencies | Must be documented in CLAUDE.md first |
| Always present MCP standards as defaults | Consistency across projects |
| Flag any deviation from MCP pitfalls | Prevent repeating known mistakes |
| Evaluate spike need before closing discuss | Prevent planning in the dark |

### Output

`CONTEXT.md` with decisions, canonical refs, spike results (if any), and MCP knowledge
that informed choices.

---

## Stage 2: Plan

**SDK command:** `/gsd:plan-phase N`

### Pre-Planning Hook (Mandatory)

Before the planner generates tasks, run the pre-planning hook.
See `methodology/pre-planning.md` for the complete procedure.

Summary:
1. `get_standards()` — load all current standards as constraints
2. `get_pitfalls()` — load all pitfalls as defensive acceptance criteria
3. `get_learnings(category: "{domain}")` — load domain-specific learnings
4. `search_knowledge(query: "{phase goal keywords}")` — cross-cutting knowledge

### Simple Design Gate (XP)

After generating the draft plan, apply the Simple Design gate before finalizing.

**The planner must verify for each task:**

1. **Is this the simplest solution that satisfies the requirement?**
   If a simpler approach exists that meets the same acceptance criteria, use it.

2. **Does this task introduce abstraction before it's needed?**
   No helpers, utilities, or abstractions for one-time operations.
   Three similar lines of code is better than a premature abstraction.

3. **Does this task duplicate something that already exists?**
   Check MCP learnings and current project for existing patterns before creating new ones.

4. **Is any part of this task solving a hypothetical future requirement?**
   If the requirement is not in the current phase goal, remove it from the plan.

Simple Design gate is NOT a blocker — if all tasks pass, continue. If a task fails
the gate, revise before finalizing the PLAN.md.

### Planning Rules for FXL Projects

| Rule | Rationale |
|------|-----------|
| Every task with API calls must include null safety acceptance criteria | Pitfall: unguarded API responses |
| Every task with edge functions must include deploy step | Pitfall: created but not deployed |
| Tasks with Promise.all must use Promise.allSettled instead | Pitfall: masks independent failures |
| Every task must have `read_first` including the file being modified | GSD deep work rules |
| Plans must account for FXL contract endpoints when relevant | SDK standard |
| Supabase queries must never use sub-paths | Pitfall: edge function URL handling |
| TDD tasks must list test file creation before implementation file | XP: tests before code |

### Output

`PLAN.md` with tasks grounded in MCP knowledge, passing Simple Design gate,
with TDD tasks explicitly ordered (test first).

---

## Stage 3: Execute

**SDK command:** `/gsd:execute-phase N`

### Test-Driven Development (XP — Mandatory for logic tasks)

TDD is mandatory for tasks that implement:
- Business logic (calculations, transformations, validations)
- Service layer functions (data access, API calls)
- Utility functions with non-trivial behavior

TDD is NOT required for:
- UI components (use visual verification instead)
- Config file changes
- Migration files
- Scaffolding / boilerplate generation

**TDD order within a task:**

```
1. Write the test file first (define what the function should do)
2. Run the test — it must FAIL (red)
3. Write the minimum implementation to make it pass (green)
4. Run the test — it must PASS
5. Run bunx tsc --noEmit — zero errors
```

Never write implementation before the test for logic tasks. If Claude skips this order,
the task is not considered complete.

### During Execution

When encountering situations not covered by the plan:

1. **Check MCP first** — `search_knowledge(query: "{problem description}")` before improvising
2. **Follow standards** — if MCP has a standard for the pattern, follow it exactly
3. **Note deviations** — if forced to deviate, document why in the commit message

### Refactoring Gate (XP — Post-task)

After completing each task and before committing, apply the Refactoring gate:

1. **Does the implementation introduce duplication?** Extract if so.
2. **Is any function longer than it needs to be?** Split if logic is not self-evident.
3. **Are there unused variables, imports, or dead code?** Remove.
4. **Does the code follow naming conventions from CLAUDE.md?** Fix if not.

The refactoring gate does NOT rewrite working code for style preferences.
It only addresses objective quality issues: duplication, dead code, naming violations.

### Execution Rules for FXL Projects

| Rule | Rationale |
|------|-----------|
| `bunx tsc --noEmit` before considering any task done | Zero TS errors is acceptance |
| Tests must pass before task is closed (when TDD applied) | XP: red → green → refactor |
| Never use `any` in TypeScript | CLAUDE.md non-negotiable |
| Never create .html files | CLAUDE.md non-negotiable |
| Commit each task atomically | GSD executor pattern |
| Deploy edge functions immediately after creation | Pitfall: created but not deployed |
| Verify visual changes in browser (light + dark mode) | CLAUDE.md validation rule |

### Post-Execution Hook (Mandatory)

After phase verification passes, run the post-execution hook.
See `methodology/post-execution.md` for the complete procedure.

Summary:
1. Review commits and SUMMARY.md for the phase
2. Identify learnings: new patterns, unexpected behaviors, useful techniques
3. Identify pitfalls: bugs found, mistakes made, things that wasted time
4. `add_learning()` for each learning worth preserving
5. `add_pitfall()` for each pitfall worth documenting

---

## The XP Practices Map

Quick reference for when each XP practice activates:

| Practice | When | Trigger |
|----------|------|---------|
| **Spike** | Discuss | Unknown technical viability or integration contract |
| **Simple Design** | Plan | After draft plan — gate before finalizing PLAN.md |
| **TDD** | Execute | Task implements logic (not UI, config, or scaffolding) |
| **Refactoring** | Execute | After each task, before commit |

---

## The Feedback Loop

```
Project A executes Phase 1
  → Spike discovers: "Clerk JWT needs custom template for Supabase RLS"
  → Spike code discarded, answer recorded as learning
  → Plan is designed correctly from the start

Project B starts Phase 1
  → pre-planning get_learnings() returns the Clerk JWT learning
  → No spike needed — answer already known
  → Plan generated with correct approach immediately
```

**Every project makes every other project better.**
**Every spike makes future spikes unnecessary.**

---

## When to Use Each MCP Tool

| Stage | Tool | Purpose |
|-------|------|---------|
| Discuss | `get_standards()` | Know conventions before asking questions |
| Discuss | `get_pitfalls()` | Know what to avoid before presenting options |
| Discuss | `get_learnings()` | Domain-specific insights |
| Discuss | `search_knowledge()` | Spike validation — check if question is already answered |
| Plan | `get_standards()` | Constraints for task generation |
| Plan | `get_pitfalls()` | Defensive acceptance criteria |
| Plan | `get_learnings()` | Influence task design |
| Plan | `search_knowledge()` | Cross-cutting knowledge for phase goal |
| Execute | `search_knowledge()` | Real-time lookup when plan is insufficient |
| Post-Execute | `add_learning()` | Persist new patterns and techniques |
| Post-Execute | `add_pitfall()` | Persist new mistakes to avoid |
| Promote | `promote_to_standard()` | Elevate validated learning to permanent standard |

---

## Promotion Criteria

A learning becomes a standard when:
1. It has been validated in 2+ projects
2. It addresses a recurring pattern (not a one-off)
3. The rule can be articulated clearly as a constraint

Use `promote_to_standard()` with the learning ID and optional enhanced details/examples.

---

## Integration with Orchestrator

When the orchestrator runs multi-agent execution:
- The **lead agent** runs the pre-planning hook and the spike evaluation (not each boundary agent)
- Each **boundary agent** can call `search_knowledge()` during execution
- The **lead agent** runs the post-execution hook after all agents complete
- Learnings and spike results are attributed to the project, not individual agents

---

## Quick Reference

```
# Before any phase work
/gsd:discuss-phase N        ← spike detection + MCP informs gray areas
/gsd:plan-phase N           ← pre-planning hook + simple design gate
/gsd:execute-phase N        ← TDD + refactoring gate + post-execution hook

# Spike (inline during discuss)
search_knowledge(query)     ← check if already answered before spiking
[spike: time-boxed test]    ← answer the question, discard the code
add_learning()              ← record the answer for future projects

# Manual MCP operations
mcp__fxl-sdk__get_standards
mcp__fxl-sdk__get_pitfalls
mcp__fxl-sdk__get_learnings
mcp__fxl-sdk__search_knowledge
mcp__fxl-sdk__add_learning
mcp__fxl-sdk__add_pitfall
mcp__fxl-sdk__promote_to_standard
```
