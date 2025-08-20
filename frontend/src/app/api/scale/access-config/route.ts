import { NextRequest, NextResponse } from 'next/server'

// Get latest configuration from scale-computers API
async function getScaleComputers() {
  try {
    // In production, this would directly query the database
    // For now, we'll fetch from our own API
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/scale-computers`, {
      cache: 'no-store'
    })
    
    if (response.ok) {
      return await response.json()
    }
  } catch (error) {
    console.error('Failed to fetch scale computers:', error)
  }
  
  // Fallback to hardcoded data
  return [
    {
      id: 'scale-station-1',
      name: 'Timbangan Station 1',
      allowedHostnames: ['localhost', '127.0.0.1', 'timbangan-1.local'],
      allowedIPs: ['127.0.0.1', '192.168.1.100', '10.0.0.50'],
      location: 'Gudang Utama',
      isActive: true
    }
  ]
}

interface ComputerInfo {
  hostname: string
  userAgent: string
  localIP: string | null
}

export async function POST(request: NextRequest) {
  try {
    const computerInfo: ComputerInfo = await request.json()
    
    // Get client IP from request headers as backup
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const clientIP = forwarded ? forwarded.split(',')[0] : realIP || null
    
    const currentIP = computerInfo.localIP || clientIP
    const currentHostname = computerInfo.hostname
    
    // Get latest scale computers configuration
    const SCALE_COMPUTERS = await getScaleComputers()
    
    // Check if current computer has scale access
    const hasAccess = SCALE_COMPUTERS.some(station => {
      if (!station.isActive) return false
      
      // Check hostname match
      const hostnameMatch = station.allowedHostnames.some(hostname => 
        currentHostname.includes(hostname) || hostname === currentHostname
      )
      
      // Check IP match
      const ipMatch = currentIP && station.allowedIPs.includes(currentIP)
      
      return hostnameMatch || ipMatch
    })
    
    // Get allowed IPs for reference
    const allowedIPs = SCALE_COMPUTERS
      .filter(station => station.isActive)
      .flatMap(station => station.allowedIPs)
    
    // Find matching station info
    const matchingStation = SCALE_COMPUTERS.find(station => {
      if (!station.isActive) return false
      
      const hostnameMatch = station.allowedHostnames.some(hostname => 
        currentHostname.includes(hostname) || hostname === currentHostname
      )
      const ipMatch = currentIP && station.allowedIPs.includes(currentIP)
      
      return hostnameMatch || ipMatch
    })
    
    return NextResponse.json({
      hasAccess,
      allowedIPs,
      currentIP,
      currentHostname,
      station: matchingStation || null,
      timestamp: new Date().toISOString(),
      debug: {
        receivedInfo: computerInfo,
        detectedIP: clientIP,
        userAgent: request.headers.get('user-agent')
      }
    })
    
  } catch (error) {
    console.error('Scale access check failed:', error)
    return NextResponse.json(
      { 
        hasAccess: false, 
        error: 'Access check failed',
        allowedIPs: [],
        station: null
      },
      { status: 500 }
    )
  }
}