import { apiClient } from '../client'
import { Role } from '../types/auth'

export interface CreateRoleRequest {
  name: string
  description?: string
  permissions?: string[]
}

export interface UpdateRoleRequest {
  name?: string
  description?: string
  permissions?: string[]
}

export const roleService = {
  async getRoles(): Promise<Role[]> {
    return apiClient.get<Role[]>('/roles')
  },

  async getRole(id: string): Promise<Role> {
    return apiClient.get<Role>(`/roles/${id}`)
  },

  async createRole(data: CreateRoleRequest): Promise<Role> {
    return apiClient.post<Role>('/roles', data)
  },

  async updateRole(id: string, data: UpdateRoleRequest): Promise<Role> {
    return apiClient.patch<Role>(`/roles/${id}`, data)
  },

  async deleteRole(id: string): Promise<void> {
    return apiClient.delete<void>(`/roles/${id}`)
  }
}