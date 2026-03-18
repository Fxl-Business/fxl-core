# Requirements: Nexo — v5.2 Nexo Skill

**Defined:** 2026-03-18
**Core Value:** Nexo e o hub central multi-tenant — cada empresa ve tudo sobre si mesma

## v1 Requirements

Requirements for v5.2. Each maps to roadmap phases.

### Consolidation

- [ ] **CONS-01**: Nexo Skill entry point (SKILL.md) routes to all capabilities (scaffold, audit, connect, orchestrate, methodology, learn)
- [ ] **CONS-02**: SDK rules migrated from .agents/skills/fxl-sdk/rules/ to .agents/skills/nexo/sdk/
- [ ] **CONS-03**: SDK checklists migrated from .agents/skills/fxl-sdk/checklists/ to .agents/skills/nexo/checklists/
- [ ] **CONS-04**: SDK templates migrated from .agents/skills/fxl-sdk/templates/ to .agents/skills/nexo/templates/
- [ ] **CONS-05**: Contract types migrated from .agents/skills/fxl-sdk/contract/ to .agents/skills/nexo/contract/

### Methodology

- [ ] **METH-01**: Workflow document defines discuss→plan→execute flow customized for FXL projects
- [ ] **METH-02**: Post-execution hook captures learnings automatically via MCP after phase completion
- [ ] **METH-03**: Pre-planning step consults MCP for existing standards and pitfalls before planning

### MCP Bridge

- [ ] **MCPB-01**: Integration module calls get_standards() before planning a new spoke
- [ ] **MCPB-02**: Integration module calls get_learnings() and get_pitfalls() for context enrichment
- [ ] **MCPB-03**: Integration module calls add_learning() after discovering new patterns during execution
- [ ] **MCPB-04**: Integration module calls add_pitfall() when encountering errors worth documenting

### Scaffold

- [ ] **SCAF-01**: Scaffold command creates complete spoke project structure from template
- [ ] **SCAF-02**: Generated spoke includes CLAUDE.md with FXL SDK rules and MCP config
- [ ] **SCAF-03**: Generated spoke includes .mcp.json pointing to the MCP Server
- [ ] **SCAF-04**: Scaffold registers project in MCP via sdk_projects table (slug, name, stack_choices)
- [ ] **SCAF-05**: Scaffold asks platform (web/mobile), framework (vite/next), and modules questions

### Documentation

- [ ] **DOCS-01**: docs/sdk/nexo-skill.md filled with complete guide (capabilities, structure, usage)

### Deprecation

- [ ] **DEPR-01**: .agents/skills/fxl-sdk/ directory removed after migration validated
- [ ] **DEPR-02**: All references to old skill paths updated (CLAUDE.md, docs, configs)
- [ ] **DEPR-03**: agent-orchestrator references updated to point to nexo/orchestrator/

## Future Requirements

### Advanced Orchestration

- **ORCH-01**: Multi-agent coordination across spoke repositories
- **ORCH-02**: Cross-repo learning propagation (auto-sync learnings between spokes)

### Advanced Scaffold

- **ASCF-01**: Blueprint-from-briefing integration in scaffold flow
- **ASCF-02**: Auto-generate initial wireframe screens from spoke domain

## Out of Scope

| Feature | Reason |
|---------|--------|
| npm package distribution of SDK | Skill-based distribution via Claude Code is the chosen approach |
| Vector database for knowledge search | Simple Supabase FTS sufficient for current scale |
| Runtime SDK validation (linting) | Static analysis via skill + checklists is sufficient |
| Cross-repo real-time sync | Async via MCP is sufficient for current team size |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| (populated by roadmapper) | | |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 0
- Unmapped: 18

---
*Requirements defined: 2026-03-18*
*Last updated: 2026-03-18 after initial definition*
