# Add FXL Contract to Existing Project

## When to Use

Project already exists and follows FXL standards (or has been audited/refactored), but does not yet expose the FXL contract API. This rule adds the required endpoints so the FXL Core Hub can connect to it as a spoke.

## Prerequisites

- Project uses Supabase for database
- Project has its own independent auth (Clerk or other — NOT shared with Hub)
- `org_id` column exists on all tables (see `rules/standards.md`)
- RLS policies filter by `org_id` (see `checklists/rls-checklist.md`)

## Step-by-Step

### 1. Copy Contract Types

Copy `contract/types.ts` from this SDK to `src/types/fxl-contract.ts`.

### 2. Define the Manifest

Create `src/api/fxl/manifest.ts`:

```typescript
import type { FxlAppManifest } from '@/types/fxl-contract'

export const APP_MANIFEST: FxlAppManifest = {
  appId: '{project-slug}',      // matches package.json fxlAppId
  appName: '{Project Name}',
  version: '1.0.0',
  entities: [
    {
      type: '{entity-type}',           // e.g., 'reservation'
      label: '{Entity Label}',         // e.g., 'Reserva'
      labelPlural: '{Entity Plural}',  // e.g., 'Reservas'
      icon: '{lucide-icon-name}',      // e.g., 'calendar'
      fields: [
        { key: 'id', label: 'ID', type: 'string', required: true },
        // ... all fields the Hub should see
      ],
      defaultSort: { field: 'created_at', order: 'desc' }
    }
    // ... more entities
  ],
  dashboardWidgets: [
    {
      id: '{widget-id}',              // e.g., 'total-reservations'
      label: '{Widget Label}',        // e.g., 'Total Reservas'
      type: 'kpi',                    // kpi | chart | table | list
      endpoint: '/api/fxl/widgets/{widget-id}/data'
    }
    // ... more widgets
  ]
}
```

### 3. Implement Endpoints

Hub and spoke have **independent auth**. The Hub authenticates to the spoke via an API key sent in the `X-FXL-API-Key` header. The spoke validates this key in middleware.

#### Generate and store the API key

```bash
# On the spoke server, generate a secure API key
openssl rand -base64 32
```

Add the key to the spoke's `.env.local`:

```
FXL_API_KEY=<generated-key>
```

The Hub stores this same key in the connector config (Supabase `tenant_modules` table, `config->api_key` field) and sends it in every request to the spoke.

#### Create the auth middleware

```typescript
// src/api/fxl/middleware.ts

export function validateApiKey(
  request: Request
): { orgId: string } | null {
  const apiKey = request.headers.get('X-FXL-API-Key')
  if (!apiKey) return null

  if (apiKey !== process.env.FXL_API_KEY) return null

  // org_id comes from the query parameter set by the Hub
  const url = new URL(request.url)
  const orgId = url.searchParams.get('org_id')
  if (!orgId) return null

  return { orgId }
}
```

#### GET /api/fxl/manifest

Returns the app manifest. No org_id filtering needed (manifest is the same for all orgs).

```typescript
export async function handleManifest(): Response {
  return Response.json(APP_MANIFEST)
}
```

#### GET /api/fxl/entities/:type

Returns paginated entity list filtered by org_id.

```typescript
import { supabase } from '@/lib/supabase'
import type { FxlPaginatedResponse } from '@/types/fxl-contract'

export async function handleEntityList(
  type: string,
  orgId: string,
  page = 1,
  pageSize = 20
): Promise<FxlPaginatedResponse<Record<string, unknown>>> {
  // Validate entity type exists in manifest
  const entity = APP_MANIFEST.entities.find(e => e.type === type)
  if (!entity) throw new Error(`Unknown entity type: ${type}`)

  // Table name convention: entity type pluralized
  const tableName = `${type}s`

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  const { data, count, error } = await supabase
    .from(tableName)
    .select('*', { count: 'exact' })
    .eq('org_id', orgId)
    .order(entity.defaultSort.field, {
      ascending: entity.defaultSort.order === 'asc'
    })
    .range(from, to)

  if (error) throw error

  return {
    data: data ?? [],
    total: count ?? 0,
    page,
    pageSize
  }
}
```

