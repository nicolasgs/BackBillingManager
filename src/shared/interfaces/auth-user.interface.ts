export interface AuthUser {
  id: string
  email?: string

  roles: string[]

  companyId?: number
  companyPublicId?: string

  firstName?: string
  lastName?: string
}