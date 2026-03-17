# Agent Orchestrator Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create the `agent-orchestrator` skill that replaces `gsd-multi-agent` with a generalist parallel agent orchestration system working in both GSD and ad-hoc contexts.

**Architecture:** A skill at `.claude/skills/agent-orchestrator/` with 5 rule files, 1 template, SKILL.md entry point, and README. Integrates with GSD via 3 minimal references in existing workflows. Replaces `gsd-multi-agent` after verification.

**Tech Stack:** Markdown rules (Claude Code skill format), bash scripts (boundary detection, scope checks), YAML (boundary maps in plan frontmatter)

**Spec:** `docs/superpowers/specs/2026-03-16-agent-orchestrator-design.md`

---

## File Structure

### Files to Create

| File | Responsibility |
|------|---------------|
| `.claude/skills/agent-orchestrator/SKILL.md` | Entry point — when to apply, rules index, confidence thresholds |
| `.claude/skills/agent-orchestrator/README.md` | Portable operational guide (PT-BR, matches project language) |
| `.claude/skills/agent-orchestrator/rules/boundary-detection.md` | Detect project boundaries from multiple signals |
| `.claude/skills/agent-orchestrator/rules/task-analysis.md` | Evaluate parallelization potential and decide execution mode |
| `.claude/skills/agent-orchestrator/rules/orchestration.md` | Wave execution, contract refresh, agent spawn, scope enforcement |
| `.claude/skills/agent-orchestrator/rules/scoped-agent.md` | Rules injected into each boundary agent prompt |
| `.claude/skills/agent-orchestrator/rules/integration-check.md` | Post-execution verification (tsc, build, imports, scope) |
| `.claude/skills/agent-orchestrator/templates/boundary-claude.md` | Template for boundary CLAUDE.md files |

### Files to Modify

| File | Change |
|------|--------|
| `.claude/get-shit-done/workflows/plan-phase.md` | Add `<parallel_execution>` block to planner prompt (Section 9.1 Ref 1) |
| `.claude/get-shit-done/workflows/execute-phase.md` | Add `<parallel_execution_check>` block before agent spawn (Section 9.1 Ref 2) |
| `.claude/get-shit-done/workflows/verify-phase.md` | Add `<cross_boundary_check>` block after standard checks (Section 9.1 Ref 3) |

### Files to Move

| From | To | Reason |
|------|----|--------|
| `.claude/skills/gsd-multi-agent/rules/brainstorming-milestone.md` | `.claude/get-shit-done/workflows/brainstorming-milestone.md` | Not an orchestration concern |

### Files to Delete (after verification)

| File | Reason |
|------|--------|
| `.claude/skills/gsd-multi-agent/` (entire directory) | Replaced by agent-orchestrator |

---

## Chunk 1: Skill Entry Point and README

### Task 1: Create skill directory and SKILL.md

**Files:**
- Create: `.claude/skills/agent-orchestrator/SKILL.md`

- [ ] **Step 1: Create directory structure**

```bash
mkdir -p .claude/skills/agent-orchestrator/rules
mkdir -p .claude/skills/agent-orchestrator/templates
```

- [ ] **Step 2: Write SKILL.md**

Write the SKILL.md entry point exactly as specified in Section 11 of the design spec. Content:

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

- [ ] **Step 3: Verify file exists**

