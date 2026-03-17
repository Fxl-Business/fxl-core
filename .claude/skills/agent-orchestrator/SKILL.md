---
name: agent-orchestrator
description: Automatic parallel agent orchestration. Detects project boundaries, evaluates parallelization potential, and spawns scoped agents when beneficial. Works with GSD workflows and ad-hoc Claude Code usage.
---

# Agent Orchestrator

## When This Skill Applies

This skill is relevant in ANY conversation where:
- The task involves files in 2+ detected boundaries
- The user's request contains independent sub-tasks
- A GSD phase plan has `execution_mode: multi-agent`

## Automatic Activation

At conversation start or when receiving a complex task:
1. Run boundary detection (rules/boundary-detection.md)
2. If 2+ boundaries exist, keep awareness active
3. When tasks are identified, run task analysis (rules/task-analysis.md)
4. If threshold met → orchestrate (rules/orchestration.md)
5. If threshold not met → standard single-agent execution

## Rules Index

| Context | Load These Rules |
|---------|-----------------|
| Any task evaluation | boundary-detection.md, task-analysis.md |
| Parallel execution | orchestration.md |
| Each spawned agent | scoped-agent.md (injected in prompt) |
| After all agents done | integration-check.md |
| GSD planner | boundary-detection.md, task-analysis.md |
| GSD executor | orchestration.md (if plan has execution_mode: multi-agent) |
| GSD verifier | integration-check.md (if plan has execution_mode: multi-agent) |

## Confidence Thresholds

| Ratio | Action |
|-------|--------|
| < 30% | Silent — single-agent |
| 30-50% | Ask user for confirmation |
| > 50% | Act automatically |

## Fallback

If tmux not available: sequential execution (same logic, no parallelism).
If no boundaries detected: skill stays inactive.
This skill adds capabilities — never removes or overrides existing behavior.
