# FXL Platform Evolution — Design Spec

**Data:** 2026-03-16
**Autor:** Cauet + Claude
**Status:** Draft

---

## 1. Contexto e Motivacao

O FXL Core e hoje uma plataforma operacional interna da FXL com ~41K LOC,
5 modulos (docs, ferramentas, clients, knowledge-base, tasks), 1 cliente piloto,
e 12 milestones entregues. A arquitetura atual e um monolito React SPA com
sistema de modulos (ModuleDefinition + registry + slots + extensions).

### Problemas atuais

1. **Identidade confusa**: docs da FXL (processo, padroes) vivem junto com
   funcionalidades da plataforma, sem separacao clara entre "conteudo da empresa FXL"
   e "funcionalidades do produto FXL Core"
2. **Single-tenant**: o sistema assume um unico usuario/empresa. Modulos sao
   toggled via localStorage, sem conceito de tenant
3. **Sem padrao para projetos externos**: 20+ dashboards de clientes em outra
   plataforma, sem padroes compartilhados, sem conexao com o hub
4. **Knowledge Base redundante**: sobrepoe-se ao modulo Docs sem diferenciacao clara
5. **Estrutura de pastas nao modular**: componentes, pages e services de modulos
   diferentes estao misturados em pastas globais (src/components/, src/pages/, src/lib/)

### Visao de longo prazo

O FXL Core se torna o **hub central** onde qualquer empresa acessa seus modulos
(tarefas, CRM, docs) e visualiza dados de **aplicacoes externas** (spokes)
atraves de uma API padronizada. Todo o desenvolvimento e feito com arquitetura
**agent-first**, otimizada para Claude Code.

---

## 2. Arquitetura de Tres Camadas (Hub, Spokes, Skill)

```
+-----------------------------------------------------+
|                    FXL Core (Hub)                    |
|           Plataforma multi-tenant modular            |
|                                                     |
|  +------+ +------+ +-----+ +----------+ +-------+  |
|  | Docs | |Tasks | | CRM | |Wireframe | | ...   |  |
|  +------+ +------+ +-----+ +----------+ +-------+  |
|                                                     |
|  +---------------------------------------------+    |
|  |           Connector Modules                  |    |
|  |  +-----------+ +----------+ +-----------+   |    |
|  |  |Beach House| |Conta Azul| | Cliente N |   |    |
|  |  +-----+-----+ +----+-----+ +-----+-----+   |    |
|  +--------|-----------|-----------|---------+    |
+-----------|-----------|-----------|--------------+
            | API       | API       | API
+-----------v--+  +-----v------+  +--v-----------+
| Beach House  |  | Conta Azul |  |  Cliente N   |
|   System     |  |  Dashboard |  |    App       |
|  (Spoke)     |  |  (Spoke)   |  |  (Spoke)     |
+--------------+  +------------+  +--------------+
        |                |                |
   +----v----------------v----------------v----+
   |           FXL SDK (Skill)                  |
   |  Rules . Templates . Contract . Checklists |
   +--------------------------------------------+
```

### 2.1 Hub (FXL Core)

A plataforma principal. Modular monolith (Abordagem A — justificativa na secao 3).
Contem:

- **Modulos nativos**: funcionalidades que vivem dentro do hub (Docs, Tasks, CRM, Wireframe)
- **Connector modules**: modulos que consomem APIs de spokes e renderizam dados
  com UI propria do hub. Para o usuario final, nao ha diferenca entre modulo nativo
  e connector — ambos aparecem na sidebar, home, e sao toggled por tenant
- **Platform layer**: shell (layout, sidebar, topnav), auth (Clerk), tenant management,
  module loader (registry, slots, extensions)

### 2.2 Spokes (Aplicacoes Externas)

Sistemas separados por cliente, cada um com seu repositorio, banco de dados e deploy.
Exemplos: sistema de gestao de casas de praia, dashboards financeiros.

- Cada spoke expoe uma **API padronizada** (contrato FXL) para que o hub consuma
- Cada spoke e construido seguindo padroes definidos pela **skill FXL SDK**
- Spokes podem ser projetos novos (scaffold do wireframe) ou refatoracoes de
  projetos existentes (ex: Lovable)

### 2.3 Skill FXL SDK

**Nao e um pacote npm.** E uma skill do Claude Code que contem:

- **Rules**: como scaffoldar, auditar, refatorar e conectar projetos
- **Templates**: configs de tsconfig, eslint, prettier, tailwind, vercel, CI/CD
- **Contract**: tipos TypeScript do contrato Hub <-> Spoke (copiados, nao importados)
- **Checklists**: verificacoes de seguranca, estrutura, TypeScript, RLS

