import { NextRequest, NextResponse } from 'next/server'

// Mock database - in production this would use actual database
let SCALE_COMPUTERS = [
  {
    id: 'scale-station-1',
    name: 'Timbangan Station 1',
    allowedHostnames: ['localhost', '127.0.0.1', 'timbangan-1.local'],
    allowedIPs: ['127.0.0.1', '192.168.1.100', '10.0.0.50'],
    location: 'Gudang Utama',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'scale-station-2',
    name: 'Timbangan Station 2', 
    allowedHostnames: ['timbangan-2.local', 'scale-pc-2'],
    allowedIPs: ['192.168.1.101', '10.0.0.51'],
    location: 'Gudang Sortir',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

interface RouteParams {
  params: {
    id: string
  }
}

// PATCH /api/scale-computers/[id]/toggle-active - Toggle active status
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const index = SCALE_COMPUTERS.findIndex(c => c.id === params.id)
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Scale computer not found' },
        { status: 404 }
      )
    }

    SCALE_COMPUTERS[index] = {
      ...SCALE_COMPUTERS[index],
      isActive: !SCALE_COMPUTERS[index].isActive,
      updatedAt: new Date().toISOString()
    }

    return NextResponse.json(SCALE_COMPUTERS[index])

  } catch (error) {
    console.error('Failed to toggle scale computer status:', error)
    return NextResponse.json(
      { error: 'Failed to toggle scale computer status' },
      { status: 500 }
    )
  }
}