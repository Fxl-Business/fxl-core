# FXL Core — Relatorio de Arquitetura do Sistema

> Gerado em 2026-03-18. Snapshot completo da arquitetura, conexoes, stack e estado atual.

---

## 1. Visao Geral

**FXL Core (Nexo)** e uma plataforma operacional interna SaaS multi-tenant, construida como SPA React com backend Supabase e autenticacao Clerk. A plataforma serve como hub para gerenciamento de clientes, documentacao, tarefas, wireframes e integracao com projetos externos (spokes).

| Dimensao | Detalhe |
|----------|---------|
| **Tipo** | SPA (Single Page Application) |
| **Versao** | 3.0.0 |
| **Frontend** | React 18 + TypeScript 5 (strict) + Vite 5 |
| **UI** | Tailwind CSS 3 + shadcn/ui (Radix primitives) |
| **Auth** | Clerk 6.x (identity) → Supabase JWT (session) |
| **Backend** | Supabase (Postgres + Edge Functions em Deno) |
| **Deploy** | Vercel (frontend) + Supabase Cloud (backend) |
| **AI Tooling** | MCP Server (Cloudflare Workers) + GSD Workflow |

---

## 2. Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              VERCEL                                     │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                    React SPA (Vite Build)                         │  │
│  │                                                                   │  │
│  │  ┌──────────┐  ┌──────────────┐  ┌────────────────────────────┐  │  │
│  │  │  Clerk   │  │   Platform   │  │        Modules             │  │  │
│  │  │Provider  │  │    Shell     │  │                            │  │  │
│  │  │(Auth)    │  │              │  │  ┌─────┐ ┌────────┐       │  │  │
│  │  └────┬─────┘  │ ┌─────────┐ │  │  │Docs │ │Projects│       │  │  │
│  │       │        │ │ TopNav  │ │  │  └─────┘ └────────┘       │  │  │
│  │       │        │ │+OrgPick │ │  │  ┌─────┐ ┌────────┐       │  │  │
│  │       │        │ └─────────┘ │  │  │Tasks│ │Clients │       │  │  │
│  │       │        │ ┌─────────┐ │  │  └─────┘ └────────┘       │  │  │
│  │       │        │ │Sidebar  │ │  │  ┌─────────┐ ┌──────────┐ │  │  │
│  │       │        │ │(Dynamic)│ │  │  │Connector│ │Wireframe │ │  │  │
│  │       │        │ └─────────┘ │  │  └─────────┘ └──────────┘ │  │  │
│  │       │        │ ┌─────────┐ │  │                            │  │  │
│  │       │        │ │ Router  │ │  │  Extension Slot System     │  │  │
│  │       │        │ │(RRv6)   │ │  │  (cross-module injection)  │  │  │
│  │       │        │ └─────────┘ │  └────────────────────────────┘  │  │
│  │       │        └──────────────┘                                  │  │
│  └───────┼──────────────────────────────────────────────────────────┘  │
│          │                          │                                   │
└──────────┼──────────────────────────┼───────────────────────────────────┘
           │                          │
           ▼                          ▼
┌──────────────────┐    ┌─────────────────────────────────────────────┐
│   Clerk Cloud    │    │              SUPABASE                       │
│                  │    │                                             │
│ • Users          │    │  ┌──────────────────────────────────────┐  │
│ • Organizations  │◄──►│  │       Edge Functions (Deno)          │  │
│ • Sessions       │    │  │                                      │  │
│ • OAuth/Google   │    │  │  auth-token-exchange (JWT mint)      │  │
│ • JWKS endpoint  │    │  │  admin-users (Clerk proxy)           │  │
└──────────────────┘    │  │  admin-tenants (org CRUD + imperson) │  │
                        │  └──────────────────────────────────────┘  │
                        │                                             │
                        │  ┌──────────────────────────────────────┐  │
                        │  │        PostgreSQL (RLS)               │  │
                        │  │                                      │  │
                        │  │  documents       tasks               │  │
                        │  │  comments         clients             │  │
                        │  │  tenant_modules   projects            │  │
                        │  │  platform_settings                   │  │
                        │  │  knowledge_entries                   │  │
                        │  │  blueprint_configs                   │  │
                        │  │  briefing_configs                    │  │
                        │  │                                      │  │
                        │  │  18 migrations | 1561 lines SQL      │  │
                        │  └──────────────────────────────────────┘  │
                        └─────────────────────────────────────────────┘
                                          │
                                          │ reads
                                          ▼
                        ┌─────────────────────────────────────────────┐
                        │         MCP Server (Cloudflare Workers)     │
                        │                                             │
                        │  Resources: standards, learnings, pitfalls  │
                        │  checklists, project configs                │
                        │                                             │
                        │  Consumers: Claude Code, Nexo Skill         │
                        └─────────────────────────────────────────────┘
