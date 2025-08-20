import { apiClient } from '../client'
import { PaginationResponse } from '../types/common'
import { Company } from '../types/business'
import { CreateCompanyDto, UpdateCompanyDto } from '../types/dto'

export const companyService = {
  async getCompanies(page: number = 1, pageSize: number = 10): Promise<PaginationResponse<Company>> {
    return apiClient.get<PaginationResponse<Company>>(`/company?page=${page}&pageSize=${pageSize}`)
  },

  async getCompany(id: string): Promise<Company> {
    return apiClient.get<Company>(`/company/${id}`)
  },

  async getCompanyProfile(): Promise<Company | null> {
    try {
      return await apiClient.get<Company>('/company/profile')
    } catch (error) {
      // Return null if no company profile exists yet
      return null
    }
  },

  async createCompany(data: CreateCompanyDto): Promise<Company> {
    return apiClient.post<Company>('/company', data)
  },

  async updateCompany(id: string, data: UpdateCompanyDto): Promise<Company> {
    return apiClient.patch<Company>(`/company/${id}`, data)
  },

  async deleteCompany(id: string): Promise<void> {
    return apiClient.delete<void>(`/company/${id}`)
  },

  async activateCompany(id: string): Promise<Company> {
    return apiClient.post<Company>(`/company/${id}/activate`, {})
  },

  async deactivateCompany(id: string): Promise<Company> {
    return apiClient.post<Company>(`/company/${id}/deactivate`, {})
  }
}