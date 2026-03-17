# Roadmap: FXL Core

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

## Quick Tasks

| # | Description | Date |
|---|------------|------|
| 13 | Remove light mode toggle, use local date format | 2026-03-13 |
| 15 | Sidebar editor: grouped screens, context menus, pin support, widget picker | 2026-03-13 |

---

## v3.2 FXL SDK Skill

**Milestone Goal:** Criar skill completa do Claude Code para padronizar projetos spoke FXL: rules de scaffold/audit/refactor/connect, contract types TypeScript do contrato Hub<->Spoke, templates production-quality de configs, e checklists de seguranca/estrutura/RLS.

**Design spec:** `docs/superpowers/specs/2026-03-16-fxl-platform-evolution-design.md` (Sections 6, 7)

## Phases

- [x] **Phase 68: SDK Core Structure** - SKILL.md entry point, all rules/*.md files, contract/types.ts (completed 2026-03-17)
- [x] **Phase 69: SDK Templates + Checklists** - All templates/*.template files, all checklists/*.md files (completed 2026-03-17)

## Phase Details

### Phase 68: SDK Core Structure
**Goal**: Create the FXL SDK skill entry point (SKILL.md), all 8 rules files with detailed guidance, and the contract types TypeScript file
**Depends on**: Nothing (first phase of v3.2)
**Requirements**: [SDK-01, SDK-02, SDK-03, SDK-04, SDK-05, SDK-06, SDK-07, SDK-08, SDK-09, SDK-10]
**Success Criteria** (what must be TRUE):
  1. `SKILL.md` exists with ~130 lines, indexes all rules, describes when to use each
  2. All 8 rules files exist in `rules/` with detailed, actionable guidance
  3. `contract/types.ts` exists with all Hub<->Spoke contract interfaces
  4. Contract types use v1 field types only (string, number, date, boolean)
  5. Rules reference templates and checklists (even though created in Phase 69)
**Plans:** 1/1 plans complete

### Phase 69: SDK Templates + Checklists
**Goal**: Create all production-quality templates for spoke project configs and all quality/compliance checklists
**Depends on**: Phase 68 (templates reference standards from rules)
**Requirements**: [SDK-11, SDK-12, SDK-13, SDK-14, SDK-15]
**Success Criteria** (what must be TRUE):
  1. `templates/CLAUDE.md.template` exists with complete spoke project CLAUDE.md
  2. All config templates exist: tsconfig.json, eslint, prettier, tailwind preset
  3. All infra templates exist: vercel.json, ci.yml, fxl-doctor.sh
  4. All 5 checklists exist with actionable items and severity levels
  5. fxl-doctor.sh template includes all CI checks from design spec
**Plans:** 1/1 plans complete

## Progress

**Execution Order:** 68 -> 69

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 68. SDK Core Structure | 1/1 | Complete | 2026-03-17 |
| 69. SDK Templates + Checklists | 1/1 | Complete | 2026-03-17 |
