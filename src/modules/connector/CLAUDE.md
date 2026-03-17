# Module: connector

## Purpose
Generic connector module that consumes data from any FXL spoke application via the standardized FXL contract API. Renders entities (tables, detail views) and widgets (KPI, chart, table, list) dynamically based on the spoke's manifest.

## Ownership
- src/modules/connector/**

## Public API

### Types
- ConnectorConfig: Configuration for a single connector (appId, appName, baseUrl, apiKey) (types/connector-config.ts)
- ConnectorState: Runtime state (manifest, loading, error, status) (types/index.ts)
- ConnectorStatus: 'online' | 'offline' | 'error' | 'loading' (types/index.ts)
- Re-exports all FXL contract types from types/index.ts (FxlAppManifest, FxlEntityDefinition, FxlFieldDefinition, etc.)

### Hooks
- useConnector(appId): Fetches and caches manifest for a specific connector, returns { manifest, loading, error, status, refetch } (hooks/useConnector.ts)
- useConnectorList(): Returns all enabled connectors for the current context (hooks/useConnectorList.ts)

### Components
- EntityTable: Generic data table rendered from FieldDefinition[] (components/EntityTable.tsx)
- EntityFields: Renders individual fields formatted by type (string, number, date, boolean) (components/EntityFields.tsx)
- ConnectorCard: Card for Home page showing connector app info and status (components/ConnectorCard.tsx)
- ConnectorBadge: Online/offline status badge (components/ConnectorBadge.tsx)
- KpiWidget: Renders KPI widget data (components/widgets/KpiWidget.tsx)
- ChartWidget: Renders chart widget data using recharts (components/widgets/ChartWidget.tsx)
- TableWidget: Renders table widget data (components/widgets/TableWidget.tsx)
- ListWidget: Renders list widget data (components/widgets/ListWidget.tsx)

### Services
- connector-service: Fetch manifest, entities, widget data from spoke API with 5s timeout, API key auth (X-FXL-API-Key header), and error handling (services/connector-service.ts)
- connector-config-service: CRUD for connector configs stored in Supabase tenant_modules (services/connector-config-service.ts)
- icon-map: Maps lucide icon names to React components with Box fallback (services/icon-map.ts)

### Pages
- ConnectorRouter: Catch-all router resolving /apps/:appId/* sub-routes from manifest entities (pages/ConnectorRouter.tsx)
- EntityList: Generic table view for any entity type (pages/EntityList.tsx)
- EntityDetail: Generic detail view for single entity (pages/EntityDetail.tsx)
- ConnectorDashboard: Dashboard with all widgets for a specific connector (pages/ConnectorDashboard.tsx)

### Extensions
- home-widgets: Extension injecting ConnectorCard into HOME_DASHBOARD slot (extensions/home-widgets.ts)

## Dependencies

### From shared/
- @shared/ui/* — shadcn components (Card, Badge, Table, Button, Separator, Skeleton)
- @shared/utils — cn (class merging)

### From platform/
- @platform/module-loader/registry — ModuleDefinition, SlotComponentProps types
- @platform/module-loader/module-ids — MODULE_IDS.CONNECTOR, SLOT_IDS.HOME_DASHBOARD
- @platform/supabase — Supabase client (used by connector-config-service)

### From other modules
- None — no direct cross-module imports

### External
- recharts — chart rendering for ChartWidget
- lucide-react — icon components for icon-map

## Validation
- Spoke offline: show "Offline" badge + graceful degradation
- Spoke 401: retry once with refreshed token, then show "Reconnect"
- Spoke 500: show error in card, don't propagate to app
- All fetch requests use 5s timeout via AbortController
- Invalid manifest: disable connector, show error state

## Agent Rules
- **Write:** Only files under `src/modules/connector/`
- **Read:** Entire codebase
- **Shared writes:** Request via lead -> platform agent
- **Cross-module writes:** Never — report to lead
- **Do NOT run** `tsc --noEmit` individually (lead runs full-project check)