#### GET /api/fxl/entities/:type/:id

Returns single entity by ID, validated against org_id.

```typescript
export async function handleEntityDetail(
  type: string,
  id: string,
  orgId: string
): Promise<Record<string, unknown> | null> {
  const tableName = `${type}s`

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .eq('id', id)
    .eq('org_id', orgId)
    .single()

  if (error) throw error
  return data
}
```

#### GET /api/fxl/widgets/:id/data

Returns widget data. Each widget type has a specific response format:

```typescript
import type {
  FxlKpiData,
  FxlChartData,
  FxlTableData,
  FxlListData
} from '@/types/fxl-contract'

export async function handleWidgetData(
  widgetId: string,
  orgId: string
): Promise<FxlKpiData | FxlChartData | FxlTableData | FxlListData> {
  // Map widget ID to data query
  // This is domain-specific — each project implements its own widget logic
  switch (widgetId) {
    case 'total-reservations':
      return await getTotalReservationsKpi(orgId)
    case 'monthly-revenue':
      return await getMonthlyRevenueChart(orgId)
    default:
      throw new Error(`Unknown widget: ${widgetId}`)
  }
}
```

#### GET /api/fxl/search?q=

Cross-entity search. Searches all entity types that have string fields.

```typescript
import type { FxlSearchResult } from '@/types/fxl-contract'

export async function handleSearch(
  query: string,
  orgId: string
): Promise<{ results: FxlSearchResult[] }> {
  const results: FxlSearchResult[] = []

  for (const entity of APP_MANIFEST.entities) {
    const stringFields = entity.fields
      .filter(f => f.type === 'string')
      .map(f => f.key)

    if (stringFields.length === 0) continue

    const tableName = `${entity.type}s`

    // Search using ilike on string fields
    // For production, consider full-text search or pg_trgm
    for (const field of stringFields) {
      const { data } = await supabase
        .from(tableName)
        .select('id, ' + field)
        .eq('org_id', orgId)
        .ilike(field, `%${query}%`)
        .limit(5)

      if (data) {
        results.push(...data.map(row => ({
          entityType: entity.type,
          entityId: row.id as string,
          title: String(row[field]),
          matchField: field
        })))
      }
    }
  }

  return { results: results.slice(0, 20) }
}
```

#### GET /api/fxl/health

Health check with contract version.

```typescript
import pkg from '../../../package.json'

export function handleHealth(): Response {
  return Response.json({
    status: 'ok' as const,
    version: pkg.version,
    contractVersion: pkg.fxlContractVersion,
    timestamp: new Date().toISOString()
  })
}
```

### 4. Add package.json Fields

```json
{
  "fxlContractVersion": "1.0",
  "fxlAppId": "{project-slug}"
}
```

### 5. Verify with Contract Checklist

Run through `checklists/contract-checklist.md` to verify all endpoints are correct.

### 6. Test Locally

```bash
# Start dev server
npm run dev

# Test endpoints
curl http://localhost:5173/api/fxl/health
curl http://localhost:5173/api/fxl/manifest
curl -H "X-FXL-API-Key: $FXL_API_KEY" "http://localhost:5173/api/fxl/entities/{type}?org_id=test-org"
```

## Important Notes

- v1 contract is read-only (GET only). Do not implement POST/PUT/DELETE.
- All entity queries MUST filter by `org_id` from the Hub-provided query parameter.
- The Hub is the only caller — it sends `org_id` alongside the API key. The spoke trusts the `org_id` only after validating the API key.
- Never expose `FXL_API_KEY` to the browser — it is a server-side secret (no `VITE_` prefix).
- Widget data queries are domain-specific — each project implements its own logic.
- Search is basic (ilike). Consider full-text search for production if dataset is large.
- The manifest and health endpoints do not need org_id filtering or API key validation (they describe the app, not data).
