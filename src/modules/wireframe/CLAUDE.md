# Module: wireframe

## Purpose
Wireframe builder tools module — component gallery and shared (public) wireframe viewer. Visual builder components live in tools/wireframe-builder/ (hybrid split).

## Ownership
- src/modules/wireframe/**

## Public API

### Types
- No module-specific types exported (types/ currently empty)

### Hooks
- None (hooks/ currently empty)

### Components
- None (components/ currently empty — builder components stay in @tools/wireframe-builder/)

### Services
- None (services/ currently empty)

### Pages
- ComponentGallery: Interactive gallery showcasing all wireframe builder blocks with mock data, prop toggles, category filters, and optional branding preview (pages/ComponentGallery.tsx)
- SharedWireframeView: Public (unauthenticated) wireframe viewer accessible via token-validated share links, with client name entry, sidebar navigation, comments, and branding (pages/SharedWireframeView.tsx)
- galleryMockData: Mock data constants for all gallery component previews (pages/galleryMockData.ts)

## Dependencies

### From shared/
- @shared/utils — cn (class merging)

### From platform/
- @platform/module-loader/registry — ModuleDefinition type (used in manifest)
- @platform/module-loader/module-ids — MODULE_IDS.FERRAMENTAS (used in manifest)

### From other modules
- None — no direct cross-module imports

### From tools/
- @tools/wireframe-builder/lib/wireframe-theme — WireframeThemeProvider
- @tools/wireframe-builder/lib/branding — brandingToWfOverrides, resolveBranding, getChartPalette, getFontLinks
- @tools/wireframe-builder/lib/tokens — validateToken
- @tools/wireframe-builder/lib/comments — getCommentsByScreen
- @tools/wireframe-builder/lib/blueprint-store — loadBlueprint
- @tools/wireframe-builder/types/branding — BrandingConfig, DEFAULT_BRANDING
- @tools/wireframe-builder/types/comments — Comment, toTargetId
- @tools/wireframe-builder/types/blueprint — BlueprintConfig, HeatmapRow, SparklineGridItem, ProgressGridItem
- @tools/wireframe-builder/components/ — KpiCard, KpiCardFull, BarLineChart, WaterfallChart, DonutChart, ParetoChart, DataTable, DrillDownTable, ClickableTable, ConfigTable, CalculoCard, WireframeSidebar, WireframeHeader, WireframeFilterBar, GlobalFilters, InputsScreen, DetailViewSwitcher, UploadSection, ManualInputSection, SaldoBancoInput, WireframeModal, CommentOverlay, BlueprintRenderer, StackedBarChartComponent, StackedAreaChartComponent, HorizontalBarChartComponent, BubbleChartComponent, ComposedChartComponent, GaugeChartComponent, CompositionBar, GroupedBarChartComponent, BulletChartComponent, StepLineChartComponent, LollipopChartComponent, RangeBarChartComponent, BumpChartComponent, PolarAreaChartComponent, PieChartComponent, HeatmapComponent, SparklineGridComponent, ProgressGridComponent, SankeyComponent

### From clients/
- @clients/financeiro-conta-azul/wireframe/branding.config — dynamic import for per-client branding in SharedWireframeView

## Hybrid Architecture Note
This module is intentionally split:
- **src/modules/wireframe/** — manifest, pages, hooks (module system integration)
- **tools/wireframe-builder/** — visual components, editor, types (reusable across contexts)

Builder components are shared across the gallery page, client wireframe viewer, and shared/public viewer. They must NOT be moved into this module.

## Validation
- ComponentGallery must render all available block types without errors
- SharedWireframeView must validate share tokens before rendering wireframe
- galleryMockData must provide valid props for every gallery component entry
- MODULE_IDS value is 'ferramentas' (preserved for URL and localStorage compatibility)

## Agent Rules
- **Write:** Only files under `src/modules/wireframe/`
- **Read:** Entire codebase
- **Shared writes:** Request via lead -> platform agent
- **Cross-module writes:** Never — report to lead
- **Do NOT run** `tsc --noEmit` individually (lead runs full-project check)
