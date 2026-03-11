# Requirements: FXL Core v1.3

**Defined:** 2026-03-10
**Core Value:** FXL Core e o cerebro operacional da empresa -- documentacao, processo e tooling juntos

## v1.3 Requirements

Requirements for v1.3 Builder & Components. Each maps to roadmap phases.

### Visual

- [ ] **VIS-01**: Wireframe component palette usa grays mais suaves (preto menos bruto)

### Layout

- [ ] **LAYOUT-01**: Header renderiza acima da sidebar (full-width, highest z-order)
- [ ] **LAYOUT-02**: "Gerenciar" move da sidebar para header como action button

### Sidebar

- [ ] **SIDE-01**: SidebarConfig adicionado ao BlueprintConfig schema (dashboard-level)
- [ ] **SIDE-02**: Sidebar renderiza icones por item de menu via BlueprintScreen.icon
- [ ] **SIDE-03**: Sidebar suporta groups/secoes com headings rotulados
- [ ] **SIDE-04**: Sidebar colapsa para icon-only rail mode
- [ ] **SIDE-05**: Sidebar items mostram badge/notification counts
- [ ] **SIDE-06**: Sidebar renderiza footer text (versao/ambiente)
- [ ] **SIDE-07**: Active screen highlighted na sidebar (preservado do existente)

### Header

- [ ] **HEAD-01**: HeaderConfig adicionado ao BlueprintConfig schema (dashboard-level)
- [ ] **HEAD-02**: Header exibe logo/brand do cliente
- [ ] **HEAD-03**: Header mostra period selector (config-driven)
- [ ] **HEAD-04**: Header mostra user/role indicator
- [ ] **HEAD-05**: Header renderiza action buttons (manage, share, export)

### Filter Bar

- [ ] **FILT-01**: FilterOption type extendido com filterType discriminator
- [ ] **FILT-02**: Date range picker filter type
- [ ] **FILT-03**: Multi-select dropdown filter type
- [ ] **FILT-04**: Search/text filter type
- [ ] **FILT-05**: Period quick-select presets para date-range filter
- [ ] **FILT-06**: Boolean toggle filter type

### Charts

- [ ] **CHART-01**: Stacked bar chart variant (chartType: 'stacked-bar')
- [ ] **CHART-02**: Stacked area chart variant (chartType: 'stacked-area')
- [ ] **CHART-03**: Horizontal bar chart variant (chartType: 'horizontal-bar')
- [ ] **CHART-04**: Bubble chart variant (chartType: 'bubble')
- [ ] **CHART-05**: Gauge chart como novo section type (gauge-chart)
- [ ] **CHART-06**: Composed chart com multi-series configuravel (chartType: 'composed')

### Gallery

- [ ] **GAL-01**: Component gallery reorganizada por secoes tematicas
- [ ] **GAL-02**: Todos os novos chart types visiveis na gallery com mock data

## Future Requirements

Deferred to future milestone. Tracked but not in current roadmap.

### Advanced Charts

- **ACHART-01**: Map/geographic chart (requer geo data + tile server dependency)
- **ACHART-02**: Sankey diagram (dados relacionais complexos)
- **ACHART-03**: Sunburst chart (donut multi-ring)
- **ACHART-04**: Histogram / box plot (charts estatisticos)

### Advanced Layout

- **ALAYOUT-01**: Nested sidebar 3+ levels
- **ALAYOUT-02**: Drag-and-drop sidebar reordering
- **ALAYOUT-03**: Cross-chart filtering (interacao entre graficos)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Map/geographic charts | Requer geo data, tile servers, nova dependencia (leaflet/mapbox). Muito pesado para wireframes com mock data |
| Pivot table / matrix | Extremamente complexo (drag columns/rows, subtotals). Recharts nao suporta. Drill-down table existente cobre 90% do caso |
| Cross-chart filtering | Requer state management global entre secoes. Quebra principio de isolamento. Sem sentido com mock data |
| Nested sidebar 3+ levels | Cria confusao, quebra scanning patterns. PME dashboards raramente excedem 15 telas |
| Custom color picker per chart | Quebra consistencia visual. Sistema de branding ja trata paleta globalmente |
| Histogram / box plot | PME BI clients quase nunca precisam de charts estatisticos |
| Sankey / sunburst | Casos de uso nicho. Sankey requer dados relacionais complexos |
| Real-time filter updates | Wireframes usam mock data. Nao ha backend para filtrar |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| VIS-01 | Phase 17 | Pending |
| LAYOUT-01 | Phase 17 | Pending |
| LAYOUT-02 | Phase 17 | Pending |
| SIDE-01 | Phase 17 | Pending |
| SIDE-02 | Phase 18 | Pending |
| SIDE-03 | Phase 18 | Pending |
| SIDE-04 | Phase 18 | Pending |
| SIDE-05 | Phase 18 | Pending |
| SIDE-06 | Phase 18 | Pending |
| SIDE-07 | Phase 18 | Pending |
| HEAD-01 | Phase 17 | Pending |
| HEAD-02 | Phase 18 | Pending |
| HEAD-03 | Phase 18 | Pending |
| HEAD-04 | Phase 18 | Pending |
| HEAD-05 | Phase 18 | Pending |
| FILT-01 | Phase 17 | Pending |
| FILT-02 | Phase 19 | Pending |
| FILT-03 | Phase 19 | Pending |
| FILT-04 | Phase 19 | Pending |
| FILT-05 | Phase 19 | Pending |
| FILT-06 | Phase 19 | Pending |
| CHART-01 | Phase 20 | Pending |
| CHART-02 | Phase 20 | Pending |
| CHART-03 | Phase 20 | Pending |
| CHART-04 | Phase 20 | Pending |
| CHART-05 | Phase 20 | Pending |
| CHART-06 | Phase 20 | Pending |
| GAL-01 | Phase 21 | Pending |
| GAL-02 | Phase 21 | Pending |

**Coverage:**
- v1.3 requirements: 26 total
- Mapped to phases: 26
- Unmapped: 0

---
*Requirements defined: 2026-03-10*
*Last updated: 2026-03-10 after roadmap creation (all 26 requirements mapped)*
