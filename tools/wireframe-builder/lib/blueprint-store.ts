import { supabase } from '@/lib/supabase'
import type { BlueprintConfig } from '../types/blueprint'
import { BlueprintConfigSchema } from './blueprint-schema'
import { migrateBlueprint, CURRENT_SCHEMA_VERSION } from './blueprint-migrations'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LoadBlueprintResult = {
  config: BlueprintConfig
  updatedAt: string
}

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------

export async function loadBlueprint(
  clientSlug: string
): Promise<LoadBlueprintResult | null> {
  const { data, error } = await supabase
    .from('blueprint_configs')
    .select('config, updated_at')
    .eq('client_slug', clientSlug)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const raw = data.config as Record<string, unknown>
  const version = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 0

  // Lazy migration: if stored version is behind, migrate and save back
  if (version < CURRENT_SCHEMA_VERSION) {
    try {
      const migrated = migrateBlueprint(raw)

      // Save migrated config back to DB
      await supabase
        .from('blueprint_configs')
        .upsert(
          {
            client_slug: clientSlug,
            config: migrated,
            updated_by: 'system:migration',
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'client_slug' }
        )

      return { config: migrated as BlueprintConfig, updatedAt: data.updated_at }
    } catch {
      // Migration failed -- return null so caller handles gracefully
      return null
    }
  }

  // Validate via Zod safeParse (replaces unsafe `as BlueprintConfig` cast)
  const result = BlueprintConfigSchema.safeParse(raw)
  if (!result.success) {
    return null
  }

  return { config: result.data as BlueprintConfig, updatedAt: data.updated_at }
}

// ---------------------------------------------------------------------------
// Save
// ---------------------------------------------------------------------------

export async function saveBlueprint(
  clientSlug: string,
  config: BlueprintConfig,
  updatedBy: string
): Promise<void> {
  // Validate via Zod parse before writing (throws on invalid)
  const validated = BlueprintConfigSchema.parse(config)

  const { error } = await supabase
    .from('blueprint_configs')
    .upsert(
      {
        client_slug: clientSlug,
        config: validated,
        updated_by: updatedBy,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'client_slug' }
    )

  if (error) throw error
}

// ---------------------------------------------------------------------------
// Seed (dev utility)
// ---------------------------------------------------------------------------

// @internal dev utility -- never called in rendering path
export async function seedFromFile(
  clientSlug: string,
  config: BlueprintConfig,
  seededBy: string
): Promise<void> {
  const existing = await loadBlueprint(clientSlug)
  if (existing) return

  await saveBlueprint(clientSlug, config, seededBy)
}
