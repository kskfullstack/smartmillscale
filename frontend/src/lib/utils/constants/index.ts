export const APP_CONFIG = {
  name: 'SmartMillScale',
  description: 'Timbang Otomatis, Proses Sistematis',
  version: '1.0.0',
} as const

export const API_ENDPOINTS = {
  AUTH: '/auth',
  PEMASOK: '/pemasok',
  SOPIR: '/sopir',
  KENDARAAN: '/kendaraan',
  TIMBANGAN: '/timbangan',
  GRADING: '/grading',
} as const

export const STATUS_OPTIONS = {
  AKTIF: 'aktif',
  NONAKTIF: 'nonaktif',
} as const

export const JENIS_BARANG = {
  TBS: 'TBS',
  INTI: 'Inti Sawit',
  CANGKANG: 'Cangkang',
} as const

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_DATA: 'user_data',
  THEME: 'theme',
} as const