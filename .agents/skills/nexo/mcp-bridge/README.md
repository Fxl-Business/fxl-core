# MCP Bridge

## What This Is

The MCP Bridge connects the Nexo Skill to the Nexo SDK MCP Server, enabling
persistent knowledge across projects. It defines WHEN and HOW Claude Code
should call MCP tools during Nexo Skill operations.

The MCP Server (`fxl-sdk`) is configured in `.mcp.json` and exposes tools
prefixed with `mcp__fxl-sdk__`. All tools are callable directly by Claude Code.

## Integration Points

| Moment | Rule | MCP Tools Used |
|--------|------|----------------|
| Before any SDK operation | `pre-operation.md` | get_learnings, get_pitfalls |
| Before planning a new spoke | `spoke-planning.md` | get_standards, get_project_config, get_checklist |
| After completing any operation | `post-operation.md` | add_learning, add_pitfall |

## Available MCP Tools

### Read Tools (no auth required)

| Tool | Purpose | Parameters |
|------|---------|------------|
| `mcp__fxl-sdk__get_standards` | Get SDK standards (stack, security, etc) | `category?` |
| `mcp__fxl-sdk__get_learnings` | Get learnings from past projects | `category?` |
| `mcp__fxl-sdk__get_pitfalls` | Get known pitfalls to avoid | `category?` |
| `mcp__fxl-sdk__get_checklist` | Get a specific checklist | `name` |
| `mcp__fxl-sdk__search_knowledge` | Full-text search across all knowledge | `query` |

### Write Tools (auth required, configured in .mcp.json)

| Tool | Purpose | Parameters |
|------|---------|------------|
| `mcp__fxl-sdk__add_learning` | Record a new learning | `rule`, `context`, `category`, `source_repo?`, `tags?` |
| `mcp__fxl-sdk__add_pitfall` | Record a new pitfall | `rule`, `context`, `category`, `source_repo?`, `tags?`, `severity?` |
| `mcp__fxl-sdk__promote_to_standard` | Promote learning to standard | `learning_id`, `details?`, `examples?` |
| `mcp__fxl-sdk__register_project` | Register/update a spoke project | `slug`, `name`, `stack_choices` |

### Meta Tools

| Tool | Purpose | Parameters |
|------|---------|------------|
| `mcp__fxl-sdk__get_sdk_status` | Knowledge base status and counts | (none) |
| `mcp__fxl-sdk__get_project_config` | Get project config by slug | `slug` |

## Activation

The MCP bridge is NOT a standalone command. It activates automatically as part
of other Nexo Skill capabilities:

- **Scaffold** (`sdk/new-project.md`) loads `spoke-planning.md` as a pre-step
- **Audit** (`sdk/audit.md`) loads `pre-operation.md` to enrich audit context
- **Connect** (`sdk/connect.md`) loads `pre-operation.md` before work
- **Any operation** loads `post-operation.md` as a post-step when learnings emerge

Claude Code should treat these as mandatory integration points, not optional extras.
