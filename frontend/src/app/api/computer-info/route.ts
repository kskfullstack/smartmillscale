import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get client IP from headers
    const forwarded = request.headers.get('x-forwarded-for')
    const realIP = request.headers.get('x-real-ip')
    const clientIP = forwarded ? forwarded.split(',')[0] : realIP || 'unknown'
    
    // Get other client info
    const userAgent = request.headers.get('user-agent') || 'unknown'
    const host = request.headers.get('host') || 'unknown'
    
    return NextResponse.json({
      localIP: clientIP,
      userAgent,
      host,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to get computer info:', error)
    return NextResponse.json(
      { error: 'Failed to get computer info' },
      { status: 500 }
    )
  }
}