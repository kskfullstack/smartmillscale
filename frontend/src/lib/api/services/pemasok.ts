import { apiClient } from '../client'
import type { Pemasok, CreatePemasokDto } from '../types'

export const pemasokService = {
  getAll: () => apiClient.get<Pemasok[]>('/pemasok'),
  getActive: () => apiClient.get<Pemasok[]>('/pemasok/active'),
  getById: (id: string) => apiClient.get<Pemasok>(`/pemasok/${id}`),
  create: (data: CreatePemasokDto) => apiClient.post<Pemasok>('/pemasok', data),
  update: (id: string, data: Partial<CreatePemasokDto>) =>
    apiClient.patch<Pemasok>(`/pemasok/${id}`, data),
  delete: (id: string) => apiClient.delete(`/pemasok/${id}`),
}