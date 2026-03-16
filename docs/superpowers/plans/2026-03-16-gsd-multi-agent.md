# GSD Multi-Agent Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Evolve GSD to automatically detect multi-module phases and execute them with parallel agents via tmux, including hub-and-spoke communication, wave-based execution, and contract refresh.

**Architecture:** Modifications to 5 existing GSD components (planner agent, executor agent, verifier agent, execute-phase workflow, new-milestone workflow) plus a new module CLAUDE.md template. No new commands or files beyond the template. The GSD's existing wave system in execute-phase is extended to support multi-agent spawning when the plan declares `execution_mode: multi-agent`.

**Tech Stack:** Claude Code agent system (markdown agent definitions, workflow orchestration), tmux teammate mode, GSD CLI tools (Node.js), git

**Spec:** `docs/superpowers/specs/2026-03-16-gsd-multi-agent-design.md`

---

## Chunk 1: Module Registry Foundation

### Task 1: Create Module CLAUDE.md Template

**Files:**
- Create: `.claude/get-shit-done/templates/module-claude.md`

- [ ] **Step 1: Write the module CLAUDE.md template**

```markdown
# Module: {{module-name}}

## Purpose
{{one-line description}}

## Ownership
- src/modules/{{module-name}}/**

## Public API

### Types
{{exported types with file paths}}

### Hooks
{{exported hooks with file paths}}

### Components
{{exported components with file paths}}

## Dependencies

### From shared/
{{imports from shared/}}

### From platform/
{{imports from platform/}}

### From other modules
{{cross-module imports, always read-only}}

## Validation
- `tsc --noEmit` (full project, only at lead level)
- {{module-specific checks}}

## Agent Rules
- **Write:** Only files under `src/modules/{{module-name}}/`
- **Read:** Entire codebase
- **Shared writes:** Request via lead → platform agent
- **Cross-module writes:** Never — report to lead
```

- [ ] **Step 2: Verify template is well-formed markdown**

Run: `head -5 .claude/get-shit-done/templates/module-claude.md`
Expected: Shows the `# Module:` header line

- [ ] **Step 3: Commit**

```bash
git add .claude/get-shit-done/templates/module-claude.md
git commit -m "infra: add module CLAUDE.md template for multi-agent GSD"
```

---

### Task 2: Generate CLAUDE.md for Each Active Module

**Files:**
- Create: `src/modules/docs/CLAUDE.md`
- Create: `src/modules/clients/CLAUDE.md`
- Create: `src/modules/wireframe/CLAUDE.md`
- Create: `src/modules/tasks/CLAUDE.md`

For each module, analyze its actual exports/imports by reading its files and generate a CLAUDE.md following the template. Skip `ferramentas`, `hooks`, and `knowledge-base` (these are being removed or reorganized per v3.0 roadmap — Phase 62).

- [ ] **Step 1: Analyze docs module exports**

Read all files under `src/modules/docs/` — identify exported types, hooks, components, and imports from shared/platform/other modules.

- [ ] **Step 2: Write `src/modules/docs/CLAUDE.md`**

Populate template with actual exports/imports discovered. Example structure:
```markdown
# Module: docs

## Purpose
Documentation rendering and navigation — process docs, tools docs, client docs.

## Ownership
- src/modules/docs/**

## Public API

### Types
- (none exported cross-module)

### Hooks
- useDoc: Load and parse a single doc by path (src/modules/docs/hooks/useDoc.ts)
- useDocsNav: Navigation tree for sidebar (src/modules/docs/hooks/useDocsNav.ts)

### Components
- MarkdownRenderer: Renders .md with custom tags (src/modules/docs/components/MarkdownRenderer.tsx)
- DocBreadcrumb: Breadcrumb navigation (src/modules/docs/components/DocBreadcrumb.tsx)
[... other components discovered]

## Dependencies

### From shared/
- ui/ components (Button, Card, etc.)

### From platform/
- Layout, routing

### From other modules
- (none)

## Validation
- `tsc --noEmit` (full project, only at lead level)

## Agent Rules
- **Write:** Only files under `src/modules/docs/`
- **Read:** Entire codebase
- **Shared writes:** Request via lead → platform agent
- **Cross-module writes:** Never — report to lead
```

