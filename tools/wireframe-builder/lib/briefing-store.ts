import { supabase } from '@platform/supabase'
import type { BriefingConfig } from '../types/briefing'
import { BriefingConfigSchema } from './briefing-schema'
import { resolveProjectId } from './project-resolver'

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------

export async function loadBriefing(
  clientSlug: string
): Promise<BriefingConfig | null> {
  // Try project_id first (new path)
  const projectId = await resolveProjectId(clientSlug)

  if (projectId) {
    const { data, error } = await supabase
      .from('briefing_configs')
      .select('config')
      .eq('project_id', projectId)
      .maybeSingle()

    if (!error && data) {
      const result = BriefingConfigSchema.safeParse(data.config)
      return result.success ? (result.data as BriefingConfig) : null
    }
  }

  // Fallback: query by client_slug (backward compat for rows without project_id)
  const { data, error } = await supabase
    .from('briefing_configs')
    .select('config')
    .eq('client_slug', clientSlug)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  const result = BriefingConfigSchema.safeParse(data.config)
  if (!result.success) {
    return null
  }

  return result.data as BriefingConfig
}

// ---------------------------------------------------------------------------
// Save (upsert — single-operator editing, no optimistic locking)
// ---------------------------------------------------------------------------

export async function saveBriefing(
  clientSlug: string,
  config: BriefingConfig,
  updatedBy: string
): Promise<void> {
  const validated = BriefingConfigSchema.parse(config)
  const projectId = await resolveProjectId(clientSlug)

  if (projectId) {
    // New path: upsert by project_id
    const { error } = await supabase
      .from('briefing_configs')
      .upsert(
        {
          client_slug: clientSlug,
          project_id: projectId,
          config: validated,
          updated_by: updatedBy,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'client_slug' }
      )

    if (error) throw error
    return
  }

  // Fallback: upsert by client_slug only
  const { error } = await supabase
    .from('briefing_configs')
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
