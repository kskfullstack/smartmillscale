import { apiClient } from '../client'
import type { Grading, CreateGradingDto, PaginationResponse } from '../types'

export const gradingService = {
  getAll: (page = 1, limit = 10) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    return apiClient.get<PaginationResponse<Grading>>(`/grading?${params}`)
  },
  getById: (id: string) => apiClient.get<Grading>(`/grading/${id}`),
  getByTransaksiId: (transaksiTimbangId: string) =>
    apiClient.get<Grading>(`/grading/transaksi/${transaksiTimbangId}`),
  create: (data: CreateGradingDto) => apiClient.post<Grading>('/grading', data),
  update: (id: string, data: Partial<CreateGradingDto>) =>
    apiClient.patch<Grading>(`/grading/${id}`, data),
  delete: (id: string) => apiClient.delete(`/grading/${id}`),
  getReport: (startDate: string, endDate: string) => {
    const params = new URLSearchParams({ startDate, endDate })
    return apiClient.get(`/grading/reports?${params}`)
  },
}