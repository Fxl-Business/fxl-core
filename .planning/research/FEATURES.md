# Feature Landscape

**Domain:** Automated BI Dashboard Generation from Declarative Blueprints
**Researched:** 2026-03-07
**Confidence:** HIGH (grounded in codebase analysis + verified library versions)

## Table Stakes

Features users expect. Missing = product feels incomplete.

### For the Generated Dashboard (End Product)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| All Blueprint screens rendered | The blueprint IS the spec. Every screen in `blueprint.config.ts` must exist in the generated dashboard. | High | 10 screens for financeiro-conta-azul. Each with unique section combinations across 15 section types. |
| Data import (CSV/XLSX upload) | Tela 9 in the blueprint. Without import, dashboard has no data. | High | Must validate structure, show errors per row, track import history. Conta Azul exports in XLS/XLSX/CSV. Use Next.js Route Handlers for server-side parsing with xlsx@0.18.5. |
| Period filtering (month/year selector) | Every BI dashboard has time-based filtering. 8 of 10 screens use period filters. | Medium | URL-encoded state via nuqs@2.8.9 so views are bookmarkable. Default to current month. |
| KPI cards with real calculated values | The core value proposition. Users expect calculated KPIs, not mock data. | High | Formulas defined in TechnicalConfig (Receita - Custos Variaveis = Margem Contribuicao, etc). Computed via Supabase views or RPC. |
| Charts with real data | Visualization is the reason for a dashboard. | Medium | recharts@3.8.0 components already exist in wireframe-builder patterns. Need to wire to real Supabase queries via @tanstack/react-query@5.90.x. |
| Tables with drill-down | Blueprint specifies drill-down on DFC, Fluxo Mensal, Fluxo Anual. | High | Expand/collapse rows, modal detail views, view switcher (Grupo/Centro Custo/Categoria). Use @tanstack/react-table@8.21.x for headless table logic. |
| Comparison mode (Switch Comparar) | Core UX pattern. 8 of 10 screens have it. | High | When ON: KPIs show variation, charts show grouped bars, tables show comparison columns. All within same component (never creates new blocks per wireframe rules). |
| Authentication (login) | Data is confidential financial information. | Medium | Supabase Auth email+password via @supabase/supabase-js@2.98.0. Use @supabase/ssr for cookie-based sessions in Next.js App Router. |
| Responsive layout | Blueprint sidebar + content area. Desktop priority, mobile functional. | Medium | Per FXL standard. Sidebar collapses on mobile. |
| Skeleton loading | FXL mandatory pattern. Every data-loading screen shows skeleton first. | Low | Standard shadcn/ui Skeleton component. |

### For the Generation System (FXL Core Tool)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| BlueprintConfig to project generation | Core purpose. Read config, output project files. | High | Must generate: Next.js pages (App Router), components, Route Handlers, Supabase migrations, env template. |
| Technical Config as input | Bridge between wireframe (what it looks like) and system (how it works). Data sources, formulas, auth rules. | High | New schema extending BlueprintConfig. Claude suggests, operator reviews. |
| Generated project builds and runs | Output must compile (`tsc --noEmit` zero errors) and serve locally on first run. | High | Critical quality gate. Next.js 16 with Turbopack for fast dev. Generated code must pass TypeScript strict mode. |
| Supabase migration generation | Database schema derived from blueprint data requirements. | Medium | Tables for: imported data, configurations, user settings, import history. Every table with RLS from day one. |

## Differentiators

Features that set FXL apart from manual dashboard development.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Config-driven generation | Change blueprint config, regenerate. Dramatically faster than coding each dashboard from scratch. | High | The entire Phase 3 automation thesis. |
| Semaphore system (configurable thresholds) | Tela 5 and Tela 8 use configurable green/yellow/red thresholds. Self-service for client operators. | Medium | Tela 10 (Configuracoes) lets users set thresholds. Stored in Supabase. |
| Manual input integration | Tela 6 and 7 combine imported data with manual adjustments (bank balances, manual revenue/expense projections). | High | Hybrid data model: imported + manual. Both contribute to KPIs and charts. |
| Import validation with error feedback | Not just "upload succeeded" -- show exactly which rows failed and why. | Medium | Validates: required columns, date formats, numeric values, category trimming, negative values. Per blueprint spec. Server-side validation in Route Handlers. |
| Comparison period as URL state | Bookmarkable comparison views. Share "March 2026 vs February 2026 DFC" as a link. | Low | nuqs@2.8.9 handles this natively with Next.js App Router. High UX value, low implementation cost. |
| Category-to-Group mapping (Tela 10) | Client configures how Conta Azul categories map to financial groups (Variable/Fixed/Financial costs). | Medium | Configuration screen. Stored in Supabase. Drives all DRE/cost calculations. |
| Server-side data processing | Heavy CSV parsing and KPI aggregation happen in Route Handlers, not in the browser. | Medium | Next.js Route Handlers handle file upload and processing server-side, reducing client bundle and improving performance. |

