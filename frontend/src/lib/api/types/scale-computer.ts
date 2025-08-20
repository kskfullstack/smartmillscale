export interface ScaleComputer {
  id: string
  name: string
  allowedHostnames: string[]
  allowedIPs: string[]
  location: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
  lastSeen?: string
  status?: 'online' | 'offline' | 'unknown'
}

export interface CreateScaleComputerDto {
  name: string
  allowedHostnames: string[]
  allowedIPs: string[]
  location: string
  isActive?: boolean
}

export interface UpdateScaleComputerDto {
  name?: string
  allowedHostnames?: string[]
  allowedIPs?: string[]
  location?: string
  isActive?: boolean
}

export interface ScaleComputerStatus {
  computerId: string
  hostname: string
  ipAddress: string
  lastSeen: string
  isOnline: boolean
  hardwareStatus: 'connected' | 'disconnected' | 'error'
}