# Phase 7: Blueprint Infrastructure - Research

**Researched:** 2026-03-09
**Domain:** Supabase JSONB storage, Zod runtime validation, optimistic locking, schema versioning
**Confidence:** HIGH

## Summary

Phase 7 migrates blueprint storage from file-based `.ts` config to Supabase-only, adding runtime validation via Zod, schema versioning for future evolution, and optimistic locking to prevent concurrent edit conflicts. The codebase already has a working `blueprint-store.ts` (49 lines) with `loadBlueprint`/`saveBlueprint`/`seedFromFile` functions, a `blueprint_configs` table in Supabase with JSONB `config` column, and two consumers (`WireframeViewer.tsx` for operators, `SharedWireframeView.tsx` for clients) that both import the `.ts` config file as fallback/seed.

The migration is well-scoped: the discriminated union in `BlueprintSection` (15 types) maps directly to Zod's `z.discriminatedUnion("type", [...])` API. The existing `updated_at` column in `blueprint_configs` provides the timestamp needed for optimistic locking. Two new dependencies are required: `zod` for validation and `sonner` for toast notifications (the shadcn/ui standard).

**Primary recommendation:** Replace the unsafe `as BlueprintConfig` cast in `blueprint-store.ts` line 16 with Zod `safeParse`, add `schemaVersion` to `BlueprintConfig` type, implement optimistic locking via `updated_at` check on save, and remove all `.ts` config file imports from rendering paths.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Clean cutover: seed pilot client (financeiro-conta-azul) to DB, then remove .ts file from repo entirely (not rename)
- DB is the sole source of truth -- no .ts file fallback in rendering path
- Remove `blueprintMap` hardcoded imports from SharedWireframeView.tsx
- New clients created via UI (empty blueprint) or via Claude Code (generated from briefing -- Phase 11)
- Both creation paths write directly to Supabase
- Conflict UX: Modal with two options when conflict detected: "Recarregar" (lose local edits, get DB version) or "Sobrescrever" (overwrite DB with local)
- Primary use case: single operator with 2 tabs open (rare real conflicts)
- Periodic polling (~30s) to detect stale data proactively, not just at save time
- Stale data warning: banner or subtle indicator that blueprint was updated externally
- Validate on both load and save (bidirectional protection)
- Error notification via toast (sonner) -- non-intrusive
- schemaVersion lives inside the JSON (field in BlueprintConfig), not as DB column
- Lazy migration on read: when loading an older schemaVersion, auto-migrate to current and save back
- New fields on existing section types are always optional with defaults -- old blueprints work without migration
- No batch migration scripts needed for v1.1 -- lazy migration is the sole strategy

### Claude's Discretion
- seedFromFile handling: keep as dev/testing utility or remove entirely. Key constraint: never called in rendering path.
- Validation error UX: whether to block rendering entirely or show partial with placeholder for invalid sections.

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope.

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| INFRA-01 | Operador pode salvar e carregar blueprint exclusivamente do Supabase (arquivo .ts removido como fonte de verdade) | Zod safeParse replaces unsafe cast; blueprint-store.ts refactored to validate on load; all .ts file imports removed from WireframeViewer.tsx and SharedWireframeView.tsx; blueprintMap eliminated |
| INFRA-02 | Blueprint armazenado com campo schemaVersion e funcoes de migracao para evolucao segura | schemaVersion added to BlueprintConfig type and Zod schema; lazy migration pattern on read with version-keyed migrator registry |
| INFRA-03 | Blueprint validado em runtime via zod parse em vez de cast TypeScript | Zod discriminatedUnion schema mirrors 15 section types; safeParse on load + parse on save; toast error notification via sonner |
| INFRA-04 | Edicao concorrente de blueprint protegida por optimistic locking (updated_at check) | Supabase update().eq('updated_at', lastKnownTimestamp) pattern; conflict modal UX; ~30s polling interval for stale detection |