A skill substitui o que seria uma CLI tradicional (`npx fxl init`, `npx fxl audit`)
porque o Claude Code com a skill faz analises infinitamente mais inteligentes
do que pattern matching estatico. Configs sao gerados como arquivos no projeto
(nao importados de pacote). CI roda scripts gerados pela skill (`fxl-doctor.sh`).

---

## 3. Decisao Arquitetural: Modular Monolith

### Opcoes consideradas

| Opcao | Descricao | Veredicto |
|-------|-----------|-----------|
| **A. Modular Monolith** | Projeto unico, modulos autocontidos por convencao | **Escolhida** |
| B. Workspace Packages | Monorepo com Turborepo/Nx, cada modulo e um pacote | Descartada |
| C. Polyrepo | Cada modulo em repo separado com SDK compartilhado | Descartada |

### Justificativa para Modular Monolith

1. **Equipe pequena + Claude Code**: velocidade de iteracao > isolamento teorico.
   12 milestones em 6 dias foi possivel porque tudo esta junto
2. **Agente orquestrador precisa de contexto 360**: polyrepo e workspace packages
   fragmentam o contexto. Com monolith, o agente root ve tudo
3. **Sistema de modulos ja existe**: ModuleDefinition, registry, slots, extensions
   esta 80% pronto. So precisa reorganizar diretorios e adicionar CLAUDE.md por modulo
4. **CLAUDE.md scoping resolve "agente por modulo"**: nao precisa de package boundary.
   Agente com contexto `src/modules/crm/CLAUDE.md` trabalha so naquele escopo
5. **CRM deve ser modulo, nao app separada**: compartilha auth, tenant data, shell.
   O valor esta na integracao (contatos do CRM dentro de tarefas, docs linkados a deals)

### Regra de decisao: Modulo vs Spoke

| Criterio | Modulo nativo | Spoke (app separada) |
|----------|--------------|---------------------|
| Compartilha auth/shell? | Sim | Nao (tem auth propria ou delegada) |
| Dados cross-module? | Sim (tasks <-> CRM) | Nao (dados isolados por dominio) |
| Mesmo publico-alvo? | Sim (operadores/gestores) | Pode ser diferente |
| Nicho muito especifico? | Nao | Sim (casas de praia, contabilidade) |
| Reusa UI do hub? | Sim (sidebar, home, slots) | Nao (UI propria) |
| Deploy independente? | Nao necessario | Sim |

**Exemplos**:
- CRM → **modulo** (compartilha auth, contatos linkam a clientes/tarefas)
- Gestao de casas de praia → **spoke** (nicho especifico, UI propria, deploy independente)
- Dashboard Conta Azul → **spoke** (sistema do cliente, dados financeiros isolados)
- Tarefas → **modulo** (cross-module com tudo)
- Wireframe Builder → **modulo** (ferramenta interna do hub)

---

## 4. Reorganizacao Interna do FXL Core

### 4.1 Estrutura atual (simplificada)

```
src/
  components/layout/        <- shell misturado
  components/docs/          <- componentes do modulo docs
  components/ui/            <- shadcn
  pages/                    <- paginas de todos os modulos
  modules/                  <- manifests + alguns modulos autocontidos
  lib/                      <- servicos misturados
```

### 4.2 Estrutura proposta

```
src/
  platform/                          <- tudo que e shell/infra da plataforma
    layout/                          <- Layout, Sidebar, TopNav
    auth/                            <- Clerk, ProtectedRoute
    tenants/                         <- NOVO: gestao de tenants (Clerk Orgs)
    module-loader/                   <- registry, slots, extension-registry
    router/                          <- logica de routing extraida do App.tsx

  modules/                           <- cada modulo 100% autocontido
    docs/
      CLAUDE.md                      <- instrucoes para agente deste modulo
      manifest.ts
      components/                    <- DocRenderer, Callout, etc.
      pages/                         <- paginas do modulo
      services/                      <- docs-service, docs-parser
      hooks/
      types/
    tasks/
      CLAUDE.md
      manifest.ts
      components/
      pages/
      extensions/
      hooks/
      types/
    clients/
      CLAUDE.md
      manifest.ts
      components/
      pages/
      services/
      types/
    wireframe/                       <- renomear "ferramentas" -> "wireframe"
      CLAUDE.md
      manifest.ts
      components/
      pages/
      types/

  shared/                            <- so o que 2+ modulos usam
    ui/                              <- shadcn (vem de components/ui/)
    hooks/
    types/
    utils/

  App.tsx                            <- simplificado (delega para platform/router)
```

### 4.3 Regras de import

- `src/modules/X/` pode importar de `src/shared/` e `@tools/`
- `src/modules/X/` **NAO** pode importar de `src/modules/Y/`
- `src/platform/` pode importar de `src/shared/` e le manifests dos modulos
- Cross-module so via registry + extensions (padrao existente)
- `@tools/wireframe-builder/` continua como alias externo

