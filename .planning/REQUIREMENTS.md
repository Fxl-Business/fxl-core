# Requirements: FXL Core v1.6

**Defined:** 2026-03-12
**Core Value:** FXL Core e o cerebro operacional da empresa — documentacao, processo e tooling juntos

## v1.6 Requirements

Requirements for milestone v1.6: 12 new chart/section types for the Wireframe Builder.

### ChartType Sub-Variants (Extension Point A)

- [ ] **CHART-01**: Grouped Bar chart renders multiple bars side-by-side per category with tooltip and legend
- [ ] **CHART-02**: Bullet Chart renders horizontal bar with ReferenceLine target marker and tooltip
- [ ] **CHART-03**: Step Line chart renders line with stepAfter interpolation (no smooth curves)
- [ ] **CHART-04**: Lollipop chart renders thin bar stick with scatter dot head via ComposedChart
- [ ] **CHART-05**: Range Bar renders bars with start/end positions via CSS-flex (not from zero)
- [ ] **CHART-06**: Bump Chart renders multi-line ranking with reversed Y-axis and end-of-line labels
- [ ] **CHART-07**: Polar/Rose chart renders bars in polar coordinates via RadialBarChart

### Standalone Section Types (Extension Point B)

- [ ] **SECT-01**: Pie Chart section renders full-circle pizza with slices, labels, and legend
- [ ] **SECT-02**: Heatmap section renders CSS grid matrix with color-mix intensity encoding and cell tooltips
- [ ] **SECT-03**: Sparkline Grid section renders grid of mini LineChart instances with label and value per cell
- [ ] **SECT-04**: Progress Grid section renders horizontal progress bars with current value, target marker, and max
- [ ] **SECT-05**: Sankey Diagram section renders proportional flow between nodes with index-based links

### Cross-Cutting

- [ ] **XCUT-01**: All 12 new chart types use chartColors prop from useWireframeChartPalette (no CSS vars in Legend)
- [ ] **XCUT-02**: All 12 new chart types set isAnimationActive={false} on every series element
- [ ] **XCUT-03**: All 12 new chart types render correctly in both light and dark mode with --wf-* tokens
- [ ] **XCUT-04**: ComponentGallery updated with preview and mock data for all 12 new types
- [ ] **XCUT-05**: Each chartType sub-variant follows 4-point atomic sync (type union, Zod enum, ChartRenderer case, component)
- [ ] **XCUT-06**: Each standalone section type follows 5-file checklist (type, Zod schema, renderer, property form, registry entry)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Chart Enhancements

- **ENH-01**: Bullet Chart reference bands (background zones for poor/satisfactory/good)
- **ENH-02**: Sparkline Grid trend indicator badge (up/down arrow + %)
- **ENH-03**: Heatmap configurable color range (e.g., blue-to-red scale)
- **ENH-04**: Bump Chart highlighted entity (bold line, others muted)
- **ENH-05**: Progress Grid configurable status thresholds
- **ENH-06**: Interactive drill-down, click-to-filter behaviors on charts
- **ENH-07**: Animated fills or transitions on chart types
- **ENH-08**: True Gantt with dependency arrows (beyond Range Bar)
- **ENH-09**: True equal-angle Nightingale rose chart (custom SVG)

## Out of Scope

| Feature | Reason |
|---------|--------|
| New npm dependencies | All 12 types achievable with Recharts 2.13.3 + CSS |
| Recharts 3.x upgrade | Breaking API changes, 2.x sufficient |
| AI screen recipe updates for new types | Mechanical, can be done in future quick task |
| Click-to-filter interactivity | v2 feature, not wireframe preview scope |
| Animated chart transitions | Explicitly disabled for editor performance |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| CHART-01 | Phase 34 | Pending |
| CHART-02 | Phase 34 | Pending |
| CHART-03 | Phase 34 | Pending |
| CHART-04 | Phase 34 | Pending |
| CHART-05 | Phase 34 | Pending |
| CHART-06 | Phase 34 | Pending |
| CHART-07 | Phase 34 | Pending |
| SECT-01 | Phase 35 | Pending |
| SECT-02 | Phase 35 | Pending |
| SECT-03 | Phase 35 | Pending |
| SECT-04 | Phase 35 | Pending |
| SECT-05 | Phase 36 | Pending |
| XCUT-01 | Phase 34 | Pending |
| XCUT-02 | Phase 34 | Pending |
| XCUT-03 | Phase 34 | Pending |
| XCUT-04 | Phase 37 | Pending |
| XCUT-05 | Phase 34 | Pending |
| XCUT-06 | Phase 35 | Pending |

**Coverage:**
- v1.6 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-03-12*
*Last updated: 2026-03-12 — traceability mapped after roadmap creation*