</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zod | ^4.0.0 | Runtime schema validation + type inference | TypeScript-first, z.discriminatedUnion maps perfectly to existing BlueprintSection union, safeParse for non-throwing validation |
| sonner | ^2.0.7 | Toast notifications for validation errors and save feedback | shadcn/ui default toast, one-line API `toast.error()`, already styled for the component system |
| @supabase/supabase-js | ^2.98.0 (already installed) | Database client for blueprint CRUD + optimistic locking | Already in use, .update().eq() provides conditional update for locking |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| vitest | ^4.0.18 (already installed) | Unit tests for Zod schemas and migration functions | Testing validation schemas, migration functions, optimistic locking logic |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| zod | io-ts, yup, arktype | Zod has best TS inference, discriminatedUnion API, and largest ecosystem; io-ts heavier, yup lacks discriminated unions, arktype newer/less stable |
| sonner | react-hot-toast, react-toastify | sonner is shadcn/ui default, minimal API, already styled for project's design system |
| updated_at locking | version integer column | Timestamp already exists in DB schema; adding version column would require migration for no benefit at this scale |

**Installation:**
```bash
npm install zod sonner
```

## Architecture Patterns

### Recommended Project Structure
```
tools/wireframe-builder/
  lib/
    blueprint-store.ts        # Refactored: load/save with Zod + locking
    blueprint-schema.ts       # NEW: Zod schemas for all 15 section types + BlueprintConfig
    blueprint-migrations.ts   # NEW: version-keyed migrators (v1->v2, v2->v3, etc.)
  types/
    blueprint.ts              # MODIFIED: add schemaVersion field to BlueprintConfig
src/
  components/ui/
    sonner.tsx                # NEW: shadcn/ui Toaster wrapper
  hooks/
    use-blueprint.ts          # NEW: custom hook encapsulating load/save/poll/conflict logic
```

### Pattern 1: Zod Discriminated Union for BlueprintSection
**What:** Mirror the existing TypeScript discriminated union (`BlueprintSection`) as a Zod schema using `z.discriminatedUnion("type", [...])` for runtime validation.
**When to use:** Every time data flows from Supabase JSONB into the application (load) and from the application back to Supabase (save).
**Example:**
```typescript
// Source: Zod API docs (https://zod.dev/api#discriminated-unions)
import { z } from 'zod'

const KpiConfigSchema = z.object({
  label: z.string(),
  value: z.string(),
  sub: z.string().optional(),
  variation: z.string().optional(),
  variationPositive: z.boolean().optional(),
  sparkline: z.array(z.number()).optional(),
  semaforo: z.enum(['verde', 'amarelo', 'vermelho']).optional(),
  semaforoLabel: z.string().optional(),
  wide: z.boolean().optional(),
})

const KpiGridSectionSchema = z.object({
  type: z.literal('kpi-grid'),
  columns: z.number().optional(),
  groupLabel: z.string().optional(),
  items: z.array(KpiConfigSchema),
})

// ... 14 more section type schemas ...

const BlueprintSectionSchema = z.discriminatedUnion('type', [
  KpiGridSectionSchema,
  BarLineChartSectionSchema,
  DonutChartSectionSchema,
  // ... all 15 types
])

const BlueprintScreenSchema = z.object({
  id: z.string(),
  title: z.string(),
  icon: z.string().optional(),
  periodType: z.enum(['mensal', 'anual', 'none']),
  filters: z.array(FilterOptionSchema),
  hasCompareSwitch: z.boolean(),
  sections: z.array(BlueprintSectionSchema),
  rows: z.array(ScreenRowSchema).optional(),
})

const BlueprintConfigSchema = z.object({
  slug: z.string(),
  label: z.string(),
  schemaVersion: z.number().default(1),
  screens: z.array(BlueprintScreenSchema),
})

export type BlueprintConfig = z.infer<typeof BlueprintConfigSchema>
```

### Pattern 2: Optimistic Locking via updated_at
**What:** On save, include the last-known `updated_at` value as an `.eq()` filter. If another tab/session updated the row since the last read, the update affects 0 rows, signaling a conflict.
**When to use:** Every `saveBlueprint` call in the operator editor.
**Example:**
```typescript
// Pattern: conditional update for optimistic locking
export async function saveBlueprint(
  clientSlug: string,
  config: BlueprintConfig,
  updatedBy: string,
  lastKnownUpdatedAt: string // ISO timestamp from last load
): Promise<{ success: boolean; conflict: boolean; updatedAt?: string }> {
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('blueprint_configs')
    .update({
      config,
      updated_by: updatedBy,
      updated_at: now,
    })
    .eq('client_slug', clientSlug)
    .eq('updated_at', lastKnownUpdatedAt) // optimistic lock
    .select('updated_at')

  if (error) throw error

  // If no rows returned, another session modified the row
  if (!data || data.length === 0) {
    return { success: false, conflict: true }
  }

  return { success: true, conflict: false, updatedAt: data[0].updated_at }
}
```

