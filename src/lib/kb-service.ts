import { supabase } from '@platform/supabase'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type KnowledgeEntryType = 'bug' | 'decision' | 'pattern' | 'lesson'

export interface KnowledgeEntry {
  id: string
  entry_type: KnowledgeEntryType
  title: string
  body: string
  tags: string[]
  client_slug: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  // Note: search_vec is a GENERATED ALWAYS column — never included in writes
}

export interface CreateKnowledgeEntryParams {
  entry_type: KnowledgeEntryType
  title: string
  body: string
  tags?: string[]
  client_slug?: string
  created_by?: string
}

export interface UpdateKnowledgeEntryParams {
  title?: string
  body?: string
  tags?: string[]
  entry_type?: KnowledgeEntryType
  client_slug?: string
}

// ---------------------------------------------------------------------------
// CRUD + Search functions
// ---------------------------------------------------------------------------

export async function createKnowledgeEntry(
  params: CreateKnowledgeEntryParams
): Promise<KnowledgeEntry> {
  const { data, error } = await supabase
    .from('knowledge_entries')
    .insert({
      entry_type: params.entry_type,
      title: params.title,
      body: params.body,
      tags: params.tags ?? [],
      client_slug: params.client_slug ?? null,
      created_by: params.created_by ?? null,
      // search_vec is GENERATED ALWAYS — never include in insert
    })
    .select()
    .single()

  if (error) throw error
  return data as KnowledgeEntry
}

export async function listKnowledgeEntries(filters?: {
  entry_type?: KnowledgeEntryType
  client_slug?: string
  tag?: string
}): Promise<KnowledgeEntry[]> {
  let query = supabase
    .from('knowledge_entries')
    .select('*')

  if (filters?.entry_type) {
    query = query.eq('entry_type', filters.entry_type)
  }
  if (filters?.client_slug) {
    query = query.eq('client_slug', filters.client_slug)
  }
  if (filters?.tag) {
    query = query.contains('tags', [filters.tag])
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as KnowledgeEntry[]
}

export async function getKnowledgeEntry(id: string): Promise<KnowledgeEntry> {
  const { data, error } = await supabase
    .from('knowledge_entries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as KnowledgeEntry
}

export async function updateKnowledgeEntry(
  id: string,
  params: UpdateKnowledgeEntryParams
): Promise<KnowledgeEntry> {
  const { data, error } = await supabase
    .from('knowledge_entries')
    .update(params)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as KnowledgeEntry
}

export async function deleteKnowledgeEntry(id: string): Promise<void> {
  const { error } = await supabase
    .from('knowledge_entries')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function searchKnowledgeEntries(
  query: string
): Promise<KnowledgeEntry[]> {
  const { data, error } = await supabase
    .from('knowledge_entries')
    .select('*')
    .textSearch('search_vec', query, { config: 'portuguese' })
    .order('created_at', { ascending: false })

  if (error) throw error
  return (data ?? []) as KnowledgeEntry[]
}
