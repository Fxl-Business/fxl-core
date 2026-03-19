export interface Tenant {
  id: string           // Clerk org ID (e.g., "org_xxx")
  name: string         // Organization name
  slug: string | null  // URL-friendly slug
  membersCount: number // Total members in the org
  createdAt: number    // Unix timestamp (ms) from Clerk
  imageUrl: string     // Org avatar URL
  archived: boolean    // Whether the tenant is archived
}

export interface TenantDetail extends Tenant {
  publicMetadata: Record<string, unknown>
  privateMetadata: Record<string, unknown>
  maxAllowedMemberships: number | null
  adminDeleteEnabled: boolean
}

export interface CreateTenantPayload {
  name: string
  slug?: string
}

export interface TenantListResponse {
  tenants: Tenant[]
  totalCount: number
}

export interface ArchiveTenantResponse {
  archived: boolean
  orgId: string
  membersRemoved: number
  tablesUpdated: number
  archivedAt: string
}

export interface RestoreTenantResponse {
  restored: boolean
  orgId: string
  tablesUpdated: number
}
