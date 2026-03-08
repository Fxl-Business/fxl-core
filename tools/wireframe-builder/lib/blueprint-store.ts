import { supabase } from '@/lib/supabase'
import type { BlueprintConfig } from '../types/blueprint'

export async function loadBlueprint(
  clientSlug: string
): Promise<BlueprintConfig | null> {
  const { data, error } = await supabase
    .from('blueprint_configs')
    .select('config')
    .eq('client_slug', clientSlug)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return data.config as BlueprintConfig
}

export async function saveBlueprint(
  clientSlug: string,
  config: BlueprintConfig,
  updatedBy: string
): Promise<void> {
  const { error } = await supabase
    .from('blueprint_configs')
    .upsert(
      {
        client_slug: clientSlug,
        config,
        updated_by: updatedBy,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'client_slug' }
    )

  if (error) throw error
}

export async function seedFromFile(
  clientSlug: string,
  config: BlueprintConfig,
  seededBy: string
): Promise<void> {
  const existing = await loadBlueprint(clientSlug)
  if (existing) return

  await saveBlueprint(clientSlug, config, seededBy)
}
