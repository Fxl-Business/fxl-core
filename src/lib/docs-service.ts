import { supabase } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DocumentRow = {
  id: string
  title: string
  badge: string
  description: string
  slug: string
  parent_path: string
  body: string
  sort_order: number
  created_at: string
  updated_at: string
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/** Fetch a single document by its slug (e.g., "processo/fases/fase1"). */
export async function getDocBySlug(slug: string): Promise<DocumentRow | null> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error || !data) return null
  return data as DocumentRow
}

/** Fetch all documents ordered by parent_path then sort_order. */
export async function getAllDocuments(): Promise<DocumentRow[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('parent_path')
    .order('sort_order')

  if (error || !data) return []
  return data as DocumentRow[]
}

/** Fetch documents under a specific parent path, ordered by sort_order. */
export async function getDocsByParentPath(parentPath: string): Promise<DocumentRow[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('parent_path', parentPath)
    .order('sort_order')

  if (error || !data) return []
  return data as DocumentRow[]
}
