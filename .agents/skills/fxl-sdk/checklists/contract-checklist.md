# Contract Checklist

Verify FXL contract implementation for Hub connectivity.

## Package Configuration

- [ ] **[Critical]** `package.json` has `"fxlContractVersion": "1.0"` field
- [ ] **[Critical]** `package.json` has `"fxlAppId": "{app-id}"` field
- [ ] **[Important]** `src/types/fxl-contract.ts` exists with contract types copied from SDK

## Endpoint: GET /api/fxl/manifest

- [ ] **[Critical]** Endpoint exists and returns 200
- [ ] **[Critical]** Response matches `FxlAppManifest` interface
- [ ] **[Critical]** `appId` matches `fxlAppId` in package.json
- [ ] **[Important]** `entities` array is non-empty (at least one entity defined)
- [ ] **[Important]** Each entity has `type`, `label`, `labelPlural`, `icon`, `fields`, `defaultSort`
- [ ] **[Important]** Each field has `key`, `label`, `type` (only: string, number, date, boolean)
- [ ] **[Normal]** `dashboardWidgets` array defined (can be empty)
- [ ] **[Normal]** `version` field follows semver format

## Endpoint: GET /api/fxl/entities/:type

- [ ] **[Critical]** Endpoint exists and returns 200 for valid entity type
- [ ] **[Critical]** Endpoint returns 404 for unknown entity type
- [ ] **[Critical]** Response matches `FxlPaginatedResponse<T>` interface
- [ ] **[Critical]** Results are filtered by `org_id` from JWT claims
- [ ] **[Important]** Supports `page` query parameter (default: 1)
- [ ] **[Important]** Supports `pageSize` query parameter (default: 20, max: 100)
- [ ] **[Important]** Returns `total` count for pagination
- [ ] **[Normal]** Results are sorted by entity's `defaultSort` configuration
- [ ] **[Normal]** Empty result returns `{ data: [], total: 0, page: 1, pageSize: 20 }`

## Endpoint: GET /api/fxl/entities/:type/:id

- [ ] **[Critical]** Endpoint exists and returns 200 for valid entity
- [ ] **[Critical]** Returns 404 for non-existent entity
- [ ] **[Critical]** Validates `org_id` — cannot access entity from another org
- [ ] **[Important]** Response is a single entity object (not wrapped in array)

## Endpoint: GET /api/fxl/widgets/:id/data

- [ ] **[Critical]** Endpoint exists for all widgets defined in manifest
- [ ] **[Critical]** Returns 404 for unknown widget ID
- [ ] **[Critical]** Data is filtered by `org_id` from JWT claims
- [ ] **[Important]** KPI widgets return `{ value, label }` (trend, prefix, suffix optional)
- [ ] **[Important]** Chart widgets return `{ labels, datasets }` with matching array lengths
- [ ] **[Important]** Table widgets return `{ columns, rows }` with consistent column keys
- [ ] **[Important]** List widgets return `{ items }` with `id` and `title` per item

## Endpoint: GET /api/fxl/search?q=

- [ ] **[Critical]** Endpoint exists and returns 200
- [ ] **[Critical]** Results are filtered by `org_id` from JWT claims
- [ ] **[Important]** Response matches `FxlSearchResponse` interface
- [ ] **[Important]** Searches across all entity types with string fields
- [ ] **[Important]** Results limited to max 20 items
- [ ] **[Normal]** Empty query returns empty results (not an error)
- [ ] **[Normal]** Each result has `entityType`, `entityId`, `title`, `matchField`

## Endpoint: GET /api/fxl/health

- [ ] **[Critical]** Endpoint exists and returns 200
- [ ] **[Critical]** Response has `status: "ok"`
- [ ] **[Critical]** Response has `contractVersion` matching package.json `fxlContractVersion`
- [ ] **[Important]** Response has `version` field (app version)
- [ ] **[Normal]** Response has `timestamp` field (ISO 8601)
- [ ] **[Normal]** Endpoint does NOT require authentication (public health check)

## Authentication

- [ ] **[Critical]** All endpoints except `/api/fxl/health` require valid Clerk JWT
- [ ] **[Critical]** JWT is validated via Clerk JWKS (not hardcoded secret)
- [ ] **[Critical]** `org_id` is extracted from JWT payload (not from request parameters)
- [ ] **[Important]** Invalid/expired JWT returns 401 with `FxlErrorResponse` format
- [ ] **[Important]** Missing `org_id` in JWT returns 403

## Error Handling

- [ ] **[Important]** Errors return `FxlErrorResponse` format: `{ error, statusCode }`
- [ ] **[Important]** 404 for unknown resources (not 500)
- [ ] **[Important]** 401 for invalid auth (not 500)
- [ ] **[Normal]** 400 for invalid query parameters (negative page, pageSize > 100)
- [ ] **[Normal]** Internal errors return 500 without leaking stack traces

## Testing

- [ ] **[Important]** Health endpoint accessible without auth
- [ ] **[Important]** Manifest endpoint returns valid JSON
- [ ] **[Normal]** Entity list returns correct pagination metadata
- [ ] **[Normal]** Search returns results for known data
- [ ] **[Info]** Load test: endpoints respond within 500ms for typical queries

## Scoring

| Severity | Weight |
|----------|--------|
| Critical | 10 |
| Important | 5 |
| Normal | 2 |
| Info | 0 |