```bash
cat .claude/skills/agent-orchestrator/SKILL.md | head -5
```
Expected: frontmatter with `name: agent-orchestrator`

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/agent-orchestrator/SKILL.md
git commit -m "tool(agent-orchestrator): add SKILL.md entry point"
```

---

### Task 2: Write README.md

**Files:**
- Create: `.claude/skills/agent-orchestrator/README.md`
- Reference: `.claude/skills/gsd-multi-agent/README.md` (source material, PT-BR style)

- [ ] **Step 1: Read existing README for style reference**

Read `.claude/skills/gsd-multi-agent/README.md` to maintain PT-BR style and structure.

- [ ] **Step 2: Write README.md**

Write the operational guide in PT-BR. Must cover:

1. **Pre-requisitos** — tmux, Claude Code, projeto com 2+ boundaries (ou modular)
2. **Fluxo GSD** — como plan-phase detecta boundaries automaticamente, como execute-phase orquestra waves
3. **Fluxo Ad-hoc** — como a skill ativa fora do GSD quando detecta trabalho paralelo
4. **O que voce ve no tmux** — ASCII art dos panes (Wave 1 e Wave 2)
5. **Quando roda multi-agent vs solo** — tabela de decisao
6. **Regras de ownership** — tabela boundary → pode escrever / pode ler
7. **Comunicacao entre agentes** — hub-and-spoke exemplos
8. **Verificacao (3 niveis)** — agent, lead, verify
9. **Portabilidade** — como instalar em outro projeto (com GSD e sem GSD)
10. **Troubleshooting** — problemas comuns e solucoes
11. **Resumo do fluxo** — diagrama ASCII

Key differences from old README:
- Add "Fluxo Ad-hoc" section (new capability)
- Add "Portabilidade" section (new requirement)
- Replace "module" terminology with "boundary" throughout
- Add `teammateMode: "tmux"` configuration instructions in pre-requisitos
- Include associated paths in ownership table (e.g., wireframe + tools/wireframe-builder/)
- Document commit tracer pattern `[agent:{name}]`

- [ ] **Step 3: Verify README covers all 11 sections**

```bash
grep "^## " .claude/skills/agent-orchestrator/README.md | wc -l
```
Expected: >= 10 section headers

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/agent-orchestrator/README.md
git commit -m "tool(agent-orchestrator): add README operational guide"
```

---

## Chunk 2: Core Rules — Detection and Analysis

### Task 3: Write boundary-detection.md

**Files:**
- Create: `.claude/skills/agent-orchestrator/rules/boundary-detection.md`
- Reference: `.claude/skills/gsd-multi-agent/rules/module-detection.md` (source material)
- Reference: `docs/superpowers/specs/2026-03-16-agent-orchestrator-design.md` Section 4

- [ ] **Step 1: Read source material**

Read both:
- `.claude/skills/gsd-multi-agent/rules/module-detection.md` (existing logic to preserve)
- Design spec Section 4 (new generalized approach)

- [ ] **Step 2: Write boundary-detection.md**

Structure the rule as steps for the gsd-planner (or ad-hoc lead):

**Step 1: Discover Boundaries** — detection hierarchy (5 signals in priority order)
```bash
# Signal 1: Explicit CLAUDE.md
find src/ -name "CLAUDE.md" -mindepth 2 -maxdepth 3 2>/dev/null

# Signal 2: Monorepo workspaces
cat package.json | jq -r '.workspaces[]? // empty' 2>/dev/null

# Signal 3: Package boundaries
find . -name "package.json" -mindepth 2 -maxdepth 3 -not -path "*/node_modules/*" 2>/dev/null

# Signal 4: Convention directories
ls -d src/modules/*/  src/services/*/  apps/*/  packages/*/ 2>/dev/null

# Signal 5: Size heuristic (5+ .ts/.tsx files with exports)
for dir in src/*/; do
  count=$(find "$dir" -name "*.ts" -o -name "*.tsx" | wc -l)
  if [ "$count" -ge 5 ]; then echo "$dir"; fi
done
```

**Step 2: Filter Noise** — remove dirs with < 3 files, re-export-only, nested inside detected boundary

**Step 3: Detect Associated Paths** — read CLAUDE.md "From tools/" sections, analyze import consumers (80% threshold)

**Step 4: Resolve Overlaps** — 80% import wins, equal goes to cross_cutting, explicit CLAUDE.md declaration wins

**Step 5: Build Boundary Map** — output YAML structure with boundaries[], cross_cutting[], unmapped[]

**Step 6: Auto-scaffold CLAUDE.md** — if boundary has no CLAUDE.md, generate from template (log warning)

Key differences from old module-detection.md:
- 5 signal hierarchy instead of only CLAUDE.md
- Associated paths concept (new — fixes tools/wireframe-builder/ issue)
- Overlap resolution rules (new)
- Noise filtering (new — fixes ferramentas/hooks/ issue)
- Works for ANY project structure, not just src/modules/

- [ ] **Step 3: Verify rule has all 6 steps**

