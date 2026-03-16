# Multi-Agent Execution — Rules for execute-phase orchestrator

When a plan has `execution_mode: multi-agent` in frontmatter, follow this orchestration
instead of the standard single-agent execution.

## Prerequisites Check

```bash
# Verify tmux is available
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
