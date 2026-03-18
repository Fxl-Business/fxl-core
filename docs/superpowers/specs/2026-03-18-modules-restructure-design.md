---
title: Reestruturação de Módulos — Clientes, Projetos e Sidebar Workspace
date: 2026-03-18
status: draft
---

# Reestruturação de Módulos — Clientes, Projetos e Sidebar Workspace

## Contexto

O módulo atual "Clientes" mistura duas responsabilidades: cadastro de clientes e ferramentas de criação de projetos (briefing, blueprint, wireframe). Além disso, a sidebar tem navegação hardcoded (ex: "Financeiro Conta Azul" aparece para todas as orgs) e todos os módulos compartilham uma sidebar flat, o que fica confuso à medida que a plataforma cresce.

## Decisões

- **CRM fora do Nexo** — será uma app separada. O Nexo é plataforma de gestão e entrega, não de operação comercial. Públicos diferentes: Nexo para gestão (pessoas acima), CRM para operacional.
- **Módulo Clientes = cadastro mínimo** — Nome, logo, slug, status. Sem CRM, sem complexidade. Evolui depois.
- **Módulo Projetos = rename do atual "Clientes"** — Contém briefing → blueprint → wireframe. Fluxo fixo por agora.
- **Projetos é autossuficiente** — Não depende do módulo Clientes estar ativo. Sem Clientes, projetos ficam vinculados à própria org (cliente implícito). Com Clientes ativo, dropdown mostra clientes cadastrados + "Minha organização".
- **Sidebar como workspace** — Dropdown no topo (estilo Slack) para trocar de módulo. Cada módulo tem seu próprio contexto de navegação.
- **Toda navegação é dinâmica** — Nenhum item hardcoded em manifests. Nav vem do banco ou do registry.

## Design

### 1. Módulo Clientes (novo)

**Responsabilidade:** CRUD de clientes por organização. Fonte única de verdade para "quem são os clientes desta org".

**Dados:** Tabela `clients` já existe (migration 016) com `id`, `slug`, `name`, `description`, `org_id` + RLS. Adicionar: `logo_url text`, `status text default 'active'` (active/inactive). A coluna `description` já existe e será aproveitada.

**Páginas:**
- `/clientes` — Lista de clientes da org (cards ou tabela), botão "Novo Cliente"
- `/clientes/:slug` — Perfil mínimo do cliente (nome, logo, status, link para projetos dele)
- Dialog de criação/edição inline

**Nav na sidebar (quando workspace Clientes ativo):**
- Lista dinâmica dos clientes da org (query Supabase)
- Cada cliente é um item clicável que abre o perfil

**Manifest:** Segue a interface `ModuleDefinition` existente (id, label, description, icon, route, status, tenantScoped, navChildren). O campo `navChildren` será substituído por um hook `useNavItems()` para suportar nav dinâmico (ver seção 3).

### 2. Módulo Projetos (rename do atual "Clientes")

**Responsabilidade:** Criação e gestão de projetos (dashboards, sites, apps) para clientes cadastrados. Contém todo o fluxo briefing → blueprint → wireframe.

**Dados:** Nova tabela `projects`:
- `id uuid`, `slug text`, `name text`, `client_id uuid nullable (FK → clients)`, `org_id text`, `created_at timestamptz`
- `client_id` nullable: se null, projeto pertence à própria org (cliente implícito)
- Tabelas `briefing_configs` e `blueprint_configs` ganham coluna `project_id uuid (FK → projects)`

**Páginas:**
- `/projetos` — Lista de projetos da org
- `/projetos/:slug/briefing` — Briefing (mesmo código atual, rota nova)
- `/projetos/:slug/blueprint` — Blueprint (mesmo código atual, rota nova)
- `/projetos/:slug/wireframe` — Wireframe builder (mesmo código atual, rota nova)
- `/projetos/:slug/branding` — Branding (mesmo código atual, rota nova)
- Dialog de criação: se módulo Clientes ativo → dropdown com clientes + "Minha organização". Se Clientes inativo → vincula automaticamente à org.

**Nav na sidebar (quando workspace Projetos ativo):**
- Lista dinâmica dos projetos, cada um expandível com sub-itens (Briefing, Blueprint, Wireframe, Branding)

**Manifest:** Segue `ModuleDefinition` existente. Sem campo `requires` — autossuficiência é por design (client_id nullable), não por dependência de módulo.

### 3. Sidebar Workspace

**Estrutura visual:**
```
┌─────────────────────┐
│ [Logo FXL]          │
│ ▼ Projetos        ↓ │  ← Dropdown switcher (módulo ativo)
├─────────────────────┤
│                     │
│  Itens dinâmicos    │  ← Nav do módulo selecionado
│  do módulo ativo    │
│                     │
├─────────────────────┤
│ ⚙ Admin  👤 Perfil  │  ← Footer fixo (se super_admin)
└─────────────────────┘
```

