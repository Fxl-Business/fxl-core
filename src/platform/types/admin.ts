export interface OrgMembership {
  orgId: string
  orgName: string
  role: string
}

export interface AdminUser {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  imageUrl: string
  createdAt: number
  lastSignInAt: number | null
  organizationMemberships: OrgMembership[]
}

export interface AdminUserListResponse {
  users: AdminUser[]
  totalCount: number
}

export interface OrgMember {
  userId: string
  firstName: string | null
  lastName: string | null
  email: string
  imageUrl: string
  role: string
  joinedAt: number
}

export interface OrgMemberListResponse {
  members: OrgMember[]
  totalCount: number
}

export interface AddMemberResponse {
  userId: string
  role: string
  joinedAt: number
}

export interface RemoveMemberResponse {
  removed: boolean
  userId: string
}

export interface ImpersonationTokenResponse {
  access_token: string
  expires_in: number
  org_id: string
  is_impersonation: boolean
}