- [ ] **Step 3: Discover exports for each remaining module**

For each module (clients, wireframe, tasks), run discovery:
```bash
# List all exported symbols
grep -r "^export" src/modules/clients/ --include="*.ts" --include="*.tsx" | head -20
grep -r "^export" src/modules/wireframe/ --include="*.ts" --include="*.tsx" | head -20
grep -r "^export" src/modules/tasks/ --include="*.ts" --include="*.tsx" | head -20

# List all imports FROM other modules/shared/platform
grep -r "from.*@\|from.*shared\|from.*platform\|from.*modules/" src/modules/clients/ --include="*.ts" --include="*.tsx" | head -20
grep -r "from.*@\|from.*shared\|from.*platform\|from.*modules/" src/modules/wireframe/ --include="*.ts" --include="*.tsx" | head -20
grep -r "from.*@\|from.*shared\|from.*platform\|from.*modules/" src/modules/tasks/ --include="*.ts" --include="*.tsx" | head -20
```

- [ ] **Step 4: Write CLAUDE.md for clients module**

Populate based on discovery. Key areas: BriefingForm, BlueprintTextView, WireframeViewer pages; client context hooks; imports from wireframe module (read-only).

- [ ] **Step 5: Write CLAUDE.md for wireframe module**

Populate based on discovery. Key areas: ComponentGallery, SharedWireframeView pages; wireframe builder components; blueprint types; chart components.

- [ ] **Step 6: Write CLAUDE.md for tasks module**

Populate based on discovery. Key areas: tasks-service.ts; task types; Supabase integration.

- [ ] **Step 7: Verify all CLAUDE.md files exist**

Run: `ls src/modules/*/CLAUDE.md`
Expected: 4 files (docs, clients, wireframe, tasks)

- [ ] **Step 8: Commit**

```bash
git add src/modules/docs/CLAUDE.md src/modules/clients/CLAUDE.md src/modules/wireframe/CLAUDE.md src/modules/tasks/CLAUDE.md
git commit -m "infra: generate module CLAUDE.md files for multi-agent boundaries"
```

---

## Chunk 2: Planner Module Detection

### Task 3: Add Module Detection to gsd-planner

**Files:**
- Modify: `.claude/agents/gsd-planner.md`

The planner agent needs a new section after task generation that:
1. Maps each task's files to module owners
2. Classifies tasks as module-specific, cross-cutting, or unmapped
3. Decides execution mode (single-agent vs multi-agent)
4. If multi-agent: generates wave breakdown, sub-waves, and contracts

- [ ] **Step 1: Read current gsd-planner.md fully**

Read the complete file to understand where to insert the new section.

- [ ] **Step 2: Add module detection section after task generation**

Insert a new `<module_detection>` section after the existing planning flow. This section instructs the planner to:

