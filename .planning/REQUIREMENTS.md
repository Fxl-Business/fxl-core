# Requirements: Nexo v6.0 — Reestruturação de Módulos

**Defined:** 2026-03-18
**Core Value:** Separar responsabilidades (cadastro vs criação) e dar a cada módulo seu próprio workspace na sidebar

## v6.0 Requirements

### Clientes

- [ ] **CLI-01**: Operador pode ver lista de clientes da org (cards ou tabela)
- [ ] **CLI-02**: Operador pode criar cliente com nome, slug e status
- [ ] **CLI-03**: Operador pode ver perfil de um cliente (nome, logo, status, link para projetos)
- [ ] **CLI-04**: Operador pode editar dados de um cliente existente
- [ ] **CLI-05**: Sidebar mostra lista dinâmica de clientes da org quando workspace Clientes está ativo

### Projetos

- [ ] **PROJ-01**: Operador pode ver lista de projetos da org
- [ ] **PROJ-02**: Operador pode criar projeto vinculado a um cliente ou à própria org
- [ ] **PROJ-03**: Operador pode acessar briefing em /projetos/:slug/briefing
- [ ] **PROJ-04**: Operador pode acessar blueprint em /projetos/:slug/blueprint
- [ ] **PROJ-05**: Operador pode acessar wireframe em /projetos/:slug/wireframe
- [ ] **PROJ-06**: Operador pode acessar branding em /projetos/:slug/branding
- [ ] **PROJ-07**: Sidebar mostra lista dinâmica de projetos (expandível com sub-itens) quando workspace Projetos está ativo

### Sidebar Workspace

- [ ] **SIDE-01**: Sidebar tem dropdown switcher no topo para trocar módulo ativo
- [ ] **SIDE-02**: Trocar módulo no dropdown muda rota para home do módulo e carrega nav daquele módulo
- [ ] **SIDE-03**: ModuleDefinition suporta useNavItems() hook opcional para nav dinâmico
- [ ] **SIDE-04**: Footer fixo da sidebar mostra Admin (se super_admin) e Perfil

### Migração de Dados

- [ ] **DATA-01**: Tabela projects criada com id, slug, name, client_id nullable, org_id + RLS
- [ ] **DATA-02**: Tabela clients estendida com logo_url e status
- [ ] **DATA-03**: Tabelas briefing_configs, blueprint_configs, comments, share_tokens ganham coluna project_id
- [ ] **DATA-04**: Dados existentes migrados: projeto "Financeiro Conta Azul" criado e FKs atualizadas
- [ ] **DATA-05**: Stores (briefing-store, blueprint-store, comments, tokens) migrados de client_slug para project_id

### Código

- [ ] **CODE-01**: src/modules/clients/ renomeado para src/modules/projects/ com module ID 'projects'
- [ ] **CODE-02**: Novo src/modules/clients/ criado do zero (CRUD simples)
- [ ] **CODE-03**: Pages hardcoded de FinanceiroContaAzul substituídas por pages genéricas parametrizadas por slug
- [ ] **CODE-04**: module-ids.ts atualizado com PROJECTS e CLIENTS com novo significado

## Future Requirements

### Clientes Avançado

- **CLI-F01**: Logo upload com storage
- **CLI-F02**: Histórico de projetos por cliente
- **CLI-F03**: Métricas/dashboard por cliente

### Projetos Avançado

- **PROJ-F01**: Templates de projeto por vertical (financeiro, varejo, serviços)
- **PROJ-F02**: Duplicar projeto existente
- **PROJ-F03**: Arquivar/desarquivar projeto

## Out of Scope

| Feature | Reason |
|---------|--------|
| CRM completo | Será app separada — Nexo é gestão/entrega, não operação comercial |
| Redirect de URLs antigas (/clients/:slug/*) | Rotas internas, não públicas. /wireframe-view?token=... permanece intocado |
| Remoção de client_slug das tabelas | Mantido temporariamente para backward compat, removido em migration futura |
| RLS restritivo em briefing_configs/blueprint_configs | Considerar em milestone futuro (atualmente USING(true)) |
| Drag-and-drop de projetos/clientes | Não necessário para v6.0 |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CLI-01 | — | Pending |
| CLI-02 | — | Pending |
| CLI-03 | — | Pending |
| CLI-04 | — | Pending |
| CLI-05 | — | Pending |
| PROJ-01 | — | Pending |
| PROJ-02 | — | Pending |
| PROJ-03 | — | Pending |
| PROJ-04 | — | Pending |
| PROJ-05 | — | Pending |
| PROJ-06 | — | Pending |
| PROJ-07 | — | Pending |
| SIDE-01 | — | Pending |
| SIDE-02 | — | Pending |
| SIDE-03 | — | Pending |
| SIDE-04 | — | Pending |
| DATA-01 | — | Pending |
| DATA-02 | — | Pending |
| DATA-03 | — | Pending |
| DATA-04 | — | Pending |
| DATA-05 | — | Pending |
| CODE-01 | — | Pending |
| CODE-02 | — | Pending |
| CODE-03 | — | Pending |
| CODE-04 | — | Pending |

**Coverage:**
- v6.0 requirements: 25 total
- Mapped to phases: 0
- Unmapped: 25

---
*Requirements defined: 2026-03-18*
*Last updated: 2026-03-18 after initial definition*
