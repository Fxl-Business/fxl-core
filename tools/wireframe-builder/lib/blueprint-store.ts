import { supabase } from '@platform/supabase'
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

export type SaveBlueprintResult = {
  success: boolean
  conflict: boolean
  updatedAt?: string
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
  updatedBy: string,
  lastKnownUpdatedAt: string | null
): Promise<SaveBlueprintResult> {
  // Validate via Zod parse before writing (throws on invalid)
  const validated = BlueprintConfigSchema.parse(config)

  const now = new Date().toISOString()

  // If no lastKnownUpdatedAt, use upsert (new record or force overwrite)
  if (lastKnownUpdatedAt === null) {
    const { error } = await supabase
      .from('blueprint_configs')
      .upsert(
        {
          client_slug: clientSlug,
          config: validated,
          updated_by: updatedBy,
          updated_at: now,
        },
        { onConflict: 'client_slug' }
      )

    if (error) throw error
    return { success: true, conflict: false, updatedAt: now }
  }

  // Optimistic locking: conditional update where updated_at must match
  const { data, error } = await supabase
    .from('blueprint_configs')
    .update({
      config: validated,
      updated_by: updatedBy,
      updated_at: now,
    })
    .eq('client_slug', clientSlug)
    .eq('updated_at', lastKnownUpdatedAt)
    .select('updated_at')
    .maybeSingle()

  if (error) throw error

  // If no row matched, updated_at changed -- conflict detected
  if (!data) {
    return { success: false, conflict: true }
  }

  // Return the DB-assigned updated_at for next comparison
  return { success: true, conflict: false, updatedAt: data.updated_at }
}

// ---------------------------------------------------------------------------
// Polling utility
// ---------------------------------------------------------------------------

export async function checkForUpdates(
  clientSlug: string
): Promise<string | null> {
  const { data } = await supabase
    .from('blueprint_configs')
    .select('updated_at')
    .eq('client_slug', clientSlug)
    .single()
  return data?.updated_at ?? null
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

  await saveBlueprint(clientSlug, config, seededBy, null)
}
