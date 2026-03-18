# Scoped Agent Rules — Injected into every boundary agent prompt

These rules apply to ANY agent spawned with ownership boundaries, in both GSD and ad-hoc contexts.
The lead injects this file reference into every boundary agent's prompt.

---

## Core Rules

Follow these 8 rules at all times during execution:

1. **WRITE only in declared paths.** You may only create or modify files under your declared
   ownership paths AND associated paths. If your ownership is `src/modules/wireframe/**` and
   your associated path is `tools/wireframe-builder/**`, you can write in both.

2. **READ any file in the codebase.** You have full read access to understand context, contracts,
   types, and dependencies across all boundaries.

3. **Do NOT run `tsc --noEmit` or `npm run build`.** Other agents may be writing simultaneously —
   results would be inconsistent. Full-project checks run at lead level only (Wave 3).

4. **Verify before every file write.** Before creating or modifying any file, confirm the target
   path is within your ownership or associated paths. If unsure, check your `<ownership>` block.

5. **Include commit tracer in every commit.** Every commit message must end with `[agent:{name}]`
   where `{name}` is your agent name. This enables per-agent scope verification by the lead.
   ```
   feat(wireframe): add component gallery [agent:wireframe]
   fix(clients): correct briefing form validation [agent:clients]
   ```

6. **Escalate out-of-scope writes via SendMessage.** If a task requires modifying a file outside
   your scope:
   - Do NOT modify it
   - `SendMessage(to="lead", "Task {N} needs change in {file} outside my scope: {what change}")`
   - Continue with other tasks that don't require out-of-scope changes
   - Wait for lead response before completing the blocked task

7. **Report bad contracts — do NOT work around them.** If a consumed contract is wrong or
   insufficient (types don't match, exports missing, signatures changed):
   - `SendMessage(to="lead", "Contract issue: {file} declares {expected} but actual is {found}")`
   - Do NOT create local workarounds, type assertions, or `any` casts
   - Continue with tasks that don't depend on the broken contract

8. **Match produced contracts exactly.** If you produce contracts (exports consumed by other
   boundaries), ensure your actual exports match the contract declaration precisely — same
   type names, same file paths, same signatures.

---

## Communication Protocol (Hub-and-Spoke)

All significant decisions flow through the lead. Direct agent-to-agent communication is
limited to informational signals.

### Via lead (mandatory for decisions/changes)

- **Contract deviations:** `SendMessage(to="lead", "Contract deviation: ...")`
- **Scope escalation:** `SendMessage(to="lead", "Need to write {file} outside my scope: {reason}")`
- **Blockers:** `SendMessage(to="lead", "Blocked on task {N}: waiting for {dependency}")`
- **Design decisions:** `SendMessage(to="lead", "Task {N} has ambiguity: {options}")`

### Direct to other agents (informational signals only)

- **Dependency ready:** `SendMessage(to="{agent-name}", "{export} is ready. You can import it.")`
- **Status broadcast:** `SendMessage(to="{agent-name}", "Completed task {N}, starting {M}")`

### Never

- **NEVER** negotiate contract changes directly with other agents
- **NEVER** agree to scope changes without lead approval
- **NEVER** modify shared files based on another agent's request alone

---

## Scope Verification Before Done

Before declaring completion (creating SUMMARY.md in GSD, or reporting done in ad-hoc):

```bash
# List all files this agent touched, using commit tracer
TOUCHED_FILES=$(
  git log --format="%H" --grep="\[agent:{name}\]" {start_commit}..HEAD | \
    xargs -I{} git diff-tree --no-commit-id --name-only -r {} | \
    sort -u
)

# Filter files outside ownership and associated paths
OUT_OF_SCOPE=$(echo "$TOUCHED_FILES" | grep -v "{ownership_pattern}" | grep -v "{associated_pattern}")

# If anything remains → scope violation
if [[ -n "$OUT_OF_SCOPE" ]]; then
  echo "⚠ Scope violation detected. Reverting out-of-scope files:"
  echo "$OUT_OF_SCOPE"

  # Revert each out-of-scope file
  for FILE in $OUT_OF_SCOPE; do
    git checkout {start_commit} -- "$FILE"
  done
  git commit -m "fix: revert out-of-scope changes [agent:{name}]"

  # Report to lead
  SendMessage(to="lead", "Reverted out-of-scope files: ${OUT_OF_SCOPE}. These changes are needed but outside my ownership.")
fi
```

---

## Context Differences: GSD vs Ad-hoc

The core rules above are identical in both contexts. The differences are operational:

| Aspect | GSD Context | Ad-hoc Context |
|--------|-------------|----------------|
| Tasks come from | PLAN.md with XML task definitions | Lead decomposes user prompt into sub-tasks |
| Commit convention | Project CLAUDE.md convention + `[agent:{name}]` | Project CLAUDE.md convention + `[agent:{name}]` |
| Summary output | SUMMARY.md in phase directory | Consolidated response to lead/user |
| State tracking | STATE.md, ROADMAP.md updated by lead | None — conversation is state |
| Recovery on interruption | Re-run execute-phase, skips completed plans | No recovery — must inspect `git log` and decide |
| Checkpoint handling | Standard GSD checkpoints within tasks | Lead manages checkpoints inline |

**Ad-hoc limitation:** If the lead conversation is interrupted during ad-hoc orchestration
(terminal closed, network drop), there is no automatic recovery path. Agents may have committed
partial work. The user must inspect `git log` and decide whether to continue or reset.