```

---

## 3. Fluxo de Autenticacao

```
User Login
    │
    ▼
Clerk (Google OAuth / Email)
    │
    ├── Clerk JWT emitido (com org_id, sub, org_role)
    │
    ▼
ProtectedRoute.tsx
    │
    ├── Verifica isSignedIn (Clerk)
    ├── Verifica userMemberships (orgs)
    ├── Verifica activeOrg
    │
    ▼
useOrgTokenExchange()
    │
    ├── Clerk session.getToken()
    ├── POST /auth-token-exchange { org_id }
    │
    ▼
Edge Function (auth-token-exchange)
    │
    ├── Valida Clerk JWT via JWKS
    ├── Extrai sub, org_id, org_role
    ├── Minta Supabase JWT (claims: sub, org_id, role, aud, iss)
    │
    ▼
setOrgAccessToken(supabaseJWT)
    │
    ├── Token injetado via fetch override no Supabase client
    ├── Todas as queries passam Authorization: Bearer {token}
    ├── RLS policies enforcam org_id match
    │
    ▼
App funcional com isolamento multi-tenant
```

---

## 4. Stack Completa

### Frontend

| Lib | Versao | Uso |
|-----|--------|-----|
| react | 18.3.1 | Framework UI |
| react-dom | 18.3.1 | DOM rendering |
| react-router-dom | 6.27.0 | Roteamento SPA |
| typescript | 5.x | Tipagem (strict: true) |
| vite | 5.x | Build tool + dev server |
| tailwindcss | 3.4.x | Utility CSS |
| @radix-ui/* | varies | Primitivas de acessibilidade (via shadcn) |
| lucide-react | latest | Icones |
| sonner | 2.0.7 | Toast notifications |
| react-markdown | 9.0.1 | Renderizacao de docs |
| remark-gfm | 4.0.0 | GitHub Flavored Markdown |
| rehype-highlight | latest | Syntax highlighting |
| recharts | 2.13.3 | Graficos/dashboards |
| @dnd-kit/* | latest | Drag-and-drop (wireframe builder) |
| zod | 4.3.6 | Validacao de schemas |
| clsx + tailwind-merge | latest | Merge de classes CSS |

### Auth

| Lib | Versao | Uso |
|-----|--------|-----|
| @clerk/react | 6.0.1 | Identity provider (frontend) |
| @clerk/ui | 1.0.1 | UI components de auth |

### Backend

| Lib | Versao | Uso |
|-----|--------|-----|
| @supabase/supabase-js | 2.98.0 | Client SDK (Postgres, Storage, Realtime) |
| Deno runtime | latest | Edge Functions |
| PostgreSQL | Supabase managed | Database |

### AI/Tooling

| Componente | Uso |
|------------|-----|
| MCP Server | Knowledge base para Claude (standards, learnings, pitfalls) |
| Nexo Skill | Scaffold, audit, connect, orchestrate projetos |
| GSD Workflow | Planejamento e execucao de milestones |

### DevOps

| Tool | Uso |
|------|-----|
| Vercel | Deploy frontend (SPA rewrite) |
| Supabase Cloud | Database + Edge Functions |
| Cloudflare Workers | MCP Server hosting |
| ESLint | Linting + boundary rules |
| Vitest | Testes unitarios |
| GitHub | Source control |

---

## 5. Estrutura de Diretorios

```
fxl-core/
├── src/
│   ├── main.tsx                    # Entry point (ClerkProvider)
│   ├── App.tsx                     # Root (Providers + Router)
│   ├── platform/                   # Shell da plataforma
│   │   ├── auth/                   # ProtectedRoute, SuperAdminRoute, Impersonation
│   │   ├── layout/                 # Layout, TopNav, Sidebar, AdminLayout
│   │   ├── router/                 # AppRouter (todas as rotas)
│   │   ├── tenants/                # Token exchange, OrgPicker, useActiveOrg
│   │   ├── module-loader/          # Registry, slots, extensions, useModuleEnabled
│   │   ├── pages/                  # Home, CriarEmpresa, admin/*
│   │   ├── services/               # admin-service, tenant-service, activity-feed
│   │   ├── hooks/                  # useAdminMode
│   │   ├── types/                  # tenant.ts, admin.ts
│   │   └── supabase.ts             # Client + orgAccessToken global
│   │
│   ├── modules/                    # Feature modules (auto-registrados)
│   │   ├── docs/                   # Docs viewer (markdown → React)
│   │   ├── projects/               # Projetos (CRUD, briefing, blueprint)
│   │   ├── tasks/                  # Tarefas (lista, kanban, CRUD)
│   │   ├── clients/                # Clientes (workspace, perfil)
│   │   ├── connector/              # Integracoes externas (spoke API)
│   │   └── wireframe/              # Builder + galeria + viewer publico
│   │
│   └── shared/
│       ├── ui/                     # shadcn/ui components
│       ├── utils/                  # cn() helper
│       ├── hooks/                  # (vazio)
│       └── types/                  # (vazio)
│
├── supabase/
│   ├── migrations/                 # 18 migrations (001-018)
│   └── functions/                  # 3 edge functions (Deno)
│       ├── auth-token-exchange/
│       ├── admin-users/
│       └── admin-tenants/
│
├── docs/                           # Knowledge base (renderizada como paginas)
│   ├── processo/                   # Regras, fases, identidade
│   ├── padroes/                    # Standards
│   ├── sdk/                        # Guias tecnicos para spokes
│   └── ferramentas/                # Tooling, tech radar
│
├── tools/
│   ├── wireframe-builder/          # Componentes do builder
│   └── sync/                       # Scripts de sync Supabase
│
├── clients/                        # Workspaces por cliente
│   └── [slug]/                     # briefing/, blueprint/, wireframe/
│
├── mcp/
│   └── fxl-sdk/                    # MCP Server (Cloudflare Workers)
│
├── .agents/skills/                 # Skills do Claude (Nexo, Clerk)
├── .planning/                      # Estado do projeto (GSD)
└── .claude/                        # Config Claude Code + GSD workflow
```

---

## 6. Sistema de Modulos

Cada modulo e auto-contido e se registra via `ModuleDefinition`:

```
ModuleDefinition {
  id: ModuleId              // 'docs', 'projects', 'tasks', etc.
  label: string             // Nome exibido
  route: string             // Rota base (/tarefas, /projetos)
  icon: LucideIcon          // Icone no sidebar
  status: 'active'|'beta'|'coming-soon'
  tenantScoped?: boolean    // Visibilidade por org
  useNavItems?: () => ...   // Nav dinamica (sidebar)
  routeConfig?: RouteObject[] // Sub-rotas
  extensions?: Extension[]  // Injecoes cross-module
}
```

### Modulos Registrados

| Modulo | Rota | Status | Descricao |
|--------|------|--------|-----------|
| docs | /processo, /padroes, /ferramentas, /sdk | active | Documentacao renderizada |
| projects | /projetos | active | Gerenciamento de projetos |
| tasks | /tarefas | active | Tarefas + Kanban |
| clients | /clientes | active | Workspaces de clientes |
| connector | /apps | beta | Integracoes externas |
| wireframe | /ferramentas | active | Builder + galeria |

### Extension Slot System

```
Module (tasks) ──declares──► Extension { injects: HOME_DASHBOARD: RecentTasksWidget }
                                │
                                ▼
