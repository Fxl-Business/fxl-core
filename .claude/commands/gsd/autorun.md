---
name: gsd:autorun
description: Analyze dependencies, parallelize phases, and execute milestone with parallel agents in waves
argument-hint: "[--from N] [--plan-only] [--execute-only]"
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
  - Agent
  - AskUserQuestion
  - Task
---
<objective>
Analyze milestone progress, detect parallelizable phases based on dependency graph, and execute them using parallel agents in waves.

Unlike /gsd:autonomous (sequential per phase), autorun groups independent phases and launches one agent per phase within each wave — maximizing throughput while respecting dependencies.

**Smart milestone discovery:** When no active milestone exists, autorun searches `docs/superpowers/specs/` for pre-configured design specs and offers to activate the next milestone automatically — no need to run `/gsd:new-milestone` manually.

**Creates/Updates:**
- `.planning/STATE.md` — updated after each wave
- `.planning/ROADMAP.md` — progress updated after each wave
- Phase artifacts — CONTEXT.md, PLANs, SUMMARYs per phase (via agents)

**After:** Milestone phases executed in parallel waves, ready for /gsd:complete-milestone.
</objective>

<execution_context>
@/Users/cauetpinciara/Documents/fxl/Projetos/fxl-core/.agents/skills/nexo/orchestrator/autorun.md
</execution_context>

<context>
$ARGUMENTS

**Flags:**
- `--from N` — start from phase N, skip earlier phases
- `--plan-only` — only run discuss + plan for each phase (no execution)
- `--execute-only` — skip planning, only execute existing plans

**How it works:**
1. Checks for active milestone (ROADMAP.md). If none found, searches `docs/superpowers/specs/` for design specs and offers to activate the next milestone
2. Reads ROADMAP.md and parses dependency graph
3. Groups phases into waves (independent phases = same wave)
4. For each wave: launches parallel agents (plan sub-wave, then execute sub-wave)
5. Handles agent failures with retry + partial progress awareness

**Agent prompt template for planning:**
Each planning agent receives: phase number, goal, requirements, success criteria, and runs `/gsd:discuss-phase {N} --auto` then `/gsd:plan-phase {N}`.

**Agent prompt template for execution:**
Each execution agent receives: phase number, plan count, and runs `/gsd:execute-phase {N}`.

Important rules to include in every agent prompt:
- Run `npx tsc --noEmit` after changes — zero errors is acceptance criteria
- Never use `any` in TypeScript
- Commit convention from CLAUDE.md
</context>

<process>
Execute the autorun workflow from @/Users/cauetpinciara/Documents/fxl/Projetos/fxl-core/.agents/skills/nexo/orchestrator/autorun.md end-to-end.
Preserve all workflow gates (dependency analysis, wave building, parallel agent execution, error handling).
</process>
