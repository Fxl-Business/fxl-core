# Roadmap: FXL Core — v2.1 Dynamic Data Layer

## Milestones

- ✅ **v1.0 MVP** - Phases 1-6 (shipped 2026-03-09) — see milestones/v1.0-ROADMAP.md
- ✅ **v1.1 Wireframe Evolution** - Phases 7-11 (shipped 2026-03-10) — see milestones/v1.1-ROADMAP.md
- ✅ **v1.2 Visual Redesign** - Phases 12-16 (shipped 2026-03-11) — see milestones/v1.2-ROADMAP.md
- ✅ **v1.3 Builder & Components** - Phases 17-21 (shipped 2026-03-11) — see milestones/v1.3-ROADMAP.md
- ✅ **v1.4 Wireframe Visual Redesign** - Phases 22-28 (shipped 2026-03-13) — see milestones/v1.4-ROADMAP.md
- ✅ **v1.5 Modular Foundation & Knowledge Base** - Phases 29-33 (shipped 2026-03-13) — see milestones/v1.5-ROADMAP.md
- ✅ **v1.6 12 Novos Graficos** - Phases 34-37 (shipped 2026-03-13) — see milestones/v1.6-ROADMAP.md
- ✅ **v2.0 Framework Shell + Arquitetura Modular** - Phases 38-42 (shipped 2026-03-13) — see milestones/v2.0-ROADMAP.md
- 🚧 **v2.1 Dynamic Data Layer** - Phases 43-46 (in progress)

## Phases

### 🚧 v2.1 Dynamic Data Layer (In Progress)

**Milestone Goal:** Migrar todos os dados de processo/documentacao de arquivos .md estaticos para Supabase, renderizando dinamicamente na app enquanto mantem acesso do Claude Code via sync bidirecional.

- [x] **Phase 43: Database Schema** - Criar tabela documents no Supabase com indexes e RLS (completed 2026-03-13)
- [ ] **Phase 44: Data Migration** - Seed script migra todos os 62 .md de docs/ para Supabase
- [ ] **Phase 45: Dynamic Rendering** - DocRenderer, search index e sidebar consomem dados do banco
- [ ] **Phase 46: Sync CLI** - make sync-down e make sync-up para fluxo bidirecional Claude Code

## Phase Details

### Phase 43: Database Schema
**Goal**: Supabase tem tabela `documents` pronta para armazenar todo o conteudo de docs/ com performance e acesso publico
**Depends on**: Nothing (first phase of milestone)
**Requirements**: DB-01, DB-02, DB-03
**Success Criteria** (what must be TRUE):
  1. Tabela `documents` existe no Supabase com colunas title, badge, description, slug, parent_path, body, order, created_at, updated_at
  2. Queries por slug retornam resultado em menos de 50ms com o index criado
  3. Acesso anonimo (anon key) consegue fazer SELECT sem autenticacao
  4. Migration SQL pode ser re-aplicada via `make migrate` sem erros
**Plans**: TBD

### Phase 44: Data Migration
**Goal**: Todo o conteudo atual de docs/ (62 arquivos) esta armazenado e disponivel no Supabase com estrutura e ordering preservados
**Depends on**: Phase 43
**Requirements**: MIG-01, MIG-02, MIG-03
**Success Criteria** (what must be TRUE):
  1. Seed script executa sem erros e insere todos os 62 documentos na tabela documents
  2. Custom tags ({% operational %}, {% callout %}, {% prompt %}, {% phase-card %}) aparecem intactos no campo body
  3. Campo parent_path reflete a estrutura de diretorios (ex: `docs/processo/fases/` para fase1.md)
  4. Campo order preserva a ordenacao relativa entre documentos dentro do mesmo parent_path
**Plans**: TBD

### Phase 45: Dynamic Rendering
**Goal**: A aplicacao renderiza todos os docs a partir do Supabase — sem nenhuma dependencia de Vite glob ou arquivos estaticos para conteudo de docs
**Depends on**: Phase 44
**Requirements**: DYN-01, DYN-02, DYN-03, DYN-04, DYN-05
**Success Criteria** (what must be TRUE):
  1. Abrir qualquer pagina de doc (ex: /docs/processo/fase1) exibe o conteudo correto vindo do banco
  2. Busca global (Cmd+K) encontra documentos a partir dos dados do Supabase, nao de arquivos locais
  3. Sidebar do modulo de documentacao lista as secoes e paginas corretas com base na tabela documents
  4. Skeleton ou spinner aparece enquanto o documento esta sendo carregado do banco
  5. Custom tags (callout, operational, prompt) continuam renderizando corretamente apos a migracao
**Plans**: TBD

### Phase 46: Sync CLI
**Goal**: Claude Code pode sincronizar conteudo entre banco e sistema de arquivos em ambas as direcoes com um unico comando make
**Depends on**: Phase 45
**Requirements**: SYNC-01, SYNC-02, SYNC-03, SYNC-04
**Success Criteria** (what must be TRUE):
  1. `make sync-down` exporta todos os documentos do Supabase criando/atualizando os .md em docs/ com frontmatter correto
  2. `make sync-up` le todos os .md de docs/ e faz upsert no Supabase sem duplicar registros
  3. `make sync-down` restaura a estrutura exata de diretorios (docs/processo/fases/fase1.md etc.)
  4. Os scripts CLI usam `process.env` e `npx tsx --env-file .env.local` — compativel com o padrao CLI existente
**Plans**: TBD

## Progress

**Execution Order:** 43 → 44 → 45 → 46

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 43. Database Schema | 1/1 | Complete    | 2026-03-13 |
| 44. Data Migration | 0/TBD | Not started | - |
| 45. Dynamic Rendering | 0/TBD | Not started | - |
| 46. Sync CLI | 0/TBD | Not started | - |
