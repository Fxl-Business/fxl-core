// ---------------------------------------------------------------------------
// Client types — matches the `clients` table (migrations 016 + 018)
// ---------------------------------------------------------------------------

export type ClientStatus = 'active' | 'inactive' | 'archived'

export interface Client {
  id: string
  slug: string
  name: string
  description: string
  org_id: string
  logo_url: string | null
  status: ClientStatus
  created_at: string
}

export interface CreateClientParams {
  name: string
  slug: string
  description?: string
  logo_url?: string | null
  status?: ClientStatus
}

export interface UpdateClientParams {
  name?: string
  slug?: string
  description?: string
  logo_url?: string | null
  status?: ClientStatus
}
