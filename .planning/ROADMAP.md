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
- **v5.2 Nexo Skill** - Phases 99-104 (shipped 2026-03-18) -- see milestones/v5.2-ROADMAP.md
- **v5.3 UX Polish** - Phases 105-111 (shipped 2026-03-18) -- see milestones/v5.3-ROADMAP.md
- **v6.0 Reestruturação de Módulos** - Phases 112-116 (in progress)

## Quick Tasks

| # | Description | Date |
|---|------------|------|
| 13 | Remove light mode toggle, use local date format | 2026-03-13 |
| 15 | Sidebar editor: grouped screens, context menus, pin support, widget picker | 2026-03-13 |

---

<details>
<summary>✅ v5.3 UX Polish (Phases 105-111) — SHIPPED 2026-03-18</summary>

- [x] Phase 105: Data Isolation (4/4 plans) — completed 2026-03-18
- [x] Phase 106: Data Recovery (1/1 plan) — completed 2026-03-18
- [x] Phase 107: Header UX (1/1 plan) — completed 2026-03-18
- [x] Phase 108: Admin Enhancements (4/4 plans) — completed 2026-03-18
- [x] Phase 109: Blueprint RLS (1/1 plan) — completed 2026-03-18
- [x] Phase 110: Phase 108 Verification (1/1 plan) — completed 2026-03-18
- [x] Phase 111: Audit Closure (1/1 plan) — completed 2026-03-18

See: milestones/v5.3-ROADMAP.md

</details>

---

## v6.0 Reestruturação de Módulos (Active)

**Milestone Goal:** Separar Clientes (cadastro) de Projetos (briefing→blueprint→wireframe), implementar sidebar workspace com dropdown switcher e navegação dinâmica por módulo.

### Phases

- [x] **Phase 112: DB Migration** - Criar tabela projects, estender clients, adicionar project_id nas tabelas dependentes e migrar dados existentes
- [ ] **Phase 113: Code Restructure** - Renomear módulo clients para projects, criar placeholder do módulo clients, genericizar pages hardcoded, atualizar module-ids
- [ ] **Phase 114: Projetos Module** - Ligar rotas /projetos/:slug/*, nav dinâmica, migrar stores de client_slug para project_id
- [ ] **Phase 115: Clientes Module** - CRUD completo de clientes (lista, criar, perfil, editar), nav dinâmica no workspace
- [ ] **Phase 116: Sidebar Workspace** - Dropdown switcher de módulos, useNavItems() hook, footer fixo com Admin/Perfil

## Phase Details

### Phase 112: DB Migration
**Goal**: Supabase tem estrutura de dados para suportar projects como entidade separada de clients, com todos os dados existentes migrados
**Depends on**: Nothing (foundation phase)
**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04
**Success Criteria** (what must be TRUE):
  1. Tabela `projects` existe com id, slug, name, client_id nullable, org_id e RLS por org
  2. Tabela `clients` tem colunas logo_url e status sem quebrar dados existentes
  3. Tabelas briefing_configs, blueprint_configs, comments e share_tokens têm coluna project_id
  4. Registro "Financeiro Conta Azul" existe em `projects` e todas as suas FKs apontam para esse project_id
**Plans**: TBD

### Phase 113: Code Restructure
**Goal**: Codebase reorganizado com módulo projects no lugar correto, módulo clients criado do zero, pages parametrizadas por slug, e module-ids.ts atualizado
**Depends on**: Phase 112
**Requirements**: CODE-01, CODE-02, CODE-03, CODE-04
**Success Criteria** (what must be TRUE):
  1. src/modules/projects/ existe com MODULE_IDS.PROJECTS e tsc --noEmit zero errors
  2. src/modules/clients/ existe como módulo novo e independente (não é o antigo renomeado)
  3. Pages de briefing, blueprint, wireframe e branding recebem slug via route params (não são hardcoded para financeiro-conta-azul)
  4. module-ids.ts exporta PROJECTS e CLIENTS com semântica correta; nenhuma referência ao antigo CLIENT (clientes = cadastro) presente
**Plans**: TBD

### Phase 114: Projetos Module
**Goal**: Operadores podem acessar a lista de projetos e todas as sub-rotas (/projetos/:slug/*) via módulo Projetos com navegação dinâmica na sidebar
**Depends on**: Phase 113
**Requirements**: PROJ-01, PROJ-02, PROJ-03, PROJ-04, PROJ-05, PROJ-06, PROJ-07, DATA-05
**Success Criteria** (what must be TRUE):
  1. Operador vê lista de projetos da org em /projetos com card ou tabela
  2. Operador cria projeto vinculado a um cliente existente ou diretamente à org (client_id nullable)
  3. Todas as rotas /projetos/:slug/briefing, /blueprint, /wireframe e /branding carregam corretamente
  4. Stores de briefing e blueprint usam project_id internamente; client_slug não é mais o identificador primário nas queries
  5. Sidebar mostra lista de projetos expandível com sub-itens quando workspace Projetos está ativo
**Plans**: TBD

### Phase 115: Clientes Module
**Goal**: Operadores podem gerenciar o cadastro de clientes (lista, criar, editar, ver perfil) e a sidebar reflete os clientes da org quando workspace Clientes está ativo
**Depends on**: Phase 112
**Requirements**: CLI-01, CLI-02, CLI-03, CLI-04, CLI-05
**Success Criteria** (what must be TRUE):
  1. Operador vê lista de todos os clientes da org em /clientes
  2. Operador cria novo cliente preenchendo nome, slug e status; cliente aparece na lista imediatamente
  3. Operador vê perfil de um cliente com nome, logo, status e link para os projetos daquele cliente
  4. Operador edita dados de um cliente existente e as alterações persistem no Supabase
  5. Sidebar exibe lista dinâmica de clientes da org quando o workspace Clientes está selecionado no switcher
**Plans**: TBD

### Phase 116: Sidebar Workspace
**Goal**: Sidebar tem dropdown switcher funcional que troca o módulo ativo, carrega navegação específica do módulo via useNavItems(), e exibe footer fixo com atalhos de Admin e Perfil
**Depends on**: Phase 113, Phase 114, Phase 115
**Requirements**: SIDE-01, SIDE-02, SIDE-03, SIDE-04
**Success Criteria** (what must be TRUE):
  1. Dropdown no topo da sidebar lista todos os módulos habilitados; clicar em um módulo fecha o dropdown e ativa aquele workspace
  2. Trocar módulo via dropdown navega para a home do módulo e a sidebar carrega a nav correspondente (sem reload de página)
  3. ModuleDefinition aceita campo useNavItems() opcional; módulos Projetos e Clientes usam esse hook para nav dinâmica
  4. Footer fixo da sidebar exibe link Admin (visível apenas para super_admin) e link Perfil para todos os operadores
**Plans**: TBD

## Progress

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 112. DB Migration | v6.0 | 1/1 | Completed | 2026-03-18 |
| 113. Code Restructure | v6.0 | 0/TBD | Not started | - |
| 114. Projetos Module | v6.0 | 0/TBD | Not started | - |
| 115. Clientes Module | v6.0 | 0/TBD | Not started | - |
| 116. Sidebar Workspace | v6.0 | 0/TBD | Not started | - |
