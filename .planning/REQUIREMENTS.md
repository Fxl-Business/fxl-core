# Requirements: FXL Core

**Defined:** 2026-03-12
**Core Value:** FXL Core e o cerebro operacional da empresa — documentacao, processo e tooling juntos para que o Claude Code tenha contexto completo ao executar qualquer tarefa

## v1.5 Requirements

Requirements for Modular Foundation & Knowledge Base milestone. Each maps to roadmap phases.

### Modular Architecture

- [x] **MOD-01**: Module registry com ModuleManifest tipado (id, label, route, icon, status) em src/modules/registry.ts
- [x] **MOD-02**: Folder structure por modulo: src/modules/[name]/ com pages/, components/, hooks/, types/
- [x] **MOD-03**: Sidebar e App.tsx consomem MODULE_REGISTRY para rotas e navegacao
- [x] **MOD-04**: Wrapper manifests para docs e wireframe-builder (registrados no registry sem mover codigo)

### Knowledge Base

- [x] **KB-01**: Tabela kb_entries no Supabase com 4 tipos (bug, decision, pattern, lesson), tags, client_slug
- [ ] **KB-02**: Pagina de listagem /knowledge-base com filtro por tipo, tags e cliente
- [ ] **KB-03**: Pagina de detalhe /knowledge-base/:id com render markdown e metadados
- [ ] **KB-04**: Formulario de criacao/edicao com type selector, markdown body, tags, client_slug
- [ ] **KB-05**: Full-text search via tsvector/tsquery (portugues) com pagina de busca
- [ ] **KB-06**: Entries do tipo 'decision' seguem formato ADR (Context, Decision, Consequences)
- [ ] **KB-07**: Resultados de KB integrados no Cmd+K (async fetch, grupo separado)

### Tarefas

- [x] **TASK-01**: Tabela tasks no Supabase com status enum, priority, client_slug, due_date
- [ ] **TASK-02**: Pagina de listagem /tarefas com filtro por status, cliente, prioridade
- [ ] **TASK-03**: Formulario de criacao/edicao com titulo, descricao, status, priority, due_date, client_slug
- [ ] **TASK-04**: Kanban view /tarefas/kanban com 4 colunas (todo, in_progress, done, blocked), mudanca via click
- [ ] **TASK-05**: Botao "Documentar" em tarefas done que pre-preenche KB entry (bug ou decision)

### Home Page

- [ ] **HOME-01**: Module hub com grid de cards lendo MODULE_REGISTRY (Docs, WF Builder, Clientes, KB, Tarefas)
- [ ] **HOME-02**: Activity feed com ultimas 10 atualizacoes cross-module (kb_entries, tasks, comments)
- [ ] **HOME-03**: Secao "Conhecimento" na pagina do cliente mostrando KB entries daquele client_slug

## Future Requirements

Deferred to future release. Tracked but not in current roadmap.

### Knowledge Base (v2)

- **KB-08**: Auto-capture de KB entries via GSD hooks (propoe entry apos conclusao de fase)
- **KB-09**: Versionamento de entries (historico de edicoes)
- **KB-10**: AI summary generation de entries acumuladas

### Tarefas (v2)

- **TASK-06**: Drag-and-drop no kanban via @dnd-kit
- **TASK-07**: Task dependencies / blocking graph
- **TASK-08**: Notificacoes por email de task assignments

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time collaboration / live cursors | Single-operator internal tool, optimistic locking sufficient |
| AI-generated KB summaries | KB entries already Claude-authored; summarizing AI output adds indirection |
| Task dependencies / blocking graph | Overkill for small team; use description to reference related tasks |
| Multiple projects per client (hierarchy) | Tasks belong to client directly in v1.5; project entity in v2 |
| Kanban drag-and-drop | Click-to-change status sufficient; @dnd-kit deferred to v2 |
| Email notifications | Requires email service; in-app activity feed sufficient |
| External tool sync (Linear, Jira, GitHub) | FXL Core is the source of truth; no sync in v1.5 |
| KB entry versioning/history | Show timestamps only; full audit trail in v2 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| MOD-01 | Phase 29 | Complete |
| MOD-02 | Phase 29 | Complete |
| MOD-03 | Phase 29 | Complete |
| MOD-04 | Phase 29 | Complete |
| KB-01 | Phase 30 | Complete |
| KB-02 | Phase 31 | Pending |
| KB-03 | Phase 31 | Pending |
| KB-04 | Phase 31 | Pending |
| KB-05 | Phase 31 | Pending |
| KB-06 | Phase 31 | Pending |
| KB-07 | Phase 33 | Pending |
| TASK-01 | Phase 30 | Complete |
| TASK-02 | Phase 32 | Pending |
| TASK-03 | Phase 32 | Pending |
| TASK-04 | Phase 32 | Pending |
| TASK-05 | Phase 32 | Pending |
| HOME-01 | Phase 33 | Pending |
| HOME-02 | Phase 33 | Pending |
| HOME-03 | Phase 33 | Pending |

**Coverage:**
- v1.5 requirements: 19 total
- Mapped to phases: 19
- Unmapped: 0

---
*Requirements defined: 2026-03-12*
*Last updated: 2026-03-12 after roadmap creation (all 19 requirements mapped)*