**Wireframe e uma excecao hibrida**: o modulo `src/modules/wireframe/` contem
manifest, pages e hooks, mas os componentes visuais continuam em
`tools/wireframe-builder/components/` (importados via `@tools/`). Isso porque
os componentes do builder sao reutilizados em contextos fora do modulo
(export para spokes, renderizacao em clients). Essa excecao e aceita e documentada.

### 4.4 Manifesto de migracao de arquivos

Mapeamento explicito de cada arquivo/diretorio para sua nova localizacao:

**src/lib/ (servicos):**

| Arquivo atual | Destino | Motivo |
|---------------|---------|--------|
| `lib/supabase.ts` | `platform/supabase.ts` | Infra da plataforma |
| `lib/docs-service.ts` | `modules/docs/services/docs-service.ts` | Especifico do modulo docs |
| `lib/docs-parser.ts` | `modules/docs/services/docs-parser.ts` | Especifico do modulo docs |
| `lib/search-index.ts` | `modules/docs/services/search-index.ts` | Busca e parte do modulo docs |
| `lib/tasks-service.ts` | `modules/tasks/services/tasks-service.ts` | Especifico do modulo tasks |
| `lib/tasks-service.test.ts` | `modules/tasks/services/tasks-service.test.ts` | Teste do servico |
| `lib/kb-service.ts` | **REMOVER** | Knowledge Base descartado |
| `lib/kb-service.test.ts` | **REMOVER** | Knowledge Base descartado |
| `lib/activity-feed.ts` | `platform/services/activity-feed.ts` | Usado pela Home (platform-level) |
| `lib/module-stats.ts` | `platform/services/module-stats.ts` | Usado pela Home (platform-level) |
| `lib/utils.ts` | `shared/utils/index.ts` | Utilidades cross-module |

**src/components/:**

| Arquivo/dir atual | Destino | Motivo |
|-------------------|---------|--------|
| `components/layout/` | `platform/layout/` | Shell da plataforma |
| `components/docs/` | `modules/docs/components/` | Especifico do modulo docs |
| `components/ui/` | `shared/ui/` | shadcn usado por todos |
| `components/ProtectedRoute.tsx` | `platform/auth/ProtectedRoute.tsx` | Auth da plataforma |

**src/pages/:**

| Arquivo/dir atual | Destino | Motivo |
|-------------------|---------|--------|
| `pages/Home.tsx` | `platform/pages/Home.tsx` | Pagina da plataforma |
| `pages/Login.tsx` | `platform/auth/Login.tsx` | Auth da plataforma |
| `pages/Profile.tsx` | `platform/auth/Profile.tsx` | Auth da plataforma |
| `pages/DocRenderer.tsx` | `modules/docs/pages/DocRenderer.tsx` | Modulo docs |
| `pages/SharedWireframeView.tsx` | `modules/wireframe/pages/SharedWireframeView.tsx` | Modulo wireframe |
| `pages/clients/` | `modules/clients/pages/` | Modulo clients |
| `pages/docs/ProcessDocsViewer.tsx` | **REMOVER** | Codigo morto (135 linhas, nao usado) |
| `pages/tools/ComponentGallery.tsx` | `modules/wireframe/pages/ComponentGallery.tsx` | Modulo wireframe |

**src/modules/ (mover para module-loader):**

| Arquivo atual | Destino | Motivo |
|---------------|---------|--------|
| `modules/registry.ts` | `platform/module-loader/registry.ts` | Infra do module system |
| `modules/module-ids.ts` | `platform/module-loader/module-ids.ts` | Constantes do system |
| `modules/extension-registry.ts` | `platform/module-loader/extension-registry.ts` | Resolucao de extensions |
| `modules/slots.tsx` | `platform/module-loader/slots.tsx` | Provider + ExtensionSlot |
| `modules/hooks/useModuleEnabled.tsx` | `platform/module-loader/hooks/useModuleEnabled.tsx` | Hook do system |
| `modules/knowledge-base/` | **REMOVER** | Modulo descartado |

**App.tsx:**

| O que muda | Detalhes |
|------------|---------|
| Routing logic | Extrair para `platform/router/AppRouter.tsx` |
| Knowledge Base routes | **REMOVER** (linhas 51-56 do App.tsx atual) |
| Provider stack | Manter em App.tsx (BrowserRouter, ModuleEnabled, Extension) |
| App.tsx final | Import simplificado: `<AppRouter />` dentro dos providers |

### 4.5 Remocoes

- **Knowledge Base**: modulo (`src/modules/knowledge-base/`), servico (`lib/kb-service.ts`
  + `lib/kb-service.test.ts`), ID (`MODULE_IDS.KNOWLEDGE_BASE`), entrada no registry,
  rotas no App.tsx