```markdown
<module_detection>
## Module-Aware Planning (Automatic)

After generating tasks, perform module detection:

### Step 1: Discover Modules
```bash
ls -d src/modules/*/CLAUDE.md 2>/dev/null
```
Read each module's CLAUDE.md to understand ownership boundaries and public APIs.

### Step 2: Map Tasks to Modules
For each task, identify files it will create/modify and map to owners:
- `src/modules/[name]/**` → module `[name]`
- `src/platform/**` → platform (cross-cutting)
- `src/shared/**` → platform (cross-cutting)
- `docs/**`, `clients/**`, `tools/**`, `supabase/**`, root configs → lead agent (unmapped)

Classify each task as: `module-specific([name])`, `cross-cutting`, or `unmapped`.

### Step 3: Decide Execution Mode
Count tasks by category:
- If only 1 module affected → `execution_mode: single-agent` (standard plan, no changes)
- If 2+ modules affected → calculate parallelization ratio:
  - `ratio = module-scoped tasks in 2+ modules / total tasks`
  - If ratio < 0.30 → `execution_mode: single-agent` (not worth parallelizing)
  - If ratio >= 0.30 → `execution_mode: multi-agent`
  - Example: 5 cross-cutting + 2 module-scoped = 2/7 = 28% → single-agent
  - Example: 3 cross-cutting + 8 module-scoped in 3 modules = 8/11 = 72% → multi-agent
- If only cross-cutting → `execution_mode: single-agent`
- If only unmapped → `execution_mode: single-agent`
- If mix of modules + unmapped → `execution_mode: multi-agent`, unmapped tasks go to lead

### Step 4: Generate Multi-Agent Plan Structure (only if multi-agent)

Add to PLAN.md frontmatter:
```yaml
execution_mode: multi-agent
agents:
  - name: platform
    ownership: ["src/platform/**", "src/shared/**"]
    tasks: [task-ids]
  - name: wireframe
    ownership: ["src/modules/wireframe/**"]
    tasks: [task-ids]
  - name: clients
    ownership: ["src/modules/clients/**"]
    tasks: [task-ids]
waves:
  1: { agent: platform, type: cross-cutting }
  2: { agents: [wireframe, clients], type: parallel-modules }
  3: { type: integration-verification }
```

Add Contracts section to plan body:
```markdown
## Contracts

### platform → wireframe
- Exports: [TypeScript interfaces with exact shapes]
- Location: [exact file paths]

### platform → clients
- Exports: [TypeScript interfaces with exact shapes]
- Location: [exact file paths]
```

**Contract generation rules:**
- Derive from task descriptions — what each task creates/modifies that others need
- Use exact TypeScript interface definitions, not prose
- Include file paths for every export
- Only include contracts for the delta (what changes in this phase)

### Step 5: Detect Intra-Wave Dependencies (Sub-Waves)

If module A produces something module B consumes within Wave 2:
```yaml
waves:
  2a: { agents: [wireframe], type: parallel-modules, note: "produces WireframeContext" }
  2b: { agents: [clients], type: parallel-modules, depends_on: 2a, note: "consumes WireframeContext" }
```

If no inter-module dependencies in Wave 2: all modules in single sub-wave.

### Step 6: Self-Check for Multi-Agent Plans
- [ ] Every task assigned to exactly one agent
- [ ] No two agents own overlapping file paths
- [ ] Cross-cutting tasks assigned to platform agent
- [ ] Contracts include TypeScript interfaces (not prose descriptions)
- [ ] Sub-waves correctly ordered if inter-module dependencies exist
</module_detection>
```

- [ ] **Step 3: Verify the edit is syntactically valid**

Run: `grep -c "module_detection" .claude/agents/gsd-planner.md`
Expected: 2 (opening and closing tags)

- [ ] **Step 4: Commit**

```bash
git add .claude/agents/gsd-planner.md
git commit -m "infra: add module detection and multi-agent planning to gsd-planner"
```

---

## Chunk 3: Execute-Phase Multi-Agent Orchestration

### Task 4: Add Multi-Agent Execution to execute-phase Workflow

**Files:**
- Modify: `.claude/get-shit-done/workflows/execute-phase.md`

This is the core change. The execute-phase workflow needs to detect `execution_mode: multi-agent` in the PLAN.md and switch from single-agent execution to multi-agent wave orchestration.

- [ ] **Step 1: Read current execute-phase.md fully**

Read the complete file to understand the existing wave execution flow.

- [ ] **Step 2: Add multi-agent detection after plan discovery**

After the `discover_and_group_plans` step, add detection logic:

```markdown
<step name="detect_multi_agent">
**Check for multi-agent execution mode:**

For each plan in `plans[]`, read frontmatter and check for `execution_mode: multi-agent`.

If ANY plan has `execution_mode: multi-agent`:
1. Read the plan's `agents` and `waves` frontmatter
2. Read the plan's `## Contracts` section
3. Set `MULTI_AGENT=true`

If NO plans have multi-agent mode: continue with standard execution (existing flow).

**Tmux + teammate mode availability check:**
```bash
# Check if tmux is installed AND teammate mode is configured
TMUX_INSTALLED=$(command -v tmux &>/dev/null && echo "true" || echo "false")
TEAMMATE_MODE=$(node "{gsd-tools}" config-get parallelization.multi_agent.enabled 2>/dev/null || echo "false")

if [[ "$TMUX_INSTALLED" == "true" && "$TEAMMATE_MODE" == "true" ]]; then
  TMUX_AVAILABLE=true
else
  TMUX_AVAILABLE=false
fi
```

If `MULTI_AGENT=true` but `TMUX_AVAILABLE=false`:
```
⚠ Multi-agent plan detected but tmux/teammate mode not available.
Falling back to sequential execution (all waves run in order with single agent).
```
Set `MULTI_AGENT=false` and continue with standard flow.
</step>
```

- [ ] **Step 3: Add multi-agent execution step**

Add the wave orchestration step for multi-agent execution:

```markdown
<step name="execute_multi_agent" condition="MULTI_AGENT=true">
**Multi-agent wave execution with hub-and-spoke communication.**

Parse from plan frontmatter: `agents[]`, `waves{}`, and `## Contracts` section.

### CHECKPOINT 1: Show Execution Plan

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► MULTI-AGENT EXECUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase {X}: {Name}
Execution Mode: multi-agent ({N} agents)

| Wave | Agent(s) | Tasks | What it builds |
|------|----------|-------|----------------|
| 1    | platform | {ids} | {cross-cutting description} |
| 2    | {module1}, {module2} | {ids} | {parallel module work} |
| 3    | lead     | —     | Integration verification |

Contracts:
{contract summary from plan}

Proceed? (yes / adjust)
```

Wait for user confirmation.

**Note on agent spawning:** The `Task()` syntax below is the standard GSD agent spawning pattern used in all workflow .md files (same as existing execute-phase uses for gsd-executor). With `teammateMode: "tmux"`, each `Task()` spawns a new tmux pane. The `name` parameter makes agents addressable via `SendMessage(to="name")`.

**Lead message monitoring:** The lead agent (execute-phase orchestrator) uses `SendMessage` reception to handle messages from module agents. When a module agent sends `SendMessage(to="lead", ...)`, the orchestrator receives it as part of its normal message flow. The orchestrator should check for incoming messages between wave operations and when waiting for agent completion. Messages requiring action (scope escalation, contract deviation) are processed immediately; informational messages are logged.

### Capture Baseline Commit

Before starting any wave, capture the current commit hash for scope verification:
```bash
BASELINE_COMMIT=$(git rev-parse HEAD)
```
After Wave 1 completes:
```bash
POST_WAVE1_COMMIT=$(git rev-parse HEAD)
```
Use these for scope violation checks after each wave.

### Wave 1: Platform Agent

Spawn platform agent with cross-cutting tasks:

```
Task(
  subagent_type="gsd-executor",
  model="{executor_model}",
  name="platform",
  prompt="
    <objective>
    Execute cross-cutting tasks for phase {phase_number}.
    You are the PLATFORM agent — you own src/platform/** and src/shared/**.
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
    @execute-plan.md
    @summary.md
    </execution_context>

    <files_to_read>
    - {phase_dir}/{plan_file}
    - .planning/STATE.md
    - ./CLAUDE.md
    </files_to_read>

    <success_criteria>
    - [ ] All platform tasks executed
    - [ ] Each task committed individually
    - [ ] SUMMARY.md created
    - [ ] Exports match contracts exactly
    </success_criteria>
  "
)
```

Wait for platform agent to complete.

### CHECKPOINT 2: Contract Refresh

After platform agent completes:

1. Read platform agent's SUMMARY.md for completed exports
2. Read the actual TypeScript files created/modified by platform agent
3. Extract real type definitions from code (not plan predictions)
4. Update contracts with concrete types for module agents
5. Log: `✓ Contracts refreshed from platform agent output`

If platform agent failed: follow error recovery (see error_recovery step).

### Wave 2: Module Agents (Parallel)

**Check for sub-waves** in plan frontmatter:
- If `waves.2a` and `waves.2b` exist: spawn 2a first, wait, then spawn 2b
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
    You are the {MODULE-NAME} agent — you own src/modules/{module-name}/**.
    </objective>

    <agent_rules>
    - Write: src/modules/{module-name}/** ONLY
    - Read: entire codebase
    - Do NOT modify src/platform/, src/shared/, or other modules
    - If you need changes outside your scope:
      - Send message to lead: describe what you need and why
      - Wait for lead to delegate to platform agent or authorize
    </agent_rules>

    <module_context>
    {contents of src/modules/{module-name}/CLAUDE.md}
    </module_context>

    <contracts_you_consume>
    {REFRESHED contracts from Checkpoint 2, with real TypeScript types}
    </contracts_you_consume>

    <contracts_you_produce>
    {contracts where this module is the source, if any}
    </contracts_you_produce>

    <communication>
    Hub-and-spoke model:
    - Decisions, changes, scope escalation → SendMessage to lead
    - Simple signals (dependency ready, status) → direct to other agents OK
    - NEVER negotiate contract changes directly with other agents
    </communication>

    <execution_context>
    @execute-plan.md
    @summary.md
    </execution_context>

    <files_to_read>
    - {phase_dir}/{plan_file}
    - src/modules/{module-name}/CLAUDE.md
    - .planning/STATE.md
    - ./CLAUDE.md
    </files_to_read>

    <success_criteria>
    - [ ] All module tasks executed
    - [ ] Each task committed individually
    - [ ] SUMMARY.md created
    - [ ] git diff shows NO files outside src/modules/{module-name}/
    </success_criteria>
  "
)
```

Platform agent remains active during Wave 2 for scope escalation:
```
SendMessage(to="platform", "You are now in standby mode for Wave 2.
  Module agents may request changes to shared/ or platform/ through the lead.
  Wait for lead instructions.")
```

Monitor agent messages during Wave 2:
- If module agent sends scope escalation → evaluate, delegate to platform agent or authorize
- If module agent sends contract deviation → evaluate impact, update contracts, notify affected agents
- If module agent sends blocker → coordinate resolution

Wait for all module agents to complete.

### Scope Violation Check

After all Wave 2 agents report done:

```bash
# For each module agent, verify scope compliance
for AGENT in {module-agents}; do
  AGENT_FILES=$(git diff --name-only $POST_WAVE1_COMMIT -- "src/modules/${AGENT}/")
  OUT_OF_SCOPE=$(git diff --name-only $POST_WAVE1_COMMIT | grep -v "src/modules/${AGENT}/" | head -5)
  if [[ -n "$OUT_OF_SCOPE" ]]; then
    echo "⚠ Agent ${AGENT} modified files outside scope: ${OUT_OF_SCOPE}"
  fi
done
```

If scope violations found:
- Revert out-of-scope changes: `git checkout $POST_WAVE1_COMMIT -- {file}`
- Notify agent and request correction through proper channel

### CHECKPOINT 3: Integration Verification

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► INTEGRATION VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Run full-project verification:
```bash
npx tsc --noEmit
npm run build
```

Check cross-module imports:
- Verify no module imports internals from another module (only public API)
- Verify contracts declared in plan were implemented correctly

If verification fails: identify which agent's domain contains the issue, re-spawn that agent with the specific fix needed.

If verification passes: continue to standard aggregate_results step.
</step>
```

- [ ] **Step 4: Add error recovery step**

```markdown
<step name="error_recovery" condition="MULTI_AGENT=true">
**Error recovery for multi-agent execution.**

If an agent fails during execution (crash, rate limit, unrecoverable error):

1. **Other agents continue** — no global abort
2. **Lead evaluates git diff** of failed agent:
   ```bash
   git diff --name-only $POST_WAVE1_COMMIT..HEAD -- {agent-ownership-paths}
   ```
3. **Commit good work** (if any complete tasks):
   ```bash
   git add {completed-files}
   git commit -m "partial: {agent-name} completed tasks before failure"
   ```
4. **Revert incomplete changes:**
   ```bash
   git checkout $POST_WAVE1_COMMIT -- {incomplete-files}
   ```
5. **Re-spawn with remaining tasks only:**
   - New agent gets only the tasks that weren't completed
   - Fresh context, no attempt to restore failed agent's state
6. **If dependents exist:** send pause signal, resume after re-spawn completes
7. **If re-spawn fails 2x:** lead executes remaining tasks directly (break glass)
</step>
```

- [ ] **Step 5: Verify the workflow file is valid**

Run: `grep -c "multi_agent" .claude/get-shit-done/workflows/execute-phase.md`
Expected: Multiple matches (detection, execution, error recovery)

- [ ] **Step 6: Commit**

```bash
git add .claude/get-shit-done/workflows/execute-phase.md
git commit -m "infra: add multi-agent wave execution to execute-phase workflow"
```

---

## Chunk 4: Verifier Cross-Module Checks

### Task 5: Add Cross-Module Verification to gsd-verifier

**Files:**
- Modify: `.claude/agents/gsd-verifier.md`

- [ ] **Step 1: Read current gsd-verifier.md fully**

Read the complete file to understand existing verification flow.

- [ ] **Step 2: Add cross-module verification section**

After the existing anti-pattern scanning section, add:

```markdown
<cross_module_verification>
## Cross-Module Verification (Multi-Agent Plans)

If the plan has `execution_mode: multi-agent` in frontmatter, perform additional checks:

### 1. Public API Boundary Check
For each module with a CLAUDE.md:
- Read the module's `## Public API` section
- Grep for imports FROM this module in OTHER modules
- Verify all cross-module imports use only the declared public API
- Flag any import that reaches into module internals (e.g., `src/modules/wireframe/components/internal/`)

### 2. Contract Implementation Check
Read the plan's `## Contracts` section:
- For each contract, verify the declared exports exist in the specified files
- Verify TypeScript types match the contract shapes
- Flag missing or mismatched exports

### 3. Module CLAUDE.md Freshness Check
For each module affected by this phase:
- Read the module's CLAUDE.md
- Check if new exports created during this phase are listed in Public API
- If not: add to gaps as "CLAUDE.md needs update for [new export]"

### 4. Scope Compliance Check
```bash
# For each module agent's commits, verify file scope
git log --format="%H %s" --all -- "src/modules/{module}/" | head -20
```
Flag any commits that modified files outside the declared module ownership.
</cross_module_verification>
```

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/gsd-verifier.md
git commit -m "infra: add cross-module verification checks to gsd-verifier"
```

---

## Chunk 5: Brainstorming in Milestones + Executor Agent Rules

### Task 6: Add Brainstorming Invocation to new-milestone Workflow

**Files:**
- Modify: `.claude/get-shit-done/workflows/new-milestone.md`

- [ ] **Step 1: Read current new-milestone.md fully**

Read the complete file to find the insertion point (after Step 2 "Gather Milestone Goals").

- [ ] **Step 2: Add brainstorming step**

After Step 2 (Gather Milestone Goals), insert:

```markdown
## 2.5. Brainstorming (Mandatory)

Before defining requirements, invoke the brainstorming skill to explore the milestone scope:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► BRAINSTORMING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Exploring milestone scope before requirements...
```

Invoke `superpowers:brainstorming` skill with context:
- Project: from PROJECT.md
- Previous milestones: from MILESTONES.md
- User's stated goals: from Step 2

The brainstorming process:
1. Asks clarifying questions (one at a time)
2. Proposes 2-3 approaches with trade-offs
3. Presents design by sections for approval
4. Writes spec to `docs/superpowers/specs/YYYY-MM-DD-<milestone-name>-design.md`

After spec is written and approved:
- Use spec as primary input for requirements definition (Step 9)
- Reference spec path in PROJECT.md under Current Milestone

**Skip condition:** If user explicitly passes `--skip-brainstorm` flag.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/get-shit-done/workflows/new-milestone.md
git commit -m "infra: add mandatory brainstorming to new-milestone workflow"
```

---

### Task 7: Add Module-Scoped Agent Rules to gsd-executor

**Files:**
- Modify: `.claude/agents/gsd-executor.md`

- [ ] **Step 1: Read current gsd-executor.md fully**

Read the complete file.

- [ ] **Step 2: Add module-scoped execution section**

Add a section that the executor respects when spawned as a module agent:

```markdown
<module_scoped_execution>
## Module-Scoped Execution

When spawned with `<agent_rules>` containing ownership boundaries:

### Scope Enforcement
- Do NOT run `tsc --noEmit` or `npm run build` — other agents may be writing simultaneously, results would be inconsistent. Full-project checks run at lead level only (Checkpoint 3).
- Before every file write, verify the target path is within your declared ownership
- If a task requires modifying a file outside your scope:
  1. Do NOT modify it
  2. Send message to lead: "Task {N} needs change in {file} outside my scope: {what change}"
  3. Continue with other tasks that don't require out-of-scope changes
  4. Wait for lead response before completing the blocked task

### Communication Protocol
- **To lead (for decisions/changes):** `SendMessage(to="lead", "...")`
- **To other agents (signals only):** `SendMessage(to="{agent-name}", "...")`
- Never negotiate contract changes directly with other agents

### Scope Verification Before Done
Before creating SUMMARY.md:
```bash
git diff --name-only {start-commit} | grep -v "{my-ownership-pattern}"
```
If any files outside scope were modified: revert them and report to lead.
</module_scoped_execution>
```

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/gsd-executor.md
git commit -m "infra: add module-scoped execution rules to gsd-executor"
```

---

## Chunk 6: Config and Documentation

### Task 8: Update GSD Config Template

**Files:**
- Modify: `.claude/get-shit-done/templates/config.json`

- [ ] **Step 1: Read current config.json**

- [ ] **Step 2: Add multi-agent config options**

Add under `parallelization`:
```json
{
  "parallelization": {
    "enabled": true,
    "plan_level": true,
    "task_level": false,
    "skip_checkpoints": true,
    "max_concurrent_agents": 3,
    "min_plans_for_parallel": 2,
    "multi_agent": {
      "enabled": true,
      "min_parallelization_ratio": 0.30,
      "platform_agent_standby": true
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add .claude/get-shit-done/templates/config.json
git commit -m "infra: add multi-agent config options to GSD config template"
```

---

### Task 9: Update Plan Template with Multi-Agent Frontmatter

**Files:**
- Modify: `.claude/get-shit-done/templates/phase-prompt.md`

- [ ] **Step 1: Read current phase-prompt.md**

- [ ] **Step 2: Add multi-agent frontmatter documentation**

In the frontmatter fields section, add:

```markdown
### Multi-Agent Fields (added automatically by planner when detected)

```yaml
execution_mode: multi-agent  # or single-agent (default)
agents:
  - name: platform
    ownership: ["src/platform/**", "src/shared/**"]
    tasks: [1, 3]
  - name: wireframe
    ownership: ["src/modules/wireframe/**"]
    tasks: [2, 4]
waves:
  1: { agent: platform, type: cross-cutting }
  2: { agents: [wireframe, clients], type: parallel-modules }
  # Sub-waves if inter-module dependencies:
  # 2a: { agents: [wireframe], type: parallel-modules }
  # 2b: { agents: [clients], type: parallel-modules, depends_on: 2a }
  3: { type: integration-verification }
```

These fields are generated by the planner's module detection step. Do NOT add manually.
When `execution_mode: multi-agent`, the plan MUST include a `## Contracts` section with TypeScript interfaces.
```

- [ ] **Step 3: Commit**

```bash
git add .claude/get-shit-done/templates/phase-prompt.md
git commit -m "infra: document multi-agent frontmatter in phase prompt template"
```

---

### Task 10: Add Auto-Scaffold for New Modules + Deprecation Note

**Files:**
- Modify: `.claude/agents/gsd-planner.md` (add auto-scaffold instruction)
- Modify: `.claude/skills/build-with-agent-team/SKILL.md` (add deprecation note)

- [ ] **Step 1: Add auto-scaffold instruction to planner's module detection**

In the `<module_detection>` section's Step 1 (Discover Modules), after reading CLAUDE.md files, add:

```markdown
If a module directory under src/modules/ exists but has NO CLAUDE.md:
- Auto-generate a scaffold CLAUDE.md by analyzing the module's exports/imports:
  ```bash
  grep -r "^export" src/modules/{name}/ --include="*.ts" --include="*.tsx" | head -20
  ```
- Write the scaffold using the module-claude.md template
- Log: "⚠ Auto-generated CLAUDE.md for module {name} — review recommended"
```

- [ ] **Step 2: Add deprecation note to build-with-agent-team SKILL.md**

Add at the top of the file, after the frontmatter:

```markdown
> **Note:** GSD now handles multi-agent execution natively via `/gsd:execute-phase`.
> This skill is maintained as reference and fallback for projects outside the GSD workflow.
> For GSD projects, use `/gsd:plan-phase` (auto-detects modules) + `/gsd:execute-phase` (auto-spawns agents).
```

- [ ] **Step 3: Commit**

```bash
git add .claude/agents/gsd-planner.md .claude/skills/build-with-agent-team/SKILL.md
git commit -m "infra: add module CLAUDE.md auto-scaffold and deprecation note for build-with-agent-team"
```

---

### Task 11: Final Integration Verification

**Files:**
- Read: All modified files

- [ ] **Step 1: Verify all modified files are syntactically valid**

```bash
# Check all modified markdown files for obvious syntax issues
for f in \
  .claude/agents/gsd-planner.md \
  .claude/agents/gsd-executor.md \
  .claude/agents/gsd-verifier.md \
  .claude/get-shit-done/workflows/execute-phase.md \
  .claude/get-shit-done/workflows/new-milestone.md \
  .claude/get-shit-done/templates/config.json \
  .claude/get-shit-done/templates/phase-prompt.md \
  .claude/get-shit-done/templates/module-claude.md; do
  echo "--- $f ---"
  wc -l "$f"
done
```

- [ ] **Step 2: Verify config.json is valid JSON**

```bash
node -e "JSON.parse(require('fs').readFileSync('.claude/get-shit-done/templates/config.json', 'utf8')); console.log('Valid JSON')"
```
Expected: "Valid JSON"

- [ ] **Step 3: Verify module CLAUDE.md files reference real paths**

For each module CLAUDE.md, verify that referenced files/directories actually exist:
```bash
for mod in docs clients wireframe tasks; do
  echo "=== $mod ==="
  ls "src/modules/$mod/" | head -10
done
```

- [ ] **Step 4: Run project TypeScript check (no code changes, just verification)**

```bash
npx tsc --noEmit
```
Expected: No errors (we only modified markdown/json, not TypeScript)

- [ ] **Step 5: Commit any remaining changes**

```bash
git add -A
git status
# Only commit if there are changes
git diff --cached --quiet || git commit -m "infra: finalize GSD multi-agent implementation"
```