ExtensionProvider ──resolves──► ExtensionMap { HOME_DASHBOARD: [RecentTasksWidget] }
                                │
                                ▼
Home.tsx ──renders──► <ExtensionSlot id="HOME_DASHBOARD" />
```

---

## 7. Multi-Tenancy

```
Clerk Organization (org_id)
        │
        ├── 1:1 mapping ──► Supabase JWT claim { org_id }
        │
        ├── tenant_modules table ──► quais modulos habilitados
        │
        ├── RLS policies ──► WHERE org_id = auth.jwt()->>'org_id'
        │
        └── Impersonation ──► admin troca token temporariamente
```

**Modelo de isolamento:**
- Clerk gerencia identidade (users, orgs, memberships)
- Supabase gerencia dados (RLS enforca org_id em todas as tabelas)
- Token exchange faz a ponte (Clerk JWT → Supabase JWT com claims)

---

## 8. Edge Functions

| Funcao | Metodo | Proposito | Auth |
|--------|--------|-----------|------|
| auth-token-exchange | POST | Clerk JWT → Supabase JWT | Bearer (Clerk session) |
| admin-users | GET | Lista todos os usuarios (proxy Clerk API) | super_admin |
| admin-tenants | GET/POST/DELETE | CRUD de orgs, membros, impersonation | super_admin |

---

## 9. Database (18 Migrations)

| # | Migration | Proposito |
|---|-----------|-----------|
| 001 | comments_schema | Sistema de comentarios (wireframe annotations) |
| 002 | clerk_migration | Sync Clerk users/orgs |
| 003 | blueprint_configs | Storage de configs de blueprint |
| 004 | briefing_configs | Storage de configs de briefing |
| 005 | knowledge_entries | Knowledge base do SDK |
| 006 | tasks | Gerenciamento de tarefas |
| 007 | documents | Storage de documentos/markdown |
| 008 | multi_tenant_schema | Isolamento por org |
| 009 | super_admin_rls | Policies de super admin |
| 010 | platform_settings | Feature flags, branding |
| 011 | documents_scope | Escopo de docs por org/workspace |
| 012 | scope_data_migration | Migracao de dados para escopo |
| 013 | remove_anon_fallback | Hardening (JWT-only, sem anon) |
| 014 | sdk_docs_scope | Visibilidade de SDK docs |
| 015 | sdk_knowledge_tables | Refinamento de tables de knowledge |
| 016 | clients_table | Tabela de clientes |
| 017 | data_recovery | Backfill/recovery |
| 018 | projects_table | Tabela de projetos |

---

## 10. State Management

**Nao usa state manager global** (Redux, Zustand, etc.).

| Mecanismo | Onde | Uso |
|-----------|------|-----|
| React Context | ImpersonationContext | Estado de impersonation |
| React Context | ModuleEnabledContext | Modulos habilitados por org |
| React Context | ExtensionContext | Extensions resolvidas |
| useState + useEffect | Hooks de modulos | Data fetching (useTasks, useDoc, etc.) |
| In-memory cache | docs-service | Cache de documentos (invalidado em org switch) |
| Global variable | supabase.ts | orgAccessToken (injetado via fetch override) |

---

## 11. Rotas

### Publicas (sem auth)
| Rota | Pagina |
|------|--------|
| /login | Clerk login |
| /signup | Clerk signup |
| /sso-callback | OAuth redirect |
| /wireframe-view | Viewer publico (token-gated) |

### Protegidas (ProtectedRoute)
| Rota | Pagina |
|------|--------|
| / | Home (dashboard) |
| /criar-empresa | Onboarding (cria org) |
| /perfil/* | Perfil Clerk |
| /processo/*, /padroes/*, /ferramentas/*, /sdk/* | DocRenderer |
| /projetos | Lista de projetos |
| /projetos/:slug | Detalhe do projeto |
| /projetos/:slug/briefing | Formulario de briefing |
| /projetos/:slug/blueprint | Visualizacao de blueprint |
| /projetos/:slug/wireframe | Editor de wireframe |
| /tarefas | Lista de tarefas |
| /tarefas/kanban | Kanban board |
| /tarefas/new | Criar tarefa |
| /tarefas/:id/edit | Editar tarefa |
| /clientes | Lista de clientes |
| /clientes/:slug | Perfil do cliente |
| /apps | Lista de connectors |
| /apps/:appId/* | Detalhe do connector |

### Admin (SuperAdminRoute)
| Rota | Pagina |
|------|--------|
| /admin | Dashboard admin |
| /admin/users | Gerenciamento de usuarios |
| /admin/tenants | Gerenciamento de tenants |
| /admin/tenants/:orgId | Detalhe do tenant |
| /admin/modules | Toggle de modulos |
| /admin/connectors | Gerenciamento de connectors |
| /admin/product-docs | Docs do produto |
| /admin/settings | Configuracoes |

---

## 12. Design System

| Aspecto | Implementacao |
|---------|---------------|
| **Cores** | CSS variables (--primary, --secondary, --accent, etc.) via shadcn |
| **Dark mode** | Class-based (`[class]`) com ThemeToggle |
| **Fontes** | Inter Variable (sans), JetBrains Mono (mono) |
| **Componentes** | shadcn/ui (Button, Card, Dialog, Select, Input, etc.) |
| **Icones** | lucide-react |
| **Spacing** | Tailwind utilities |
| **Border radius** | CSS variable --radius |
| **Wireframe tokens** | --wf-* prefix (canvas, card, heading, table) |
| **Sidebar tokens** | Dedicated palette (sidebar-*, accent, border) |
| **Charts** | 5 cores (chart-1 a chart-5) |

---

## 13. Analise de Qualidade Tecnica

### Pontos Fortes

1. **Arquitetura modular bem definida** — cada modulo e auto-contido com manifest, services, hooks e types
2. **Multi-tenancy robusto** — isolamento via JWT claims + RLS (sem chance de data leak entre orgs)
3. **TypeScript strict** — sem `any`, zero tolerance para erros de tipo
4. **Extension slot system** — composicao cross-module sem acoplamento direto
5. **Separacao clara de camadas** — platform vs modules vs shared
6. **Path aliases** — imports limpos e organizados (@platform, @modules, @shared)
7. **Lazy loading** — code splitting para paginas admin e componentes pesados
8. **Boundary rules** — ESLint enforca que modulos nao importam de outros modulos
9. **Edge functions** — logica sensivel (JWT mint, admin ops) no servidor
10. **MCP Server** — knowledge base acessivel por AI agents

### Pontos de Atencao

1. **Token global mutavel** — `orgAccessToken` como variavel global em `supabase.ts` e fragil; race conditions possiveis em org switch rapido
2. **Sem state manager** — para a escala atual funciona, mas pode complicar com mais modulos e dados compartilhados
3. **Cache in-memory basico** — apenas docs-service tem cache; outros modulos refetch a cada mount
4. **AdminSidebar hardcoded** — enquanto Sidebar principal e dinamico, admin nav e estatico
5. **Sem testes E2E** — apenas testes unitarios (vitest); sem Playwright/Cypress
6. **Sem error boundary global** — se um modulo crashar, pode derrubar toda a app
7. **Sem retry/backoff** — edge function calls nao tem retry automatico
8. **3 edge functions apenas** — toda logica admin proxeia Clerk API; se Clerk cair, admin fica inoperante
9. **Sem monitoring/observabilidade** — sem Sentry, LogRocket, ou similar no frontend
10. **Sem CI/CD pipeline visivel** — sem GitHub Actions configurados no repo

### O que esta Faltando

| Area | Status | Impacto |
|------|--------|---------|
| **Testes E2E** | Ausente | Alto — sem validacao de fluxos completos |
| **Error boundaries** | Ausente | Medio — crash em modulo derruba app |
| **Monitoring (Sentry/similar)** | Ausente | Alto — sem visibilidade de erros em prod |
| **CI/CD pipeline** | Ausente | Alto — deploys manuais, sem checks automaticos |
| **Rate limiting** | Ausente nas edge functions | Medio — vulneravel a abuse |
| **Request retry/backoff** | Ausente | Baixo — falhas silenciosas em rede instavel |
| **Stale-while-revalidate** | Ausente | Baixo — UX poderia ser mais fluida |
| **API documentation** | Ausente | Medio — edge functions sem docs formais |
| **Database indexes audit** | Desconhecido | Potencialmente alto em escala |
| **Supabase Realtime** | Nao utilizado | Baixo — disponivel mas nao conectado |
| **PWA/offline** | Ausente | Baixo — plataforma interna, sempre online |
| **i18n** | Ausente | Baixo — atualmente PT-BR only |
| **Feature flags** | Parcial (platform_settings) | Baixo — tem tabela mas sem SDK no frontend |
| **Audit log** | Ausente | Medio — sem trail de acoes admin |

---

## 14. Diagrama de Fluxo de Dados

```
┌─────────────┐     Clerk JWT      ┌──────────────────┐
│   Browser   │ ──────────────────► │  Clerk Cloud     │
│   (React)   │ ◄────────────────── │  (Users, Orgs)   │
└──────┬──────┘     Session Token   └──────────────────┘
       │
       │ POST /auth-token-exchange
       │ { clerk_token, org_id }
       ▼
