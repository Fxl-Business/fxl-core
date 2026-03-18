import { supabase } from '@platform/supabase'
import type { Client, CreateClientParams, UpdateClientParams } from '../types'

// ---------------------------------------------------------------------------
// CRUD functions for the `clients` table
// ---------------------------------------------------------------------------

export async function listClients(): Promise<Client[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('name', { ascending: true })

  if (error) throw error
  return (data ?? []) as Client[]
}

export async function getClientBySlug(slug: string): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data as Client
}

export async function createClient(params: CreateClientParams): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .insert({
      name: params.name,
      slug: params.slug,
      description: params.description ?? '',
      logo_url: params.logo_url ?? null,
      status: params.status ?? 'active',
    })
    .select()
    .single()

  if (error) throw error
  return data as Client
}

export async function updateClient(
  id: string,
  params: UpdateClientParams,
): Promise<Client> {
  const { data, error } = await supabase
    .from('clients')
    .update(params)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Client
}

export async function deleteClient(id: string): Promise<void> {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id)

  if (error) throw error
}
