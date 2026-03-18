# Roadmap: Nexo

## Milestones

- **v1.0 MVP** - Phases 1-6 (shipped 2026-03-09) -- see milestones/v1.0-ROADMAP.md
- **v1.1 Wireframe Evolution** - Phases 7-11 (shipped 2026-03-10) -- see milestones/v1.1-ROADMAP.md
- **v1.2 Visual Redesign** - Phases 12-16 (shipped 2026-03-11) -- see milestones/v1.2-ROADMAP.md
- **v1.3 Builder & Components** - Phases 17-21 (shipped 2026-03-11) -- see milestones/v1.3-ROADMAP.md
- **v1.4 Wireframe Visual Redesign** - Phases 22-28 (shipped 2026-03-13) -- see milestones/v1.4-ROADMAP.md
- **v1.5 Modular Foundation & Knowledge Base** - Phases 29-33 (shipped 2026-03-13) -- see milestones/v1.5-ROADMAP.md
- **v1.6 12 Novos Graficos** - Phases 34-37 (shipped 2026-03-13) -- see milestones/v1.6-ROADMAP.md
- **v2.0 Framework Shell + Arquitetura Modular** - Phases 38-42 (shipped 2026-03-13) -- see milestones/v2.0-ROADMAP.md
- **v2.1 Dynamic Data Layer** - Phases 43-46 (shipped 2026-03-13) -- see milestones/v2.1-ROADMAP.md
- **v2.2 Wireframe Builder -- Configurable Layout Components** - Phases 47-53 (shipped 2026-03-13) -- see milestones/v2.2-ROADMAP.md
- **v2.3 Inline Editing UX** - Phases 54-57 (shipped 2026-03-13) -- see milestones/v2.3-ROADMAP.md
- **v2.4 Component Picker Preview Mode** - Phases 58-59 (shipped 2026-03-14) -- see milestones/v2.4-ROADMAP.md
- **v3.0 Reorganizacao Modular** - Phases 60-63 (shipped 2026-03-17) -- see milestones/v3.0-ROADMAP.md
- **v3.1 Multi-tenancy** - Phases 64-67 (shipped 2026-03-17) -- see milestones/v3.1-ROADMAP.md
- **v3.2 FXL SDK Skill** - Phases 68-69 (shipped 2026-03-17) -- see milestones/v3.2-ROADMAP.md
- **v3.3 Generic Connector Module** - Phases 70-72 (shipped 2026-03-17) -- see milestones/v3.3-ROADMAP.md
- **v4.0 Rebrand Nexo** - Phases 73-74 (shipped 2026-03-17) -- see milestones/v4.0-ROADMAP.md
- **v4.1 Super Admin** - Phases 75-80 (shipped 2026-03-17) -- see milestones/v4.1-ROADMAP.md
- **v4.2 Docs do Sistema + Tenant Onboarding** - Phases 81-84 (shipped 2026-03-17) -- see milestones/v4.2-ROADMAP.md
- **v4.3 Admin Polish & Custom Auth** - Phases 85-88 (shipped 2026-03-17) -- see milestones/v4.3-ROADMAP.md
- **v5.0 SDK Docs** - Phases 89-93 (shipped 2026-03-17) -- see milestones/v5.0-ROADMAP.md
- **v5.1 MCP Server** - Phases 94-98 (shipped 2026-03-18) -- see milestones/v5.1-ROADMAP.md
- **v5.2 Nexo Skill** - Phases 99-104 (in progress)

## Quick Tasks

| # | Description | Date |
|---|------------|------|
| 13 | Remove light mode toggle, use local date format | 2026-03-13 |
| 15 | Sidebar editor: grouped screens, context menus, pin support, widget picker | 2026-03-13 |

---

## v5.2 Nexo Skill

**Milestone Goal:** Consolidar skills existentes (FXL SDK + agent orchestrator) em uma Nexo Skill unificada que integra com o MCP Server e customiza a metodologia GSD para projetos FXL.

## Phases

- [x] **Phase 99: Consolidation** - Unify SDK skill + orchestrator into single Nexo Skill structure
- [ ] **Phase 100: Methodology Layer** - GSD bridge with FXL-customized discuss/plan/execute flow
- [ ] **Phase 101: MCP Bridge** - Skill consults and feeds MCP Server automatically
- [ ] **Phase 102: Scaffold Flow** - Create complete spoke project via skill + MCP integration
- [ ] **Phase 103: Documentation** - Fill docs/sdk/nexo-skill.md with complete usage guide
- [ ] **Phase 104: Deprecation** - Remove old skills and update all references

## Phase Details

