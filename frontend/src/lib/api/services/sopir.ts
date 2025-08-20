import { apiClient } from '../client'
import type { Sopir, CreateSopirDto } from '../types'

export const sopirService = {
  getAll: () => apiClient.get<Sopir[]>('/sopir'),
  getActive: () => apiClient.get<Sopir[]>('/sopir/active'),
  getById: (id: string) => apiClient.get<Sopir>(`/sopir/${id}`),
  create: (data: CreateSopirDto) => apiClient.post<Sopir>('/sopir', data),
  update: (id: string, data: Partial<CreateSopirDto>) =>
    apiClient.patch<Sopir>(`/sopir/${id}`, data),
  delete: (id: string) => apiClient.delete(`/sopir/${id}`),
}