- **Codigo morto**: `pages/docs/ProcessDocsViewer.tsx` (135 linhas, nao importado),
  `components/docs/PageHeader.tsx` (duplicado — manter versao em `components/docs/DocPageHeader.tsx`),
  `components/docs/PromptBlock.tsx` (duplicado — manter versao dentro do docs module)

---

## 5. Multi-tenancy com Clerk Organizations

### 5.1 Modelo

- Cada empresa = uma **Organization** no Clerk
- Cada org tem **membros** com **roles** (admin, member, viewer)
- FXL (a empresa) e o primeiro tenant/org
- Modulos habilitados **por org** (migra de localStorage para Supabase)

### 5.2 Clerk-Supabase JWT Bridge

O FXL Core atualmente usa Clerk para auth de app e Supabase anon key para dados
(padrao "anon-permissive"). Para multi-tenancy com RLS por org_id, precisamos
que o JWT enviado ao Supabase contenha o `org_id` do Clerk.

**Abordagem escolhida: Supabase Edge Function como token exchange.**

Fluxo:
1. User faz login via Clerk, seleciona org ativa
2. Frontend obtem Clerk session token (com `org_id` no payload)
3. Frontend chama Edge Function `/auth/token-exchange` com Clerk token
4. Edge Function valida Clerk token (via JWKS), extrai `org_id`, `user_id`, `role`
5. Edge Function minta JWT customizado usando Supabase JWT secret com claims:
   `{ sub: user_id, org_id: org_id, role: role }`
6. Frontend usa esse JWT customizado como Supabase access token
7. RLS policies leem `org_id` do JWT

**Por que Edge Function e nao JWT template direto:**
- Supabase nao aceita JWTs de issuers externos sem configuracao do JWT secret
- Edge Function permite validacao, transformacao e logging centralizado
- Unico ponto de integracao Clerk<->Supabase

**Fallback para dev/staging:** manter suporte ao anon key (sem org_id)
com flag `VITE_AUTH_MODE=anon|org`. Em modo anon, RLS fica permissivo
(comportamento atual). Em modo org, RLS exige org_id.

### 5.3 Fluxo completo

1. User faz login via Clerk
2. Clerk retorna `organizationMemberships[]`
3. FXL Core mostra org picker (ou auto-seleciona se so tem uma)
4. Frontend chama token exchange para obter JWT Supabase com org_id
5. Sidebar, home, modulos filtrados pela org ativa
6. Supabase RLS usa `org_id` do JWT para isolar dados
7. Connector modules usam Clerk org token para autenticar nas spokes

### 5.4 Schema Supabase

```sql
-- Modulos habilitados por tenant
create table tenant_modules (
  org_id text not null,           -- Clerk organization ID
  module_id text not null,        -- MODULE_IDS value
  enabled boolean default true,
  config jsonb default '{}',      -- configuracao por tenant/modulo
  created_at timestamptz default now(),
  primary key (org_id, module_id)
);

-- RLS: usuario so ve modulos da org que pertence
-- org_id vem do JWT customizado mintado pela Edge Function
alter table tenant_modules enable row level security;
create policy "tenant_modules_org_access" on tenant_modules
  for all using (
    org_id = (current_setting('request.jwt.claims')::jsonb->>'org_id')
  );
```

**Migracao de dados existentes:**
- Todas as tabelas existentes (documents, comments, blueprints, briefings, tasks)
  recebem coluna `org_id text` com default = ID da org FXL
- Backfill: `UPDATE documents SET org_id = 'org_fxl_default' WHERE org_id IS NULL`
- Novas RLS policies adicionadas a cada tabela existente
- localStorage module toggles migrados para `tenant_modules` na primeira execucao

### 5.5 Mudancas nos hooks

```typescript
// Hook 1: gestao de organizacao (NOVO)
function useActiveOrg(): {
  activeOrg: ClerkOrganization | null
  orgs: ClerkOrganization[]
  switchOrg: (orgId: string) => void
  isLoading: boolean
}

// Hook 2: modulos habilitados (REFATORADO)
// Depende de useActiveOrg() internamente
function useModuleEnabled(): {
  enabledModules: Set<ModuleId>      // filtrado por org ativa
  isLoading: boolean                  // true enquanto carrega tenant_modules
  error: Error | null
}

// Estrategia de dados:
// - Initial load: fetch tenant_modules WHERE org_id = activeOrg.id
// - Cache: React state (nao precisa de React Query por ser dado pequeno)
// - Fallback se Supabase falhar: todos os modulos habilitados (graceful degradation)
```

### 5.6 Mudancas no ModuleDefinition

