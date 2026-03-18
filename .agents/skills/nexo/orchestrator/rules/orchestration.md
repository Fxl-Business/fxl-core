# Orchestration — Wave-based parallel agent execution

When a plan has `execution_mode: multi-agent` (GSD) or the skill decides to orchestrate (ad-hoc),
follow this wave architecture to spawn scoped agents, enforce contracts, and verify integration.

---

## Prerequisites Check

```bash
# Verify tmux is available
TMUX_INSTALLED=$(command -v tmux &>/dev/null && echo "true" || echo "false")

# Capture baseline commit before any wave
BASELINE_COMMIT=$(git rev-parse HEAD)
```

If tmux not available:
```
⚠ Multi-agent orchestration detected but tmux not available.
Falling back to sequential execution (waves in order, single agent per wave).
```
→ Execute waves sequentially with a single agent at a time. Same contract and scope logic applies.
→ `SendMessage` between agents is NOT available without tmux — all communication goes through
the lead's sequential orchestration.
→ See "Fallback Without tmux" section below for full protocol.

---

## CHECKPOINT 1: Show Execution Plan

Before spawning any agent, present the execution summary:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 AGENT ORCHESTRATOR ► MULTI-AGENT EXECUTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase/Task: {name}
Execution Mode: multi-agent ({N} agents)

| Wave | Agent(s)      | Tasks   | What it builds              |
|------|---------------|---------|-----------------------------|
| 1    | platform      | {ids}   | {cross-cutting description} |
| 2a   | {boundaries}  | {ids}   | {parallel work description} |
| 2b   | {boundaries}  | {ids}   | {depends on 2a, if any}     |
| 3    | lead          | —       | Integration verification    |

Contracts:
  - platform → [{boundaries}]: {contract description}
  - {boundary} → [{consumers}]: {contract description}