### Pattern 3: Lazy Schema Migration
**What:** On load, check `schemaVersion` of stored JSON. If older than current, run migration chain and save back.
**When to use:** Every `loadBlueprint` call. Keeps migration invisible to consumers.
**Example:**
```typescript
const CURRENT_SCHEMA_VERSION = 1

type Migrator = (config: Record<string, unknown>) => Record<string, unknown>

// Registry: version N migrates from N to N+1
const migrators: Record<number, Migrator> = {
  // Example for future: 1 -> 2
  // 1: (config) => ({ ...config, newField: 'default', schemaVersion: 2 }),
}

export function migrateBlueprint(raw: Record<string, unknown>): BlueprintConfig {
  let version = (raw.schemaVersion as number) ?? 0
  let current = { ...raw }

  while (version < CURRENT_SCHEMA_VERSION) {
    const migrator = migrators[version]
    if (!migrator) {
      throw new Error(`No migrator for schema version ${version}`)
    }
    current = migrator(current)
    version = (current.schemaVersion as number) ?? version + 1
  }

  // Validate final result
  const result = BlueprintConfigSchema.safeParse(current)
  if (!result.success) {
    throw new Error(`Migration to v${CURRENT_SCHEMA_VERSION} produced invalid config`)
  }
  return result.data
}
```

### Pattern 4: Polling for Stale Data Detection
**What:** Periodically check the `updated_at` timestamp in the DB against the locally known value. If different, show a banner/indicator.
**When to use:** While in edit mode, poll every ~30s.
**Example:**
```typescript
// Inside use-blueprint hook
useEffect(() => {
  if (!editMode || !clientSlug || !lastKnownUpdatedAt) return

  const interval = setInterval(async () => {
    const { data } = await supabase
      .from('blueprint_configs')
      .select('updated_at')
      .eq('client_slug', clientSlug)
      .single()

    if (data && data.updated_at !== lastKnownUpdatedAt) {
      setStaleWarning(true)
    }
  }, 30_000) // 30 seconds

  return () => clearInterval(interval)
}, [editMode, clientSlug, lastKnownUpdatedAt])
```

### Anti-Patterns to Avoid
- **Keeping .ts file as fallback:** The decision is clean cutover -- no file fallback. If DB is empty, show "blueprint not found", never import .ts.
- **Using `as BlueprintConfig` cast:** This is the exact problem being solved. Every data path from Supabase must go through Zod safeParse.
- **Storing schemaVersion as DB column:** Decision is JSON-internal field. DB column would require SQL migration for every schema change.
- **Polling outside edit mode:** Waste of resources. Only poll when operator is in edit mode.
- **Full config comparison for stale detection:** Compare only `updated_at` timestamp, not entire config. Cheap and sufficient.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Runtime type validation | Manual type guards for 15 section types | Zod discriminatedUnion | 15 section types with nested objects = hundreds of checks; Zod generates them from schema |
| Toast notifications | Custom notification system | sonner (shadcn/ui default) | Styling, positioning, stacking, accessibility all handled |
| Optimistic concurrency | Custom locking table or advisory locks | Supabase update().eq('updated_at', ...) | The `updated_at` column already exists; conditional update is one line |
| Schema migration framework | Generic migration runner | Simple version-keyed function registry | Only 1-2 migrations expected; full framework is overkill |

**Key insight:** The existing `updated_at` column and Supabase's filter-on-update pattern provide optimistic locking without any DB schema changes. The Zod discriminatedUnion API maps 1:1 to the existing TypeScript discriminated union type -- this is the exact use case it was designed for.

## Common Pitfalls

### Pitfall 1: Zod Schema Drift from TypeScript Types
**What goes wrong:** The Zod schema and the TypeScript `BlueprintSection` type diverge over time. A new section type is added to one but not the other.
**Why it happens:** Two separate definitions of the same structure.
**How to avoid:** Use `z.infer<typeof BlueprintConfigSchema>` as the canonical type. Export the inferred type from `blueprint-schema.ts` and import it everywhere. Remove the manual type definitions from `types/blueprint.ts` or keep them only as reference/comments.
**Warning signs:** TypeScript compiles but Zod rejects valid data, or Zod accepts data TypeScript flags.

