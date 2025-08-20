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

// GET /api/scale-computers - Get all scale computers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''

    let filtered = SCALE_COMPUTERS

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = SCALE_COMPUTERS.filter(computer =>
        computer.name.toLowerCase().includes(searchLower) ||
        computer.location.toLowerCase().includes(searchLower) ||
        computer.allowedIPs.some(ip => ip.includes(search)) ||
        computer.allowedHostnames.some(hostname => hostname.toLowerCase().includes(searchLower))
      )
    }

    // If no pagination params, return all
    if (!searchParams.has('page') && !searchParams.has('limit')) {
      return NextResponse.json(filtered)
    }

    // Apply pagination
    const total = filtered.length
    const start = (page - 1) * limit
    const end = start + limit
    const data = filtered.slice(start, end)

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Failed to get scale computers:', error)
    return NextResponse.json(
      { error: 'Failed to get scale computers' },
      { status: 500 }
    )
  }
}

// POST /api/scale-computers - Create new scale computer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const newComputer = {
      id: `scale-${Date.now()}`,
      name: body.name,
      allowedHostnames: body.allowedHostnames || [],
      allowedIPs: body.allowedIPs || [],
      location: body.location,
      isActive: body.isActive ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    SCALE_COMPUTERS.push(newComputer)

    return NextResponse.json(newComputer, { status: 201 })

  } catch (error) {
    console.error('Failed to create scale computer:', error)
    return NextResponse.json(
      { error: 'Failed to create scale computer' },
      { status: 500 }
    )
  }
}