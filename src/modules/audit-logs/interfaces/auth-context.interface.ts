export interface AuthContext {
  userId?: string | null
  userEmail?: string | null
  username?: string | null
  userRole?: string | null
  companyId?: number
  companyPublicId?: string | null
  ipAddress?: string | null
  userAgent?: string | null
}