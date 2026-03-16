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
