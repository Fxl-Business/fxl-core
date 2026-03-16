---
name: gsd-multi-agent
description: Module-aware parallel execution for GSD. Automatically detects when a phase affects multiple modules and orchestrates parallel agents via tmux with hub-and-spoke communication.
---

# GSD Multi-Agent

Extends GSD with automatic multi-module detection and parallel agent execution.

## When This Skill Applies

This skill is relevant when:
- A GSD phase affects files in 2+ modules under `src/modules/`
- Each module has a `CLAUDE.md` declaring its boundaries and public API
- The project uses a modular monolith structure (modules/, platform/, shared/)

## Rules Index

Load rules based on your role:

| Your Role | Load This Rule | When |
|-----------|---------------|------|
| **gsd-planner** | `rules/module-detection.md` | Always during plan generation |
| **execute-phase orchestrator** | `rules/multi-agent-execution.md` | When plan has `execution_mode: multi-agent` |
| **gsd-executor** (spawned as module agent) | `rules/module-scoped-executor.md` | When spawned with `<agent_rules>` containing ownership |
| **gsd-verifier** | `rules/cross-module-verification.md` | When verifying a phase with `execution_mode: multi-agent` |
| **new-milestone orchestrator** | `rules/brainstorming-milestone.md` | Always during milestone creation |

## Key Concepts

- **Module Registry:** Each `src/modules/[name]/CLAUDE.md` declares ownership, public API, dependencies
- **Waves:** Wave 1 (platform/cross-cutting) → Wave 2 (parallel modules) → Wave 3 (integration verification)
- **Contracts:** TypeScript interfaces derived from plan delta — what changes in this phase
- **Hub-and-spoke:** Decisions/changes go through lead; simple signals (dependency ready) can be direct
- **Soft isolation:** Agents can read everything, write only in their owned scope

## Templates

- `templates/module-claude.md` — Template for module CLAUDE.md files

## Fallback

If tmux is not available or `execution_mode` is not `multi-agent`, all GSD behavior remains unchanged.
This skill adds capabilities — it never removes or overrides existing GSD behavior.
