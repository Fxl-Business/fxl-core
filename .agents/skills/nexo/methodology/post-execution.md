# Post-Execution Hook — Learning Capture

## When to Run

**After** phase verification passes (VERIFICATION.md status: `passed` or `human_needed` with approval).
This hook is the final step of the Execute stage in the FXL methodology (see `methodology/workflow.md`).

---

## Procedure

### Step 1: Gather Phase Artifacts

Read the following files to understand what happened during execution:

1. **SUMMARY.md** files from each plan — what was built, deviations, decisions
2. **VERIFICATION.md** — what passed, what needed fixes
3. **Git log** — commit messages for the phase (patterns, errors, retries)
4. **CONTEXT.md** — original decisions (to compare intent vs outcome)

### Step 2: Identify Learnings

Scan the artifacts for patterns worth preserving. A learning is worth recording if:

- It would save time in a future project
- It reveals how an API or library actually behaves (vs documentation)
- It describes a technique that worked well
- It corrects a common assumption

**Categories of learnings to look for:**

| Signal | Example |
|--------|---------|
| Unexpected API behavior | "Clerk /v1/users returns array, not { data: [] }" |
| Effective technique | "Using Promise.allSettled with per-result error handling" |
| Configuration gotcha | "Supabase edge functions strip sub-paths from URL" |
| Performance insight | "Batch Clerk API calls in edge function, not N+1 from frontend" |
| Architecture decision | "Separating admin service from tenant service reduces complexity" |

### Step 3: Identify Pitfalls

Scan the artifacts for mistakes that should not be repeated. A pitfall is worth recording if:

- It caused a bug that took time to diagnose
- It is a pattern that looks correct but fails silently
- It wastes resources (time, API calls, compute)
- It causes user-visible errors (white screen, wrong data, CORS)

**Severity classification:**

| Severity | Criteria |
|----------|----------|
| high | Causes data loss, security issue, or user-visible crash |
| medium | Causes incorrect behavior that requires debugging |
| low | Causes minor issues or suboptimal patterns |

### Step 4: Record to MCP

For each identified learning, call:

```
mcp__fxl-sdk__add_learning(
  rule: "{short description}",
  context: "{detailed context: when, why, how discovered}",
  category: "{api|database|security|frontend|infrastructure|auth}",
  source_repo: "{project slug or 'fxl-core'}",
  tags: ["{cross-cutting-tag-1}", "{cross-cutting-tag-2}"]
)
```

For each identified pitfall, call:

```
mcp__fxl-sdk__add_pitfall(
  rule: "{what NOT to do}",
  context: "{why this is a problem, with reproduction details}",
  category: "{api|database|security|frontend|infrastructure|auth}",
  source_repo: "{project slug or 'fxl-core'}",
  tags: ["{cross-cutting-tag-1}", "{cross-cutting-tag-2}"],
  severity: "{low|medium|high}"
)
```

### Step 5: Log Capture Summary

After recording to MCP, log what was captured:

```
## Post-Execution: Knowledge Captured

### Learnings ({N} recorded)
- [{category}] {rule}
- [{category}] {rule}

### Pitfalls ({N} recorded)
- [{severity}] [{category}] {rule}
- [{severity}] [{category}] {rule}

### Skipped (not significant enough)
- {description} — reason: {one-time, project-specific, etc.}
```

---

## What NOT to Record

Not every observation deserves an MCP entry. Skip these:

| Skip | Reason |
|------|--------|
| Project-specific configuration values | Not transferable |
| Typos or copy-paste errors | Human error, not systemic |
| One-time environment issues | Not reproducible |
| Already-existing standards | Duplicates add noise |
| Subjective preferences | "I prefer X" is not a learning |

Before calling `add_learning()` or `add_pitfall()`, check if similar knowledge
already exists:

```
mcp__fxl-sdk__search_knowledge(query: "{rule keywords}")
```

If a match exists, skip the duplicate. If the new learning adds nuance to an
existing one, consider updating the existing entry or adding a complementary one
with a reference tag.

---

## When MCP Is Unavailable

If the MCP Server is unreachable during post-execution:

1. Write learnings and pitfalls to a local file: `.planning/notes/pending-mcp-{date}.md`
2. Format entries with the same fields as MCP (rule, context, category, tags, severity)
3. On next successful MCP connection, replay pending entries
4. Delete the local file after successful replay

---

## Integration Points

### With GSD execute-phase workflow

The post-execution hook runs **after** `verify_phase_goal` passes and **before**
`update_roadmap` marks the phase complete. In the `execute-phase.md` workflow,
this fits between the verification step and the `offer_next` step.

### With GSD transition workflow

When auto-advancing between phases, the transition should wait for the
post-execution hook to complete before starting the next phase's discuss stage.
This ensures the next phase's pre-planning hook has access to freshly captured knowledge.

### With Orchestrator

When multi-agent execution completes, the **lead agent** runs the post-execution
hook. It reviews all boundary agent SUMMARYs and the integration verification results.
Individual boundary agents do NOT run the hook — only the lead captures knowledge
to avoid duplicates.

---

## Promotion Workflow

After 2+ projects record similar learnings, consider promotion:

1. Call `get_learnings()` and look for patterns (same category, similar rules)
2. If a learning appears in 2+ source_repos, it is a promotion candidate
3. Call `promote_to_standard()` with the learning_id
4. The promoted standard will be returned by `get_standards()` in future pre-planning hooks

This closes the full lifecycle: learning -> validated pattern -> standard -> constraint.