### Phase 99: Consolidation
**Goal**: All SDK and orchestrator capabilities live in a single Nexo Skill with clear routing
**Depends on**: Nothing (first phase)
**Requirements**: CONS-01, CONS-02, CONS-03, CONS-04, CONS-05
**Success Criteria** (what must be TRUE):
  1. Running the Nexo Skill via SKILL.md routes to all 6 capabilities (scaffold, audit, connect, orchestrate, methodology, learn)
  2. SDK rules exist at .agents/skills/nexo/sdk/ and are loadable by Claude Code
  3. SDK checklists, templates, and contract types exist at their new paths under .agents/skills/nexo/
  4. The old skill paths are no longer required to access any capability (new paths are self-sufficient)
**Plans**: 1/1 complete
**Completed**: 2026-03-18

### Phase 100: Methodology Layer
**Goal**: FXL projects follow a customized discuss/plan/execute workflow that leverages MCP for context
**Depends on**: Phase 99
**Requirements**: METH-01, METH-02, METH-03
**Success Criteria** (what must be TRUE):
  1. A workflow document at .agents/skills/nexo/methodology/ defines the discuss/plan/execute flow for FXL projects
  2. After phase completion, a post-execution hook captures learnings and writes them to MCP via add_learning()
  3. Before planning a new phase, the pre-planning step retrieves existing standards and pitfalls from MCP
**Plans**: TBD

### Phase 101: MCP Bridge
**Goal**: The Nexo Skill automatically consults and feeds the MCP Server during its operations
**Depends on**: Phase 99
**Requirements**: MCPB-01, MCPB-02, MCPB-03, MCPB-04
**Success Criteria** (what must be TRUE):
  1. When planning a new spoke, the skill calls get_standards() and incorporates results into planning context
  2. The skill calls get_learnings() and get_pitfalls() to enrich context before any operation
  3. When discovering a new pattern during execution, the skill calls add_learning() to persist it
  4. When encountering a documentable error, the skill calls add_pitfall() to persist it
**Plans**: TBD

### Phase 102: Scaffold Flow
**Goal**: A single scaffold command creates a complete, ready-to-develop spoke project with all FXL conventions
**Depends on**: Phase 99, Phase 100, Phase 101
**Requirements**: SCAF-01, SCAF-02, SCAF-03, SCAF-04, SCAF-05
**Success Criteria** (what must be TRUE):
  1. Running the scaffold command produces a complete spoke project directory with standard FXL structure
  2. The generated spoke contains a CLAUDE.md with FXL SDK rules and a .mcp.json pointing to the MCP Server
  3. The scaffold registers the new project in the MCP Server via sdk_projects table (slug, name, stack_choices)
  4. The scaffold prompts for platform (web/mobile), framework (vite/next), and module selections before generating
**Plans**: TBD

### Phase 103: Documentation
**Goal**: Operators and Claude Code can learn how to use the Nexo Skill from a complete guide in the docs
**Depends on**: Phase 99, Phase 100, Phase 101, Phase 102
**Requirements**: DOCS-01
**Success Criteria** (what must be TRUE):
  1. docs/sdk/nexo-skill.md exists with complete documentation of all capabilities, structure, and usage examples
  2. The page renders correctly in the Nexo docs viewer with proper frontmatter (title, badge, description)
**Plans**: TBD

### Phase 104: Deprecation
**Goal**: Old skill paths are removed and all references point to the new Nexo Skill location
**Depends on**: Phase 99, Phase 100, Phase 101, Phase 102, Phase 103
**Requirements**: DEPR-01, DEPR-02, DEPR-03
**Success Criteria** (what must be TRUE):
  1. The directory .agents/skills/fxl-sdk/ no longer exists
  2. CLAUDE.md, docs, and config files reference .agents/skills/nexo/ (not fxl-sdk or agent-orchestrator)
  3. agent-orchestrator references point to nexo/orchestrator/ throughout the codebase
**Plans**: TBD

## Progress

**Execution Order:**
Phases 100 and 101 are independent and can run in parallel after Phase 99.
Phase 102 requires 99, 100, 101 complete. Phases 103 and 104 are sequential after 102.

Order: 99 -> [100, 101] (parallel) -> 102 -> 103 -> 104

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 99. Consolidation | 1/1 | Complete | 2026-03-18 |
| 100. Methodology Layer | 0/? | Not started | - |
| 101. MCP Bridge | 0/? | Not started | - |
| 102. Scaffold Flow | 0/? | Not started | - |
| 103. Documentation | 0/? | Not started | - |
| 104. Deprecation | 0/? | Not started | - |
