// Global type definitions
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
}

export interface SelectOption {
  value: string
  label: string
}

export interface TableColumn {
  key: string
  label: string
  sortable?: boolean
  width?: string
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea'
  required?: boolean
  placeholder?: string
  options?: SelectOption[]
}

export interface PageMeta {
  title: string
  description?: string
  keywords?: string[]
}

// Re-export API types for convenience
export * from '../lib/api/types'