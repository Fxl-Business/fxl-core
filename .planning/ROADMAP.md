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
- **v6.0 Reestruturação de Módulos** - Phases 112-116 (shipped 2026-03-18) -- see milestones/v6.0-ROADMAP.md
- **v7.0 Admin-Only Org Management** - Phases 117-120 (shipped 2026-03-18) -- see milestones/v7.0-ROADMAP.md
- **v8.0 Estabilidade Multi-Tenant** - Phases 121-124 (active)

## Quick Tasks

| # | Description | Date |
|---|------------|------|
| 13 | Remove light mode toggle, use local date format | 2026-03-13 |
| 15 | Sidebar editor: grouped screens, context menus, pin support, widget picker | 2026-03-13 |

---

## v8.0 Estabilidade Multi-Tenant (Phases 121-124)

**Goal:** Diagnosticar e corrigir bugs de isolamento multi-tenant (token exchange quebrado, sidebar vazia, dados inacessiveis) e adicionar test suite por area para prevenir regressoes futuras.

**Coverage:** 16/16 requirements mapped

### Phases

- [ ] **Phase 121: Auth & Token Exchange** — Diagnosticar e corrigir pipeline de token exchange; garantir que JWT carrega org_id correto para todas as orgs
- [ ] **Phase 122: Document Scoping & RLS** — Corrigir visibilidade de docs por org (tenant isolado, product para admins), invalidar cache ao trocar org
- [ ] **Phase 123: Modules & Org Lifecycle** — Corrigir opt-out model de modules, impersonation mode, org switch com reload de dados, empty states claros
- [x] **Phase 124: Regression Guard** — Smoke test end-to-end validando fluxo completo login → org → sidebar → troca org

### Phase Details

#### Phase 121: Auth & Token Exchange
**Goal**: JWT com org_id correto flui do Clerk para o Supabase client para todas as orgs ativas
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, TEST-01
**Success Criteria** (what must be TRUE):
  1. Ao fazer login com qualquer org ativa, Supabase client recebe JWT com org_id correto daquela org
  2. Quando token exchange falha, o usuario ve uma mensagem de erro explicita — nenhuma tela fica silenciosamente vazia
  3. Ao trocar de org via OrgPicker, novo token e obtido e Supabase client e atualizado antes de qualquer query disparar
  4. Super admin autenticado com JWT super_admin=true consegue ler dados de qualquer org via RLS bypass
  5. useOrgTokenExchange, useActiveOrg e token-exchange service tem unit tests cobrindo fluxo feliz e casos de erro
**Plans**: 4 plans
Plans:
- [ ] 121-01-PLAN.md — Vitest path aliases fix + useOrgTokenExchange race condition fix
- [ ] 121-02-PLAN.md — Commit and verify uncommitted auth changes (ProtectedRoute, useActiveOrg, useModuleEnabled)
- [ ] 121-03-PLAN.md — Unit tests for token-exchange service, useOrgTokenExchange, useActiveOrg
- [ ] 121-04-PLAN.md — Edge function super_admin claim + deploy verification checkpoint

#### Phase 122: Document Scoping & RLS
**Goal**: Cada org ve exatamente os documentos a que tem direito — tenant docs isolados, product docs para admins
**Depends on**: Phase 121
**Requirements**: DOCS-01, DOCS-02, DOCS-03, DOCS-04, TEST-02
**Success Criteria** (what must be TRUE):
  1. Um membro da org FXL ve os tenant docs da FXL e nao ve tenant docs de outra org
  2. Super admin ve os product docs de qualquer org onde estiver autenticado
  3. A sidebar de docs popula corretamente imediatamente apos login e imediatamente apos trocar de org
  4. Apos trocar de org, nenhum documento da org anterior aparece — cache e invalidado na troca
  5. Integration tests executam queries com JWTs de orgs diferentes e verificam que RLS isola corretamente os resultados
**Plans**: 2 plans
Plans:
- [ ] 122-01-PLAN.md — Corrigir RLS (migration 020) + cache invalidation em useDocsNav
- [ ] 122-02-PLAN.md — Integration tests RLS isolation (TEST-02)

#### Phase 123: Modules & Org Lifecycle
**Goal**: Modulos funcionam com opt-out por padrao, impersonation retorna dados reais, troca de org recarrega tudo sem reload manual
**Depends on**: Phase 122
**Requirements**: MORG-01, MORG-02, MORG-03, MORG-04, TEST-03
**Success Criteria** (what must be TRUE):
  1. Org sem nenhuma entrada em tenant_modules tem todos os modulos visiveis (opt-out: ausencia = habilitado)
  2. Admin impersonando a org FXL ve docs, clients, tasks e projects daquela org, nao dados da sessao propria
  3. Trocar de org via OrgPicker recarrega sidebar, docs, modulos e dados sem exigir reload manual da pagina
  4. Org com zero dados mostra empty states com texto explicativo em vez de sidebar vazia sem mensagem
  5. Tests validam que sidebar e modulos mudam corretamente ao simular org switch (cache, sidebar, module list)
**Plans**: 2 plans
Plans:
- [ ] 123-01-PLAN.md — Module opt-out logic, docs nav reactive reload, empty state UX
- [ ] 123-02-PLAN.md — Impersonation fixes: module reload on enter/exit, effective org_id for tenant_modules

#### Phase 124: Regression Guard
**Goal**: Fluxo multi-tenant critico esta coberto por smoke test que detecta regressao antes de chegar ao usuario
**Depends on**: Phase 123
**Requirements**: TEST-04
**Success Criteria** (what must be TRUE):
  1. Smoke test executa a sequencia: login → org ativa → sidebar com docs → troca de org → sidebar atualiza com docs da nova org
  2. Smoke test falha visivelmente com exit code != 0 e mensagem clara se qualquer passo produzir estado incorreto
  3. O smoke test pode ser executado localmente com um comando unico sem setup manual alem do .env
**Plans**: 1 plan
Plans:
- [x] 124-01-PLAN.md — Smoke test script + Makefile target + env docs

### Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 121. Auth & Token Exchange | 0/4 | Planning done | — |
| 122. Document Scoping & RLS | 0/2 | Planned | — |
| 123. Modules & Org Lifecycle | 0/2 | Planned | — |
| 124. Regression Guard | 1/1 | Complete | 2026-03-19 |

---

<details>
<summary>✅ v7.0 Admin-Only Org Management (Phases 117-120) — SHIPPED 2026-03-18</summary>

- [x] Phase 117: Access Control Lockdown (2/2 plans) — completed 2026-03-18
- [x] Phase 118: Admin User Management (2/2 plans) — completed 2026-03-18
- [x] Phase 119: Tenant Archival (3/3 plans) — completed 2026-03-18
- [x] Phase 120: Admin Dashboard Improvements (1/1 plan) — completed 2026-03-18

See: milestones/v7.0-ROADMAP.md

</details>

---

<details>
<summary>✅ v6.0 Reestruturação de Módulos (Phases 112-116) — SHIPPED 2026-03-18</summary>

- [x] Phase 112: DB Migration (1/1 plan) — completed 2026-03-18
- [x] Phase 113: Code Restructure — completed 2026-03-18
- [x] Phase 114: Projetos Module — completed 2026-03-18
- [x] Phase 115: Clientes Module — completed 2026-03-18
- [x] Phase 116: Sidebar Workspace — completed 2026-03-18

See: milestones/v6.0-ROADMAP.md

</details>

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
