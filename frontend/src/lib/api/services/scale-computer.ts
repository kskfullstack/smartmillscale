import { apiClient } from '../client'
import type { 
  ScaleComputer, 
  CreateScaleComputerDto, 
  UpdateScaleComputerDto,
  ScaleComputerStatus 
} from '../types/scale-computer'
import type { PaginationResponse } from '../types/common'

class ScaleComputerService {
  private baseUrl = '/api/scale-computers'

  async getAll(): Promise<ScaleComputer[]> {
    const response = await apiClient.get<ScaleComputer[]>(this.baseUrl)
    return response.data
  }

  async getPaginated(page: number = 1, limit: number = 10, search?: string): Promise<PaginationResponse<ScaleComputer>> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })
    
    if (search) {
      params.append('search', search)
    }

    const response = await apiClient.get<PaginationResponse<ScaleComputer>>(`${this.baseUrl}?${params}`)
    return response.data
  }

  async getById(id: string): Promise<ScaleComputer> {
    const response = await apiClient.get<ScaleComputer>(`${this.baseUrl}/${id}`)
    return response.data
  }

  async create(data: CreateScaleComputerDto): Promise<ScaleComputer> {
    const response = await apiClient.post<ScaleComputer>(this.baseUrl, data)
    return response.data
  }

  async update(id: string, data: UpdateScaleComputerDto): Promise<ScaleComputer> {
    const response = await apiClient.put<ScaleComputer>(`${this.baseUrl}/${id}`, data)
    return response.data
  }

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`)
  }

  async toggleActive(id: string): Promise<ScaleComputer> {
    const response = await apiClient.patch<ScaleComputer>(`${this.baseUrl}/${id}/toggle-active`)
    return response.data
  }

  async getStatus(): Promise<ScaleComputerStatus[]> {
    const response = await apiClient.get<ScaleComputerStatus[]>(`${this.baseUrl}/status`)
    return response.data
  }

  async testConnection(id: string): Promise<{ success: boolean; message: string; details?: any }> {
    const response = await apiClient.post<{ success: boolean; message: string; details?: any }>(`${this.baseUrl}/${id}/test`)
    return response.data
  }
}

export const scaleComputerService = new ScaleComputerService()