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
- **v5.3 UX Polish** - Phases 105-108 (active)

## Quick Tasks

| # | Description | Date |
|---|------------|------|
| 13 | Remove light mode toggle, use local date format | 2026-03-13 |
| 15 | Sidebar editor: grouped screens, context menus, pin support, widget picker | 2026-03-13 |

---

## v5.3 UX Polish — Phases

### Phases

- [x] **Phase 105: Data Isolation** - Adicionar org_id em todas as tabelas de dados operacionais e enforcar isolamento por org via RLS + service layer (completed 2026-03-18)
- [x] **Phase 106: Data Recovery** - Recuperar e re-associar dados existentes (tarefas, wireframes) a org correta (completed 2026-03-18)
- [x] **Phase 107: Header UX** - Adicionar avatar com dropdown de logout, distinguir admin vs operator, corrigir brand "Nexo" (completed 2026-03-18)
- [ ] **Phase 108: Admin Enhancements** - Admin pode gerenciar membros de qualquer org e entrar na visao de qualquer org (impersonate)

### Progress Table

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 105. Data Isolation | 4/4 | Complete    | 2026-03-18 |
| 106. Data Recovery | 0/? | Complete    | 2026-03-18 |
| 107. Header UX | 1/1 | Complete    | 2026-03-18 |
| 108. Admin Enhancements | 0/? | Not started | - |

---

## Phase Details

### Phase 105: Data Isolation

**Goal**: Todos os dados operacionais (tarefas, clientes, wireframes, docs) sao visualmente e tecnicamente isolados por org — cada org ve apenas o que e seu, e a arquitetura modular reflete a separacao entre ferramenta (global) e dado (org-scoped)

**Depends on**: Nothing (first phase of v5.3)

**Requirements**: DATA-01, DATA-02, DATA-03, DATA-04, ARCH-01, ARCH-02

**Success Criteria** (what must be TRUE):
  1. Um operator da org A nao consegue ver tarefas, clientes ou wireframes criados pela org B
  2. A sidebar de docs exibe apenas documentos associados a org do operator logado
  3. O Wireframe Builder aparece como ferramenta global no MODULE_REGISTRY, enquanto os wireframes de clientes sao listados como dados da org
  4. As tabelas `tasks`, `documents`, `blueprints` e `clients` tem coluna `org_id` com RLS ativa filtrando por org
  5. O service layer (task-service, client-service, etc.) passa org_id automaticamente sem o chamador precisar informar

**Plans**: TBD

---

### Phase 106: Data Recovery

**Goal**: Dados existentes que sumiram ou perderam associacao apos mudancas de org sao recuperados e vinculados a org correta, sem perda de conteudo

**Depends on**: Phase 105 (org_id columns must exist before re-association)

**Requirements**: DATA-05

**Success Criteria** (what must be TRUE):
  1. Tarefas criadas antes do isolamento de org_id aparecem na org correta apos a recuperacao
  2. Wireframes/blueprints existentes aparecem para a org que os criou, sem duplicacao ou perda de dados
  3. Um script ou migration documentada executa a re-associacao de forma idempotente (pode rodar mais de uma vez sem efeito colateral)

**Plans**: TBD

---

### Phase 107: Header UX

**Goal**: O header da aplicacao oferece identidade visual clara ("Nexo"), distingue admin de operator, e permite logout com um clique

**Depends on**: Nothing (independent of data isolation work)

**Requirements**: HEAD-01, HEAD-02, HEAD-03

**Success Criteria** (what must be TRUE):
  1. O header exibe "Nexo" como nome da plataforma (nao "Fxl Core Fxl" ou qualquer variante incorreta)
  2. Um operator logado ve seu avatar no header; ao clicar, aparece um dropdown com opcao de logout
  3. Ao executar logout pelo dropdown, o usuario e redirecionado para a pagina de login
  4. Um usuario com role admin ve indicacao visual distinta no header (badge, cor ou label) que diferencia sua sessao de um operator comum

**Plans**: TBD

---

### Phase 108: Admin Enhancements

**Goal**: O admin pode gerenciar o ciclo de vida de membros em qualquer org e inspecionar qualquer org como se fosse um de seus membros

**Depends on**: Phase 105 (org_id isolation must be in place for impersonation to be meaningful)

**Requirements**: ADMN-01, ADMN-02

**Success Criteria** (what must be TRUE):
  1. Na pagina de detalhe de um tenant em /admin/tenants/:id, o admin consegue adicionar um usuario existente como membro da org
  2. Na mesma pagina, o admin consegue remover um membro da org
  3. O admin pode selecionar "Entrar como esta org" e ver o Nexo com os dados e modulos daquela org, como se fosse um operator dela
  4. Ao sair do modo impersonation, o admin retorna para sua sessao original sem necessidade de novo login

**Plans**: TBD

---
