import { supabase } from '@platform/supabase'

/**
 * In-memory cache of slug -> project_id to avoid repeated DB lookups.
 * Stores use this to resolve project_id from the slug passed via route params.
 */
const projectIdCache = new Map<string, string>()

/**
 * Resolve a project slug to its project_id (UUID).
 *
 * Used by stores (briefing-store, blueprint-store, comments, tokens) during the
 * migration from client_slug to project_id as primary key.
 *
 * Returns null if no matching project is found (backward compat: stores should
 * fall back to client_slug queries).
 */
export async function resolveProjectId(slug: string): Promise<string | null> {
  const cached = projectIdCache.get(slug)
  if (cached) return cached

  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) return null

  projectIdCache.set(slug, data.id)
  return data.id
}

/**
 * Clear the project_id cache. Useful after creating a new project.
 */
export function clearProjectIdCache(): void {
  projectIdCache.clear()
}
