import { apiClient } from '../client'
import type { Kendaraan, CreateKendaraanDto } from '../types'

export const kendaraanService = {
  getAll: () => apiClient.get<Kendaraan[]>('/kendaraan'),
  getActive: () => apiClient.get<Kendaraan[]>('/kendaraan/active'),
  getById: (id: string) => apiClient.get<Kendaraan>(`/kendaraan/${id}`),
  create: (data: CreateKendaraanDto) => apiClient.post<Kendaraan>('/kendaraan', data),
  update: (id: string, data: Partial<CreateKendaraanDto>) =>
    apiClient.patch<Kendaraan>(`/kendaraan/${id}`, data),
  delete: (id: string) => apiClient.delete(`/kendaraan/${id}`),
}