export interface User {
  id: string
  username: string
  email?: string
  fullName: string
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
  role?: Role // single role (new format from backend)
  userRole?: {
    id: string
    userId: string
    roleId: string
    role: Role
  } // actual backend format
  userRoles?: UserRole[] // legacy format for compatibility
  roles?: Role[] // legacy format for compatibility
}

export interface UserRole {
  id: string
  userId: string
  roleId: string
  role: Role
}

export interface Role {
  id: string
  name: string
  description?: string
  permissions: string[] | string // Can be array or JSON string from backend
  createdAt?: string
  updatedAt?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: User
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginRequest) => Promise<void>
  logout: () => void
  hasRole: (roleName: string) => boolean
  hasPermission: (permission: string) => boolean
}