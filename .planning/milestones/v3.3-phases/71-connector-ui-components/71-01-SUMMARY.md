---
phase: "71"
plan: "01"
subsystem: connector
tags: [connector, ui, entities, widgets, routing, extension]
dependency-graph:
  requires: [connector-service, connector-types, connector-hooks, recharts]
  provides: [entity-table, entity-fields, entity-list, entity-detail, connector-router, connector-dashboard, widgets, home-extension]
  affects: [home-dashboard]
tech-stack:
  added: []
  patterns: [generic-table, field-formatting, dynamic-routing, widget-factory]
key-files:
  created:
    - src/modules/connector/components/EntityTable.tsx
    - src/modules/connector/components/EntityFields.tsx
    - src/modules/connector/components/ConnectorCard.tsx
    - src/modules/connector/components/ConnectorBadge.tsx
    - src/modules/connector/components/widgets/KpiWidget.tsx
    - src/modules/connector/components/widgets/ChartWidget.tsx
    - src/modules/connector/components/widgets/TableWidget.tsx
    - src/modules/connector/components/widgets/ListWidget.tsx
    - src/modules/connector/pages/ConnectorRouter.tsx
    - src/modules/connector/pages/EntityList.tsx
    - src/modules/connector/pages/EntityDetail.tsx
    - src/modules/connector/pages/ConnectorDashboard.tsx
    - src/modules/connector/extensions/home-widgets.ts
decisions:
  - "EntityFields.formatFieldValue exported for reuse by EntityTable"
  - "ChartWidget spans 2 grid columns for better readability"
  - "ConnectorRouter uses nested Routes for entity sub-routing"
  - "ConnectorHomeWidget follows RecentTasksWidget self-contained pattern"
metrics:
  duration: "~5min"
  completed: "2026-03-17"
---

# Phase 71 Plan 01: Connector UI Components Summary

Complete UI layer for the connector module: entity rendering, widget components, dynamic routing, and home page extension.

## One-liner

Generic entity table/detail views, 4 widget types (KPI/chart/table/list), dynamic ConnectorRouter, and HOME_DASHBOARD extension.

## What was built

1. **EntityTable**: Generic data table with columns from FieldDefinition[], first column links to detail page
2. **EntityFields**: Field renderer with type-aware formatting (pt-BR numbers/dates, boolean as Sim/Nao)
3. **EntityList page**: Paginated entity list with loading/error/empty states
4. **EntityDetail page**: Full entity detail with all fields displayed vertically
5. **ConnectorRouter**: Catch-all router resolving `/apps/:appId/*` with nested Routes per entity type
6. **ConnectorDashboard**: Dashboard grid with widgets + entity quick-link cards
7. **Widget components**: KpiWidget (trend indicator), ChartWidget (recharts bar chart), TableWidget, ListWidget
8. **ConnectorCard + Badge**: Home page card showing connected apps with online/offline status
9. **home-widgets extension**: Injects ConnectorHomeWidget into HOME_DASHBOARD slot via extension system

## Deviations from Plan

None - plan executed exactly as written.

## Commits

- `cefc982` — app: create connector UI components and dynamic routing (Phase 71)
