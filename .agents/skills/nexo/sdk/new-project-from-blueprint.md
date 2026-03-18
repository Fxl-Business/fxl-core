# Scaffold FXL Spoke from Wireframe Builder Export

## When to Use

User has a `blueprint-export.json` from the FXL Wireframe Builder and wants to create a full spoke project from it. This builds on `sdk/new-project.md` — follow that first for base scaffold, then apply blueprint-specific generation.

## Blueprint Export Format

```typescript
interface BlueprintExport {
  client: {
    name: string              // "Casas de Praia"
    slug: string              // "beach-houses"
    branding: BrandingConfig  // colors, fonts, logo
  }
  sections: SectionConfig[]   // wireframe sections with component configs
  entities: {
    type: string              // "reservation"
    fields: FieldDefinition[] // manually defined by operator
  }[]
  pages: {
    slug: string              // "dashboard"
    label: string             // "Dashboard"
    sections: string[]        // section IDs
  }[]
}
```

## Step-by-Step

### 1. Base Scaffold

Follow `sdk/new-project.md` steps 1-8 using:
- `project-slug` = `blueprint.client.slug`
- `project-name` = `blueprint.client.name`

### 2. Apply Branding

From `blueprint.client.branding`, generate:

**tailwind.config.ts** — extend colors:
```typescript
// Extract from branding.primaryColor, branding.secondaryColor, etc.
colors: {
  primary: { DEFAULT: branding.primaryColor, ...generateShades(branding.primaryColor) },
  secondary: { DEFAULT: branding.secondaryColor, ...generateShades(branding.secondaryColor) },
}
```

**src/styles/globals.css** — add CSS variables:
```css
:root {
  --color-primary: {branding.primaryColor};
  --color-secondary: {branding.secondaryColor};
  --font-heading: {branding.headingFont};
  --font-body: {branding.bodyFont};
}
```

### 3. Generate Entity Types

For each entity in `blueprint.entities`, create `src/types/{entity.type}.ts`:

```typescript
// Example: src/types/reservation.ts
export interface Reservation {
  id: string
  org_id: string
  // ... fields from entity.fields, mapped to TS types
  created_at: string
  updated_at: string
}
```

**Field type mapping:**
| Blueprint type | TypeScript type | Database type |
|---------------|-----------------|---------------|
| string | string | text |
| number | number | numeric |
| date | string (ISO 8601) | timestamptz |
| boolean | boolean | boolean |

### 4. Generate Database Migrations

For each entity, create migration SQL:

```sql
-- supabase/migrations/001_{entity_type}.sql
CREATE TABLE {entity_type_plural} (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  org_id text NOT NULL,
  -- fields from entity.fields
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE {entity_type_plural} ENABLE ROW LEVEL SECURITY;

CREATE POLICY "{entity_type_plural}_org_access" ON {entity_type_plural}
  FOR ALL USING (
    org_id = COALESCE(
      (current_setting('request.jwt.claims', true)::jsonb->>'org_id'),
      org_id
    )
  );

CREATE INDEX idx_{entity_type_plural}_org_id ON {entity_type_plural}(org_id);
```

### 5. Generate Pages

For each page in `blueprint.pages`, create `src/pages/{PageSlug}Page.tsx`:

```typescript
// Map sections to components
// Each section has a type (hero, data-table, stats-grid, etc.)
// that corresponds to a component from the wireframe builder
```

**Section type to component mapping:**
| Section type | Generated component |
|-------------|-------------------|
| hero | HeroSection (static content) |
| stats-grid | StatsGrid (connects to KPI widgets) |
| data-table | DataTable (connects to entity endpoint) |
| chart | ChartSection (connects to chart widget) |
| form | FormSection (display only in v1 — read-only contract) |
| cards-grid | CardsGrid (connects to list widget) |

### 6. Generate Contract Manifest

From blueprint entities and pages, generate the manifest response:

```typescript
// src/api/fxl/manifest.ts
const manifest: FxlAppManifest = {
  appId: blueprint.client.slug,
  appName: blueprint.client.name,
  version: '1.0.0',
  entities: blueprint.entities.map(e => ({
    type: e.type,
    label: e.label || capitalize(e.type),
    labelPlural: e.labelPlural || capitalize(e.type) + 's',
    icon: e.icon || 'box',
    fields: e.fields,
    defaultSort: { field: 'created_at', order: 'desc' as const }
  })),
  dashboardWidgets: generateWidgetsFromSections(blueprint.sections)
}
```

### 7. Generate Entity Endpoints

For each entity, create service + endpoint:

```typescript
// src/lib/services/{entity-type}-service.ts
export async function list{EntityType}s(orgId: string, page: number, pageSize: number) {
  const { data, count } = await supabase
    .from('{entity_type_plural}')
    .select('*', { count: 'exact' })
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1)

  return { data: data ?? [], total: count ?? 0, page, pageSize }
}
```

### 8. Generate Widget Endpoints

Map sections with data to widget endpoints:

- Stats sections -> KPI widgets (`{ value, label, trend }`)
- Chart sections -> Chart widgets (`{ labels, datasets }`)
- Table sections -> Table widgets (`{ columns, rows }`)
- Card grid sections -> List widgets (`{ items }`)

### 9. Customize CLAUDE.md

Update the generated CLAUDE.md with:
- Entity descriptions and relationships
- Domain-specific rules (e.g., "reservations cannot overlap for same property")
- Page descriptions and their data sources

### 10. Verify

```bash
bunx tsc --noEmit
bun run build
bash fxl-doctor.sh
```

## Output Structure

After scaffold, the project should have:
```
{project-slug}/
  CLAUDE.md                        <- customized with domain context
  package.json                     <- with fxlContractVersion: "1.0"
  src/
    types/
      fxl-contract.ts              <- copied from SDK
      {entity}.ts                  <- per entity
    api/fxl/
      manifest.ts
      entities.ts
      widgets.ts
      search.ts
      health.ts
    lib/services/
      {entity}-service.ts          <- per entity
    pages/
      {Page}Page.tsx               <- per blueprint page
    components/
      {domain}/                    <- domain components from sections
  supabase/
    migrations/
      001_{entity}.sql             <- per entity
```

## Limitations

- v1 contract is read-only: generated forms are display-only
- Field types limited to string, number, date, boolean (no enum, no relation)
- Blueprint export feature does not exist in Wireframe Builder yet
- This rule documents the planned flow for when export becomes available
