# Module Detection — Rules for gsd-planner

After generating tasks for a phase, perform these additional steps.

## Step 1: Discover Modules

```bash
ls -d src/modules/*/CLAUDE.md 2>/dev/null
```

Read each module's CLAUDE.md to understand ownership boundaries and public APIs.

**If a module directory exists but has NO CLAUDE.md:**
- Auto-generate a scaffold by analyzing exports:
  ```bash
  grep -r "^export" src/modules/{name}/ --include="*.ts" --include="*.tsx" | head -20
  ```
- Write scaffold using `.claude/skills/gsd-multi-agent/templates/module-claude.md`
- Log: "⚠ Auto-generated CLAUDE.md for module {name} — review recommended"

## Step 2: Map Tasks to Modules

For each task, identify files it will create/modify and map to owners:
- `src/modules/[name]/**` → module `[name]` (dynamic — any dir with CLAUDE.md)
- `src/platform/**` → platform (cross-cutting)
- `src/shared/**` → platform (cross-cutting)
- `docs/**`, `clients/**`, `tools/**`, `supabase/**`, root configs → lead agent (unmapped)

Classify each task as: `module-specific([name])`, `cross-cutting`, or `unmapped`.

## Step 3: Decide Execution Mode

Count tasks by category and calculate parallelization ratio:
- `ratio = module-scoped tasks in 2+ modules / total tasks`
- If ratio < 0.30 → `execution_mode: single-agent` (not worth parallelizing). STOP here.
- If ratio >= 0.30 → `execution_mode: multi-agent`. Continue to Step 4.

**Decision matrix:**
- Only 1 module affected → single-agent
- 2+ modules affected with ratio >= 0.30 → multi-agent
- Only cross-cutting (platform/shared) → single-agent
- Only unmapped (docs/, clients/, tools/) → single-agent
- Mix of modules + unmapped → multi-agent, unmapped tasks go to lead

**Examples:**
- 5 cross-cutting + 2 module-scoped = 2/7 = 28% → single-agent
- 3 cross-cutting + 8 module-scoped in 3 modules = 8/11 = 72% → multi-agent

## Step 4: Generate Multi-Agent Plan Structure

Add to PLAN.md frontmatter:
```yaml
execution_mode: multi-agent
agents:
  - name: platform
    ownership: ["src/platform/**", "src/shared/**"]
    tasks: [task-ids]
  - name: {module1}
    ownership: ["src/modules/{module1}/**"]
    tasks: [task-ids]
  - name: {module2}
    ownership: ["src/modules/{module2}/**"]
    tasks: [task-ids]
waves:
  1: { agent: platform, type: cross-cutting }
  2: { agents: [{module1}, {module2}], type: parallel-modules }
  3: { type: integration-verification }
```

Add `## Contracts` section to plan body with TypeScript interfaces:
```markdown
## Contracts

### platform → {module1}
- Exports: {exact TypeScript interface} (e.g., `TenantConfig { id: string, slug: string }`)
- Location: {exact file path}

### platform → {module2}
- Exports: {same or different interfaces}
- Location: {exact file path}
```

**Contract rules:**
- Derive from task descriptions — what each task creates/modifies that others need
- Use exact TypeScript interface definitions, NOT prose descriptions
- Include file paths for every export
- Only include contracts for the delta (what changes in this phase)

## Step 5: Detect Intra-Wave Dependencies (Sub-Waves)

If module A produces something module B consumes within Wave 2:
```yaml
waves:
  2a: { agents: [{producer}], type: parallel-modules }
  2b: { agents: [{consumer}], type: parallel-modules, depends_on: 2a }
```

If no inter-module dependencies: all modules in single Wave 2.

## Step 6: Self-Check

Before returning the plan:
- [ ] Every task assigned to exactly one agent
- [ ] No two agents own overlapping file paths
- [ ] Cross-cutting tasks assigned to platform agent
- [ ] Contracts include TypeScript interfaces (not prose)
- [ ] Sub-waves correctly ordered if inter-module dependencies exist
