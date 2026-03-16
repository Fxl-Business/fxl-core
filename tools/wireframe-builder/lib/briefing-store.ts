import { supabase } from '@platform/supabase'
import type { BriefingConfig } from '../types/briefing'
import { BriefingConfigSchema } from './briefing-schema'

// ---------------------------------------------------------------------------
// Load
// ---------------------------------------------------------------------------

export async function loadBriefing(
  clientSlug: string
): Promise<BriefingConfig | null> {
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
