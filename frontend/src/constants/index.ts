// Re-export all constants from utils
export * from '../lib/utils/constants'

// Application-specific constants
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  TIMBANGAN: '/timbangan',
  GRADING: '/grading',
  MASTER: {
    PEMASOK: '/master/pemasok',
    SOPIR: '/master/sopir',
    KENDARAAN: '/master/kendaraan',
  },
  LAPORAN: {
    HARIAN: '/laporan/harian',
    BULANAN: '/laporan/bulanan',
    GRADING: '/laporan/grading',
  },
  UNAUTHORIZED: '/unauthorized',
} as const

export const PERMISSIONS = {
  // Master data permissions
  PEMASOK_READ: 'pemasok:read',
  PEMASOK_WRITE: 'pemasok:write',
  SOPIR_READ: 'sopir:read',
  SOPIR_WRITE: 'sopir:write',
  KENDARAAN_READ: 'kendaraan:read',
  KENDARAAN_WRITE: 'kendaraan:write',
  
  // Transaction permissions
  TIMBANGAN_READ: 'timbangan:read',
  TIMBANGAN_WRITE: 'timbangan:write',
  GRADING_READ: 'grading:read',
  GRADING_WRITE: 'grading:write',
  
  // Report permissions
  LAPORAN_READ: 'laporan:read',
  LAPORAN_EXPORT: 'laporan:export',
} as const

export const ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  SUPERVISOR: 'supervisor',
  VIEWER: 'viewer',
} as const