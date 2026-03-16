# Brainstorming in Milestones — Rules for new-milestone orchestrator

Before defining requirements (Step 9 in the new-milestone workflow),
invoke the brainstorming skill to explore the milestone scope.

## When to Apply

Always apply when running `/gsd:new-milestone`, unless user passes `--skip-brainstorm`.

## Process

After gathering milestone goals (Step 2) and before defining requirements:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► BRAINSTORMING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

◆ Exploring milestone scope before requirements...
```

Invoke `superpowers:brainstorming` skill with context:
- Project context: from PROJECT.md
- Previous milestones: from MILESTONES.md
- User's stated goals: from Step 2

The brainstorming process:
1. Asks clarifying questions (one at a time)
2. Proposes 2-3 approaches with trade-offs
3. Presents design by sections for approval
4. Writes spec to `docs/superpowers/specs/YYYY-MM-DD-<milestone-name>-design.md`

## After Brainstorming

- Use the approved spec as primary input for requirements definition
- Reference spec path in PROJECT.md under Current Milestone
- The spec becomes the source of truth for what the milestone should build

## Why

Guarantees every milestone goes through structured exploration of requirements,
alternatives, and trade-offs before becoming phases in the roadmap.
Prevents the "I already know what to do, let me code" anti-pattern.
