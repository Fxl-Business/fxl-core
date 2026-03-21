# Requirements: Nexo

**Defined:** 2026-03-21
**Core Value:** Nexo e o hub central multi-tenant — cada empresa ve tudo sobre si mesma

## v12.0 Requirements

Requirements for Admin Modules Overview milestone. Each maps to roadmap phases.

### Diagrama

- [x] **DIAG-01**: Admin pode ver diagrama visual com todos os modulos como nos conectados por arestas de extension/slot
- [x] **DIAG-02**: Admin pode passar hover em um modulo no diagrama e ver suas conexoes destacadas
- [ ] **DIAG-03**: Admin pode clicar em um modulo no diagrama e a pagina rola ate o card correspondente
- [x] **DIAG-04**: Diagrama renderiza corretamente em dark mode e light mode

### Cards de Modulo

- [ ] **CARD-01**: Admin pode ver card de cada modulo com nome, descricao e status badge (Active/Beta/Coming Soon)
- [ ] **CARD-02**: Admin pode ver lista de funcionalidades principais de cada modulo no card
- [ ] **CARD-03**: Admin pode ver quais extensions cada modulo oferece e em quais slots injeta
- [ ] **CARD-04**: Cards organizados em grid responsivo na pagina /admin/modules

### Migracao de Toggles

- [x] **TOGL-01**: Admin pode ativar/desativar modulos de um tenant na TenantDetailPage
- [x] **TOGL-02**: Pagina /admin/modules nao mostra mais seletor de tenant ou toggles de modulos
- [x] **TOGL-03**: Toggle logic extraido em componente reutilizavel com orgId prop

## Future Requirements

### Estatisticas de Uso

- **STAT-01**: Admin pode ver quantos tenants usam cada modulo
- **STAT-02**: Admin pode ver metricas de adocao por modulo

### Configuracao Global

- **CONF-01**: Admin pode definir configuracoes globais por modulo
- **CONF-02**: Admin pode definir modulos default para novos tenants

## Out of Scope

| Feature | Reason |
|---------|--------|
| Drag-and-drop no diagrama | 6 modulos nao justificam — auto-layout suficiente |
| @xyflow/react library | Overkill para 6 nos — custom SVG com Tailwind |
| Metricas de uso por modulo | Defer para milestone futuro (STAT-01/02) |
| Config global por modulo | Defer para milestone futuro (CONF-01/02) |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DIAG-01 | Phase 140 | Complete |
| DIAG-02 | Phase 140 | Complete |
| DIAG-03 | Phase 142 | Pending |
| DIAG-04 | Phase 140 | Complete |
| CARD-01 | Phase 141 | Pending |
| CARD-02 | Phase 141 | Pending |
| CARD-03 | Phase 141 | Pending |
| CARD-04 | Phase 141 | Pending |
| TOGL-01 | Phase 139 | Complete |
| TOGL-02 | Phase 139 | Complete |
| TOGL-03 | Phase 139 | Complete |

**Coverage:**
- v12.0 requirements: 11 total
- Mapped to phases: 11
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-21*
*Last updated: 2026-03-21 — traceability mapped after roadmap creation*
