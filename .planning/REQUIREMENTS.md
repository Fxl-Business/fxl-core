# Requirements: v3.3 Generic Connector Module

**Defined:** 2026-03-17
**Milestone:** v3.3
**Core Value:** Modulo generico no FXL Core que consome qualquer spoke via contrato padronizado, renderizando entidades e widgets com UI generica
**Design Spec:** `docs/superpowers/specs/2026-03-16-fxl-platform-evolution-design.md` (Section 6.6)

## v3.3 Requirements

### Module Infrastructure

- [ ] **CON-01**: Criar estrutura do modulo connector com CLAUDE.md, manifest.ts, e registro no MODULE_REGISTRY
  - **Aceite:** MODULE_IDS.CONNECTOR existe, modulo registrado no registry, rota catch-all `/apps/*` configurada.
  - **Depende de:** Nada

- [ ] **CON-02**: Criar tipos do connector (re-export contract types + ConnectorConfig)
  - **Aceite:** types/index.ts re-exporta tipos do contrato SDK, ConnectorConfig define appId + baseUrl.
  - **Depende de:** CON-01

- [ ] **CON-03**: Criar connector-service.ts para comunicacao com spokes
  - **Aceite:** Servico faz GET manifest, entities, widgets com timeout 5s, tratamento de erros (offline, 401, 500).
  - **Depende de:** CON-02

- [ ] **CON-04**: Criar icon-map.ts mapeando ~100 icones lucide comuns com fallback para Box
  - **Aceite:** Funcao resolveIcon(name) retorna componente LucideIcon, fallback para Box se nao encontrado.
  - **Depende de:** Nada

- [ ] **CON-05**: Criar hooks useConnector e useConnectorList
  - **Aceite:** useConnector(appId) retorna manifest/loading/error. useConnectorList retorna lista de connectors habilitados.
  - **Depende de:** CON-03

### UI Components

- [ ] **CON-06**: Criar EntityTable e EntityFields para renderizacao generica de entidades
  - **Aceite:** EntityTable renderiza tabela com colunas baseadas em FieldDefinition[]. EntityFields renderiza campos formatados por tipo.
  - **Depende de:** CON-02

- [ ] **CON-07**: Criar EntityList (pagina de listagem) e EntityDetail (pagina de detalhe)
  - **Aceite:** EntityList busca dados paginados via connector-service. EntityDetail busca entidade individual.
  - **Depende de:** CON-03, CON-06

- [ ] **CON-08**: Criar widget components (KpiWidget, ChartWidget, TableWidget, ListWidget)
  - **Aceite:** Cada widget renderiza dados no formato correto (ver spec Section 6.5). ChartWidget usa recharts.
  - **Depende de:** CON-02

- [ ] **CON-09**: Criar ConnectorRouter com roteamento dinamico baseado no manifest
  - **Aceite:** ConnectorRouter resolve sub-rotas de `/apps/:appId/*` usando entities do manifest.
  - **Depende de:** CON-05, CON-07

- [ ] **CON-10**: Criar ConnectorDashboard com widgets overview por connector
  - **Aceite:** Dashboard renderiza todos os widgets de um connector com layout grid.
  - **Depende de:** CON-05, CON-08

- [ ] **CON-11**: Criar ConnectorCard e ConnectorBadge
  - **Aceite:** ConnectorCard mostra app info para Home. ConnectorBadge mostra status online/offline.
  - **Depende de:** CON-05

- [ ] **CON-12**: Criar home-widgets extension para injetar widgets de connectors no Home
  - **Aceite:** Extension injeta ConnectorCard no HOME_DASHBOARD slot via extension system.
  - **Depende de:** CON-11

### Integration

- [ ] **CON-13**: tsc --noEmit zero erros, npm run build sem erros
  - **Aceite:** Build completa sem erros TypeScript ou Vite.
  - **Depende de:** Todos os anteriores

## Out of Scope

| Feature | Reason |
|---------|--------|
| Multi-tenancy integration | v3.5 (config hardcoded inicialmente) |
| CRUD/mutations | v1 contract is read-only |
| React Query / cache layer | Simple fetch + state (project convention) |
| Real spoke connection | v3.5 (Beach House) |
| enum/relation field types | v2 contract |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CON-01 | Phase 70 | Pending |
| CON-02 | Phase 70 | Pending |
| CON-03 | Phase 70 | Pending |
| CON-04 | Phase 70 | Pending |
| CON-05 | Phase 70 | Pending |
| CON-06 | Phase 71 | Pending |
| CON-07 | Phase 71 | Pending |
| CON-08 | Phase 71 | Pending |
| CON-09 | Phase 71 | Pending |
| CON-10 | Phase 71 | Pending |
| CON-11 | Phase 71 | Pending |
| CON-12 | Phase 71 | Pending |
| CON-13 | Phase 72 | Pending |

**Coverage:**
- v3.3 requirements: 13 total
- Mapped to phases: 13
- Unmapped: 0

---
*Requirements defined: 2026-03-17*
