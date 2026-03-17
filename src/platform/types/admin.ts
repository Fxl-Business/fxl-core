export interface AdminUser {
  id: string
  firstName: string | null
  lastName: string | null
  email: string
  imageUrl: string
  createdAt: number
  lastSignInAt: number | null
}

export interface AdminUserListResponse {
  users: AdminUser[]
  totalCount: number
}
