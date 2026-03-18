# MCP Bridge: Post-Operation Knowledge Capture

## When to Use

After completing ANY Nexo Skill SDK operation (scaffold, audit, connect, refactor,
ci-cd, deploy), run this post-operation step to capture new knowledge.

This is mandatory. Evaluate whether new learnings or pitfalls emerged during execution.

## Decision: Should I Write to MCP?

Not every operation produces new knowledge. Use this criteria:

### Record a Learning When:

- You discovered a pattern that worked well and would benefit future projects
- You found a workaround for a library quirk or API behavior
- You identified a sequence of steps that must be followed in a specific order
- You resolved a non-obvious configuration issue
- A technique from one project context would transfer to another

### Record a Pitfall When:

- You hit an error that was not obvious from documentation
- You discovered a configuration that silently fails or causes subtle bugs
- You found a combination of tools/libs that conflicts
- You encountered a security issue that should never be repeated
- A mistake cost significant debugging time

### Do NOT Record When:

- The knowledge already exists in MCP (check with `search_knowledge` first)
- The issue is too project-specific to transfer (e.g., "client X prefers blue buttons")
- The pattern is already documented in the SDK standards or skill rules

## Steps

### 1. Evaluate Learnings

Review the operation that was just completed. For each noteworthy discovery:

1. Check if it already exists: `mcp__fxl-sdk__search_knowledge(query: "<brief description>")`
2. If it does NOT exist, record it:

```
mcp__fxl-sdk__add_learning(
  rule: "<concise description of the learning>",
  context: "<detailed explanation: when/why/how this was learned>",
  category: "<api|database|security|frontend|infrastructure>",
  source_repo: "<project-slug where this was learned>",
  tags: ["<relevant>", "<tags>"]
)
```

**Rule format:** A single imperative sentence. Example: "Always set RLS policies before inserting seed data"
**Context format:** 2-4 sentences explaining the situation, the problem, and the solution.
**Category:** Use one of: `api`, `database`, `security`, `frontend`, `infrastructure`, `tooling`

### 2. Evaluate Pitfalls

For each mistake or near-miss during the operation:

1. Check if it already exists: `mcp__fxl-sdk__search_knowledge(query: "<brief description>")`
2. If it does NOT exist, record it:

```
mcp__fxl-sdk__add_pitfall(
  rule: "<what NOT to do>",
  context: "<why this is a problem, with details>",
  category: "<api|database|security|frontend|infrastructure>",
  source_repo: "<project-slug where this was discovered>",
  tags: ["<relevant>", "<tags>"],
  severity: "<low|medium|high>"
)
```

**Rule format:** A single "Never do X" or "Do not assume Y" sentence.
**Severity guide:**
- `low` — minor inconvenience, easy to fix
- `medium` — causes bugs or significant debugging time
- `high` — security vulnerability, data loss, or production breakage

### 3. Consider Promotion (Rare)

If a learning has been validated across 2+ projects, consider promoting it to a standard:

```
mcp__fxl-sdk__promote_to_standard(
  learning_id: "<uuid of the learning>",
  details: "<expanded explanation for the standard>",
  examples: "<code examples or usage patterns>"
)
```

Only promote when the pattern has been independently confirmed in multiple projects.
This is a rare action -- most operations will only record learnings and pitfalls.

## Output

After the post-operation step, report:
- Number of new learnings recorded (if any)
- Number of new pitfalls recorded (if any)
- Any promotions made (if any)

If nothing was recorded, that is fine -- not every operation produces new transferable knowledge.