```bash
grep "^## Step" .claude/skills/agent-orchestrator/rules/boundary-detection.md | wc -l
```
Expected: 6

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/agent-orchestrator/rules/boundary-detection.md
git commit -m "tool(agent-orchestrator): add boundary detection rules"
```

---

### Task 4: Write task-analysis.md

**Files:**
- Create: `.claude/skills/agent-orchestrator/rules/task-analysis.md`
- Reference: Design spec Section 5

- [ ] **Step 1: Write task-analysis.md**

Structure as steps:

**Step 1: Map Tasks to Boundaries** — for each task, identify files it creates/modifies, map to boundary owner using the boundary map from boundary-detection

**Step 2: Calculate Parallelization Ratio**
```
ratio = tasks in 2+ boundaries / total tasks
```

**Step 3: Check Anti-Parallelization Signals** — chained tasks, schema migrations, hot shared files (3+ tasks on same file), global refactoring

**Step 4: Decide Execution Mode** — decision matrix:
| Ratio | Boundaries | Anti-signals | Decision |
|-------|-----------|-------------|----------|
| < 30% | any | any | single-agent |
| 30-50% | 2+ | none | multi-agent with confirmation |
| > 50% | 2+ | none | multi-agent automatic |
| any | 1 | any | single-agent |
| any | 2+ | present | single-agent (override) |

**Step 5: Generate Multi-Agent Plan Structure (if multi-agent)**
- Add to PLAN.md frontmatter: `execution_mode`, `agents[]`, `contracts[]`
- Detect sub-waves (inter-boundary dependencies via read_first references)
- Self-check: every task assigned, no overlapping ownership, contracts use TypeScript not prose

**Ad-hoc variant:** Same steps but tasks come from prompt decomposition. If decomposition is ambiguous, use 30-50% confirmation path regardless of ratio.

- [ ] **Step 2: Verify decision matrix is present**

```bash
grep -c "single-agent\|multi-agent" .claude/skills/agent-orchestrator/rules/task-analysis.md
```
Expected: >= 5 occurrences

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/agent-orchestrator/rules/task-analysis.md
git commit -m "tool(agent-orchestrator): add task analysis rules"
```

---

## Chunk 3: Core Rules — Execution and Verification

### Task 5: Write orchestration.md

**Files:**
- Create: `.claude/skills/agent-orchestrator/rules/orchestration.md`
- Reference: `.claude/skills/gsd-multi-agent/rules/multi-agent-execution.md` (source material)
- Reference: Design spec Section 6

- [ ] **Step 1: Read source material**

Read `.claude/skills/gsd-multi-agent/rules/multi-agent-execution.md` for existing logic.

- [ ] **Step 2: Write orchestration.md**

Structure follows the wave architecture:

**Prerequisites Check** — verify tmux available, capture baseline commit

**CHECKPOINT 1: Show Execution Plan** — display waves, agents, contracts summary. Wait for user confirmation.

**Wave 1: Cross-cutting Agent** — spawn platform agent with scope `src/platform/**`, `src/shared/**`. Capture post-Wave-1 commit.

**CHECKPOINT 2: Contract Refresh** — read platform agent's actual output files, extract real TypeScript types, update contracts for boundary agents. This is the key improvement over gsd-multi-agent (which used predicted types).

**Wave 2: Boundary Agents (Parallel)** — check for sub-waves (2a/2b). For each boundary agent, spawn with:
- Ownership (boundary path + associated paths)
- Scope rules reference (scoped-agent.md)
- Refreshed contracts
- Tasks
- Module CLAUDE.md content (if exists)

Platform agent stays on standby for scope escalation.

**Scope Violation Check** — using commit tracers:
```bash
for AGENT in {boundary-names}; do
  git log --format="%H" --grep="\[agent:${AGENT}\]" $POST_WAVE1_COMMIT..HEAD | \
    xargs -I{} git diff-tree --no-commit-id --name-only -r {} | \
    grep -v "${AGENT_OWNERSHIP}" | grep -v "${AGENT_ASSOCIATED}"
done
```

**CHECKPOINT 3: Integration Verification** — tsc, build, import audit. If passes → aggregate_results.

**Error Recovery** — other agents continue on failure, commit good work, revert incomplete, re-spawn with remaining tasks (max 2 retries), break glass to lead.

**Fallback without tmux** — execute waves sequentially, same logic.

