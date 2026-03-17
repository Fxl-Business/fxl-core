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

## Quick Tasks

| # | Description | Date |
|---|------------|------|
| 13 | Remove light mode toggle, use local date format | 2026-03-13 |
| 15 | Sidebar editor: grouped screens, context menus, pin support, widget picker | 2026-03-13 |

---

## v4.0 Rebrand Nexo (In Progress)

**Milestone Goal:** Renomear o produto de "FXL Core" / "Nucleo FXL" para "Nexo" em toda a codebase. Zero mudanca funcional.

## Phases

- [ ] **Phase 73: Rename Nexo** - Substituir todas as ocorrencias de "FXL Core" e "Nucleo FXL" por "Nexo" em UI, meta e docs
- [ ] **Phase 74: Build Verification** - Confirmar que o build passa sem erros apos o rename

## Phase Details

### Phase 73: Rename Nexo
**Goal**: Todos os pontos visiveis ao usuario e na documentacao mostram "Nexo" em vez de "FXL Core" ou "Nucleo FXL"
**Depends on**: Nothing (first phase of milestone)
**Requirements**: BRAND-01, BRAND-02, BRAND-03, BRAND-04, BRAND-05, BRAND-06, META-01, META-02, DOCS-01, DOCS-02, DOCS-03
**Success Criteria** (what must be TRUE):
  1. O titulo da app, header/topbar e home page exibem "Nexo" em vez de "Nucleo FXL"
  2. As paginas de login e signup exibem branding "Nexo"
  3. A tab do browser mostra "Nexo" como titulo
  4. package.json e index.html referenciam "nexo" / "Nexo"
  5. CLAUDE.md e PROJECT.md nao contem mais "FXL Core" ou "Nucleo FXL"; src/ esta limpo dessas strings (exceto SDK)
**Plans**: TBD

Plans:
- [ ] 73-01: Rename em UI (src/), meta (package.json, index.html) e docs (CLAUDE.md, PROJECT.md)

### Phase 74: Build Verification
**Goal**: O build de producao confirma que o rename nao introduziu nenhum erro
**Depends on**: Phase 73
**Requirements**: VERIF-01, VERIF-02
**Success Criteria** (what must be TRUE):
  1. npx tsc --noEmit retorna zero erros
  2. npm run build conclui sem erros
**Plans**: TBD

Plans:
- [ ] 74-01: Executar tsc --noEmit e npm run build; corrigir qualquer regressao

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 73. Rename Nexo | v4.0 | 0/1 | Not started | - |
| 74. Build Verification | v4.0 | 0/1 | Not started | - |
