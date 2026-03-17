---
phase: 79-platform-settings-mcp
plan: 02
status: complete
commit: f1a23af
---

## What was done

1. **MCP Server Config** (`.mcp.json`):
   - Supabase MCP: `@supabase/mcp-server-supabase@latest` with `--read-only` flag
   - Clerk MCP: `@anthropic/mcp-server-clerk@latest` (package not yet published — placeholder)
   - Both use `${VAR}` env var references, no hardcoded secrets
   - Note: Originally planned for `.claude/settings.json` but `mcpServers` is not a valid key there. Used `.mcp.json` (standard Claude Code MCP config) instead.

2. **Documentation** (`docs/ferramentas/super-admin-mcp.md`):
   - Frontmatter with `badge: Ferramentas`
   - Prerequisites section (env vars needed)
   - Supabase operations table (6 operations)
   - Clerk operations table (5 operations) with callout about package availability
   - Configuration section showing `.mcp.json` block
   - Security section (no hardcoded tokens, read-only default)
   - `{% operational %}` quick-reference for Claude

## Deviations
- MCP config placed in `.mcp.json` instead of `.claude/settings.json` (schema validation rejects `mcpServers` key in settings.json)
- Added callout warning about `@anthropic/mcp-server-clerk` package not being published yet on npm
