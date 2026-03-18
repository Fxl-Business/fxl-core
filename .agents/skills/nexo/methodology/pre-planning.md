# Pre-Planning Hook — MCP Context Retrieval

## When to Run

**Before** the GSD planner agent generates tasks for any phase.
This hook is part of the Plan stage in the FXL methodology (see `methodology/workflow.md`).

---

## Procedure

### Step 1: Retrieve Standards

Call the MCP Server to get all current FXL standards:

```
mcp__fxl-sdk__get_standards()
```

Parse the response. Standards define constraints that the planner MUST respect.
Group them by category for easy reference during task generation.

**How the planner uses standards:**
- Each standard becomes a constraint on relevant tasks
- If a task involves database queries, standards in category "database" apply
- If a task involves API calls, standards in category "api" apply
- Standards override any conflicting approach the planner might generate

### Step 2: Retrieve Pitfalls

Call the MCP Server to get all known pitfalls:

```
mcp__fxl-sdk__get_pitfalls()
```

Parse the response. Pitfalls are mistakes to avoid. Sort by severity (high first).

**How the planner uses pitfalls:**
- High-severity pitfalls generate explicit acceptance criteria on related tasks
- Medium-severity pitfalls influence task design (e.g., use query params instead of sub-paths)
- Low-severity pitfalls are noted but do not change task structure

Example — Pitfall "Promise.all masks independent failures" (high severity):
```yaml
# This pitfall generates this acceptance criterion:
acceptance_criteria:
  - "No Promise.all usage for independent fetches — use Promise.allSettled"
  - "grep -r 'Promise.all' src/ returns 0 results for independent fetch patterns"
```

### Step 3: Retrieve Domain Learnings

Determine the phase domain from the phase goal (e.g., "auth", "database", "frontend", "api").

```
mcp__fxl-sdk__get_learnings(category: "{domain}")
```

Parse the response. Learnings are patterns and techniques discovered in previous projects.

**How the planner uses learnings:**
- Learnings inform task design (e.g., "Clerk /v1/users returns array, handle accordingly")
- Learnings may become `read_first` references if they describe file-level patterns
- Learnings that contradict the planned approach should trigger a plan revision

### Step 4: Search for Cross-Cutting Knowledge

Extract 2-3 keywords from the phase goal and search:

```
mcp__fxl-sdk__search_knowledge(query: "{keyword1} {keyword2}")
```

This catches knowledge that spans categories (e.g., a security pitfall that affects API design).

**How the planner uses search results:**
- Results from `sdk_standards` → treat as constraints
- Results from `sdk_pitfalls` → treat as defensive criteria
- Results from `sdk_learnings` → treat as informational context

---

## Output Format

After retrieving all MCP context, structure it as an internal reference block
that the planner carries throughout task generation:

```
<mcp_context>
## Standards (constraints)
- [category]: [rule] — [details]
- [category]: [rule] — [details]

## Pitfalls (avoid)
- [severity] [category]: [rule] — [context]
- [severity] [category]: [rule] — [context]

## Learnings (inform)
- [category]: [rule] — [context]

## Search Results (cross-cutting)
- [table] [category]: [rule] — [excerpt]
</mcp_context>
```

The planner references this block when generating each task to ensure nothing
from the knowledge base is violated or missed.

---

## When MCP Is Unavailable

If the MCP Server is unreachable or returns errors:

1. Log a warning: `[pre-planning] MCP unreachable — falling back to local knowledge`
2. Fall back to local skill files:
   - `sdk/standards.md` for stack rules
   - `.planning/PITFALLS.md` for known pitfalls
   - CLAUDE.md for project rules
3. Continue planning — MCP is an enhancement, not a blocker
4. After phase execution, note the MCP outage as a learning for debugging

---

## Integration Points

### With GSD plan-phase workflow

The pre-planning hook runs **after** CONTEXT.md is loaded and **before** the planner
agent is spawned. In the `plan-phase.md` workflow, this fits between Step 7
(Use Context Paths) and Step 8 (Spawn gsd-planner Agent).

The planner prompt should include the `<mcp_context>` block in its
`<planning_context>` section.

### With Orchestrator

When the orchestrator generates multi-agent plans, the pre-planning hook runs once
for the entire phase (led by the orchestrator), not per boundary agent.
The `<mcp_context>` is shared across all agents via the plan frontmatter.