## Anti-Features

Features to explicitly NOT build.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| Real-time data sync with Conta Azul API | Conta Azul API has rate limits, auth complexity, and breaking changes. Manual CSV import is simpler and the client already exports data this way. | Manual upload via Tela 9. Revisit API integration as a future phase if client demand exists. |
| Custom chart builder (drag-and-drop) | Scope creep. The blueprint defines all charts. Users should not be designing their own visualizations. | Blueprint defines charts. Config screen (Tela 10) allows threshold/parameter changes only. |
| Multi-language support | FXL clients are Brazilian SMEs. Portuguese only. | Hardcode PT-BR in the generated project. All user-facing strings in Portuguese. |
| PDF/Excel report export (v1) | Valuable but not table stakes for v1. The dashboard IS the report. | Defer to a future phase. Consider browser print CSS as a lightweight alternative. |
| Custom theme builder | Each client has branding from Fase 2 (branding.md). Apply at generation time, not runtime. | Generator reads branding.md and applies colors/fonts during project creation via Tailwind config extend. |
| White-label customization UI | Admin panel for changing logos/colors at runtime. Overkill for per-client BI dashboards. | Branding baked in at generation time from branding.md. |
| Data warehouse / ETL pipeline | FXL dashboards consume simple CSV exports, not enterprise data pipelines. | Process CSV on import via Route Handlers. Store in Supabase tables. Query directly. |
| Embedded Metabase/Superset | Heavy infrastructure, fights FXL design system, vendor lock-in. | Custom dashboard with recharts + TanStack Table. Full code ownership. |

## Feature Dependencies

```
Technical Config schema definition
  -> Code generator reads Technical Config
    -> Generated project scaffolding (Next.js 16 App Router)
      -> Supabase migration generation (with RLS)
        -> Data import via Route Handlers (Tela 9)
          -> KPI calculations (depend on imported data + config)
            -> Charts (depend on calculated KPIs/aggregations)
            -> Tables (depend on raw + aggregated data)
              -> Comparison mode (transforms existing components)

Parallel track:
  Auth setup via @supabase/ssr (independent of data pipeline)
  Configuration screens - Tela 10 (independent, but must exist before KPI thresholds work)
  Manual input sections - Tela 6, 7 (after base data import works)
```

## MVP Recommendation

Prioritize for first generated project (financeiro-conta-azul):

1. **Technical Config schema + generator scaffold** -- Without this, nothing else works. Defines the contract between Phase 2 and Phase 3.
2. **Data import (Tela 9)** -- Without data, dashboard is empty. Route Handlers for server-side CSV/XLSX parsing.
3. **Core data screens (Tela 1 DFC + Tela 2 Receita + Tela 3 Despesas)** -- Prove the value proposition with the three most important screens.
4. **Auth** -- Protect financial data from day one. Supabase Auth with cookie-based sessions.
5. **Configuration (Tela 10)** -- Enable category mapping that drives all DRE calculations.
6. **Remaining screens** -- Add incrementally once the pattern is proven.

Defer:
- **Manual input (Tela 6, 7)**: Complex hybrid data model. Add after core import-and-display pipeline works.
- **Comparison mode**: High UX value but high complexity. Layer on after base mode works for all screens.
- **Tela 8 (Indicadores consolidados)**: Depends on all other screens' data being correct first.

## Sources

- FXL internal: `clients/financeiro-conta-azul/docs/blueprint.md` -- complete 10-screen specification
- FXL internal: `tools/wireframe-builder/types/blueprint.ts` -- 15 section types in discriminated union
- FXL internal: `clients/financeiro-conta-azul/wireframe/blueprint.config.ts` -- production BlueprintConfig
- FXL internal: `docs/processo/fases/fase3.md` -- development phase process documentation
- npm registry: all library versions verified 2026-03-07

---
*Feature landscape for: Automated BI Dashboard Generation*
*Researched: 2026-03-07*
