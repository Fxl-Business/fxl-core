# MCP Bridge: Pre-Operation Context Enrichment

## When to Use

Before starting ANY Nexo Skill SDK operation (scaffold, audit, connect, refactor,
ci-cd, deploy), run this pre-operation step to gather context from the MCP knowledge base.

This is mandatory. Do not skip this step.

## Steps

### 1. Fetch Relevant Learnings

Call `mcp__fxl-sdk__get_learnings` to retrieve learnings from past projects.

If you know the domain of the current task, filter by category:

| Task Domain | Category Filter |
|------------|----------------|
| API endpoints, contract | `api` |
| Database, migrations, RLS | `database` |
| Auth, security | `security` |
| UI components, styling | `frontend` |
| Build, deploy, CI | `infrastructure` |
| General / unknown | (omit category to get all) |

**How to use the results:** Read each learning and apply it as additional context
for the operation. If a learning contradicts a standard, the standard takes precedence.

### 2. Fetch Relevant Pitfalls

Call `mcp__fxl-sdk__get_pitfalls` to retrieve known mistakes to avoid.

Use the same category filters as above. Pitfalls are the most actionable context --
they describe specific things that went wrong and should not be repeated.

**How to use the results:** Treat each pitfall as a constraint. Before implementing
anything, verify the implementation does not violate any retrieved pitfall.

### 3. Search for Task-Specific Knowledge (Optional)

If the task involves a specific technology or pattern, call `mcp__fxl-sdk__search_knowledge`
with a relevant query term.

Examples:
- Task involves RLS: `search_knowledge("RLS policies")`
- Task involves Clerk auth: `search_knowledge("Clerk auth")`
- Task involves API validation: `search_knowledge("Zod validation")`

This provides cross-cutting results from standards, learnings, and pitfalls.

## Output

After completing the pre-operation step, you should have:
- A list of relevant learnings to apply
- A list of pitfalls to avoid
- Any task-specific knowledge from search

Incorporate these into your operation plan before proceeding with the actual work.
Do not mention "MCP bridge" to the user -- simply apply the knowledge naturally.
