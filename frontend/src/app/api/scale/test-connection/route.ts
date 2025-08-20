import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // In production, this would test actual hardware connection
    // For now, we'll simulate the connection test
    
    // Simulate hardware test delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock connection test based on current environment
    const isDevelopment = process.env.NODE_ENV === 'development'
    const currentTime = new Date().getTime()
    
    // Simulate intermittent connection issues (90% success rate)
    const isConnected = isDevelopment ? Math.random() > 0.1 : false
    
    if (isConnected) {
      return NextResponse.json({
        connected: true,
        status: 'online',
        lastWeight: Math.random() * 1000, // Simulated weight reading
        calibrationStatus: 'ok',
        hardwareVersion: '1.2.3',
        lastCalibration: new Date(currentTime - 24 * 60 * 60 * 1000).toISOString(),
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        connected: false,
        status: 'offline',
        error: 'Hardware not responding',
        timestamp: new Date().toISOString()
      })
    }
    
  } catch (error) {
    console.error('Scale connection test failed:', error)
    return NextResponse.json(
      { 
        connected: false,
        status: 'error',
        error: 'Connection test failed'
      },
      { status: 500 }
    )
  }
}