### Pitfall 2: Timestamp Precision Mismatch
**What goes wrong:** JavaScript `new Date().toISOString()` produces microsecond precision, but PostgreSQL `timestamptz` may round differently. The `.eq('updated_at', lastKnownTimestamp)` comparison fails even when no concurrent edit occurred.
**Why it happens:** PostgreSQL stores timestamps with microsecond precision, but there can be rounding differences between client and server.
**How to avoid:** Always use the `updated_at` value returned by the SELECT/UPDATE query (from Supabase), never generate it client-side for comparison. The save function returns `updated_at` from the DB via `.select('updated_at')`.
**Warning signs:** Saves fail with "conflict detected" even when only one tab is editing.

### Pitfall 3: Stale Data on Initial Load After Migration
**What goes wrong:** Lazy migration reads old config, migrates it, saves it back. But the save-back changes `updated_at`. If the UI was rendered before save-back completes, the locally cached `updated_at` is now wrong.
**Why it happens:** Migration save-back is a side effect of load.
**How to avoid:** The `loadBlueprint` function must return the fresh `updated_at` after migration save-back. Store and use this returned timestamp, not the original one.
**Warning signs:** First save after migration triggers false conflict.

### Pitfall 4: Recursive BlueprintSection in ChartGridSection
**What goes wrong:** `ChartGridSection` has `items: BlueprintSection[]` -- a recursive type. Zod requires `z.lazy()` for recursive schemas, but `z.discriminatedUnion` inside `z.lazy` needs careful ordering.
**Why it happens:** The ChartGrid section contains nested sections (charts inside a grid).
**How to avoid:** Define `BlueprintSectionSchema` with `z.lazy()` for the items field of ChartGridSection. Use a function reference pattern:
```typescript
const ChartGridSectionSchema = z.object({
  type: z.literal('chart-grid'),
  columns: z.number().optional(),
  items: z.lazy(() => z.array(BlueprintSectionSchema)),
})
```
**Warning signs:** "Maximum call stack exceeded" or "type not assignable" errors during schema definition.

### Pitfall 5: Not Returning updated_at from loadBlueprint
**What goes wrong:** The load function returns only the config, not the `updated_at` metadata. The editor has no baseline for optimistic locking.
**Why it happens:** Current `loadBlueprint` only selects `config` column.
**How to avoid:** Change load to `select('config, updated_at')` and return both. The hook/consumer must track `updatedAt` alongside the config.
**Warning signs:** Optimistic locking impossible because there's no baseline timestamp.

### Pitfall 6: Forgetting to Update Sonner's Toaster in App Root
**What goes wrong:** `toast.error()` calls do nothing because `<Toaster />` is not mounted.
**Why it happens:** sonner requires a single `<Toaster />` component mounted at the app root.
**How to avoid:** Add `<Toaster />` in `App.tsx` immediately. Test toast appears before wiring real validation.
**Warning signs:** No visual feedback on validation errors.

## Code Examples

Verified patterns from official sources:

### Supabase Conditional Update for Optimistic Locking
```typescript
// Source: Supabase JS docs (https://supabase.com/docs/reference/javascript/update)
// Pattern: update only if updated_at matches, return updated row
const { data, error } = await supabase
  .from('blueprint_configs')
  .update({
    config: validatedConfig,
    updated_by: userId,
    updated_at: new Date().toISOString(),
  })
  .eq('client_slug', clientSlug)
  .eq('updated_at', lastKnownUpdatedAt)
  .select('updated_at')
  .maybeSingle()

if (error) throw error
if (!data) {
  // Conflict: row was modified since last load
  return { conflict: true }
}
```

### Zod safeParse for Non-Throwing Validation
```typescript
// Source: Zod docs (https://zod.dev/api)
const result = BlueprintConfigSchema.safeParse(data.config)
if (!result.success) {
  // result.error.issues has structured error info
  const messages = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`)
  toast.error('Blueprint invalido', {
    description: messages.join('\n'),
  })
  return null
}
return result.data // fully typed BlueprintConfig
```

### Sonner Toast for Validation Errors
```typescript
// Source: sonner docs (https://sonner.emilkowal.ski/getting-started)
import { toast } from 'sonner'

// Error toast for validation failure
toast.error('Erro de validacao', {
  description: 'O blueprint contém campos invalidos. Verifique a estrutura.',
})

