import { apiClient } from '../client'
import type { TransaksiTimbang, CreateTransaksiTimbangDto, PaginationResponse } from '../types'

export const timbanganService = {
  getAll: (page = 1, limit = 10, status?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    })
    return apiClient.get<PaginationResponse<TransaksiTimbang>>(`/timbangan?${params}`)
  },
  getById: (id: string) => apiClient.get<TransaksiTimbang>(`/timbangan/${id}`),
  getByNomorDo: (nomorDo: string) => apiClient.get<TransaksiTimbang>(`/timbangan/do/${nomorDo}`),
  create: (data: CreateTransaksiTimbangDto) =>
    apiClient.post<TransaksiTimbang>('/timbangan', data),
  update: (id: string, data: Partial<CreateTransaksiTimbangDto>) =>
    apiClient.patch<TransaksiTimbang>(`/timbangan/${id}`, data),
  delete: (id: string) => apiClient.delete(`/timbangan/${id}`),
  getDailyReport: (date: string) =>
    apiClient.get(`/timbangan/reports/daily/${date}`),
  getMonthlyReport: (year: number, month: number) =>
    apiClient.get(`/timbangan/reports/monthly/${year}/${month}`),
  
  // Pending transaction methods
  getPending: () => apiClient.get<any[]>('/timbangan/pending'),
  createPending: (data: any) => apiClient.post<any>('/timbangan/pending', data),
  completePending: (id: string, data: any) => 
    apiClient.patch<any>(`/timbangan/pending/${id}/complete`, data),
}