# MCP Bridge: Spoke Planning Context

## When to Use

Before planning or scaffolding a new spoke project (new-project or new-project-from-blueprint),
run this extended pre-planning step. This supplements `pre-operation.md` with
spoke-specific context.

This is mandatory for scaffold and planning operations.

## Steps

### 1. Run Standard Pre-Operation

First, execute all steps from `pre-operation.md` (learnings + pitfalls + search).

### 2. Fetch All Standards

Call `mcp__fxl-sdk__get_standards` without a category filter to get the full set of
SDK standards. These define the non-negotiable rules for spoke projects.

**How to use the results:** Every standard must be satisfied in the scaffold output.
Cross-reference the standards with the templates being applied. If a standard exists
in the MCP database that is not covered by a template, flag it and handle it manually.

### 3. Fetch Standards by Category

For deeper context, also fetch standards filtered by the most relevant categories:

```
mcp__fxl-sdk__get_standards(category: "stack")      -- tech choices
mcp__fxl-sdk__get_standards(category: "security")   -- auth, RLS, headers
mcp__fxl-sdk__get_standards(category: "database")   -- Supabase conventions
```

### 4. Check for Existing Project Config

If the spoke project already exists (e.g., re-scaffolding or upgrading), check
if it has a config in the knowledge base:

```
mcp__fxl-sdk__get_project_config(slug: "<project-slug>")
```

If a config exists, use it to inform stack choices and avoid conflicting decisions.
If no config exists, this is a new project and will be registered after scaffold.

### 5. Get Relevant Checklists

Fetch checklists that apply to the scaffold:

```
mcp__fxl-sdk__get_checklist(name: "structure")    -- directory layout
mcp__fxl-sdk__get_checklist(name: "typescript")   -- strict mode rules
mcp__fxl-sdk__get_checklist(name: "security")     -- auth and env vars
mcp__fxl-sdk__get_checklist(name: "rls")          -- database policies
mcp__fxl-sdk__get_checklist(name: "contract")     -- API endpoints
```

Use these as verification gates after scaffold completes.

## Output

After completing spoke planning, you should have:
- Full set of SDK standards to satisfy
- Category-specific standards for stack, security, database
- Existing project config (if any)
- All relevant checklists for post-scaffold verification
- Learnings and pitfalls from pre-operation step

Use this combined context to generate a scaffold plan that satisfies all standards,
avoids all known pitfalls, and can be verified against the checklists.