Proceed? (yes / adjust)
```

Wait for user confirmation before spawning agents.

**In auto mode (GSD `workflow.auto_advance: true`):** Auto-approve. Log `⚡ Auto-approved execution plan`.

---

## Wave 1: Cross-Cutting Agent (Platform)

Spawn the platform agent to handle shared infrastructure, types, configs, and migrations:

```
Agent(
  subagent_type="gsd-executor",   # GSD context; omit for ad-hoc
  name="platform",
  prompt="
    <role>You are the PLATFORM agent — cross-cutting infrastructure.</role>

    <ownership>
    - src/platform/**
    - src/shared/**
    - {additional cross_cutting paths from boundary map}
    </ownership>

    <scope_rules>
    Read: .agents/skills/nexo/orchestrator/rules/scoped-agent.md
    Follow ALL rules in that file.
    </scope_rules>

    <contracts_you_produce>
    {contracts from plan/analysis where source is platform}
    Ensure your exports match these contracts exactly.
    </contracts_you_produce>

    <tasks>
    {tasks assigned to platform/cross-cutting}
    </tasks>

    <context>
    {boundary CLAUDE.md content for platform, if exists}
    </context>
  "
)
```

Wait for platform agent to complete. Capture post-Wave-1 commit:

```bash
POST_WAVE1_COMMIT=$(git rev-parse HEAD)
```

If platform agent failed → see Error Recovery below.

---

## CHECKPOINT 2: Contract Refresh

**This is the key improvement over the old multi-agent system.** Instead of using predicted
types from the plan, we extract REAL TypeScript from the platform agent's actual output.

After platform agent completes:

1. **Read actual files** created/modified by platform agent:
   ```bash
   # Use commit tracer to find platform's commits
   git log --format="%H" --grep="\[agent:platform\]" ${BASELINE_COMMIT}..HEAD | \
     xargs -I{} git diff-tree --no-commit-id --name-only -r {}
   ```

2. **Extract concrete TypeScript** — read each modified file, extract:
   - Exported types and interfaces
   - Exported functions and their signatures
   - Exported constants and enums

3. **Build refreshed contracts** for boundary agents:
   ```
   <contracts_you_consume>
   // From: src/platform/types/tenant.ts (actual, post-Wave-1)
   export interface TenantConfig {
     id: string;
     slug: string;
     features: FeatureFlags;
   }

   // From: src/shared/hooks/useTenant.ts (actual, post-Wave-1)
   export function useTenant(): TenantConfig;
   </contracts_you_consume>
   ```

4. **Log:** `✓ Contracts refreshed from platform agent output ({N} types, {M} functions)`

If contracts changed significantly from plan predictions, log the delta but continue —
the real types are authoritative.

---

## Wave 2: Boundary Agents (Parallel)

### Sub-Wave Detection

Check for inter-boundary dependencies in the plan:

- If plan has `waves.2a` and `waves.2b` → spawn 2a first, wait for completion, then spawn 2b
- If no inter-boundary dependencies → spawn all boundary agents in a single Wave 2

**Detection rule:** If a task in boundary B has `read_first` or `depends_on` referencing a file
that a task in boundary A creates, they cannot run in parallel → split into sub-waves.

### Spawning Boundary Agents

For each boundary agent:

```
Agent(
  subagent_type="gsd-executor",   # GSD context; omit for ad-hoc
  name="{boundary-name}",
  prompt="
    <role>You are the {boundary-name} agent.</role>

    <ownership>
    - {boundary primary path}/**
    {for each associated path:}
    - {associated path}/**   (associated: {reason})
    </ownership>

    <scope_rules>
    Read: .agents/skills/nexo/orchestrator/rules/scoped-agent.md
    Follow ALL rules in that file.
    </scope_rules>

    <contracts_you_consume>
    {REFRESHED contracts with real TypeScript types from Checkpoint 2}
    </contracts_you_consume>

    <contracts_you_produce>
    {contracts where this boundary is source, if any}
    </contracts_you_produce>

    <tasks>
    {tasks assigned to this boundary}
    </tasks>

    <context>
    {contents of boundary CLAUDE.md, if exists}
    </context>
  "
)
```

### Platform Agent Standby

Platform agent stays active during Wave 2 for scope escalation:
```
SendMessage(to="platform", "Standby for Wave 2. Boundary agents may request
  changes to shared/ or platform/. Wait for lead instructions.")
```

### Lead Responsibilities During Wave 2

- Monitor incoming messages from boundary agents via SendMessage
- If scope escalation → delegate to platform agent or authorize directly
- If contract deviation → evaluate, update contracts, notify affected agents
- If blocker → coordinate resolution between agents

Wait for all boundary agents to complete.

### Agent Dismissal

After all wave agents complete and results are consolidated, **immediately shut down every agent
from that wave** before proceeding to the next step. Leaving agents idle wastes tmux panes,
confuses the user, and burns context.

**How to dismiss:** Use `SendMessage` with a `shutdown_request` for each agent:

```
SendMessage(
  to="{agent-name}",
  message={ "type": "shutdown_request", "reason": "Wave complete. Results consolidated." }
)
```

The agent will receive the shutdown request, approve it, and its tmux pane will close.

**Dismissal sequence:**

1. All wave agents return results → lead consolidates
2. **Immediately** send `shutdown_request` to every agent in the completed wave
3. Only then proceed to next wave / scope verification / integration check

**Rule:** Never leave agents idle across waves or after consolidation. If a subsequent step
needs agent-level work, spawn a fresh subagent (which runs invisibly) — this is the correct
choice for sequential follow-up tasks that don't benefit from tmux visibility.

**Common mistake:** Assuming agents auto-exit when you stop messaging them. They do NOT —
tmux agents stay idle indefinitely until explicitly shut down via `shutdown_request`.

---

## Scope Violation Check via Commit Tracers

After Wave 2 completes, verify each agent stayed within its declared ownership:

```bash
for AGENT in {boundary-names}; do
  # Get all files this agent touched, identified by commit tracer
  OUT_OF_SCOPE=$(
    git log --format="%H" --grep="\[agent:${AGENT}\]" ${POST_WAVE1_COMMIT}..HEAD | \
      xargs -I{} git diff-tree --no-commit-id --name-only -r {} | \
      sort -u | \
      grep -v "${AGENT_OWNERSHIP_PATTERN}" | \
      grep -v "${AGENT_ASSOCIATED_PATTERN}"
  )

  if [[ -n "$OUT_OF_SCOPE" ]]; then
    echo "⚠ Agent ${AGENT} modified files outside scope:"
    echo "$OUT_OF_SCOPE"
    # Revert out-of-scope changes from this agent's commits
    for COMMIT in $(git log --format="%H" --grep="\[agent:${AGENT}\]" ${POST_WAVE1_COMMIT}..HEAD); do
      for FILE in $(git diff-tree --no-commit-id --name-only -r $COMMIT | grep -v "${AGENT_OWNERSHIP_PATTERN}" | grep -v "${AGENT_ASSOCIATED_PATTERN}"); do
        git checkout ${POST_WAVE1_COMMIT} -- "$FILE" 2>/dev/null
      done
    done
    git commit -m "fix: revert out-of-scope changes from agent ${AGENT} [agent:lead]" 2>/dev/null
  fi
done
```

This approach uses per-agent commit tracers (`[agent:{name}]`) instead of global `git diff`,
which eliminates false positives when multiple agents commit in parallel.

---

## CHECKPOINT 3: Integration Verification

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 AGENT ORCHESTRATOR ► INTEGRATION VERIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Run the checks defined in `rules/integration-check.md`:

1. `npx tsc --noEmit` — global type check
2. `npm run build` — build verification
3. Cross-boundary import audit (internal imports only)
4. Scope compliance (already done above, include results)

If ALL pass → proceed to aggregate results.
If ANY fail → see Error Recovery, then re-run failed checks.

---

## Error Recovery

When an agent fails (crash, rate limit, unrecoverable error):

1. **Other agents continue** — no global abort. Healthy agents keep working.

2. **Commit good work** — if the failed agent made partial progress:
   ```bash
   git log --format="%H %s" --grep="\[agent:${FAILED_AGENT}\]" ${POST_WAVE1_COMMIT}..HEAD
   ```
   Completed task commits are kept. Only revert uncommitted/incomplete changes.

3. **Revert incomplete changes:**
   ```bash
   # Check for uncommitted changes in failed agent's scope
   git diff --name-only -- "${FAILED_AGENT_OWNERSHIP}" | xargs git checkout HEAD --
   ```

4. **Re-spawn with remaining tasks** (max 2 retries):
   - Fresh agent with same ownership and contracts
   - Only assign tasks NOT already committed
   - Include error context: "Previous agent failed with: {error}. Completed: {task list}."

5. **If dependents exist** — pause dependent sub-wave until re-spawn completes.

6. **Break glass (after 2 failed re-spawns):**
   - Lead executes remaining tasks directly
   - Log: `⚠ Agent ${AGENT} failed 2x. Lead taking over remaining tasks.`
   - Continue to integration verification

---

## Fallback Without tmux

If tmux is not available, execute the same wave architecture sequentially:

1. **Wave 1:** Spawn platform agent as subagent (single, foreground). Wait for completion.
2. **Contract Refresh:** Same process — read real types from platform output.
3. **Wave 2a:** Execute first sub-wave agents one at a time.
4. **Wave 2b:** Execute second sub-wave agents one at a time (if any).
5. **Wave 3:** Integration verification (same checks).

Key differences:
- No parallel execution — agents run one after another
- `SendMessage` is NOT available — all coordination is inline
- Same contract and scope logic applies
- Same commit tracer pattern for scope verification
- Zero interface change — the plan structure is identical, only execution is serial

---

## Aggregate Results

After all waves complete and integration passes:

**GSD context:**
- Each agent produced its own SUMMARY.md (or task commits)
- Lead aggregates into phase-level summary
- Continue with standard GSD `aggregate_results` step

**Ad-hoc context:**
- Collect results from each boundary agent
- Present consolidated summary to user:
  ```
  Parallel execution complete ({N} agents, {W} waves).
  ✓ TypeScript: 0 errors
  ✓ Build: OK
  ✓ Scope compliance: all agents in-bounds

  Commits:
  - {hash}: {message} [agent:{name}]
  - {hash}: {message} [agent:{name}]
  ```