```typescript
interface ModuleDefinition {
  id: ModuleId
  label: string
  description: string
  route: string
  icon: LucideIcon
  status: ModuleStatus
  tenantScoped?: boolean     // default false = aparece pra todos
  navChildren?: NavItem[]
  routeConfig?: RouteObject[]
  extensions?: ModuleExtension[]
}
```

---

## 6. Contrato de API (Hub <-> Spoke)

### 6.1 Tipos do contrato

```typescript
/** Metadados que toda spoke expoe */
interface FxlAppManifest {
  appId: string              // "beach-houses"
  appName: string            // "Gestao Casas de Praia"
  version: string
  entities: EntityDefinition[]
  dashboardWidgets: WidgetDefinition[]
}

/** Definicao de uma entidade */
interface EntityDefinition {
  type: string               // "reservation", "property"
  label: string              // "Reserva", "Imovel"
  labelPlural: string
  icon: string               // nome do icone lucide
  fields: FieldDefinition[]
  defaultSort: { field: string; order: 'asc' | 'desc' }
}

/** Campo de uma entidade */
interface FieldDefinition {
  key: string                // "checkIn"
  label: string              // "Check-in"
  type: 'string' | 'number' | 'date' | 'boolean' | 'enum' | 'relation'
  required?: boolean
  enumValues?: string[]
  relationTo?: string        // outra entity type
}

/** Widget para o dashboard do Hub */
interface WidgetDefinition {
  id: string
  label: string
  type: 'kpi' | 'chart' | 'table' | 'list'
  endpoint: string           // rota relativa
}
```

### 6.2 Endpoints obrigatorios

**v1 (read-only):** O connector e inicialmente somente leitura. O hub exibe dados
das spokes mas nao permite editar. Para modificar dados, o usuario acessa a spoke
diretamente. Endpoints de mutacao (POST, PUT, DELETE) serao adicionados em milestone
futuro conforme necessidade real.

| Endpoint | Metodo | Retorna |
|----------|--------|---------|
| `/api/fxl/manifest` | GET | `FxlAppManifest` |
| `/api/fxl/entities/:type` | GET | Lista paginada `{ data: T[], total, page, pageSize }` |
| `/api/fxl/entities/:type/:id` | GET | Entidade individual |
| `/api/fxl/widgets/:id/data` | GET | Dados para widget (formato por tipo — ver 6.5) |
| `/api/fxl/search?q=` | GET | Busca cross-entidade `{ results: SearchResult[] }` |
| `/api/fxl/health` | GET | `{ status: 'ok', version, contractVersion: '1.0' }` |

**v1 field types suportados:** `string`, `number`, `date`, `boolean`.
Os tipos `enum` e `relation` sao adiados para v2 do contrato. Isso simplifica
a UI generica do connector (sem dropdowns, sem resolucao de referencias).

### 6.3 Autenticacao entre Hub e Spokes

**Modelo: API key por spoke (service-to-service)**

Hub e spokes tem autenticacao INDEPENDENTE. Cada spoke pode usar qualquer provider
de auth (Supabase Auth, Clerk, Firebase, etc.). A comunicacao hub→spoke usa API key
dedicada para cada connector.

**Como funciona:**
1. Operador cadastra connector no hub com `{appId, baseUrl, apiKey}`
2. Hub armazena config na tabela `tenant_modules` (coluna `config` JSONB)
3. Quando hub faz request para spoke, inclui header `X-FXL-API-Key: <api_key>`
4. Spoke valida API key no middleware dos endpoints `/api/fxl/*`
5. Spoke retorna dados — sem conhecimento de Clerk ou do hub auth

**Por que nao Clerk compartilhado:**
- Spokes sao produtos independentes que podem escalar sozinhos
- Acoplar auth ao hub limita evolucao da spoke (pricing, provider, user pool)
- API key e suficiente para contrato v1 read-only
- Quando mutations vierem (v2), user context via headers customizados (`X-FXL-User-Id`, `X-FXL-Org-Id`)

**Seguranca:**
- API key protegida por RLS no Supabase (apenas org dona ve a key)
- API key trafega no header (nao na URL)
- Para ferramentas internas (operadores confiados), exposicao no browser e aceitavel
- Para producao com usuarios externos: proxy via Edge Function (melhoria futura)

**Spoke-side middleware (exemplo):**
```typescript
// middleware/fxl-auth.ts — valida API key nos endpoints /api/fxl/*
export function validateFxlApiKey(req: Request): boolean {
  const apiKey = req.headers.get('X-FXL-API-Key')
  if (!apiKey) return false
  // Compare against stored key (env var or database)
  return apiKey === process.env.FXL_API_KEY
}
```

**Implicacao:** Spokes NAO precisam usar a mesma Clerk app que o hub.
Cada spoke gerencia seus proprios usuarios e auth de forma independente.

### 6.4 Tratamento de erros hub-spoke

