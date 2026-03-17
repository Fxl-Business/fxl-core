---
phase: "70"
plan: "01"
subsystem: connector
tags: [connector, module, api, spoke, hub]
dependency-graph:
  requires: [MODULE_REGISTRY, MODULE_IDS, extension-registry]
  provides: [connector-module, connector-service, connector-types, connector-hooks]
  affects: [registry.ts, module-ids.ts, sidebar, home-dashboard]
tech-stack:
  added: []
  patterns: [contract-types, result-pattern, in-memory-cache, icon-map]
key-files:
  created:
    - src/modules/connector/CLAUDE.md
    - src/modules/connector/manifest.tsx
    - src/modules/connector/types/index.ts
    - src/modules/connector/types/connector-config.ts
    - src/modules/connector/services/connector-service.ts
    - src/modules/connector/services/icon-map.ts
    - src/modules/connector/hooks/useConnector.ts
    - src/modules/connector/hooks/useConnectorList.ts
  modified:
    - src/platform/module-loader/module-ids.ts
    - src/platform/module-loader/registry.ts
decisions:
  - "Contract types copied inline (SDK skill outside TS scope)"
  - "ConnectorResult<T> uses ok/error discriminated union pattern"
  - "Manifest cache: 1min TTL in-memory Map"
  - "useConnectorList returns hardcoded array for v3.3 (Supabase in future)"
  - "Icon map covers ~100 common lucide icons with Box fallback"
metrics:
  duration: "~5min"
  completed: "2026-03-17"
---

# Phase 70 Plan 01: Core Connector Infrastructure Summary

Generic connector module foundation with types, API service, icon mapping, and hooks for spoke communication.

## One-liner

Connector module with Result-pattern API service, 5s timeout, ~100 icon mappings, and in-memory manifest caching.

## What was built

1. **Module structure**: CLAUDE.md, manifest.tsx with catch-all `/apps/:appId/*` route, MODULE_IDS.CONNECTOR added
2. **Contract types**: All FXL contract types (FxlAppManifest, entities, fields, widgets, responses) copied inline from SDK skill
3. **ConnectorConfig**: Simple `{ appId, baseUrl }` configuration type
4. **connector-service**: 5 functions (fetchManifest, fetchEntities, fetchEntity, fetchWidgetData, fetchHealth) with 5s AbortController timeout and ConnectorResult<T> discriminated union
5. **icon-map**: 100 lucide icons mapped by name string with Box fallback
6. **useConnector hook**: Fetches + caches manifest per baseUrl (1min TTL), exposes status/loading/error/refetch
7. **useConnectorList hook**: Returns enabled connectors (hardcoded empty for v3.3, ready for Supabase in future)

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

1. Contract types copied inline rather than importing from SDK skill (outside TS compilation scope)
2. Result pattern (ConnectorResult<T>) for type-safe error handling
3. In-memory Map cache for manifests with 1min TTL
4. useConnectorList hardcoded for v3.3 development (no spokes connected yet)

## Commits

- `047410e` — app: create connector module infrastructure (Phase 70)