Key differences from old multi-agent-execution.md:
- Commit tracers replace broken global git diff (fixes inconsistency #5)
- Contract refresh reads REAL TypeScript (fixes inconsistency #7)
- Sub-waves support (preserved from old skill)
- Associated paths in ownership (fixes inconsistency #2)
- Agent tool syntax (not Task)

- [ ] **Step 3: Verify all 3 checkpoints exist**

```bash
grep -c "CHECKPOINT" .claude/skills/agent-orchestrator/rules/orchestration.md
```
Expected: >= 3

- [ ] **Step 4: Commit**

```bash
git add .claude/skills/agent-orchestrator/rules/orchestration.md
git commit -m "tool(agent-orchestrator): add orchestration rules with wave architecture"
```

---

### Task 6: Write scoped-agent.md

**Files:**
- Create: `.claude/skills/agent-orchestrator/rules/scoped-agent.md`
- Reference: `.claude/skills/gsd-multi-agent/rules/module-scoped-executor.md` (source material)
- Reference: Design spec Section 7

- [ ] **Step 1: Write scoped-agent.md**

Short, universal rules file. Structure:

**Scope Enforcement** — 8 core rules (WRITE only ownership + associated, READ all, no tsc/build, verify before write, commit tracers, escalate via SendMessage, report bad contracts, match produced contracts)

**Communication Protocol** — hub-and-spoke (via lead for decisions, direct for signals, never negotiate contracts peer-to-peer)

**Scope Verification Before Done** — git log with tracer grep, filter outside ownership, revert + report if violations found

**Key difference from old module-scoped-executor.md:** associated paths in ownership check, commit tracer `[agent:{name}]` pattern

- [ ] **Step 2: Verify 8 core rules present**

```bash
grep -cE "^[0-9]+\." .claude/skills/agent-orchestrator/rules/scoped-agent.md
```
Expected: >= 8

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/agent-orchestrator/rules/scoped-agent.md
git commit -m "tool(agent-orchestrator): add scoped agent rules"
```

---

### Task 7: Write integration-check.md

**Files:**
- Create: `.claude/skills/agent-orchestrator/rules/integration-check.md`
- Reference: `.claude/skills/gsd-multi-agent/rules/cross-module-verification.md` (source material)
- Reference: Design spec Section 8

- [ ] **Step 1: Write integration-check.md**

Structure:

**Automatic Checks (always run):**
1. `npx tsc --noEmit` — global type check
2. `npm run build` — build verification
3. Cross-boundary import audit — flag INTERNAL imports only (exclude manifest, types/index, hooks/use*)
4. Scope compliance via commit tracers

**Conditional Checks:**
- If project has tests → run test suite
- If boundary has CLAUDE.md → verify new exports documented in Public API
- If contracts defined → verify declared exports exist
- If project has lint → run lint

**Failure Recovery:**
- tsc/build failed → identify boundary, re-spawn agent with error
- Import audit violation → lead fixes
- Scope violation → revert + re-spawn
- Limit: 2 fix attempts per agent, then lead takes over

**Output:**
- GSD: append to VERIFICATION.md under "## Cross-Boundary Verification"
- Ad-hoc: report summary to user

Key differences from old cross-module-verification.md:
- Import audit refined to only flag internals, not all cross-boundary imports
- Conditional checks (tests, lint) added
- Dual output (GSD vs ad-hoc)

- [ ] **Step 2: Commit**

```bash
git add .claude/skills/agent-orchestrator/rules/integration-check.md
git commit -m "tool(agent-orchestrator): add integration check rules"
```

---

## Chunk 4: Template and GSD Bridge

### Task 8: Write boundary-claude.md template

**Files:**
- Create: `.claude/skills/agent-orchestrator/templates/boundary-claude.md`
- Reference: `.claude/skills/gsd-multi-agent/templates/module-claude.md` (source material)
- Reference: Design spec Section 10.5

- [ ] **Step 1: Write expanded template**

The template must include ALL sections that real module CLAUDE.md files have (as created in Phase 61):

```markdown
# Boundary: {{name}}

## Purpose
{{one-line description}}

## Ownership
- {{primary path}}

## Associated Paths
- {{external paths with read-write access, if any}}
- {{reason for association}}

## Public API

### Types
- {{TypeName}}: {{brief description}} ({{path}})

### Hooks
- {{useHookName}}: {{brief description}} ({{path}})

### Components
- {{ComponentName}}: {{brief description}} ({{path}})

### Services
- {{serviceName}}: {{brief description}} ({{path}})

### Pages
- {{PageName}}: {{brief description}} ({{path}})

### Extensions
- {{ExtensionName}}: {{brief description}} ({{path}})

## Dependencies

### From shared/
- {{imports from shared/}}

### From platform/
- {{imports from platform/}}

### From other boundaries
- {{boundary}}: {{what it reads, always read-only}}

### From external packages
- {{package}}: {{what it uses}}

### From tools/
- {{tool path}}: {{what it imports}}

## Validation
- {{boundary-specific checks}}

## Agent Rules
- **Write:** Only files under ownership and associated paths
- **Read:** Entire codebase
- **Shared writes:** Request via lead
- **Cross-boundary writes:** Never — report to lead
- **Do NOT run** `tsc --noEmit` individually (lead runs full-project check)
```

- [ ] **Step 2: Verify template has all sections**

```bash
grep "^## \|^### " .claude/skills/agent-orchestrator/templates/boundary-claude.md | wc -l
```
Expected: >= 15 section/subsection headers

- [ ] **Step 3: Commit**

```bash
git add .claude/skills/agent-orchestrator/templates/boundary-claude.md
git commit -m "tool(agent-orchestrator): add boundary CLAUDE.md template"
```

---

### Task 9: Add GSD bridge — plan-phase.md integration

**Files:**
- Modify: `.claude/get-shit-done/workflows/plan-phase.md`

- [ ] **Step 1: Read current plan-phase.md**

Read `.claude/get-shit-done/workflows/plan-phase.md`. Locate the planner prompt in Step 8 (the `<planning_context>` block that ends with `</downstream_consumer>`).

- [ ] **Step 2: Add parallel_execution block**

Insert after the `</downstream_consumer>` closing tag and before `<deep_work_rules>`:

```markdown
<parallel_execution>
**Parallel agent orchestration:** Read .claude/skills/agent-orchestrator/rules/boundary-detection.md
and .claude/skills/agent-orchestrator/rules/task-analysis.md

After generating tasks, run boundary detection and task analysis.
If execution_mode resolves to multi-agent, add to PLAN.md frontmatter:
  execution_mode, agents[], contracts[]
If single-agent, omit these fields (standard behavior).
</parallel_execution>
```

- [ ] **Step 3: Verify insertion**

```bash
grep "parallel_execution" .claude/get-shit-done/workflows/plan-phase.md
```
Expected: 2 matches (opening and closing tag)

- [ ] **Step 4: Commit**

```bash
git add .claude/get-shit-done/workflows/plan-phase.md
git commit -m "tool(agent-orchestrator): add parallel execution reference to plan-phase workflow"
```

---

### Task 10: Add GSD bridge — execute-phase.md integration

**Files:**
- Modify: `.claude/get-shit-done/workflows/execute-phase.md`

- [ ] **Step 1: Read current execute-phase.md**

Read `.claude/get-shit-done/workflows/execute-phase.md`. Locate `<step name="execute_waves">`, specifically before item 2 ("Spawn executor agents").

- [ ] **Step 2: Add parallel_execution_check block**

Insert inside `<step name="execute_waves">`, after the "Describe what's being built" section (item 1) and before the "Spawn executor agents" section (item 2):

```markdown
<parallel_execution_check>
**Before spawning agents, check for multi-agent execution:**

Read first incomplete plan's frontmatter. If `execution_mode: multi-agent`:
  Read .claude/skills/agent-orchestrator/rules/orchestration.md
  Follow wave-based orchestration instead of standard sequential spawn.
  STOP reading the rest of execute_waves — orchestration.md takes over.
  After orchestration completes, resume at `<step name="aggregate_results">`.

If `execution_mode` is absent or `single-agent`:
  Continue with standard execution below (no change).
</parallel_execution_check>
```

- [ ] **Step 3: Verify insertion**

```bash
grep "parallel_execution_check" .claude/get-shit-done/workflows/execute-phase.md
```
Expected: 2 matches (opening and closing tag)

- [ ] **Step 4: Commit**

```bash
git add .claude/get-shit-done/workflows/execute-phase.md
git commit -m "tool(agent-orchestrator): add parallel execution check to execute-phase workflow"
```

---

### Task 11: Add GSD bridge — verify-phase.md integration

**Files:**
- Modify: `.claude/get-shit-done/workflows/verify-phase.md`

- [ ] **Step 1: Read current verify-phase.md**

Read `.claude/get-shit-done/workflows/verify-phase.md`. Locate the section where standard verification checks complete, before the VERIFICATION.md report is written.

- [ ] **Step 2: Add cross_boundary_check block**

Insert after the standard observable truths verification and before the report generation:

```markdown
<cross_boundary_check>
**Cross-boundary verification (multi-agent phases only):**

Check if any plan in this phase has `execution_mode: multi-agent` in frontmatter.

If yes:
  Read .claude/skills/agent-orchestrator/rules/integration-check.md
  Run cross-boundary verification in addition to standard checks.
  Append results to VERIFICATION.md under "## Cross-Boundary Verification".

If no:
  Skip (standard single-agent verification is sufficient).
</cross_boundary_check>
```

- [ ] **Step 3: Verify insertion**

```bash
grep "cross_boundary_check" .claude/get-shit-done/workflows/verify-phase.md
```
Expected: 2 matches (opening and closing tag)

- [ ] **Step 4: Commit**

```bash
git add .claude/get-shit-done/workflows/verify-phase.md
git commit -m "tool(agent-orchestrator): add cross-boundary check to verify-phase workflow"
```

---

## Chunk 5: Migration and Cleanup

### Task 12: Migrate brainstorming-milestone.md

**Files:**
- Move: `.claude/skills/gsd-multi-agent/rules/brainstorming-milestone.md` → `.claude/get-shit-done/workflows/brainstorming-milestone.md`
- Modify: `.claude/get-shit-done/workflows/new-milestone.md` (if it references the old path)

- [ ] **Step 1: Check if new-milestone references old path**

```bash
grep -n "brainstorming-milestone\|gsd-multi-agent.*brainstorming" .claude/get-shit-done/workflows/new-milestone.md
```

- [ ] **Step 2: Copy file to new location**

```bash
cp .claude/skills/gsd-multi-agent/rules/brainstorming-milestone.md \
   .claude/get-shit-done/workflows/brainstorming-milestone.md
```

- [ ] **Step 3: Update reference in new-milestone.md (if found in Step 1)**

Update any path references from `.claude/skills/gsd-multi-agent/rules/brainstorming-milestone.md` to `.claude/get-shit-done/workflows/brainstorming-milestone.md`.

- [ ] **Step 4: Commit**

```bash
git add .claude/get-shit-done/workflows/brainstorming-milestone.md
git add .claude/get-shit-done/workflows/new-milestone.md
git commit -m "tool(agent-orchestrator): migrate brainstorming-milestone to GSD workflows"
```

---

### Task 13: Update project CLAUDE.md skill references

**Files:**
- Modify: `CLAUDE.md` (root)

- [ ] **Step 1: Read current CLAUDE.md skills section**

Read `CLAUDE.md`, find the "Skills — localizacao" section.

- [ ] **Step 2: Update skill references**

In the "Skills locais do projeto" list:
- Replace `gsd-multi-agent` reference with `agent-orchestrator`
- Keep `build-with-agent-team` as-is (it coexists per spec Section 10.3)

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: update skill references to agent-orchestrator"
```

---

### Task 14: Delete gsd-multi-agent skill

**Files:**
- Delete: `.claude/skills/gsd-multi-agent/` (entire directory)

- [ ] **Step 1: Verify agent-orchestrator is complete**

```bash
ls .claude/skills/agent-orchestrator/
ls .claude/skills/agent-orchestrator/rules/
```
Expected: SKILL.md, README.md, rules/ (5 files), templates/ (1 file)

- [ ] **Step 2: Verify GSD bridges are in place**

```bash
grep "parallel_execution" .claude/get-shit-done/workflows/plan-phase.md
grep "parallel_execution_check" .claude/get-shit-done/workflows/execute-phase.md
grep "cross_boundary_check" .claude/get-shit-done/workflows/verify-phase.md
```
Expected: 2 matches each

- [ ] **Step 3: Verify brainstorming-milestone migrated**

```bash
test -f .claude/get-shit-done/workflows/brainstorming-milestone.md && echo "OK"
```
Expected: OK

- [ ] **Step 4: Delete old skill**

```bash
rm -rf .claude/skills/gsd-multi-agent/
```

- [ ] **Step 5: Verify no dangling references**

```bash
grep -r "gsd-multi-agent" .claude/ --include="*.md" --include="*.json" | grep -v "node_modules"
```
Expected: 0 matches (or only in git history/changelogs)

- [ ] **Step 6: Commit**

```bash
git add -A .claude/skills/gsd-multi-agent/
git commit -m "tool(agent-orchestrator): remove deprecated gsd-multi-agent skill"
```

---

## Chunk 6: Verification

### Task 15: End-to-end dry run verification

**Files:**
- Read-only verification of all created/modified files

- [ ] **Step 1: Verify skill structure is complete**

```bash
find .claude/skills/agent-orchestrator/ -type f | sort
```
Expected:
```
.claude/skills/agent-orchestrator/README.md
.claude/skills/agent-orchestrator/SKILL.md
.claude/skills/agent-orchestrator/rules/boundary-detection.md
.claude/skills/agent-orchestrator/rules/integration-check.md
.claude/skills/agent-orchestrator/rules/orchestration.md
.claude/skills/agent-orchestrator/rules/scoped-agent.md
.claude/skills/agent-orchestrator/rules/task-analysis.md
.claude/skills/agent-orchestrator/templates/boundary-claude.md
```

- [ ] **Step 2: Verify SKILL.md references all 5 rules**

```bash
for rule in boundary-detection task-analysis orchestration scoped-agent integration-check; do
  grep -q "$rule" .claude/skills/agent-orchestrator/SKILL.md && echo "OK: $rule" || echo "MISSING: $rule"
done
```
Expected: all OK

- [ ] **Step 3: Verify GSD bridge references resolve**

```bash
# Each reference points to a file that exists
grep -oP 'agent-orchestrator/rules/\S+\.md' .claude/get-shit-done/workflows/plan-phase.md | while read f; do
  test -f ".claude/skills/$f" && echo "OK: $f" || echo "MISSING: $f"
done

grep -oP 'agent-orchestrator/rules/\S+\.md' .claude/get-shit-done/workflows/execute-phase.md | while read f; do
  test -f ".claude/skills/$f" && echo "OK: $f" || echo "MISSING: $f"
done

grep -oP 'agent-orchestrator/rules/\S+\.md' .claude/get-shit-done/workflows/verify-phase.md | while read f; do
  test -f ".claude/skills/$f" && echo "OK: $f" || echo "MISSING: $f"
done
```
Expected: all OK

- [ ] **Step 4: Verify gsd-multi-agent fully removed**

```bash
test -d .claude/skills/gsd-multi-agent/ && echo "FAIL: still exists" || echo "OK: removed"
grep -r "gsd-multi-agent" .claude/ --include="*.md" -l 2>/dev/null | head -5
```
Expected: "OK: removed", 0 file matches

- [ ] **Step 5: Verify no TypeScript errors introduced**

```bash
npx tsc --noEmit
```
Expected: 0 errors (skill files are .md, shouldn't affect TypeScript)

- [ ] **Step 6: Final commit log review**

```bash
git log --oneline -15
```
Expected: ~10 commits from this implementation, clean history

---

## Summary

| Chunk | Tasks | What it delivers |
|-------|-------|-----------------|
| 1 | 1-2 | Skill entry point + README |
| 2 | 3-4 | Detection and analysis rules |
| 3 | 5-7 | Execution and verification rules |
| 4 | 8-11 | Template + GSD bridge (3 workflow patches) |
| 5 | 12-14 | Migration (brainstorming move, CLAUDE.md update, old skill deletion) |
| 6 | 15 | End-to-end verification |

**Total:** 15 tasks, ~6 chunks, all markdown/config (no TypeScript changes).

**Dependencies:**
- Chunks 1-3 are independent (can run in parallel)
- Chunk 4 depends on Chunks 2-3 (rules must exist before bridging)
- Chunk 5 depends on Chunk 4 (bridge must be in place before deleting old skill)
- Chunk 6 depends on all previous chunks
