"use client"

import { useState, useEffect } from 'react'

interface ScaleAccessConfig {
  isScaleComputer: boolean
  allowedIPs: string[]
  scaleStatus: 'connected' | 'disconnected' | 'checking'
  computerInfo: {
    hostname: string
    userAgent: string
    localIP: string | null
  }
}

interface UseScaleAccessReturn {
  hasScaleAccess: boolean
  scaleStatus: 'connected' | 'disconnected' | 'checking'
  computerInfo: ScaleAccessConfig['computerInfo']
  checkScaleConnection: () => Promise<void>
  isLoading: boolean
  error: string | null
}

export function useScaleAccess(): UseScaleAccessReturn {
  const [config, setConfig] = useState<ScaleAccessConfig>({
    isScaleComputer: false,
    allowedIPs: [],
    scaleStatus: 'checking',
    computerInfo: {
      hostname: '',
      userAgent: '',
      localIP: null
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingConnection, setIsCheckingConnection] = useState(false)

  // Get computer information
  const getComputerInfo = async () => {
    const info = {
      hostname: window.location.hostname,
      userAgent: navigator.userAgent,
      localIP: null as string | null
    }

    // Try to get local IP (works in some browsers/environments)
    try {
      const response = await fetch('/api/computer-info', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => null)
      
      if (response?.ok) {
        const data = await response.json()
        info.localIP = data.localIP
      }
    } catch (e) {
      // Fallback: use WebRTC to get local IP (if available)
      try {
        const pc = new RTCPeerConnection({ iceServers: [] })
        pc.createDataChannel('')
        const offer = await pc.createOffer()
        await pc.setLocalDescription(offer)
        
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            const candidate = event.candidate.candidate
            const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/)
            if (ipMatch && !ipMatch[1].startsWith('127.')) {
              info.localIP = ipMatch[1]
              pc.close()
            }
          }
        }
      } catch (rtcError) {
        console.log('Could not determine local IP:', rtcError)
      }
    }

    return info
  }

  // Check if current computer has scale access
  const checkScaleAccess = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const computerInfo = await getComputerInfo()
      
      // Get scale access configuration from backend
      const response = await fetch('/api/scale/access-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostname: computerInfo.hostname,
          userAgent: computerInfo.userAgent,
          localIP: computerInfo.localIP
        })
      })

      if (!response.ok) {
        throw new Error('Failed to check scale access')
      }

      const accessConfig = await response.json()
      
      setConfig({
        isScaleComputer: accessConfig.hasAccess,
        allowedIPs: accessConfig.allowedIPs || [],
        scaleStatus: accessConfig.hasAccess ? 'connected' : 'disconnected',
        computerInfo
      })

    } catch (err) {
      console.error('Scale access check failed:', err)
      setError(err instanceof Error ? err.message : 'Scale access check failed')
      setConfig(prev => ({ ...prev, scaleStatus: 'disconnected' }))
    } finally {
      setIsLoading(false)
    }
  }

  // Test actual scale hardware connection
  const checkScaleConnection = async () => {
    if (!config.isScaleComputer || isCheckingConnection) return

    try {
      setIsCheckingConnection(true)
      setConfig(prev => ({ ...prev, scaleStatus: 'checking' }))
      
      // Test hardware connection through scale API
      const response = await fetch('/api/scale/test-connection', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (response.ok) {
        const result = await response.json()
        setConfig(prev => ({ 
          ...prev, 
          scaleStatus: result.connected ? 'connected' : 'disconnected' 
        }))
        setError(null)
      } else {
        setConfig(prev => ({ ...prev, scaleStatus: 'disconnected' }))
        setError(`HTTP ${response.status}: ${response.statusText}`)
      }
    } catch (err) {
      console.error('Scale connection test failed:', err)
      setConfig(prev => ({ ...prev, scaleStatus: 'disconnected' }))
      setError(err instanceof Error ? err.message : 'Connection test failed')
    } finally {
      setIsCheckingConnection(false)
    }
  }

  // Initial access check
  useEffect(() => {
    checkScaleAccess()
  }, [])

  // Periodic connection check (every 5 minutes instead of 30 seconds to reduce load)
  useEffect(() => {
    if (config.isScaleComputer) {
      // Initial check after 10 seconds
      const initialTimeout = setTimeout(checkScaleConnection, 10000)
      
      // Then periodic check every 5 minutes
      const interval = setInterval(checkScaleConnection, 300000) // 5 minutes
      
      return () => {
        clearTimeout(initialTimeout)
        clearInterval(interval)
      }
    }
  }, [config.isScaleComputer])

  return {
    hasScaleAccess: config.isScaleComputer,
    scaleStatus: config.scaleStatus,
    computerInfo: config.computerInfo,
    checkScaleConnection,
    isLoading,
    error
  }
}