// Warning toast for stale data
toast.warning('Blueprint atualizado externamente', {
  description: 'Outra sessao modificou este blueprint.',
  action: {
    label: 'Recarregar',
    onClick: () => reloadBlueprint(),
  },
})

// Success toast for save
toast.success('Blueprint salvo com sucesso')
```

### Conflict Resolution Modal
```typescript
// Pattern: Dialog with two options
// Uses existing project pattern (see WireframeViewer.tsx unsaved changes dialog)
function ConflictModal({
  open,
  onReload,
  onOverwrite,
}: {
  open: boolean
  onReload: () => void
  onOverwrite: () => void
}) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-sm rounded-lg border bg-background p-6 shadow-lg">
        <h3 className="text-base font-semibold text-foreground">
          Conflito detectado
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Este blueprint foi modificado por outra sessao desde a ultima leitura.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onReload}
            className="rounded-md border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Recarregar
          </button>
          <button
            type="button"
            onClick={onOverwrite}
            className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90"
          >
            Sobrescrever
          </button>
        </div>
      </div>
    </div>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `as TypeName` cast for JSONB data | Zod safeParse with z.infer for type + runtime safety | Standard practice since Zod 3.x (2023+) | Catches structural errors before they cause runtime crashes |
| Version column (integer) for locking | updated_at timestamp with conditional update | Standard for low-contention scenarios | No extra column needed when timestamp already exists |
| Batch migration scripts | Lazy migration on read with version check | Common in document-store patterns | Eliminates deployment-time migration step for JSON schema changes |
| Zod v3 z.discriminatedUnion | Zod v4 z.discriminatedUnion (composable) | July 2025 (Zod v4 release) | Better error messages, composable unions, slimmer bundle |

**Deprecated/outdated:**
- Zod v3: Still works but v4 is recommended for new projects (better TS compilation, composable discriminated unions)
- `as Type` casts on JSONB: Universally discouraged when runtime validation libraries exist

## Open Questions

1. **seedFromFile Retention Decision**
   - What we know: CONTEXT.md marks this as Claude's Discretion. It's used in 2 files (WireframeViewer.tsx line 82, SharedWireframeView.tsx line 133) as a fallback when DB is empty.
   - What's unclear: Whether the function should be kept as a dev utility or removed entirely.
   - Recommendation: Keep `seedFromFile` as a dev-only utility in `blueprint-store.ts` but remove all call sites from rendering paths. It can be useful for resetting test data via console. Add a `// @internal dev utility` comment.

2. **Validation Error Rendering Strategy**
   - What we know: CONTEXT.md marks this as Claude's Discretion. Two options: block rendering entirely, or show partial with placeholder.
   - What's unclear: Which provides better UX for the operator.
   - Recommendation: Block rendering and show full-screen error with details. Partial rendering with invalid data risks confusing the operator. The error should show which fields/sections are invalid and suggest "contact dev" since malformed data in DB typically means a code bug, not user error.

3. **Zod v3 vs v4**
   - What we know: Zod v4 (4.3.6) is stable since July 2025. The project has no existing Zod dependency.
   - What's unclear: Whether v4 has any edge cases with the specific recursive discriminated union pattern (ChartGridSection).
   - Recommendation: Use Zod v4 (`zod@^4.0.0`). New project, no migration needed. The composable discriminated unions in v4 are specifically beneficial for the recursive ChartGrid case.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | vitest ^4.0.18 |
| Config file | vitest.config.ts (exists, includes tools/**/*.test.ts pattern) |
| Quick run command | `npx vitest run --reporter=verbose` |
| Full suite command | `npx vitest run` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| INFRA-01 | loadBlueprint returns validated config from DB, no .ts fallback | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-store.test.ts -t "load" -x` | No -- Wave 0 |
| INFRA-02 | schemaVersion persists in JSON, migration chain runs correctly | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-migrations.test.ts -x` | No -- Wave 0 |
| INFRA-03 | Zod schema accepts valid blueprints, rejects malformed ones | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-schema.test.ts -x` | No -- Wave 0 |
| INFRA-04 | saveBlueprint detects conflict when updated_at differs | unit | `npx vitest run tools/wireframe-builder/lib/blueprint-store.test.ts -t "conflict" -x` | No -- Wave 0 |

### Sampling Rate
- **Per task commit:** `npx vitest run --reporter=verbose`
- **Per wave merge:** `npx vitest run`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tools/wireframe-builder/lib/blueprint-schema.test.ts` -- covers INFRA-03 (Zod schema validation for all 15 section types, valid/invalid cases)
- [ ] `tools/wireframe-builder/lib/blueprint-store.test.ts` -- covers INFRA-01, INFRA-04 (load/save with mock Supabase, conflict detection)
- [ ] `tools/wireframe-builder/lib/blueprint-migrations.test.ts` -- covers INFRA-02 (version detection, migration chain, idempotency)

