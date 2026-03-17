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