| Cenario | Comportamento |
|---------|---------------|
| Spoke offline/timeout (5s) | Connector mostra badge "Offline" + ultimo dado cacheado se disponivel |
| Spoke retorna 401 | Re-tentar com token refreshed. Se falhar, mostrar "Reconectar" |
| Spoke retorna 500 | Mostrar erro generico no card do connector. Nao propagar para app |
| Clerk offline | App inteira em modo degradado (redirect para pagina de status) |
| Manifest invalido | Desabilitar connector, logar erro, notificar admin |

### 6.5 Widget data format

Cada widget type tem formato de resposta esperado:

```typescript
// KPI widget
{ value: number | string, label: string, trend?: number, prefix?: string, suffix?: string }

// Chart widget
{ labels: string[], datasets: { label: string, data: number[] }[] }

// Table widget
{ columns: { key: string, label: string }[], rows: Record<string, unknown>[] }

// List widget
{ items: { id: string, title: string, subtitle?: string, badge?: string }[] }
```

### 6.6 Connector Module no Hub

O connector e um modulo generico que sabe renderizar dados de qualquer spoke:

```typescript
// src/modules/connector/
// Nao e 1 connector por spoke — e 1 connector generico que le o manifest

interface ConnectorConfig {
  appId: string
  baseUrl: string
  // tudo mais vem do /api/fxl/manifest
}

// Registrado via tenant_modules:
// { org_id: "org_abc", module_id: "connector:beach-houses",
//   config: { appId: "beach-houses", baseUrl: "https://beach.fxl.app" } }
```

O connector:
1. Faz GET `/api/fxl/manifest` para descobrir entidades e widgets
2. Gera rotas dinamicas: `/apps/beach-houses/reservations`, `/apps/beach-houses/properties`
3. Renderiza UI generica (tabelas, detail views) baseada nos `FieldDefinition[]`
4. Injeta widgets no HOME_DASHBOARD via extensions

**Roteamento dinamico:** O connector nao depende de `routeConfig` estatico no manifest.
Em vez disso, o modulo connector registra uma rota catch-all `/apps/:appId/*` e
internamente usa o manifest da spoke para resolver sub-rotas. Isso funciona porque:
- O `ModuleDefinition` do connector tem `routeConfig: [{ path: '/apps/*', element: <ConnectorRouter /> }]`
- `ConnectorRouter` le a lista de connectors habilitados para o tenant
- Para cada connector, faz GET `/api/fxl/manifest` (cacheado)
- Gera rotas internas baseado nas entities do manifest
- Sidebar entries sao gerados dinamicamente a partir dos connectors habilitados

**Lucide icon mapping:** O campo `icon` nas entities e widgets usa nomes de icone
lucide-react (ex: "calendar", "home", "dollar-sign"). O connector mantem um
`Record<string, LucideIcon>` mapeando os ~100 icones mais comuns. Icones nao
encontrados usam fallback `Box`.

---

## 7. FXL SDK como Skill do Claude Code

### 7.1 Por que skill e nao npm package

| Aspecto | npm package | Skill Claude Code |
|---------|-------------|-------------------|
| Inteligencia | Pattern matching estatico | Analise contextual com IA |
| Manutencao | Versionar, publicar, instalar | Atualizar arquivo, pronto |
| Configs | Importados via `extends` | Gerados como arquivos no projeto |
| Tipos | Importados via `import` | Copiados para o projeto |
| CI | `npx fxl doctor` | `bash fxl-doctor.sh` (script gerado) |
| Custo | Setup npm/registry | Zero setup alem do Claude Code |

### 7.2 Estrutura do repositorio

```
fxl-sdk/
  SKILL.md                         <- entry point da skill

  rules/
    standards.md                   <- padroes de codigo, seguranca, estrutura
    new-project.md                 <- como scaffoldar projeto novo
    new-project-from-blueprint.md  <- scaffold a partir de export do Wireframe Builder
    audit.md                       <- como auditar projeto existente
    connect.md                     <- como adicionar contrato FXL
    refactor.md                    <- padroes de refatoracao
    ci-cd.md                       <- como configurar GitHub Actions
    deploy.md                      <- padroes de deploy Vercel

  contract/
    types.ts                       <- tipos do contrato (copiados pro projeto)

  templates/
    CLAUDE.md.template             <- CLAUDE.md padrao pra projetos FXL
    tsconfig.json.template
    eslint.config.js.template
    prettier.config.js.template
    tailwind.preset.js.template
    vercel.json.template
    ci.yml.template
    fxl-doctor.sh.template         <- script pra CI

  checklists/
    security-checklist.md
    structure-checklist.md
    typescript-checklist.md
    rls-checklist.md
    contract-checklist.md
```

### 7.3 Cenarios de uso

