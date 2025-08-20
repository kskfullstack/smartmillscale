import { apiClient } from '../client'
import { User } from '../types/auth'
import { PaginationResponse } from '../types/common'

export interface CreateUserRequest {
  username: string
  email?: string
  password: string
  fullName: string
  roleId?: string
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  fullName?: string
  password?: string
}

export interface AssignRoleRequest {
  roleId: string
}

export const userService = {
  async getUsers(page: number = 1, limit: number = 10): Promise<PaginationResponse<User>> {
    return apiClient.get<PaginationResponse<User>>(`/users?page=${page}&limit=${limit}`)
  },

  async getUser(id: string): Promise<User> {
    return apiClient.get<User>(`/users/${id}`)
  },

  async createUser(data: CreateUserRequest): Promise<User> {
    return apiClient.post<User>('/users', data)
  },

  async updateUser(id: string, data: UpdateUserRequest): Promise<User> {
    return apiClient.patch<User>(`/users/${id}`, data)
  },

  async deleteUser(id: string): Promise<void> {
    return apiClient.delete<void>(`/users/${id}`)
  },

  async activateUser(id: string): Promise<User> {
    return apiClient.patch<User>(`/users/${id}/activate`, {})
  },

  async deactivateUser(id: string): Promise<User> {
    return apiClient.patch<User>(`/users/${id}/deactivate`, {})
  },

  async assignRole(userId: string, roleId: string): Promise<void> {
    return apiClient.post<void>(`/users/${userId}/roles`, { roleId })
  },

  async removeRole(userId: string, roleId: string): Promise<void> {
    return apiClient.delete<void>(`/users/${userId}/roles/${roleId}`)
  }
}