┌──────────────────┐                ┌──────────────────┐
│  Edge Function   │ ──validates──► │  Clerk JWKS      │
│  (Deno)          │                │  (Public Keys)   │
└──────┬───────────┘                └──────────────────┘
       │
       │ Mints Supabase JWT
       │ { sub, org_id, role }
       ▼
┌──────────────────┐
│  Supabase Client │ ◄── fetch override injeta Bearer token
│  (Browser)       │
└──────┬───────────┘
       │
       │ Queries com org_id no JWT
       ▼
┌──────────────────┐
│  PostgreSQL      │ ── RLS policies checam org_id
│  (Supabase)      │ ── Dados isolados por tenant
└──────────────────┘
```

---

## 15. Mapa de Dependencias entre Componentes

```
ClerkProvider
  └── App.tsx
        ├── ImpersonationProvider
        │     └── ModuleEnabledProvider (reads tenant_modules)
        │           └── ExtensionProvider (resolves extensions)
        │                 └── AppRouter
        │                       ├── ProtectedRoute
        │                       │     └── useOrgTokenExchange (Clerk → Supabase JWT)
        │                       │           └── Layout
        │                       │                 ├── TopNav (OrgPicker, Search, Theme, UserMenu)
        │                       │                 ├── Sidebar (ModuleSwitcher + Dynamic Nav)
        │                       │                 └── <Outlet> (Module Pages)
        │                       │                       ├── Home (ExtensionSlots)
        │                       │                       ├── DocRenderer (react-markdown)
        │                       │                       ├── TaskList / KanbanBoard
        │                       │                       ├── ProjectsIndex / ProjectIndex
        │                       │                       ├── ClientList / ClientProfile
        │                       │                       └── ConnectorList / ConnectorRouter
        │                       │
        │                       └── SuperAdminRoute
        │                             └── AdminLayout
        │                                   ├── TopNav
        │                                   ├── AdminSidebar (hardcoded)
        │                                   └── <Outlet> (Admin Pages)
        │
        └── Toaster (sonner)
```

---

*Fim do relatorio. Use este documento como base para auditoria de qualidade tecnica.*