**Projeto novo (do Wireframe Builder):**
- User exporta blueprint do Wireframe Builder como `blueprint-export.json`
- User pede ao Claude Code: "cria projeto novo a partir deste blueprint"
- Skill le `rules/new-project-from-blueprint.md`
- Claude Code cria repo com estrutura padrao, componentes das secoes,
  configs, CLAUDE.md, CI/CD, endpoints do contrato, migrations Supabase

**Refatoracao de projeto existente (ex: Beach House Lovable):**
- User abre Claude Code no repo existente
- User pede: "audita esse projeto contra os padroes FXL"
- Skill le `rules/audit.md` + `checklists/`
- Claude Code analisa o projeto e gera `FXL-AUDIT.md` com:
  - Score de conformidade
  - Itens criticos, importantes, normais
  - Plano de refatoracao sugerido
  - Opcionalmente gera ROADMAP GSD

**Dia-a-dia:**
- CLAUDE.md do projeto (gerado pela skill) contem os padroes
- Claude Code ja sabe as regras ao trabalhar em qualquer projeto spoke
- Toda alteracao segue os padroes automaticamente

### 7.4 Blueprint Export (Wireframe Builder -> Spoke)

```typescript
interface BlueprintExport {
  client: {
    name: string              // "Casas de Praia"
    slug: string              // "beach-houses"
    branding: BrandingConfig
  }
  sections: SectionConfig[]   // secoes do wireframe (ja existem no BlueprintConfig)
  entities: {                 // preenchido pelo operador no wireframe
    type: string              // "reservation"
    fields: FieldDefinition[] // definido manualmente (nao inferido)
  }[]
  pages: {                    // agrupamento de secoes em paginas
    slug: string
    label: string
    sections: string[]        // IDs das secoes
  }[]
}
```

**Entidades sao definidas manualmente, nao inferidas automaticamente.**
O operador preenche a lista de entidades durante a fase de wireframe como parte
do blueprint. O Wireframe Builder pode sugerir entidades com base nas secoes
(DataTable columns -> campos sugeridos), mas o operador valida e ajusta.
Inferencia automatica e ambigua demais (ex: coluna "Cliente" pode ser string,
enum ou relation) e gera mais retrabalho do que economia.

### 7.5 CI/CD padrao

Script `fxl-doctor.sh` gerado pela skill, roda sem Claude Code:

```bash
#!/bin/bash
set -e
echo "FXL Doctor — Verificacao de conformidade"
npx tsc --noEmit              # type-check
npx eslint .                  # lint
npx prettier --check .        # formatting
# security headers check (ESM-compatible)
node --input-type=module -e "
  import { readFileSync } from 'fs';
  const v = JSON.parse(readFileSync('./vercel.json', 'utf8'));
  const h = v.headers?.[0]?.headers?.map(h => h.key) || [];
  const req = ['X-Frame-Options','X-Content-Type-Options'];
  const miss = req.filter(r => !h.includes(r));
  if (miss.length) { console.error('Missing:', miss); process.exit(1); }
"
# contract version check
node --input-type=module -e "
  import { readFileSync } from 'fs';
  const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));
  const v = pkg.fxlContractVersion;
  if (!v) { console.error('Missing fxlContractVersion in package.json'); process.exit(1); }
  const MIN = '1.0';
  if (v < MIN) { console.error('Contract version', v, '< required', MIN); process.exit(1); }
"
echo "FXL Doctor — OK"
```

**Versionamento do contrato:** cada spoke tem `"fxlContractVersion": "1.0"` no
`package.json`. O hub valida versao minima ao fazer GET `/api/fxl/health`
(que retorna `contractVersion`). `fxl-doctor.sh` valida no CI.

GitHub Actions (`ci.yml`) roda `fxl-doctor.sh` em todo push/PR.

---

## 8. Camada de IA (Futuro)

### 8.1 IA no Hub (FXL Core)

- Assistente contextual que entende todos os dados do tenant
  (modulos nativos + dados de spokes via contrato)
- Busca semantica cross-modulo (tarefas + CRM + docs + dados de spokes)
- Vector DB (ex: pgvector no Supabase) armazena embeddings de:
  - Documentos do modulo Docs
  - Entidades do CRM (contatos, deals)
  - Dados de spokes (via `/api/fxl/search` + embeddings)

### 8.2 IA nas Spokes

- Cada spoke pode ter IA propria mais especializada no dominio
- Embeddings locais do dominio (reservas, imoveis, financeiro)
- Pode expor embeddings via contrato para o hub agregar

### 8.3 Implementacao (adiada)

Esta camada e posterior aos milestones v3.0-v3.3. Pre-requisitos:
- Multi-tenancy funcionando (v3.1)
- Contrato de API estavel (v3.2 + v3.3)
- Nota: v3.4/v3.5 foram descontinuadas — evolucao continua via v4.x spec