Note: Store tests will require mocking `@/lib/supabase`. The existing test pattern (vitest, describe/it/expect) is established in `br-normalizer.test.ts`.

## Codebase Audit: Files That Must Change

### Must Modify
| File | What Changes | Requirement |
|------|-------------|-------------|
| `tools/wireframe-builder/lib/blueprint-store.ts` | Replace `as BlueprintConfig` with Zod parse; add `updated_at` to select/return; add optimistic locking to save; return conflict status | INFRA-01, INFRA-03, INFRA-04 |
| `tools/wireframe-builder/types/blueprint.ts` | Add `schemaVersion: number` to `BlueprintConfig` type (or derive from Zod schema) | INFRA-02 |
| `src/pages/clients/FinanceiroContaAzul/WireframeViewer.tsx` | Remove `import seedConfig`, remove `blueprintMap` fallback, wire save to use optimistic locking, add conflict modal, add stale polling | INFRA-01, INFRA-04 |
| `src/pages/SharedWireframeView.tsx` | Remove `blueprintMap`, remove `seedFromFile` import, remove `.ts` fallback logic, add Zod validation on load | INFRA-01, INFRA-03 |
| `src/App.tsx` | Add `<Toaster />` from sonner | INFRA-03 |

### Must Create
| File | Purpose | Requirement |
|------|---------|-------------|
| `tools/wireframe-builder/lib/blueprint-schema.ts` | Zod schemas for all section types + BlueprintConfig | INFRA-03 |
| `tools/wireframe-builder/lib/blueprint-migrations.ts` | Version-keyed migration functions | INFRA-02 |
| `src/components/ui/sonner.tsx` | shadcn/ui Toaster wrapper | INFRA-03 |

### Must Delete
| File | Reason | Requirement |
|------|--------|-------------|
| `clients/financeiro-conta-azul/wireframe/blueprint.config.ts` | Data moves to Supabase exclusively; file is seed source only | INFRA-01 |

### Seeding Prerequisite
Before deleting the `.ts` config file, the pilot client data must be confirmed present in Supabase `blueprint_configs` table. The existing `seedFromFile` can be used one final time for this, or a direct DB insert can be performed.

## Sources

### Primary (HIGH confidence)
- Zod official docs (https://zod.dev/api) - discriminatedUnion, safeParse, z.infer, z.lazy, z.object APIs
- Zod v4 release notes (https://zod.dev/v4) - composable discriminated unions, version stability
- Supabase JS docs (https://supabase.com/docs/reference/javascript/update) - update().eq() conditional pattern
- Sonner official docs (https://sonner.emilkowal.ski/getting-started) - toast API, error/warning/success variants
- shadcn/ui sonner integration (https://ui.shadcn.com/docs/components/radix/sonner) - installation and Toaster setup

### Secondary (MEDIUM confidence)
- Optimistic locking patterns with timestamps (https://www.coditation.com/blog/implementing-concurrent-data-updates-with-optimistic-locking) - verified pattern matches Supabase .eq() approach
- Supabase concurrent write handling (https://bootstrapped.app/guide/how-to-handle-concurrent-writes-in-supabase) - confirmed app-level locking via conditional updates

### Tertiary (LOW confidence)
- None -- all critical patterns verified against official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Zod, sonner, Supabase all verified via official docs; project already uses Supabase
- Architecture: HIGH - All patterns verified; existing codebase structures (discriminated union, blueprint-store) map cleanly to proposed changes
- Pitfalls: HIGH - Identified from actual codebase analysis (recursive ChartGrid type, timestamp precision, migration side effects)
- Validation: HIGH - vitest already configured and used in project; test patterns established

**Research date:** 2026-03-09
**Valid until:** 2026-04-09 (stable libraries, low churn)
