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

---

## 🚧 v4.1 Super Admin (In Progress)

**Milestone Goal:** Painel global de administracao para gerenciar toda a plataforma Nexo — tenants, modulos, connectors, metricas, feature flags. Integracoes MCP (Supabase + Clerk) para operacoes via Claude Code.

### Phases

- [ ] **Phase 75: Auth & RLS Foundation** - JWT claim super_admin + SuperAdminRoute + RLS policies atualizadas em todas as tabelas
- [ ] **Phase 76: Admin Shell & Dashboard** - Layout /admin/*, sidebar de navegacao e dashboard com metricas agregadas + toggle admin/operator na topbar
- [ ] **Phase 77: Tenant Management** - CRUD de tenants via Clerk Organizations (lista, detalhe, criacao)
- [ ] **Phase 78: Module Management Evolution** - Migracao de localStorage para Supabase tenant_modules com controle por tenant
- [ ] **Phase 79: Platform Settings & MCP** - Tabela platform_settings, pagina /admin/settings e configuracao dos MCP servers
- [ ] **Phase 80: Build Verification** - Zero erros TypeScript e build de producao limpo

### Phase Details

### Phase 75: Auth & RLS Foundation
**Goal**: Super admin pode ser identificado via JWT claim e bloqueado de rotas nao autorizadas; todas as tabelas Supabase respeitam o claim para bypass de org_id
**Depends on**: Nothing (first phase of milestone)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, RLS-01, RLS-02
**Success Criteria** (what must be TRUE):
  1. Clerk JWT template inclui o campo `super_admin` extraido de publicMetadata e ele aparece no JWT decodificado
  2. Acessar `/admin/qualquer-rota` sem claim super_admin redireciona para home sem flash de conteudo
  3. Usuario com claim super_admin acessa `/admin/*` normalmente sem redirecionamento
  4. Consulta SQL direta no Supabase retorna dados de todos os tenants quando JWT tem `super_admin = true`
  5. Consulta com JWT de tenant comum continua retornando apenas dados do proprio org_id
**Plans:** 2 plans

Plans:
- [ ] 75-01-PLAN.md — SuperAdminRoute component + AppRouter wiring + RLS migration 009
- [ ] 75-02-PLAN.md — Clerk JWT template config (checkpoint) + E2E verification

### Phase 76: Admin Shell & Dashboard
**Goal**: Super admin tem um shell de navegacao dedicado para a area /admin e ve metricas agregadas da plataforma logo ao entrar
**Depends on**: Phase 75
**Requirements**: ADMIN-01, ADMIN-02, UX-01, UX-02
**Success Criteria** (what must be TRUE):
  1. Pagina /admin renderiza com sidebar de navegacao com links para Tenants, Modules, Settings e Connectors
  2. Dashboard /admin exibe contadores reais: total de tenants (Clerk orgs), total de usuarios e modulos ativos
  3. Topbar exibe botao/icone de toggle apenas quando usuario tem claim super_admin
  4. Clicar no toggle alterna entre modo Admin (/admin/*) e modo Operator (home do tenant FXL) sem recarregar pagina
**Plans:** 2 plans

Plans:
- [ ] 076-01-PLAN.md — Admin shell layout, sidebar, routes, toggle (ADMIN-02, UX-01, UX-02)
- [ ] 076-02-PLAN.md — Admin dashboard with platform metrics (ADMIN-01)

### Phase 77: Tenant Management
**Goal**: Super admin pode visualizar, criar e inspecionar tenants (Clerk Organizations) diretamente pelo painel
**Depends on**: Phase 75, Phase 76
**Requirements**: TENANT-01, TENANT-02, TENANT-03
**Success Criteria** (what must be TRUE):
  1. Pagina /admin/tenants lista todas as Clerk Organizations com nome, ID, numero de membros e status
  2. Clicar em um tenant abre /admin/tenants/:orgId com modulos habilitados, conectores e metricas do tenant
  3. Super admin preenche formulario e cria novo tenant (Clerk org) que aparece imediatamente na lista
**Plans:** 2 plans

Plans:
- [ ] 77-01-PLAN.md — Edge Function proxy for Clerk Organizations API + types + client service
- [ ] 77-02-PLAN.md — TenantsPage (list), TenantDetailPage, CreateTenantDialog + route wiring

### Phase 78: Module Management Evolution
**Goal**: Controle de modulos por tenant migra de localStorage (local, per-browser) para Supabase tenant_modules (persistente, per-org), com super admin como unico ponto de controle
**Depends on**: Phase 75, Phase 76
**Requirements**: MOD-01, MOD-02, MOD-03
**Success Criteria** (what must be TRUE):
  1. Pagina /admin/modules exibe modulos configurados por tenant via leitura da tabela tenant_modules no Supabase
  2. Super admin habilita ou desabilita um modulo para um tenant especifico e a mudanca persiste ao recarregar
  3. Operador do tenant (modo operator) ve na sidebar apenas os modulos que o super admin habilitou para seu org
  4. localStorage nao e mais usado como fonte de verdade para modulos habilitados
**Plans:** 1 plan

Plans:
- [ ] 78-01-PLAN.md — Supabase tenant_modules CRUD + localStorage removal

### Phase 79: Platform Settings & MCP
**Goal**: Super admin tem pagina para gerenciar feature flags e configs globais; Claude Code tem acesso direto a Supabase e Clerk via MCP servers configurados
**Depends on**: Phase 75, Phase 76
**Requirements**: SET-01, SET-02, MCP-01, MCP-02, MCP-03
**Success Criteria** (what must be TRUE):
  1. Migracao Supabase cria tabela `platform_settings` (key/value) com RLS respeitando super_admin claim
  2. Pagina /admin/settings exibe e permite editar os valores da tabela platform_settings
  3. `.claude/settings.json` contem entrada configurada para Supabase MCP server
  4. `.claude/settings.json` contem entrada configurada para Clerk MCP server
  5. CLAUDE.md ou doc em docs/ descreve operacoes de super admin disponíveis via MCP (criar tenant, habilitar modulo)
**Plans**: TBD

### Phase 80: Build Verification
**Goal**: Toda a implementacao do milestone passa nas validacoes obrigatorias de qualidade de codigo
**Depends on**: Phase 77, Phase 78, Phase 79
**Requirements**: VERIF-01, VERIF-02
**Success Criteria** (what must be TRUE):
  1. `npx tsc --noEmit` retorna zero erros em todo o codebase
  2. `npm run build` completa sem erros e gera bundle de producao valido
**Plans:** 1 plan
Plans:
- [ ] 80-01-PLAN.md — Fix TypeScript errors and verify production build

## Quick Tasks

| # | Description | Date |
|---|------------|------|
| 13 | Remove light mode toggle, use local date format | 2026-03-13 |
| 15 | Sidebar editor: grouped screens, context menus, pin support, widget picker | 2026-03-13 |

## Progress

**Execution Order:**
Phase 75 primeiro (bloqueante). Phase 76 depende de 75. Phases 77, 78 e 79 sao INDEPENDENTES entre si — podem ser executadas em paralelo apos 75+76. Phase 80 e gate final.

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 75. Auth & RLS Foundation | v4.1 | 0/2 | Not started | - |
| 76. Admin Shell & Dashboard | v4.1 | 0/2 | Not started | - |
| 77. Tenant Management | v4.1 | 0/2 | Not started | - |
| 78. Module Management Evolution | v4.1 | 0/1 | Not started | - |
| 79. Platform Settings & MCP | v4.1 | 0/? | Not started | - |
| 80. Build Verification | v4.1 | 0/1 | Not started | - |
