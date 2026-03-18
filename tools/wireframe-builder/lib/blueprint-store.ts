import { supabase } from '@platform/supabase'
import type { BlueprintConfig } from '../types/blueprint'
import { BlueprintConfigSchema } from './blueprint-schema'
import { migrateBlueprint, CURRENT_SCHEMA_VERSION } from './blueprint-migrations'
import { resolveProjectId } from './project-resolver'

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
// Internal: parse a raw DB row into a LoadBlueprintResult (with lazy migration)
// ---------------------------------------------------------------------------

async function parseRow(
  row: { config: unknown; updated_at: string },
  clientSlug: string,
  projectId: string | null,
): Promise<LoadBlueprintResult | null> {
  const raw = row.config as Record<string, unknown>
  const version = typeof raw.schemaVersion === 'number' ? raw.schemaVersion : 0

  // Lazy migration: if stored version is behind, migrate and save back
  if (version < CURRENT_SCHEMA_VERSION) {
    try {
      const migrated = migrateBlueprint(raw)

      const upsertPayload: Record<string, unknown> = {
        client_slug: clientSlug,
        config: migrated,
        updated_by: 'system:migration',
        updated_at: new Date().toISOString(),
      }
      if (projectId) {
        upsertPayload.project_id = projectId
      }

      await supabase
        .from('blueprint_configs')
        .upsert(upsertPayload, { onConflict: 'client_slug' })

      return { config: migrated as BlueprintConfig, updatedAt: row.updated_at }
    } catch {
      return null
    }
  }

  const result = BlueprintConfigSchema.safeParse(raw)
  if (!result.success) {
    return null
  }

  return { config: result.data as BlueprintConfig, updatedAt: row.updated_at }
}

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------

export async function loadBlueprint(
  clientSlug: string
): Promise<LoadBlueprintResult | null> {
  const projectId = await resolveProjectId(clientSlug)

  // Try project_id first
  if (projectId) {
    const { data, error } = await supabase
      .from('blueprint_configs')
      .select('config, updated_at')
      .eq('project_id', projectId)
      .maybeSingle()

    if (!error && data) {
      return parseRow(data, clientSlug, projectId)
    }
  }

  // Fallback: query by client_slug
  const { data, error } = await supabase
    .from('blueprint_configs')
    .select('config, updated_at')
    .eq('client_slug', clientSlug)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return parseRow(data, clientSlug, projectId)
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
  const validated = BlueprintConfigSchema.parse(config)
  const now = new Date().toISOString()
  const projectId = await resolveProjectId(clientSlug)

  // Build base payload
  const basePayload: Record<string, unknown> = {
    client_slug: clientSlug,
    config: validated,
    updated_by: updatedBy,
    updated_at: now,
  }
  if (projectId) {
    basePayload.project_id = projectId
  }

  // If no lastKnownUpdatedAt, use upsert (new record or force overwrite)
  if (lastKnownUpdatedAt === null) {
    const { error } = await supabase
      .from('blueprint_configs')
      .upsert(basePayload, { onConflict: 'client_slug' })

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
      ...(projectId ? { project_id: projectId } : {}),
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

  return { success: true, conflict: false, updatedAt: data.updated_at }
}

// ---------------------------------------------------------------------------
// Polling utility
// ---------------------------------------------------------------------------

export async function checkForUpdates(
  clientSlug: string
): Promise<string | null> {
  const projectId = await resolveProjectId(clientSlug)

  if (projectId) {
    const { data } = await supabase
      .from('blueprint_configs')
      .select('updated_at')
      .eq('project_id', projectId)
      .maybeSingle()
    if (data) return data.updated_at ?? null
  }

  // Fallback
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