**Comportamento:**
- Dropdown lista módulos habilitados para a org (query `tenant_modules` + `MODULE_REGISTRY`)
- Trocar no dropdown muda a rota para a home do módulo e carrega o nav daquele módulo
- Cada módulo define nav via `navChildren` no manifest — pode ser estático ou dinâmico
- Para nav dinâmico, o manifest expõe um hook `useNavItems()` que o sidebar chama

**Extensão da interface `ModuleDefinition`:**
- Adicionar campo opcional `useNavItems?: () => { items: NavItem[]; isLoading: boolean }` ao `ModuleDefinition`
- Se presente, sidebar usa o hook em vez de `navChildren` estático
- Se ausente, sidebar usa `navChildren` como hoje (backward compatible)

**Módulos e seus navs:**

| Módulo | Nav sidebar |
|--------|------------|
| Clientes | Lista dinâmica de clientes da org |
| Projetos | Lista dinâmica de projetos (expandível: briefing, blueprint, wireframe) |
| Documentos (id: `docs`) | Categorias fixas (processo, padrões, ferramentas, refs) |
| Tarefas (id: `tasks`) | Links fixos (lista, kanban) |
| Ferramentas (id: `ferramentas`) | Links fixos (wireframe gallery) |
| Connector | Lista dinâmica de apps conectados |

### 4. Migração de Dados e Rotas

**Banco — nova tabela:**
- `projects` (id uuid, slug text, name text, client_id uuid nullable FK → clients, org_id text, created_at timestamptz) com RLS por org_id

**Banco — alterações em tabelas existentes:**
- `clients` — adicionar `logo_url text`, `status text default 'active'`
- `briefing_configs` — adicionar `project_id uuid FK → projects`, migrar dados existentes via `client_slug` → `projects.slug`
- `blueprint_configs` — adicionar `project_id uuid FK → projects`, migrar dados existentes via `client_slug` → `projects.slug`
- `comments` — adicionar `project_id uuid FK → projects`, migrar dados existentes via `client_slug`
- `share_tokens` — adicionar `project_id uuid FK → projects`, migrar dados existentes via `client_slug`
- Em todas as tabelas acima, `client_slug` é mantido temporariamente para backward compatibility e removido em migration futura após atualização do código

**Banco — seed de migração:**
- Criar projeto "Financeiro Conta Azul" (slug: `financeiro-conta-azul`) vinculado ao cliente existente com mesmo slug
- Atualizar `project_id` em briefing_configs, blueprint_configs, comments e share_tokens onde `client_slug = 'financeiro-conta-azul'`

**Banco — RLS:**
- Considerar restringir RLS de `briefing_configs` e `blueprint_configs` (atualmente `USING (true)`) para filtrar por org_id via JOIN com projects

**Código — migração de stores:**
- `tools/wireframe-builder/lib/briefing-store.ts` — mudar queries de `client_slug` para `project_id` (ou `project_slug` + `org_id`)
- `tools/wireframe-builder/lib/blueprint-store.ts` — idem
- `tools/wireframe-builder/lib/comments.ts` — idem
- `tools/wireframe-builder/lib/tokens.ts` — idem
- Todas as ~18 call sites que usam `client_slug` como key precisam migrar

**Rotas legadas:**
- URLs antigas (`/clients/:slug/*`) não terão redirect automático — são rotas internas da plataforma, não públicas. Exceto `/wireframe-view?token=...` (compartilhamento externo) que permanece intocado.

**Rotas:**

| Antes | Depois |
|-------|--------|
| `/clientes` | `/clientes` (agora é lista de clientes, não projetos) |
| `/clients/:slug/briefing` | `/projetos/:slug/briefing` |
| `/clients/:slug/blueprint` | `/projetos/:slug/blueprint` |
| `/clients/:slug/wireframe` | `/projetos/:slug/wireframe` |
| `/clients/:slug/branding` | `/projetos/:slug/branding` |

**Código:**
- `src/modules/clients/` → renomeia para `src/modules/projects/`, novo module ID `'projects'`
- Novo `src/modules/clients/` criado do zero (CRUD simples)
- `Sidebar.tsx` → refatorado pro pattern workspace (dropdown + nav dinâmico)
- `module-ids.ts` → adiciona `PROJECTS`, mantém `CLIENTS` com novo significado
- `registry.ts` → registra ambos os módulos
- Pages hardcoded de `FinanceiroContaAzul/` → substituídas por pages genéricas que carregam por slug

**Intocado:**
- Wireframe builder (`tools/wireframe-builder/`)
- Sistema de extensões
- Auth, tenants, admin
- Módulos docs, tasks, connector
