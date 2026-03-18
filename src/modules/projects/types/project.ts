// ---------------------------------------------------------------------------
// Project types — matches the `projects` table (migration 018)
// ---------------------------------------------------------------------------

export interface Project {
  id: string
  slug: string
  name: string
  client_id: string | null
  org_id: string
  created_at: string
}

export interface ProjectWithClient extends Project {
  client_name: string | null
}

export interface CreateProjectParams {
  name: string
  slug: string
  client_id?: string | null
}
