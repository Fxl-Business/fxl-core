import { supabase } from '@platform/supabase'
import type { Project, ProjectWithClient, CreateProjectParams } from '../types/project'

// ---------------------------------------------------------------------------
// List all projects for the current org (RLS filters by org_id)
// ---------------------------------------------------------------------------

export async function listProjects(): Promise<ProjectWithClient[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*, clients(name)')
    .order('name', { ascending: true })

  if (error) throw error

  return (data ?? []).map((row) => {
    const clientRow = row.clients as { name: string } | null
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      client_id: row.client_id,
      org_id: row.org_id,
      created_at: row.created_at,
      client_name: clientRow?.name ?? null,
    } satisfies ProjectWithClient
  })
}

// ---------------------------------------------------------------------------
// Get a single project by slug (RLS filters by org_id)
// ---------------------------------------------------------------------------

export async function getProjectBySlug(slug: string): Promise<ProjectWithClient> {
  const { data, error } = await supabase
    .from('projects')
    .select('*, clients(name)')
    .eq('slug', slug)
    .single()

  if (error) throw error

  const clientRow = data.clients as { name: string } | null
  return {
    id: data.id,
    slug: data.slug,
    name: data.name,
    client_id: data.client_id,
    org_id: data.org_id,
    created_at: data.created_at,
    client_name: clientRow?.name ?? null,
  } satisfies ProjectWithClient
}

// ---------------------------------------------------------------------------
// Get project_id by slug — used by stores for the project_id migration
// ---------------------------------------------------------------------------

export async function getProjectIdBySlug(slug: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('projects')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (error) return null
  return data?.id ?? null
}

// ---------------------------------------------------------------------------
// Create a new project
// ---------------------------------------------------------------------------

export async function createProject(params: CreateProjectParams): Promise<Project> {
  const { data, error } = await supabase
    .from('projects')
    .insert({
      name: params.name,
      slug: params.slug,
      client_id: params.client_id ?? null,
    })
    .select()
    .single()

  if (error) throw error
  return data as Project
}