---

## 9. Ordem de Execucao (Milestones)

| # | Milestone | Entrega | Dependencia |
|---|-----------|---------|-------------|
| **v3.0** | Reorganizacao modular | Mover arquivos para nova estrutura. Remover Knowledge Base. Zero mudanca funcional. | — |
| **v3.1** | Multi-tenancy | Clerk Organizations, org picker, tenant_modules, RLS por org_id. FXL como primeiro tenant. | v3.0 |
| **v3.2** | FXL SDK (Skill) | Criar repo fxl-sdk com skill completa: rules, templates, contract, checklists. | v3.0 |
| **v3.3** | Connector module generico | Modulo no FXL Core que consome qualquer spoke via contrato. UI generica. Admin UI para gerenciar connectors. | v3.0 + v3.2 |

**Nota sobre spoke projects (ex: Sitio Santa Cruz):**

O onboarding de spokes NAO e milestone do FXL Core. E trabalho feito no repo da spoke,
guiado pelo FXL SDK skill. O processo esta documentado em `docs/processo/spoke-onboarding.md`.

Passos para conectar uma spoke ao hub:
1. No repo da spoke: usar FXL SDK skill para auditar e implementar contrato
2. No hub: cadastrar connector via Admin UI (`/admin/connectors`)
3. Verificar dados aparecendo no hub via connector module

**Grafo de dependencias atualizado:**

```
v3.0 (reorganizacao) ──> v3.1 (multi-tenancy)
  |
  |──> v3.2 (SDK skill) ──> v3.3 (connector + admin UI)
  |                     \
  |                      ──> Spoke onboarding (repo externo, guiado por SDK)
  |                                    \
  |                                     ──> Configurar connector no hub (quick task)
```

**Paralelismo possivel:**
- v3.1 e v3.2 podem rodar em paralelo (hub auth vs SDK skill)
- v3.3 depende de v3.2 (connector usa tipos do contrato)
- Spoke onboarding pode iniciar assim que v3.2 estiver pronto
- Configuracao do connector no hub e um quick task apos spoke ter contrato implementado

---

## 10. Fora do Escopo (Explicitamente Adiado)

- Drag-and-drop no Wireframe Builder
- Real-time collaborative editing (CRDT)
- Mobile apps
- Modulo CRM (milestone futuro)
- IA runtime / vector DB (milestone futuro)
- React Query / loading states globais
- Code splitting / lazy loading (pode entrar em v3.0 como bonus)
- Testes automatizados (divida tecnica reconhecida, sera enderecard separadamente)

---

## 11. Riscos e Mitigacoes

| Risco | Impacto | Mitigacao |
|-------|---------|-----------|
| Reorganizacao modular quebra imports | Alto | v3.0 e refactor puro, zero mudanca funcional. `tsc --noEmit` como gate. |
| Clerk Organizations tem custo | Medio | Verificar plano Clerk atual. Free tier suporta 5 orgs. |
| Contrato de API muito rigido | Medio | Comecar simples (manifest + entities). Iterar com base no Beach House real. |
| Config drift entre spokes | Baixo | Skill verifica conformidade ao abrir projeto. CI roda fxl-doctor. |
| Complexidade do connector generico | Alto | Comecar com UI basica (tabela + detail). Evoluir conforme necessidade real. |

---

## 12. Criterios de Sucesso

- [ ] v3.0: `tsc --noEmit` zero erros apos reorganizacao. Todas as paginas funcionam identico ao antes.
  Checklist manual de verificacao v3.0:
  - [ ] Home page renderiza com widgets
  - [ ] Navegacao sidebar funciona (todos os links)
  - [ ] DocRenderer abre e renderiza docs corretamente
  - [ ] Busca (Cmd+K) funciona
  - [ ] Login/logout funciona
  - [ ] Pagina de cliente (briefing, blueprint, wireframe) abre
  - [ ] ComponentGallery renderiza
  - [ ] SharedWireframeView (rota publica) funciona
  - [ ] Admin modules toggle funciona
  - [ ] Dark mode funciona em todas as paginas
  - [ ] Build de producao (`npm run build`) completa sem erros
- [ ] v3.1: Login com 2+ orgs mostra org picker. Modulos filtrados por org. RLS isolando dados.
- [ ] v3.2: Skill funciona: `audita este projeto` gera relatorio. Template gera projeto valido.
- [ ] v3.3: Connector renderiza entidades de um mock spoke. Widgets aparecem na home.
- ~~v3.4: Beach House~~ — DESCONTINUADA (superseded by v4.x evolution spec)
- ~~v3.5: Beach House no FXL Core~~ — DESCONTINUADA (superseded by v4.x evolution spec)
